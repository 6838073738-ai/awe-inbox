/**
 * Static trivia + key statistics for the Sun, 8 planets, and the Moon.
 * Sources: NASA Planetary Fact Sheets (https://nssdc.gsfc.nasa.gov/planetary/factsheet/)
 * and Wikipedia. All stats verified against NASA factsheets as of 2026-05.
 *
 * Short trivia is for hover popups (~1-2 lines). Long trivia is for the
 * /solar-system/[planet] detail page (3-5 paragraphs of cited facts).
 */

export type PlanetStats = {
  diameterKm: number;
  massEarths: number; // mass relative to Earth = 1
  orbitalPeriodDays: number | null; // null for Sun
  dayLengthHours: number; // self-rotation period (sidereal)
  moons: number;
  surfaceTempC: { min?: number; max?: number; avg?: number };
  distanceFromSunAU: number | null; // null for Sun & Moon
  gravityMS2: number; // surface gravity m/s²
  escapeVelocityKms: number; // escape velocity km/s
};

export type PlanetInfo = {
  /** URL-safe slug (lowercase, no spaces) */
  slug: string;
  /** Display name */
  name: string;
  /** ISO color theme for accents */
  accent: string;
  /** Wikipedia page slug for REST summary fetch */
  wikipediaSlug: string;
  /** NASA factsheet URL */
  nasaFactSheet: string;
  stats: PlanetStats;
  /** 1-2 sentence fun fact for hover popup */
  shortFact: string;
  /** 3-5 paragraphs of trivia for detail page */
  longTrivia: string[];
  /** Path to the texture in /public — used on the detail-page hero */
  texture: string;
};

