// Downloads GeoNames cities1000.zip, filters population >= MIN_POP, writes lib/cities.json.
// Run manually: `node scripts/build-cities.mjs`
// Output is committed; you do not need to re-run this on every build.
// Source: GeoNames cities1000 dataset, CC-BY 4.0 (https://www.geonames.org)

import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const SRC = "https://download.geonames.org/export/dump/cities1000.zip";
const OUT = new URL("../lib/cities.json", import.meta.url);
const MIN_POP = 100_000;

console.log("[cities] downloading", SRC);
const res = await fetch(SRC);
if (!res.ok) {
  console.error("[cities] download failed:", res.status, res.statusText);
  process.exit(1);
}
const zipBuf = Buffer.from(await res.arrayBuffer());
const tmp = join(tmpdir(), `awe-inbox-cities-${Date.now()}`);
mkdirSync(tmp, { recursive: true });
const zipPath = join(tmp, "cities1000.zip");
writeFileSync(zipPath, zipBuf);
console.log("[cities] downloaded", zipBuf.length, "bytes →", zipPath);

console.log("[cities] extracting…");
const isWindows = process.platform === "win32";
const extract = isWindows
  ? spawnSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${tmp.replace(/'/g, "''")}' -Force`,
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    )
  : spawnSync("unzip", ["-o", zipPath, "-d", tmp], {
      stdio: ["ignore", "pipe", "pipe"],
    });
if (extract.status !== 0) {
  console.error(
    "[cities] extract failed:",
    extract.stderr?.toString() || extract.stdout?.toString(),
  );
  process.exit(1);
}

const txtPath = join(tmp, "cities1000.txt");
const raw = readFileSync(txtPath, "utf8");
const lines = raw.split("\n");
console.log("[cities] parsing", lines.length.toLocaleString(), "rows…");

// GeoNames cities1000 schema (tab-delimited):
//   0 geonameid, 1 name, 2 asciiname, 3 alternatenames,
//   4 latitude, 5 longitude, 6 feature_class, 7 feature_code,
//   8 country_code, 9 cc2, 10 admin1, 11 admin2, 12 admin3,
//   13 admin4, 14 population, 15 elevation, 16 dem,
//   17 timezone, 18 modification_date
const out = [];
for (const line of lines) {
  if (!line) continue;
  const c = line.split("\t");
  const pop = Number.parseInt(c[14], 10);
  if (!Number.isFinite(pop) || pop < MIN_POP) continue;
  const lat = Number.parseFloat(c[4]);
  const lng = Number.parseFloat(c[5]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
  out.push({
    n: c[2] || c[1], // prefer ASCII name for label rendering
    c: c[8], // country code
    lat,
    lng,
    p: pop,
  });
}
out.sort((a, b) => b.p - a.p);
console.log(
  "[cities] kept",
  out.length.toLocaleString(),
  "cities (pop ≥",
  MIN_POP.toLocaleString(),
  ")"
);

writeFileSync(OUT, JSON.stringify(out));
const bytes = Buffer.byteLength(JSON.stringify(out));
console.log(
  "[cities] wrote",
  OUT.pathname,
  "—",
  (bytes / 1024).toFixed(1),
  "KB"
);
