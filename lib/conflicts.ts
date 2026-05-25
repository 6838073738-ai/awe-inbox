/**
 * Curated list of active armed-conflict / war zones, plotted alongside the
 * natural EONET events on the globe.
 *
 * This is a STATIC reference list — not a real-time feed. It will go stale.
 * Review and update at least every few months. Coordinates point to a central
 * place name for each conflict; they do not represent the full territorial
 * extent. Casualty figures and "since" dates use best-effort public sources
 * at the time of curation; treat them as approximate.
 *
 * Categorising armed conflict alongside icebergs and volcanoes is a
 * deliberate editorial choice for the Awe Inbox globe — it acknowledges that
 * to look at the planet without acknowledging human harm is to look away.
 * Each entry is written soberly and avoids partisan framing.
 *
 * Last reviewed: 2026-05
 */

export type ConflictZone = {
  id: string;
  /** Short, neutral label. */
  title: string;
  /** Approximate central coordinates. */
  lat: number;
  lng: number;
  /** Start year of the current phase (not the underlying historical dispute). */
  since: string;
  /** Two-three sentences. Soberly written. No partisan framing. */
  summary: string;
};

export const CONFLICTS: ConflictZone[] = [
  {
    id: "conflict-ukraine",
    title: "War in Ukraine",
    lat: 49.5,
    lng: 32.0,
    since: "2022-02",
    summary:
      "Large-scale armed conflict following Russia's invasion of Ukraine. Active front lines span eastern and southern Ukraine; cities and civilian infrastructure across the country have been struck. Hundreds of thousands of people have been killed or wounded, and millions displaced.",
  },
  {
    id: "conflict-gaza",
    title: "Israel–Hamas war (Gaza)",
    lat: 31.45,
    lng: 34.4,
    since: "2023-10",
    summary:
      "Armed conflict in the Gaza Strip and surrounding areas following the October 2023 attacks. Tens of thousands of Palestinians have been killed, most of Gaza's population has been displaced, and most of the territory's infrastructure has been destroyed or damaged.",
  },
  {
    id: "conflict-sudan",
    title: "Sudan civil war",
    lat: 15.5,
    lng: 32.5,
    since: "2023-04",
    summary:
      "Civil war between the Sudanese Armed Forces and the Rapid Support Forces, centred on Khartoum and spreading across Darfur and Kordofan. The fighting has produced one of the world's largest displacement crises and a famine officially declared in 2024.",
  },
  {
    id: "conflict-myanmar",
    title: "Myanmar civil war",
    lat: 21.0,
    lng: 96.0,
    since: "2021-02",
    summary:
      "Nationwide armed resistance against the military junta following the 2021 coup. Ethnic armed organisations and civilian-led People's Defence Forces hold significant territory; the junta retains the cities. Millions are displaced.",
  },
  {
    id: "conflict-yemen",
    title: "Yemen civil war",
    lat: 15.55,
    lng: 48.5,
    since: "2014-09",
    summary:
      "Long-running multi-party civil war between the internationally recognised government and Houthi forces, with regional powers backing different sides. Despite a fragile pause in active front-line fighting since 2022, the humanitarian crisis remains severe.",
  },
  {
    id: "conflict-eastern-drc",
    title: "Eastern DRC conflict",
    lat: -1.7,
    lng: 29.2,
    since: "2022-03",
    summary:
      "Resurgent fighting in eastern Democratic Republic of the Congo, driven by the M23 armed group and dozens of other militias. The Kivu provinces around Goma and Bukavu have been particularly affected; over six million people are displaced inside the country.",
  },
  {
    id: "conflict-sahel",
    title: "Sahel insurgencies (Mali · Burkina Faso · Niger)",
    lat: 14.0,
    lng: -1.5,
    since: "2012-01",
    summary:
      "Jihadist insurgencies tied to the Islamic State and al-Qaeda affiliates have expanded across the central Sahel since 2012, with military juntas now in power across all three countries. Civilian deaths and displacement have climbed sharply since 2023.",
  },
  {
    id: "conflict-syria",
    title: "Syria",
    lat: 35.0,
    lng: 38.5,
    since: "2011-03",
    summary:
      "After the fall of the Assad government in late 2024, Syria is in a fragile transitional period with ongoing skirmishes between factions in the north and east. The humanitarian situation across the country remains acute, with more than half the pre-war population still displaced.",
  },
  {
    id: "conflict-somalia",
    title: "Somalia (Al-Shabaab)",
    lat: 5.15,
    lng: 46.2,
    since: "2009-01",
    summary:
      "Long-running insurgency by Al-Shabaab against the Federal Government of Somalia and African Union forces. Attacks against Mogadishu, military bases, and rural communities continue; recurring drought has compounded displacement.",
  },
  {
    id: "conflict-haiti",
    title: "Haiti gang violence",
    lat: 18.55,
    lng: -72.33,
    since: "2024-02",
    summary:
      "Heavily armed gang coalitions hold large portions of Port-au-Prince and key roads. State authority has collapsed across much of the country; a multinational security mission has not restored order, and humanitarian access is severely constrained.",
  },
];
