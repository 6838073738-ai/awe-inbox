# Awe Inbox

A contemplative single-page web experience: a slowly rotating 3D Earth that
surfaces, once a day, the most reward-based-awe natural events from NASA's
Earth Observatory Natural Event Tracker (EONET), plus a curated layer of
active armed-conflict zones.

The deliberate antithesis of doomscrolling. Look once, look slowly, close the
tab.

## What you see

- **A Blue Marble Earth** rendered with Three.js, axially tilted 23.5°, slowly
  rotating. A custom shader anchors a real day/night terminator to the current
  position of the sun (computed from UTC time), with a warm twilight band at
  the boundary. 24 longitude meridians map the time zones; the equator and
  tropics are drawn as well.
- **Natural events** plotted as icons at their real coordinates. Each icon is
  category-specific (volcano, iceberg, hurricane, wildfire, earthquake,
  phytoplankton bloom, dust storm, flood, landslide, drought, temperature
  extreme, snow). A curation score filters out threat-based events near
  populated places, in line with the research of Dacher Keltner's lab at the
  Greater Good Science Center.
- **Conflict zones** plotted as a separate, deliberately somber layer.
  Curated list, soberly written, no partisan framing.
- **Hover** any icon → tooltip with the category, event title, a short
  reflection and the coordinates.
- **Click** any icon → modal with a close-up NASA GIBS satellite tile of the
  area and the long-form reflection.

## Data sources

| Source                                                    | Used for                              | Refresh |
| --------------------------------------------------------- | ------------------------------------- | ------- |
| [NASA EONET v3](https://eonet.gsfc.nasa.gov/api/v3/)      | Active natural events worldwide       | 24 h    |
| [NASA GIBS](https://nasa-gibs.github.io/gibs-api-docs/)   | Blue Marble texture + per-event tiles | 30 d    |
| [GeoNames cities1000](https://www.geonames.org)           | Population-proximity filter (CC-BY 4) | static  |
| `lib/conflicts.ts`                                        | Active armed conflicts (curated)      | static  |

The Blue Marble texture and EONET feed are proxied through Next.js routes for
CORS-safe loading and edge caching. No keys required — every dataset is open
data.

## Run locally

```bash
npm install
node scripts/build-cities.mjs   # one-time: downloads + filters cities.json
npm run dev                     # http://localhost:3000
npm run build && npm start      # production build
```

You will need Node 20+ (Next 16 requirement).

## Deploy

Push to a GitHub repo, then connect it to [Vercel](https://vercel.com/new) —
no environment variables are required. Vercel will detect Next.js, build, and
deploy. The `/api/world-texture` proxy is statically cached for 30 days at
the edge.

## Security posture

- **No analytics, no third-party scripts, no cookies.** The page never sends
  identifying information about a visitor anywhere.
- **CSP, HSTS, COOP, X-Frame-Options, X-Content-Type-Options, Permissions-Policy**
  set in `next.config.ts` for every response.
- **CSP** restricts script/style/img/connect to `'self'` + `gibs.earthdata.nasa.gov`
  + `eonet.gsfc.nasa.gov`. No external script loads possible.
- `/api/debug-curation` is gated to `NODE_ENV !== production` — returns 404
  in production. It exposes no secrets; it's purely a tuning aid.
- The `.gitignore` excludes `.env*`, `node_modules`, `.next/`, build output,
  and PEM files.
- No keys, tokens, or credentials are stored in the repo (verified by repo
  scan). No accounts to manage.

## Updating

- **EONET event data** refreshes automatically every 24 hours via Next.js
  fetch revalidation.
- **Conflict layer** is a curated static list in `lib/conflicts.ts`. Review
  and update at least every few months — wars and political situations
  change. Each entry has a `since` date, central coordinates, and a sober
  factual summary.
- **Cities dataset** is generated once via
  `node scripts/build-cities.mjs` from GeoNames `cities1000`. Output is
  committed at `lib/cities.json`. Re-run only when GeoNames updates.
- **Blue Marble texture** is the December 2004 NASA composite. It is
  effectively static — re-running the proxy with a different layer name in
  `app/api/world-texture/route.ts` swaps the visual style.

## Tech stack

- Next.js 16 (App Router, RSC, edge + node functions)
- React 19
- TypeScript (strict)
- Tailwind CSS 4 (CSS-based theme tokens)
- Three.js (custom day/night shader, time-zone meridians, marker overlay)
- Framer Motion (`LazyMotion` mode for minimal bundle)
- Lenis (smooth scroll)

## Layout

```
app/                     route handlers, pages, OG images
components/              Globe, EventModal, CategoryIcon, etc.
lib/
  eonet.ts               NASA EONET fetch + revalidation
  gibs.ts                GIBS WMS URL builder
  globe-data.ts          merges EONET events + conflicts → GlobePoint[]
  conflicts.ts           curated armed-conflict list
  cities.json            GeoNames cities ≥ 100k (filtered)
  curation.ts            threat-awe filter / scoring
  reflections.ts         per-category prose
scripts/build-cities.mjs builds lib/cities.json from GeoNames
```

## Credits

- Concept and copy informed by [Dacher Keltner](https://greatergood.berkeley.edu/profile/Dacher_Keltner)
  and the Greater Good Science Center at UC Berkeley.
- Event data: [NASA EONET](https://eonet.gsfc.nasa.gov/).
- Satellite imagery: [NASA GIBS](https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs).
- City data: [GeoNames](https://www.geonames.org), CC-BY 4.0.
- Typography: Fraunces (Undercase Type), Inter Tight (Rasmus Andersson),
  JetBrains Mono — all OFL.

## License

MIT — see [`LICENSE`](./LICENSE).
