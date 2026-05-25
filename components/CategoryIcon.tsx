import type { CategoryId } from "@/lib/types";

/**
 * Category icons designed via Gemini (2026-05-25) and adapted into the
 * Awe Inbox icon system. Each icon is the inner markup that sits inside a
 * shared <svg> wrapper, so stroke/color/size are inherited from the parent.
 */
const ICON_MARKUP: Record<CategoryId, string> = {
  // Mountain silhouette with eruption smoke marks above
  volcanoes: `<path d="M12 5l-7 14h14l-7-14z"/><path d="M12 5v-2M15 4l1-2M9 4L8 2"/>`,
  // Iceberg — faceted peak above a clear waterline, with the submerged hint
  // below. Reads as ice rather than a rounded box at 18px.
  seaLakeIce: `<path d="M4 13 L9 5 L14 9 L19 13 Z"/><path d="M3 13h18"/><path d="M7 13 L8.5 18 L13 19 L17 17 L17.5 13" stroke-opacity="0.55"/>`,
  // Hurricane: center eye + four spiral arms
  severeStorms: `<circle cx="12" cy="12" r="1.5"/><path d="M12 12c-4 0-7 3-7 7M12 12c0-4 3-7 7-7M12 12c4 0 7-3 7-7M12 12c0 4-3 7-7 7"/>`,
  // Flame outline with an inner curl
  wildfires: `<path d="M12 2c0 8-5 10-5 15 0 2 2 5 5 5s5-3 5-5c0-7-5-9-5-15zM10 10c1 0 2-1 2-2"/>`,
  // Seismograph trace — sharp zigzag wave
  earthquakes: `<path d="M3 12h4l2-6 3 12 3-8 2 4h4"/>`,
  // Phytoplankton bloom: ocean circle bisected by a current line
  waterColor: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM2 12h20"/>`,
  // Wind-blown dust: four horizontal streaks of varying length
  dustHaze: `<path d="M3 12h18M3 16h18M5 8h14M7 20h10"/>`,
  // River swelling — two wavy current lines
  floods: `<path d="M2 14c2 0 3 1 4 1s2-1 4-1 3 1 4 1 2-1 4-1 3 1 4 1M2 18c2 0 3 1 4 1s2-1 4-1 3 1 4 1 2-1 4-1 3 1 4 1"/>`,
  // Hillside collapse — triangle slope + falling material lines
  landslides: `<path d="M20 20H4l8-16zM12 4v16M8 12l2 2"/>`,
  // Eight-pointed sun (heat radiating outward)
  drought: `<path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>`,
  // Thermometer column — vertical with arrowheads + horizontal base
  tempExtremes: `<path d="M12 3v13M12 3l-3 3M12 3l3 3M12 16l-3-3M12 16l3-3M8 19h8"/>`,
  // Six-pointed snowflake (vertical, two diagonals, horizontal)
  snow: `<path d="M12 2v20M4.22 4.22l15.56 15.56M2 12h20M4.22 19.78l15.56-15.56"/>`,
  // Active armed conflict / war — encircled X. Read as gravity, not danger.
  conflict: `<circle cx="12" cy="12" r="8.2"/><path d="M8 8 L16 16 M16 8 L8 16"/>`,
  // Manmade is excluded from the curated feed but we keep a placeholder
  // for type completeness — a simple dot.
  manmade: `<circle cx="12" cy="12" r="3"/>`,
};

export function CategoryIcon({
  category,
  size = 18,
  className = "",
}: {
  category: CategoryId;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICON_MARKUP[category] ?? ICON_MARKUP.manmade }}
    />
  );
}
