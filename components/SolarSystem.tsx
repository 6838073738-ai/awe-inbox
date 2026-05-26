"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Body, HelioVector, GeoVector } from "astronomy-engine";

/**
 * The solar system rendered in Three.js at a compressed-but-recognizable
 * scale. The orbital plane is the X-Z plane (so we look "down" onto it
 * slightly tilted). Below the orbital plane sits a deformed grid mesh
 * representing spacetime curvature — vertices are pushed down proportional
 * to the gravitational potential summed over the Sun + every planet.
 *
 * Positions come from the astronomy-engine npm package (MIT) which is a
 * port of NASA JPL's planetary calculations. Each planet is placed at its
 * actual current heliocentric coordinates (compressed), then advanced at
 * an accelerated time rate so orbital motion is visible in seconds rather
 * than centuries.
 *
 * Textures are 2K CC-BY 4.0 surface maps from Solar System Scope.
 */

type PlanetDef = {
  name: string;
  body: Body;
  /** Display radius in scene units (NOT to scale — purely visual hierarchy) */
  radius: number;
  /** Display distance from Sun in scene units. We use astronomy-engine for
   *  the actual angular position; this is just a per-planet length scalar. */
  distance: number;
  /** Path to the surface texture in /public */
  texture: string;
  /** Axial tilt in degrees, applied to the planet mesh */
  tilt: number;
  /** Day length in earth-days — controls self-rotation rate */
  rotPeriodDays: number;
  /** Gravitational mass weight for the spacetime grid (Sun-relative). */
  massWeight: number;
};

const PLANETS: PlanetDef[] = [
  { name: "Mercury", body: Body.Mercury, radius: 0.10, distance: 5,  texture: "/textures/mercury.jpg", tilt: 0.03, rotPeriodDays: 58.6,  massWeight: 0.00000017 },
  { name: "Venus",   body: Body.Venus,   radius: 0.16, distance: 7,  texture: "/textures/venus.jpg",   tilt: 177.3, rotPeriodDays: -243.0, massWeight: 0.00000245 },
  { name: "Earth",   body: Body.Earth,   radius: 0.17, distance: 9.5,texture: "/textures/earth.jpg",   tilt: 23.5,  rotPeriodDays: 1.0,   massWeight: 0.000003 },
  { name: "Mars",    body: Body.Mars,    radius: 0.12, distance: 12, texture: "/textures/mars.jpg",    tilt: 25.2,  rotPeriodDays: 1.03,  massWeight: 0.00000032 },
  { name: "Jupiter", body: Body.Jupiter, radius: 0.70, distance: 17, texture: "/textures/jupiter.jpg", tilt: 3.13,  rotPeriodDays: 0.41,  massWeight: 0.000955 },
  { name: "Saturn",  body: Body.Saturn,  radius: 0.58, distance: 22, texture: "/textures/saturn.jpg",  tilt: 26.7,  rotPeriodDays: 0.44,  massWeight: 0.000285 },
  { name: "Uranus",  body: Body.Uranus,  radius: 0.32, distance: 26, texture: "/textures/uranus.jpg",  tilt: 97.8,  rotPeriodDays: -0.72, massWeight: 0.0000437 },
  { name: "Neptune", body: Body.Neptune, radius: 0.31, distance: 29.5,texture: "/textures/neptune.jpg",tilt: 28.3,  rotPeriodDays: 0.67,  massWeight: 0.0000515 },
];

const SUN_RADIUS = 2.0;
const SUN_MASS_WEIGHT = 1.0;
const TIME_SCALE_DAYS_PER_SEC = 14; // 1 sec real = 2 weeks simulated
const GRID_SIZE = 70;
const GRID_SEGMENTS = 64;
const GRID_DEPTH_SCALE = 6; // visual stretch on the rubber-sheet depression

