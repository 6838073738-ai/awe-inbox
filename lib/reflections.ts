import type { CategoryId } from "./types";

type Reflection = { short: string; long: string };

export const reflections: Record<
  Exclude<CategoryId, "manmade" | "conflict">,
  Reflection
> = {
  volcanoes: {
    short:
      "Something deep beneath the crust has been waiting since before language. Today it breaches. The mountain remembers, in heat and ash, what it once was.",
    long: "The rock beneath our feet is not still. It moves, slowly, on currents too slow for any human lifetime to register — a few centimeters a year, the pace of a fingernail growing. Volcanoes are the places where that motion becomes visible. When a volcano erupts, it is venting material that has been gathering for centuries, sometimes millennia, in chambers we cannot see. The lava that reaches the surface today began its rise before the cathedral was built, before the alphabet was written. To watch a volcano is to watch geological time briefly enter human time. The Earth, for an instant, runs at our speed. Then it slows again, and the mountain returns to its long patience.",
  },
  seaLakeIce: {
    short:
      "A piece of the world the size of a city has come loose. It will drift for years, melting slowly, returning a thousand winters of snow to the sea that made it.",
    long: "Icebergs are slow news. The one moving south today began as snowfall on Antarctica during the reign of medieval kings — each flake compressed, layer by layer, into ice that flowed at the speed of a glacier toward the coast. There it floated, hung suspended for centuries, until some pressure or warmth or fault line finally let it go. Now it travels at less than a kilometer a day, releasing fresh water that has been locked away since long before our grandparents were born. To watch an iceberg is to watch the climate of another era melting into ours. By the time it disappears, our own snowfalls will be doing the same.",
  },
  severeStorms: {
    short:
      "A storm has organized itself into a single mind. From orbit, the spiral is exact — chaos resolving, for a few days, into geometry.",
    long: "A hurricane is what happens when the ocean, the atmosphere, and the spin of the Earth conspire to produce coherence. Trillions of molecules of warm air, rising, cooling, releasing their heat, are nudged into rotation by the planet's turn. The result is a structure so symmetrical it looks designed — a wheel of cloud hundreds of kilometers wide, with a still eye at its center. Storms like this are among the largest organized things the Earth makes without help. They live for days, sometimes weeks, sustained by warm sea, and then they spend themselves and dissolve. From the ground they are violence. From orbit they are pattern. Both are true.",
  },
  wildfires: {
    short:
      "Fire has taken the boreal again. The same forests have burned for ten thousand years; the trees here grow from cones that need flame to open.",
    long: "Some forests cannot live without burning. The lodgepole pine, the jack pine, the giant sequoia — their cones are sealed with resin that only fire can melt. They have evolved into a partnership with combustion across millions of years. A wildfire in the boreal north is, in part, the forest renewing itself, clearing the understory, returning carbon to soil, opening seedbeds, calling next century's trees into existence. We watch the smoke and feel only loss. The land itself reads the same fire as a beginning. This does not mean every fire is welcome — climate has changed the math — but the old fires, in the old places, are continuous with a story longer than ours.",
  },
  earthquakes: {
    short:
      "Two pieces of the planet, pressed against each other for centuries, have shifted by a few meters. The continents are awake, in their slow way.",
    long: "The ground we trust most is the part that moves. Continents drift, plates grind, faults accumulate strain over generations until something gives. When that release happens far from us, we register it as a tremor on instruments. When it happens beneath a city, we register it as catastrophe. The same event, scaled differently. A magnitude seven earthquake in an empty ocean is the same physics as a magnitude seven beneath a capital — only the geography differs. To know the Earth as a moving thing is the beginning of a particular kind of humility. We are riding something. We did not build it. We do not control it. It will outlast every map we make of it.",
  },
  floods: {
    short:
      "A river has taken back its floodplain. The water is not lost. It is going where rivers have always gone.",
    long: "Rivers do not have banks; they have averages. The line we draw between water and land is the place the river usually sits, not the place it belongs. Every river floods. Floodplains exist because rivers built them — laying down silt over thousands of years, depositing the soils we then farm and live on. When a river rises, it is not breaking a rule; it is restating one. The flood is the river remembering its full shape. We have made it harder for rivers to do this — channelizing, dyking, building close — and so when the water returns, it returns with consequence. The land underneath, undisturbed, would have absorbed it without comment.",
  },
  landslides: {
    short:
      "A hillside has rearranged itself. Gravity, which has been pulling on it since the mountain rose, finally won the argument.",
    long: "Every slope is a slow surrender. The mountains we see were lifted by tectonic forces and have been losing ground, literally, since the moment they appeared — eroded by water, weakened by ice, undermined by their own weight. A landslide is one of the discrete moments in that long surrender. A hillside that has held for ten thousand years lets go in a few seconds. The material now at the bottom will be carried by streams to rivers and eventually to seas, where it will settle as sediment and one day, on a timescale that does not concern us, be lifted again into new mountains. The cycle is geological. We see only a fragment of it.",
  },
  drought: {
    short:
      "The rain has not arrived for a long time. The land is keeping score in its rings and roots, recording an absence we will read later.",
    long: "Drought is what is not happening. It is the slow accumulation of an absence — rainfall that should have come and did not, snowpack that should have built and did not, groundwater that should have refilled and has not. The land registers these absences in its rings, its leaf scars, its retreating shorelines. Tree-ring scientists can read centuries of drought in a single trunk, finding records of dry years that pre-date any human chronicle. The current drought somewhere on the planet today will be legible in the wood of trees not yet sprouted, for centuries to come. We are, without intending it, leaving long messages in the bodies of plants. Whether anyone will be reading is a question for them.",
  },
  dustHaze: {
    short:
      "A storm of fine sand has risen from the Sahara and crossed an ocean. The desert is fertilizing a rainforest five thousand kilometers away.",
    long: "Each year, the trade winds lift roughly a hundred million tons of dust from the Sahara and carry it across the Atlantic. Some of this dust falls into the ocean and feeds the plankton there. Some reaches the Amazon basin, where it settles on leaves and into soils, replenishing minerals — phosphorus most importantly — that the rainforest cannot manufacture and cannot afford to lose. The forest and the desert are partners across an ocean, linked by a wind older than any of the countries they touch. To see a plume of Saharan dust from orbit is to see one half of a transaction the planet has been completing for millions of years, without ever explaining itself to anyone.",
  },
  snow: {
    short:
      "An unusual snow has fallen somewhere it does not usually fall. The map of the cold is shifting; the records of where snow belongs are being rewritten.",
    long: "Snow is water that has agreed to hold a shape for a while. It accumulates in places where the temperature stays below freezing long enough, building the great reservoirs — snowpack in the Sierra, the Alps, the Himalaya — that release themselves slowly through spring and summer to feed rivers, farms, cities. The places where snow falls are not constant. They drift with climate, and within our lifetimes the maps have changed. An unusual snow event, in either direction — too much, too little, too far south — is the climate writing its current sentences. Some of these sentences are short and reversible. Some are not. The snow itself, falling, does not know which it is.",
  },
  tempExtremes: {
    short:
      "The air has reached a temperature it has never reached here before. The instruments record what the body already knows.",
    long: "Heat records are not just statistics; they are the climate showing its hand. The atmosphere has a memory shaped by physics — patterns of pressure, of moisture, of motion — and most of the time it stays within familiar bounds. When it does not, when a temperature is reached that has no precedent in the local record, something has changed in the underlying system. Sometimes the change is local and brief. Sometimes it is the leading edge of something larger, a signal that the climate has shifted into a new range of possibilities. The weather of any single day is not climate, but climate is what determines which weathers are possible. The unprecedented day is the question. The decade tells us the answer.",
  },
  waterColor: {
    short:
      "The sea has changed color where billions of microscopic plants have multiplied at once. Half of the breath you just took came from organisms like these.",
    long: "A phytoplankton bloom is the ocean breathing in. These single-celled drifters — too small to see, vast in aggregate — pull carbon dioxide from the atmosphere, use sunlight to split water, and release oxygen as a byproduct. About half of the oxygen on Earth comes from them. When conditions align — nutrients upwelled from below, the right light, the right calm — they multiply until the water itself takes on their color, spirals and ribbons miles wide, visible from orbit. Not every bloom is benign; some produce toxins. But most are simply the planet's primary producers doing what they have done since long before there were lungs to use the oxygen they make. We are downstream of them, in every breath.",
  },
};

export const categoryTitle: Record<CategoryId, string> = {
  drought: "Drought",
  dustHaze: "Dust & Haze",
  earthquakes: "Earthquake",
  floods: "Floods",
  landslides: "Landslides",
  manmade: "Manmade",
  seaLakeIce: "Sea, Lake & Ice",
  severeStorms: "Severe Storm",
  snow: "Snow",
  tempExtremes: "Temperature Extreme",
  volcanoes: "Volcano",
  waterColor: "Water Color",
  wildfires: "Wildfire",
  conflict: "Conflict",
};

export const accentVar: Record<CategoryId, string> = {
  drought: "--color-accent-drought",
  dustHaze: "--color-accent-dusthaze",
  earthquakes: "--color-accent-earthquakes",
  floods: "--color-accent-floods",
  landslides: "--color-accent-landslides",
  manmade: "--color-accent-default",
  seaLakeIce: "--color-accent-sealakeice",
  severeStorms: "--color-accent-severestorms",
  snow: "--color-accent-snow",
  tempExtremes: "--color-accent-tempextremes",
  volcanoes: "--color-accent-volcanoes",
  waterColor: "--color-accent-watercolor",
  wildfires: "--color-accent-wildfires",
  conflict: "--color-accent-conflict",
};
