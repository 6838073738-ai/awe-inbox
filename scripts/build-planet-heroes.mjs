// Downloads canonical NASA/Hubble/Cassini/Voyager imagery for each body in
// PLANET_DATA via the Wikipedia REST API (which returns Wikimedia Commons
// URLs — stable, NASA-sourced lead images). Outputs go to
// /public/svs/planets/, one JPG per body.
//
// Run manually: `node scripts/build-planet-heroes.mjs`
// Wikimedia images are released under various open licenses; NASA-sourced
// material is public domain. Attribution is added to /colophon.

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "svs", "planets");
mkdirSync(OUT_DIR, { recursive: true });

// Match the slugs from lib/planet-data.ts. Each maps to a Wikipedia article
// title (English) whose `originalimage` field returns a stable Commons URL.
const BODIES = [
  { slug: "sun", wiki: "Sun" },
  { slug: "mercury", wiki: "Mercury_(planet)" },
  { slug: "venus", wiki: "Venus" },
  { slug: "earth", wiki: "Earth" },
  { slug: "moon", wiki: "Moon" },
  { slug: "mars", wiki: "Mars" },
  { slug: "jupiter", wiki: "Jupiter" },
  { slug: "saturn", wiki: "Saturn" },
  { slug: "uranus", wiki: "Uranus" },
  { slug: "neptune", wiki: "Neptune" },
];

async function fetchLeadImageUrl(wikiTitle) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
  const res = await fetch(url, {
    headers: {
      "user-agent": "awe-inbox/1.0 (https://awe-inbox.vercel.app)",
    },
  });
  if (!res.ok) {
    console.error(`[heroes] summary ${wikiTitle} -> ${res.status}`);
    return null;
  }
  const json = await res.json();
  const original = json.originalimage?.source;
  const credit = json.title;
  return original ? { url: original, credit } : null;
}

async function downloadOne(slug, wikiTitle) {
  // We always use .jpg as the output extension because we re-encode... no
  // we don't, we just trust the upstream format. Use the Commons URL's
  // extension directly.
  const lead = await fetchLeadImageUrl(wikiTitle);
  if (!lead) {
    console.warn(`[heroes] no image for ${slug}`);
    return;
  }
  const ext = extname(new URL(lead.url).pathname).toLowerCase() || ".jpg";
  const dst = join(OUT_DIR, `${slug}${ext}`);
  if (existsSync(dst)) {
    console.log(`[heroes] keep ${slug}${ext} (already present)`);
    return;
  }
  console.log(`[heroes] fetching ${slug} from ${lead.url}`);
  const res = await fetch(lead.url, {
    headers: {
      "user-agent": "awe-inbox/1.0 (https://awe-inbox.vercel.app)",
    },
  });
  if (!res.ok) {
    console.error(`[heroes] ${slug} download failed: ${res.status}`);
    return;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dst, buf);
  console.log(
    `[heroes] wrote ${slug}${ext} (${(buf.length / 1024).toFixed(1)} KB, ` +
      `${lead.credit})`,
  );
}

for (const b of BODIES) {
  try {
    await downloadOne(b.slug, b.wiki);
  } catch (e) {
    console.error(`[heroes] ${b.slug} error:`, e.message);
  }
}
console.log("[heroes] done");