export function SolarSystem() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [textureProgress, setTextureProgress] = useState({ loaded: 0, total: 0 });
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const w = wrap.clientWidth;
    const h = wrap.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040408);

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(0, 24, 42);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(w, h);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    wrap.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 6;
    controls.maxDistance = 120;
    controls.maxPolarAngle = Math.PI * 0.95;

    // Lighting — directional from the Sun, plus a faint ambient to keep
    // the night side from going pitch black.
    const sunLight = new THREE.PointLight(0xfff4d6, 3.0, 0, 0);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x404656, 0.35));

    const loader = new THREE.TextureLoader();
    const PATHS = [
      "/textures/sun.jpg",
      "/textures/moon.jpg",
      "/textures/saturn-ring.png",
      "/textures/stars.jpg",
      ...PLANETS.map((p) => p.texture),
    ];
    setTextureProgress({ loaded: 0, total: PATHS.length });
    function loadTex(path: string): Promise<THREE.Texture> {
      return new Promise((res, rej) => {
        loader.load(
          path,
          (t) => {
            t.colorSpace = THREE.SRGBColorSpace;
            t.anisotropy = renderer.capabilities.getMaxAnisotropy();
            setTextureProgress((p) => ({ ...p, loaded: p.loaded + 1 }));
            res(t);
          },
          undefined,
          (e) => rej(e),
        );
      });
    }

    let disposed = false;
    let raf = 0;

    Promise.all(PATHS.map(loadTex))
      .then((textures) => {
        if (disposed) return;
        const [sunTex, moonTex, ringTex, starsTex, ...planetTexes] = textures;

        // Starfield skybox
        const stars = new THREE.Mesh(
          new THREE.SphereGeometry(450, 32, 32),
          new THREE.MeshBasicMaterial({
            map: starsTex,
            side: THREE.BackSide,
            color: 0x444466,
          }),
        );
        scene.add(stars);

        // Sun — basic material so it self-illuminates (we don't want the
        // light source to be in shadow of itself).
        const sun = new THREE.Mesh(
          new THREE.SphereGeometry(SUN_RADIUS, 64, 64),
          new THREE.MeshBasicMaterial({ map: sunTex }),
        );
        scene.add(sun);

        // Sun corona — additive shader for a warm glow.
        const corona = new THREE.Mesh(
          new THREE.SphereGeometry(SUN_RADIUS * 1.5, 32, 32),
          new THREE.ShaderMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.BackSide,
            uniforms: { uColor: { value: new THREE.Color(0xffb24a) } },
            vertexShader: /* glsl */ `
              varying vec3 vNormal;
              void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: /* glsl */ `
              uniform vec3 uColor;
              varying vec3 vNormal;
              void main() {
                float f = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(uColor, f * 0.8);
              }
            `,
          }),
        );
        scene.add(corona);

        // Planet meshes + orbital ring lines + Saturn ring + Earth-Moon
        const planetMeshes: Array<{
          def: PlanetDef;
          mesh: THREE.Mesh;
          orbitRing: THREE.Line;
        }> = [];

        for (let i = 0; i < PLANETS.length; i++) {
          const p = PLANETS[i];
          const tex = planetTexes[i];
          const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(p.radius, 48, 48),
            new THREE.MeshStandardMaterial({
              map: tex,
              roughness: 0.92,
              metalness: 0,
            }),
          );
          mesh.rotation.z = (p.tilt * Math.PI) / 180;
          mesh.userData.planet = p;
          scene.add(mesh);

          // Saturn ring
          if (p.name === "Saturn") {
            const ringGeom = new THREE.RingGeometry(
              p.radius * 1.3,
              p.radius * 2.3,
              96,
            );
            // Reproject UVs so the texture wraps radially (otherwise
            // RingGeometry's default UVs are unusable).
            const pos = ringGeom.attributes.position;
            const uv = ringGeom.attributes.uv;
            for (let v = 0; v < pos.count; v++) {
              const x = pos.getX(v);
              const y = pos.getY(v);
              const r = Math.sqrt(x * x + y * y);
              const t =
                (r - p.radius * 1.3) / (p.radius * 2.3 - p.radius * 1.3);
              uv.setXY(v, t, 0.5);
            }
            uv.needsUpdate = true;
            const ringMesh = new THREE.Mesh(
              ringGeom,
              new THREE.MeshBasicMaterial({
                map: ringTex,
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false,
              }),
            );
            ringMesh.rotation.x = Math.PI / 2;
            mesh.add(ringMesh);
          }

          // Earth gets the Moon as a child
          if (p.name === "Earth") {
            const moonMesh = new THREE.Mesh(
              new THREE.SphereGeometry(p.radius * 0.27, 32, 32),
              new THREE.MeshStandardMaterial({
                map: moonTex,
                roughness: 0.96,
                metalness: 0,
              }),
            );
            moonMesh.name = "moon";
            scene.add(moonMesh);
            // Updated each tick from astronomy-engine geocentric Moon pos
          }

          // Orbital path ring
          const ringPositions: number[] = [];
          const SEG = 256;
          for (let s = 0; s <= SEG; s++) {
            const a = (s / SEG) * Math.PI * 2;
            ringPositions.push(
              Math.cos(a) * p.distance,
              0,
              Math.sin(a) * p.distance,
            );
          }
          const ringG = new THREE.BufferGeometry();
          ringG.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(ringPositions, 3),
          );
          const orbitRing = new THREE.Line(
            ringG,
            new THREE.LineBasicMaterial({
              color: 0x88a4c4,
              transparent: true,
              opacity: p.name === "Earth" ? 0.6 : 0.28,
              depthWrite: false,
            }),
          );
          scene.add(orbitRing);

          planetMeshes.push({ def: p, mesh, orbitRing });
        }

        // === Spacetime fabric grid ===
        // A horizontal plane below the orbital plane whose vertices are
        // pushed DOWN proportional to summed gravitational potential. The
        // Sun produces a deep central well; planets produce small
        // surrounding dimples. Recomputed every 30 frames as planets move.
        const gridGeom = new THREE.PlaneGeometry(
          GRID_SIZE,
          GRID_SIZE,
          GRID_SEGMENTS,
          GRID_SEGMENTS,
        );
        gridGeom.rotateX(-Math.PI / 2);
        const gridMat = new THREE.LineBasicMaterial({
          color: 0xb8ae9b,
          transparent: true,
          opacity: 0.22,
          depthWrite: false,
        });
        // Wireframe rendering of the plane
        const gridWire = new THREE.LineSegments(
          new THREE.WireframeGeometry(gridGeom),
          gridMat,
        );
        gridWire.position.y = -3.5;
        scene.add(gridWire);

        // We work on a shared positions array — wireframe geometry has its
        // own vertex set but we deform the underlying PlaneGeometry then
        // rebuild the wireframe each refresh.
        const bodyPositions: Array<{
          x: number;
          z: number;
          mass: number;
          radiusSoft: number;
        }> = [
          { x: 0, z: 0, mass: SUN_MASS_WEIGHT, radiusSoft: 1.2 },
          ...PLANETS.map((p) => ({
            x: p.distance,
            z: 0,
            mass: p.massWeight,
            radiusSoft: 0.3,
          })),
        ];

        function deformGrid() {
          const pos = gridGeom.attributes.position;
          for (let v = 0; v < pos.count; v++) {
            const x = pos.getX(v);
            const z = pos.getZ(v);
            let depth = 0;
            for (const b of bodyPositions) {
              const dx = x - b.x;
              const dz = z - b.z;
              const r = Math.sqrt(dx * dx + dz * dz) + b.radiusSoft;
              depth += b.mass / r;
            }
            pos.setY(v, -depth * GRID_DEPTH_SCALE);
          }
          pos.needsUpdate = true;
          gridGeom.computeBoundingSphere();
          // Rebuild wireframe edges to match the new vertex positions
          const oldEdges = gridWire.geometry;
          gridWire.geometry = new THREE.WireframeGeometry(gridGeom);
          oldEdges.dispose();
        }
        deformGrid();

        // === Animation ===
        const epochStart = new Date();
        let elapsedSimDays = 0;
        let lastTime = performance.now();
        let frameCount = 0;

        function tick(now: number) {
          const dt = (now - lastTime) / 1000; // sec
          lastTime = now;
          if (!prefersReduced) {
            elapsedSimDays += dt * TIME_SCALE_DAYS_PER_SEC;
          }
          const simDate = new Date(
            epochStart.getTime() + elapsedSimDays * 86400_000,
          );

          // Update planet positions from astronomy-engine
          for (let i = 0; i < planetMeshes.length; i++) {
            const { def, mesh } = planetMeshes[i];
            try {
              const v = HelioVector(def.body, simDate);
              // Heliocentric ecliptic coords (AU). Convert to scene scale —
              // we use the planet's display `distance` and the actual
              // angular position from astronomy-engine.
              const auMag = Math.sqrt(v.x * v.x + v.y * v.y);
              if (auMag > 0) {
                const ang = Math.atan2(v.y, v.x);
                mesh.position.x = Math.cos(ang) * def.distance;
                mesh.position.z = Math.sin(ang) * def.distance;
              }
              if (def.name === "Earth") {
                bodyPositions[i + 1].x = mesh.position.x;
                bodyPositions[i + 1].z = mesh.position.z;
                // Moon position relative to Earth
                const moon = scene.getObjectByName("moon");
                if (moon) {
                  const mv = GeoVector(Body.Moon, simDate, false);
                  // mv is in AU. Earth-Moon mean distance is 0.00257 AU =
                  // 384,400 km. We render that at 0.6 scene units for
                  // visibility (much bigger than physically correct).
                  const moonScale = 240;
                  moon.position.set(
                    mesh.position.x + mv.x * moonScale,
                    mv.z * moonScale * 0.5,
                    mesh.position.z + mv.y * moonScale,
                  );
                }
              } else {
                bodyPositions[i + 1].x = mesh.position.x;
                bodyPositions[i + 1].z = mesh.position.z;
              }
            } catch {
              /* astronomy-engine throws if simDate is out of its range —
               * unlikely to happen unless someone scrubs the clock. */
            }
            // Self-rotation
            if (!prefersReduced) {
              const dayRot =
                ((dt * TIME_SCALE_DAYS_PER_SEC) / def.rotPeriodDays) *
                Math.PI *
                2;
              mesh.rotation.y += dayRot;
            }
          }

          // Sun self-rotation (~25 days at equator)
          if (!prefersReduced) {
            sun.rotation.y += (dt * TIME_SCALE_DAYS_PER_SEC / 25) * Math.PI * 2;
          }

          // Refresh spacetime grid every ~30 frames (planets shift slowly)
          frameCount += 1;
          if (frameCount % 30 === 0) {
            deformGrid();
          }

          controls.update();
          renderer.render(scene, camera);
          raf = requestAnimationFrame(tick);
        }
        raf = requestAnimationFrame(tick);

        // Hover detection via raycaster
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        function onMouseMove(e: MouseEvent) {
          const rect = wrap!.getBoundingClientRect();
          pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(pointer, camera);
          const hits = raycaster.intersectObjects(
            planetMeshes.map((p) => p.mesh),
            false,
          );
          if (hits.length > 0) {
            const ud = hits[0].object.userData as { planet?: PlanetDef };
            setHoveredPlanet(ud.planet?.name ?? null);
          } else {
            setHoveredPlanet(null);
          }
        }
        wrap!.addEventListener("mousemove", onMouseMove);

        // Cleanup hooked to the outer effect
        const cleanup = () => {
          wrap!.removeEventListener("mousemove", onMouseMove);
        };
        (
          window as unknown as { __solarSystemCleanup?: () => void }
        ).__solarSystemCleanup = cleanup;
      })
      .catch((e) => {
        console.error("[solar-system] texture load failed", e);
      });

    function onResize() {
      const w2 = wrap!.clientWidth;
      const h2 = wrap!.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    }
    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      const c = (
        window as unknown as { __solarSystemCleanup?: () => void }
      ).__solarSystemCleanup;
      if (c) c();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === wrap) {
        wrap.removeChild(renderer.domElement);
      }
      // We don't traverse-dispose every geometry/material here for brevity;
      // GC + WebGLRenderer.dispose handles the bulk.
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-full overflow-hidden"
      style={{ background: "#040408" }}
    >
      {/* Loading state */}
      {textureProgress.loaded < textureProgress.total ? (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="mono text-[12px] text-[color-mix(in_oklab,var(--color-paper)_55%,transparent)]">
            loading textures {textureProgress.loaded}/{textureProgress.total}…
          </div>
        </div>
      ) : null}
      {/* Hovered planet label */}
      {hoveredPlanet ? (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="font-display text-[1.4rem] text-[var(--color-paper)] tracking-tight">
            {hoveredPlanet}
          </div>
        </div>
      ) : null}
    </div>
  );
}
