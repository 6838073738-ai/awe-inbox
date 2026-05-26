import * as THREE from "three";
import bordersData from "./country-borders.json";

/**
 * Build a `THREE.BufferGeometry` of every country border segment, ready to
 * feed into `new THREE.LineSegments(geom, material)`.
 *
 * Vertices are pre-projected to Cartesian on a sphere of radius 1.002 (set in
 * `scripts/build-countries.mjs`), which sits just above the globe texture
 * (r=1.0) so the lines don't z-fight with the day/night shader. Caller is
 * responsible for material + mesh lifecycle and disposal.
 */
export function buildCountryBordersGeometry(): THREE.BufferGeometry {
  const segments = (bordersData as { segments: number[] }).segments;
  const positions = new Float32Array(segments);
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geom;
}