export const PLANET_DATA: Record<string, PlanetInfo> = {
  sun: {
    slug: "sun",
    name: "Sun",
    accent: "#ffae5a",
    wikipediaSlug: "Sun",
    nasaFactSheet: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html",
    texture: "/textures/sun.jpg",
    stats: {
      diameterKm: 1_392_700,
      massEarths: 333_000,
      orbitalPeriodDays: null,
      dayLengthHours: 25.4 * 24, // equatorial rotation
      moons: 0,
      surfaceTempC: { avg: 5500 },
      distanceFromSunAU: null,
      gravityMS2: 274,
      escapeVelocityKms: 617.7,
    },
    shortFact:
      "A medium-sized yellow dwarf star. Holds 99.86% of the solar system's mass and converts 4 million tonnes of matter into energy every second.",
    longTrivia: [
      "The Sun is a 4.6-billion-year-old G2V main-sequence star — a yellow dwarf, about midway through its hydrogen-burning life. Every second its core fuses ~600 million tonnes of hydrogen into helium, converting roughly four million tonnes of mass directly into the energy that lights and warms every planet.",
      "Photons born in the core take between ten thousand and one hundred seventy thousand years to random-walk their way out through the radiative zone, then a further few weeks through the convective zone. Once they leave the photosphere they reach Earth in just over eight minutes.",
      "Its visible surface — the photosphere — sits at about 5500 °C, but the corona above it is hotter still, at one to three million degrees. Why the corona is hotter than the surface beneath it remains one of the open questions in solar physics; Parker Solar Probe is currently flying through it gathering data.",
      "The Sun rotates differentially: roughly 25 days at the equator, 35 days near the poles. That twisting motion winds magnetic field lines into the active regions that eventually erupt as flares and coronal mass ejections — the same eruptions that produce auroras when their plasma reaches Earth.",
      "In about five billion years the Sun will exhaust its core hydrogen, expand into a red giant large enough to engulf Mercury, Venus, and possibly Earth, and finally shed its outer layers as a planetary nebula — leaving behind a white-dwarf ember about the size of our planet.",
    ],
  },
  mercury: {
    slug: "mercury",
    name: "Mercury",
    accent: "#a89890",
    wikipediaSlug: "Mercury_(planet)",
    nasaFactSheet:
      "https://nssdc.gsfc.nasa.gov/planetary/factsheet/mercuryfact.html",
    texture: "/textures/mercury.jpg",
    stats: {
      diameterKm: 4_879,
      massEarths: 0.055,
      orbitalPeriodDays: 87.97,
      dayLengthHours: 4222.6, // 176 Earth days — sidereal "solar day" is 176
      moons: 0,
      surfaceTempC: { min: -173, max: 427 },
      distanceFromSunAU: 0.387,
      gravityMS2: 3.7,
      escapeVelocityKms: 4.3,
    },
    shortFact:
      "Smallest planet, closest to the Sun. A single Mercury solar day lasts about 176 Earth days — longer than its own year.",
    longTrivia: [
      "Mercury is the smallest planet in the solar system — only slightly larger than Earth's Moon — and the closest to the Sun. It races around its orbit in just 88 Earth days, but rotates on its axis only three times for every two orbits, an unusual 3:2 spin-orbit resonance that makes one Mercury solar day last 176 Earth days.",
      "It has no real atmosphere, only a tenuous exosphere of hydrogen, helium, oxygen, sodium, calcium, and potassium picked up from the solar wind and meteoroid impacts. Without that insulating blanket, temperatures swing from 430 °C in direct sunlight to -180 °C on the night side — the steepest day-night range of any planet.",
      "Mercury's surface, mapped in detail by NASA's MESSENGER mission (2011-2015), is heavily cratered and ancient — the Caloris Basin alone is 1,550 km across, scarred by an impact so violent the antipodal hemisphere is fractured into chaotic terrain. Long ridges called rupes show the planet shrank as its iron core cooled.",
      "About 60% of Mercury is made of iron — proportionally more than any other planet — packed into a core that takes up 80% of the planet's radius. Why so much iron? Leading hypotheses include a giant impact that stripped the lighter outer layers, or formation in an inner-disk region where light elements had already been blown out by the young Sun.",
      "The European-Japanese BepiColombo mission is en route as of 2026, due to enter Mercury orbit in late 2026 to take over from MESSENGER's legacy — including the puzzling polar craters that appear to harbour permanent water-ice deposits never warmed by the Sun.",
    ],
  },
  venus: {
    slug: "venus",
    name: "Venus",
    accent: "#d4a373",
    wikipediaSlug: "Venus",
    nasaFactSheet:
      "https://nssdc.gsfc.nasa.gov/planetary/factsheet/venusfact.html",
    texture: "/textures/venus.jpg",
    stats: {
      diameterKm: 12_104,
      massEarths: 0.815,
      orbitalPeriodDays: 224.7,
      dayLengthHours: 2802, // 116.75 Earth days
      moons: 0,
      surfaceTempC: { avg: 464 },
      distanceFromSunAU: 0.723,
      gravityMS2: 8.87,
      escapeVelocityKms: 10.36,
    },
    shortFact:
      "Hottest planet at 464 °C — hotter than Mercury despite being further from the Sun. Spins backwards relative to every other planet.",
    longTrivia: [
      "Venus is nearly Earth's twin in size and mass — roughly 95% the diameter, 81% the mass — and is sometimes called our \"sister planet.\" But its surface conditions are radically different: an atmospheric pressure 92 times Earth's, a temperature of 464 °C uniform across day and night, and clouds of sulphuric acid driven by hurricane-force winds.",
      "Its runaway greenhouse effect is the textbook example of climate catastrophe. Carbon-dioxide atmospheric content of 96.5% traps so much infrared radiation that Venus is hotter than Mercury, despite receiving roughly a quarter the sunlight per square meter.",
      "Venus rotates in the opposite direction to almost every other planet — extremely slowly, taking 243 Earth days for a single rotation, longer than the 225 Earth days it takes to circle the Sun. Combined with its orbital motion, that means a Venus solar day lasts about 117 Earth days, and the Sun rises in the west and sets in the east.",
      "The surface, last imaged by the Magellan mission's synthetic-aperture radar (1990-1994), is covered in volcanic plains, ridge belts, and over 1,600 major volcanoes. NASA's VERITAS and DAVINCI+ missions and ESA's EnVision are scheduled to relaunch detailed Venus exploration in the late 2020s.",
      "In 2020 a controversial detection of phosphine in Venus's upper cloud deck triggered renewed speculation about whether microbial life might survive in the cooler, more temperate layer of the atmosphere 50 km above the surface. The signal has been debated since; resolving it is one motivation for the upcoming missions.",
    ],
  },
  earth: {
    slug: "earth",
    name: "Earth",
    accent: "#4f8cc5",
    wikipediaSlug: "Earth",
    nasaFactSheet:
      "https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html",
    texture: "/textures/earth.jpg",
    stats: {
      diameterKm: 12_756,
      massEarths: 1,
      orbitalPeriodDays: 365.26,
      dayLengthHours: 23.93,
      moons: 1,
      surfaceTempC: { avg: 15 },
      distanceFromSunAU: 1.0,
      gravityMS2: 9.81,
      escapeVelocityKms: 11.19,
    },
    shortFact:
      "Only known planet with liquid surface water, plate tectonics, and a biosphere. 71% ocean, 29% land.",
    longTrivia: [
      "Earth is the only world we know that hosts liquid water across its surface, an active biosphere, and plate tectonics that continuously recycle the crust. Its temperate climate is sustained by an unusually thick nitrogen-oxygen atmosphere, a magnetic field generated by convection in the molten outer core, and the stabilising gravitational influence of an oversized Moon.",
      "The biosphere has reshaped the planet's chemistry: roughly 21% of the current atmosphere is free oxygen, almost all of it the by-product of photosynthesis by cyanobacteria and later plants. Before the Great Oxidation Event 2.4 billion years ago, Earth's air had almost no free oxygen at all.",
      "Plate tectonics — the slow drift and recycling of crustal plates — is currently believed to be unique to Earth among rocky planets. Combined with weathering, it acts as a long-term thermostat, drawing CO₂ out of the atmosphere over millions of years and helping keep surface temperatures liveable as the Sun's brightness has slowly increased.",
      "The Moon, roughly a quarter of Earth's diameter, is unusually large relative to its host planet and was almost certainly produced by a Mars-sized impact during Earth's first 100 million years. Its tidal pull stabilises our axial tilt of 23.4°, which in turn produces seasons and a reasonably steady long-term climate.",
      "From the perspective of NASA's Earth-observation programme — EONET, the source of the events on the Awe Inbox globe — the planet is a single coupled system: wildfires in Siberia colour skies above Tokyo; phytoplankton blooms off Argentina pull carbon into the deep ocean; melting icebergs from Antarctica change sea level in Bangladesh. Awe Inbox surfaces the slow, vast, beautiful parts of that system once a day.",
    ],
  },
  mars: {
    slug: "mars",
    name: "Mars",
    accent: "#cc6f44",
    wikipediaSlug: "Mars",
    nasaFactSheet:
      "https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html",
    texture: "/textures/mars.jpg",
    stats: {
      diameterKm: 6_792,
      massEarths: 0.107,
      orbitalPeriodDays: 686.97,
      dayLengthHours: 24.62,
      moons: 2,
      surfaceTempC: { avg: -65 },
      distanceFromSunAU: 1.524,
      gravityMS2: 3.71,
      escapeVelocityKms: 5.03,
    },
    shortFact:
      "Hosts Olympus Mons — at 22 km, the tallest volcano in the solar system. Once had rivers, lakes, and possibly an ocean.",
    longTrivia: [
      "Mars is the fourth planet from the Sun and the most thoroughly explored body beyond Earth — currently home to NASA's Curiosity and Perseverance rovers, China's Zhurong rover, and a small fleet of orbiters watching its weather and probing its interior. Its thin CO₂ atmosphere (less than 1% of Earth's pressure) is just thick enough to drive global dust storms and a thin water-ice cycle.",
      "Olympus Mons, in the Tharsis volcanic region, is the tallest known mountain in the solar system — 22 km high, with a base over 600 km across. Its size is a consequence of Mars's lack of plate tectonics: the same hot spot in the mantle has been erupting through a stationary crust for billions of years, instead of being smeared into a chain of smaller volcanoes the way the Hawaiian Islands are.",
      "Valles Marineris, a canyon system 4,000 km long and up to 7 km deep, runs along the planet's equator like a scar. It's not a river valley but a tectonic rift, formed as the crust pulled apart in response to the rising Tharsis bulge.",
      "Multiple lines of evidence indicate Mars was warmer and wetter early in its history. Dried river deltas, hydrated minerals, and shoreline-like features point to flowing surface water, possibly even a northern-hemisphere ocean, before the planet lost most of its atmosphere to space around 3.5-4 billion years ago.",
      "The Perseverance rover is currently caching samples from Jezero Crater — an ancient lake bed — for a future Mars Sample Return mission planned with ESA. Whether any of those samples contain biosignatures of past microbial life is the central open question of contemporary planetary science.",
    ],
  },
  jupiter: {
    slug: "jupiter",
    name: "Jupiter",
    accent: "#d4a884",
    wikipediaSlug: "Jupiter",
    nasaFactSheet:
      "https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html",
    texture: "/textures/jupiter.jpg",
    stats: {
      diameterKm: 142_984,
      massEarths: 317.83,
      orbitalPeriodDays: 4332.59,
      dayLengthHours: 9.93,
      moons: 95,
      surfaceTempC: { avg: -110 },
      distanceFromSunAU: 5.203,
      gravityMS2: 24.79,
      escapeVelocityKms: 59.5,
    },
    shortFact:
      "Largest planet — 11 Earths across, 318 Earths in mass. Has 95 known moons. The Great Red Spot is a storm older than the United States.",
    longTrivia: [
      "Jupiter is the most massive planet in the solar system — more than twice the combined mass of everything else orbiting the Sun. Its rapid 9.93-hour rotation flings clouds into the alternating zonal jet streams that produce the planet's iconic banded appearance: ammonia ice high up, ammonium hydrosulphide below that, and water clouds deeper still.",
      "The Great Red Spot is a high-pressure anticyclonic storm that has been observed continuously since at least 1830, possibly since 1665. It's larger than Earth (though it has been shrinking for the past century), with winds at the edge exceeding 430 km/h. NASA's Juno mission has probed its depth at over 300 km below the cloud tops.",
      "Jupiter has 95 confirmed moons (as of 2026), including the four large Galilean satellites Galileo Galilei discovered in 1610 — Io, Europa, Ganymede, and Callisto. Io is the most volcanically active body in the solar system, kept molten by tidal flexing from Jupiter and its neighbouring moons. Europa and Ganymede are believed to host subsurface liquid water oceans beneath their icy crusts.",
      "The planet has a faint ring system discovered by Voyager 1 in 1979, made of dust knocked off the small inner moons. It also generates the most powerful planetary magnetic field in the solar system — 14 times stronger than Earth's at the cloud tops — which traps charged particles into a radiation belt deadly to spacecraft.",
      "ESA's JUICE (Jupiter Icy Moons Explorer) is currently en route, due to arrive in 2031 for a multi-year tour focused on Ganymede, Callisto, and Europa. NASA's Europa Clipper, launched in 2024, is scheduled to start its 49 close flybys of Europa in 2030, searching for habitability indicators in that moon's hidden ocean.",
    ],
  },
  saturn: {
    slug: "saturn",
    name: "Saturn",
    accent: "#e8c898",
    wikipediaSlug: "Saturn",
    nasaFactSheet:
      "https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturnfact.html",
    texture: "/textures/saturn.jpg",
    stats: {
      diameterKm: 120_536,
      massEarths: 95.16,
      orbitalPeriodDays: 10759.22,
      dayLengthHours: 10.66,
      moons: 146,
      surfaceTempC: { avg: -140 },
      distanceFromSunAU: 9.539,
      gravityMS2: 10.44,
      escapeVelocityKms: 35.5,
    },
    shortFact:
      "Famous rings span 282,000 km but are only ~10 m thick. So low-density it would float on water — if you could find a bathtub large enough.",
    longTrivia: [
      "Saturn is the second-largest planet and the only one with a ring system visible from Earth through small backyard telescopes — though Jupiter, Uranus, and Neptune all have fainter rings of their own. Its average density of 0.687 g/cm³ is less than water; the joke is that Saturn would float, if there were a body of water large enough to hold it.",
      "The rings, formally A through G (named in order of discovery, not position), span about 282,000 km outward from the planet but are remarkably thin — between 10 metres and a kilometre in most places. They are made almost entirely of water ice, ranging in size from microscopic dust grains to mountain-sized chunks, and are kept sharp at their edges by small shepherd moons.",
      "How and when the rings formed is contested. Their cleanness suggests they're young — perhaps only a few hundred million years old, the remains of a moon that wandered too close and was torn apart by Saturn's gravity, or comet debris captured into orbit. Cassini-era data has hinted they may be evaporating into the planet, possibly disappearing entirely over the next 100-300 million years.",
      "Saturn has 146 confirmed moons (NASA, 2026), more than any other planet. Titan is larger than Mercury and is the only moon with a thick atmosphere — a nitrogen-rich envelope hosting methane rain, ethane lakes, and a hydrological cycle in which methane plays the role water does on Earth. Huygens, the Cassini lander, parachuted to its surface in 2005 and returned the most distant landing images ever captured.",
      "Enceladus, a smaller icy moon, shoots geyser-like plumes from its south-polar fractures hundreds of kilometres into space, sampling a salty subsurface ocean. The plumes contain water vapor, salts, organics, and detectable molecular hydrogen — chemistry consistent with hydrothermal activity on the ocean floor. Enceladus is one of the most promising targets in the solar system in the search for extraterrestrial life.",
    ],
  },
  uranus: {
    slug: "uranus",
    name: "Uranus",
    accent: "#8fc2c9",
    wikipediaSlug: "Uranus",
    nasaFactSheet:
      "https://nssdc.gsfc.nasa.gov/planetary/factsheet/uranusfact.html",
    texture: "/textures/uranus.jpg",
    stats: {
      diameterKm: 51_118,
      massEarths: 14.54,
      orbitalPeriodDays: 30_688.5,
      dayLengthHours: 17.24,
      moons: 28,
      surfaceTempC: { avg: -195 },
      distanceFromSunAU: 19.18,
      gravityMS2: 8.87,
      escapeVelocityKms: 21.3,
    },
    shortFact:
      "Rotates on its side at 97.8° — likely tipped by an ancient giant impact. Atmospheric methane makes it cyan.",
    longTrivia: [
      "Uranus is the seventh planet from the Sun and one of the two \"ice giants\" — large worlds dominated by heavier volatiles like water, methane and ammonia rather than the hydrogen and helium that dominate Jupiter and Saturn. It was the first planet discovered with a telescope, by William Herschel in 1781.",
      "Its most distinctive property is an axial tilt of 97.8°: Uranus is essentially rolling around its orbit on its side. The most widely accepted explanation is a colossal impact early in the planet's history — possibly two — that knocked the rotation axis nearly into the orbital plane. As a result each pole spends 42 Earth years in continuous sunlight, then 42 in darkness.",
      "The cyan-blue colour comes from methane in the upper atmosphere, which absorbs red wavelengths and reflects blue. Beneath the visible cloud tops the atmosphere transitions through hydrogen, helium, and methane layers into a slushy mantle of water, ammonia, and methane ices under enormous pressure — sometimes nicknamed the \"superionic ocean.\"",
      "Uranus has a faint ring system (discovered by stellar occultation in 1977) and 28 known moons, all named after characters from Shakespeare and Alexander Pope rather than Greco-Roman myth — the convention started with Herschel's son John. The five largest moons (Miranda, Ariel, Umbriel, Titania, Oberon) were mapped in a single fly-by by Voyager 2 in 1986; no spacecraft has visited the system since.",
      "Models suggest a dedicated Uranus orbiter mission could resolve outstanding questions about the planet's interior structure, magnetic-field geometry (offset 59° from the rotation axis), and whether its moons might host subsurface oceans. NASA's 2023-2032 planetary decadal survey ranked a Uranus orbiter and probe as the highest-priority next flagship.",
    ],
  },
  neptune: {
    slug: "neptune",
    name: "Neptune",
    accent: "#4570b5",
    wikipediaSlug: "Neptune",
    nasaFactSheet:
      "https://nssdc.gsfc.nasa.gov/planetary/factsheet/neptunefact.html",
    texture: "/textures/neptune.jpg",
    stats: {
      diameterKm: 49_528,
      massEarths: 17.15,
      orbitalPeriodDays: 60_182,
      dayLengthHours: 16.11,
      moons: 16,
      surfaceTempC: { avg: -200 },
      distanceFromSunAU: 30.07,
      gravityMS2: 11.15,
      escapeVelocityKms: 23.5,
    },
    shortFact:
      "Furthest planet. Winds reach 2,100 km/h — the fastest known sustained winds in the solar system.",
    longTrivia: [
      "Neptune is the eighth and outermost planet from the Sun — discovered in 1846 not by direct observation but by mathematical prediction, after Urbain Le Verrier worked out where an unseen planet must be to explain irregularities in Uranus's orbit. Within hours of receiving his coordinates, German astronomer Johann Galle found the planet within 1° of the predicted position.",
      "It is the most distant of the major planets, orbiting at 30 AU — so far that a single Neptunian year is 165 Earth years long. Since its discovery it has completed only one full orbit, in July 2011.",
      "Despite receiving less than a thousandth the sunlight Earth does, Neptune's atmosphere is the windiest in the solar system, with sustained winds measured by Voyager 2 at up to 2,100 km/h. The energy source for those winds isn't well understood — it can't be solar heating alone, suggesting internal heat from continued contraction or methane condensation is doing significant work.",
      "Triton, Neptune's largest moon, orbits backwards relative to the planet's rotation — strong evidence it was originally a Kuiper Belt object captured by Neptune's gravity. It is the only large moon in the solar system with a retrograde orbit, and one of only three bodies (along with Earth and Saturn's moon Enceladus) known to have active geological activity, with nitrogen geysers seen by Voyager 2.",
      "Like Uranus, Neptune has been visited only once: Voyager 2 flew past in August 1989. The 2023 NASA planetary decadal survey ranks a Uranus mission first, but recommends a Neptune-Triton orbiter and atmospheric probe as a high priority for the following flagship. Both ice giants remain the least-explored major worlds in the solar system.",
    ],
  },
  moon: {
    slug: "moon",
    name: "Moon",
    accent: "#c8cfd6",
    wikipediaSlug: "Moon",
    nasaFactSheet:
      "https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html",
    texture: "/textures/moon.jpg",
    stats: {
      diameterKm: 3_475,
      massEarths: 0.0123,
      orbitalPeriodDays: 27.32,
      dayLengthHours: 655.7, // synodic day ~29.5 Earth days
      moons: 0,
      surfaceTempC: { min: -173, max: 127 },
      distanceFromSunAU: 1.0,
      gravityMS2: 1.62,
      escapeVelocityKms: 2.38,
    },
    shortFact:
      "Earth's only natural satellite. Slowly drifting away at 3.8 cm per year. Always shows the same face to Earth.",
    longTrivia: [
      "The Moon is Earth's only natural satellite — the fifth largest moon in the solar system, and unusually large relative to its host planet. The current consensus is that it formed about 4.5 billion years ago when a Mars-sized body called Theia struck the proto-Earth, ejecting molten debris that coalesced into the Moon over the next 100 million years.",
      "It is tidally locked: the same hemisphere has faced Earth for billions of years. The far side — first photographed by Luna 3 in 1959 — is dramatically different, with thicker crust, more craters, and far fewer of the dark basaltic plains (\"maria\") that make up the familiar near-side face.",
      "Surface gravity is just 1/6th of Earth's, which is why the Apollo astronauts could jump around in their bulky suits. The lunar day is roughly 29.5 Earth days long; surface temperatures swing from 127 °C in direct sunlight to -173 °C in shadow, with permanently shadowed polar craters as cold as -240 °C — cold enough to trap water ice for billions of years.",
      "The Moon is drifting away from Earth at about 3.8 cm per year, as tidal interactions transfer angular momentum from Earth's spin into the Moon's orbit. The Earth's day is correspondingly lengthening; 1.4 billion years ago the day was about 18 hours long.",
      "After a 50-year pause following Apollo, the Moon is the focus of intense renewed interest. NASA's Artemis program is working toward a sustained human presence at the lunar south pole, where water-ice deposits in permanently shadowed craters could support life support and rocket-fuel production. China, India, Japan, and South Korea all have active lunar programs as well.",
    ],
  },
};

export function getPlanet(slug: string): PlanetInfo | null {
  return PLANET_DATA[slug.toLowerCase()] ?? null;
}

export const PLANET_SLUGS = Object.keys(PLANET_DATA);
