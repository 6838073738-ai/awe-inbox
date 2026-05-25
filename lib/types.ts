export type CategoryId =
  | "drought"
  | "dustHaze"
  | "earthquakes"
  | "floods"
  | "landslides"
  | "manmade"
  | "seaLakeIce"
  | "severeStorms"
  | "snow"
  | "tempExtremes"
  | "volcanoes"
  | "waterColor"
  | "wildfires"
  /** Curated armed-conflict / war zones — not from EONET. See lib/conflicts.ts */
  | "conflict";

export type EonetCategory = {
  id: CategoryId;
  title: string;
};

export type EonetSource = {
  id: string;
  url: string;
};

export type EonetGeometryPoint = {
  type: "Point";
  magnitudeValue: number | null;
  magnitudeUnit: string | null;
  date: string;
  coordinates: [number, number]; // [lng, lat] per GeoJSON
};

export type EonetGeometryPolygon = {
  type: "Polygon";
  magnitudeValue: number | null;
  magnitudeUnit: string | null;
  date: string;
  coordinates: number[][][];
};

export type EonetGeometry = EonetGeometryPoint | EonetGeometryPolygon;

export type EonetEvent = {
  id: string;
  title: string;
  description: string | null;
  link: string;
  closed: string | null;
  categories: EonetCategory[];
  sources: EonetSource[];
  geometry: EonetGeometry[];
};

export type EonetCollection = {
  title: string;
  description: string;
  link: string;
  events: EonetEvent[];
};

export type City = {
  n: string; // name (ascii)
  c: string; // ISO country code
  lat: number;
  lng: number;
  p: number; // population
};

export type ScoreBreakdown = {
  base: number;
  magnitude: number;
  longevity: number;
  recency: number;
  proximity: number;
  mundanity: number;
  total: number;
  score: number;
  nearestCityKm: number;
  nearestCity: string | null;
  suppressed: boolean;
  suppressionReason?: string;
};

export type ScoredEvent = {
  event: EonetEvent;
  score: number;
  breakdown: ScoreBreakdown;
  category: CategoryId;
  archive?: boolean;
  imagery?: ResolvedImagery;
};

export type ResolvedImagery = {
  kind: "satellite" | "gradient";
  url?: string;
  layer?: string;
  date?: string;
  candidates: string[];
  gradient: { hue: number; angle: number; rx: number; ry: number };
};

export type CuratedFeed = {
  today: ScoredEvent | null;
  inbox: ScoredEvent[];
  generatedAt: string;
  totalConsidered: number;
};
