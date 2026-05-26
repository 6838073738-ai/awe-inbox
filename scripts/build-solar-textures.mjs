// Downloads the planet/sun/moon textures from Solar System Scope into
// `public/textures/`. Run manually: `node scripts/build-solar-textures.mjs`.
// Outputs are committed; this script is one-shot.
//
// Source: https://www.solarsystemscope.com/textures/
// License: CC-BY 4.0 — credit "Solar System Scope" / Tomas Slavinskas.
// Attribution is added to /colophon and README on the same commit as this
// script's output.

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "textures");
mkdirSync(OUT_DIR, { recursive: true });

const TEXTURES = [
  { name: "sun.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_sun.jpg" },
  { name: "mercury.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_mercury.jpg" },
  { name: "venus.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_venus_surface.jpg" },
  { name: "earth.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg" },
  { name: "moon.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_moon.jpg" },
  { name: "mars.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_mars.jpg" },
  { name: "jupiter.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_jupiter.jpg" },
  { name: "saturn.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_saturn.jpg" },
  { name: "saturn-ring.png", url: "https://www.solarsystemscope.com/textures/download/2k_saturn_ring_alpha.png" },
  { name: "uranus.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_uranus.jpg" },
  { name: "neptune.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_neptune.jpg" },
  { name: "stars.jpg", url: "https://www.solarsystemscope.com/textures/download/2k_stars_milky_way.jpg" },
];

async function downloadOne(t) {
  const dst = join(OUT_DIR, t.name);
  if (existsSync(dst)) {
    console.log(`[textures] keep ${t.name} (already present)`);
    return;
  }
  console.log(`[textures] fetching ${t.name} …`);
  const res = await fetch(t.url, {
    headers: {
      "user-agent": "awe-inbox/1.0 (https://awe-inbox.vercel.app)",
    },
  });
  if (!res.ok) {
    console.error(
      `[textures] FAIL ${t.name} — ${res.status} ${res.statusText}`,
    );
    return;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dst, buf);
  console.log(`[textures] wrote ${t.name} (${(buf.length / 1024).toFixed(1)} KB)`);
}

for (const t of TEXTURES) {
  await downloadOne(t);
}
console.log("[textures] done");
