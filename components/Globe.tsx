"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CategoryIcon } from "./CategoryIcon";
import { EventModal } from "./EventModal";
import { accentVar, categoryTitle } from "@/lib/reflections";
import { formatCoords, formatDate } from "@/lib/format";
import type { GlobePoint } from "@/lib/globe-data";

function latLngToVec3(lat: number, lng: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

export function Globe({
  textureUrl,
  points,
}: {
  textureUrl: string;
  points: GlobePoint[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [textureReady, setTextureReady] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const activePoint = activeId
    ? points.find((p) => p.id === activeId) ?? null
    : null;
  const openPoint = openId
    ? points.find((p) => p.id === openId) ?? null
    : null;

  useEffect(() => {
    const wrap = canvasWrapRef.current;
    const overlay = overlayRef.current;
    if (!wrap || !overlay) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const width = wrap.clientWidth || 600;
    const height = wrap.clientHeight || 600;

    const scene = new THREE.Scene();
    // Camera distance is computed so the unit sphere fits the canvas regardless
    // of aspect ratio, with a small breathing margin so icons near the limb
    // don't get pushed off the viewport.
    const FOV_DEG = 32;
    const MARGIN = 1.18;
    function cameraZFor(w: number, h: number) {
      const aspect = w / h;
      const fovRad = (FOV_DEG * Math.PI) / 180;
      // Vertical-limited when aspect >= 1, horizontal-limited when aspect < 1.
      const need = aspect >= 1 ? 2 * MARGIN : (2 * MARGIN) / aspect;
      return need / (2 * Math.tan(fovRad / 2));
    }
    const camera = new THREE.PerspectiveCamera(FOV_DEG, width / height, 0.1, 100);
    camera.position.set(0, 0, cameraZFor(width, height));

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    wrap.appendChild(renderer.domElement);

    // Sphere with day/night shader. The fragment shader samples the Blue
    // Marble texture, then darkens the night hemisphere based on a sun
    // direction uniform (computed from current UTC). A subtle warm band sits
    // at the terminator for the twilight edge.
    const sunUniform = { value: new THREE.Vector3(1, 0, 0) };
    const geom = new THREE.SphereGeometry(1, 96, 96);
    const placeholderMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x1a1a1c),
    });
    const globe = new THREE.Mesh(geom, placeholderMat);
    globe.rotation.z = -23.5 * (Math.PI / 180);
    scene.add(globe);

    let disposed = false;
    {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (disposed) return;
        const texture = new THREE.Texture(img);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.needsUpdate = true;
        const m = new THREE.ShaderMaterial({
          uniforms: {
            uTexture: { value: texture },
            uSunDirection: sunUniform,
          },
          vertexShader: /* glsl */ `
            varying vec3 vWorldNormal;
            varying vec2 vUv;
            void main() {
              // World-space normal so the day/night terminator stays anchored
              // to the sun regardless of how the globe spins.
              vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: /* glsl */ `
            uniform sampler2D uTexture;
            uniform vec3 uSunDirection;
            varying vec3 vWorldNormal;
            varying vec2 vUv;
            void main() {
              vec3 texColor = texture2D(uTexture, vUv).rgb;
              // Gamma-lift the texture so deep ocean (which is almost black in
              // the source bathymetry) becomes a readable navy/teal. Highlights
              // (continents, ice) barely move.
              vec3 lifted = pow(texColor, vec3(0.62));
              // Boost saturation slightly so continents pop against ocean.
              float lum = dot(lifted, vec3(0.299, 0.587, 0.114));
              lifted = mix(vec3(lum), lifted, 1.18);

              float lit = dot(vWorldNormal, uSunDirection);
              // Soft terminator band ~ ±0.22 wide
              float dayFactor = smoothstep(-0.22, 0.22, lit);
              // Day side: a warm sunlit tint
              vec3 dayColor = lifted * vec3(1.05, 1.02, 0.97);
              // Night side: cool blue cast at ~88% brightness — clearly visible
              // but unmistakably different from the day side.
              vec3 nightColor = lifted * vec3(0.78, 0.84, 0.98) + vec3(0.05, 0.07, 0.11);
              vec3 base = mix(nightColor, dayColor, dayFactor);
              // Warm twilight glow along the terminator
              float twilight = 1.0 - smoothstep(0.0, 0.28, abs(lit));
              base += vec3(0.14, 0.08, 0.04) * twilight * 0.45;
              gl_FragColor = vec4(min(base, vec3(1.0)), 1.0);
            }
          `,
        });
        const old = globe.material as THREE.Material;
        (globe as THREE.Mesh).material = m;
        old.dispose();
        setTextureReady(true);
      };
      img.onerror = () => {
        if (!disposed) setTextureReady(true);
      };
      img.src = textureUrl;
    }

    // Time-zone meridians — 24 longitude lines spaced 15° apart. Every 90°
    // line (prime meridian + 90°E + dateline + 90°W) is a bit more prominent.
    // The group is attached to the globe so it spins with the texture.
    const meridianGroup = new THREE.Group();
    const SEG = 64;
    for (let i = 0; i < 24; i++) {
      const lng = i * 15 - 180;
      const positions: number[] = [];
      for (let s = 0; s <= SEG; s++) {
        const lat = -90 + (180 * s) / SEG;
        const v = latLngToVec3(lat, lng, 1.0015);
        positions.push(v.x, v.y, v.z);
      }
      const mg = new THREE.BufferGeometry();
      mg.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      const isCardinal = i % 6 === 0;
      const mm = new THREE.LineBasicMaterial({
        color: 0xb8ae9b,
        transparent: true,
        opacity: isCardinal ? 0.18 : 0.07,
        depthWrite: false,
      });
      meridianGroup.add(new THREE.Line(mg, mm));
    }
    // Equator + tropic of cancer + tropic of capricorn (latitude lines)
    for (const lat of [0, 23.5, -23.5]) {
      const positions: number[] = [];
      for (let s = 0; s <= SEG * 2; s++) {
        const lng = -180 + (360 * s) / (SEG * 2);
        const v = latLngToVec3(lat, lng, 1.0015);
        positions.push(v.x, v.y, v.z);
      }
      const lg = new THREE.BufferGeometry();
      lg.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      const lm = new THREE.LineBasicMaterial({
        color: 0xb8ae9b,
        transparent: true,
        opacity: lat === 0 ? 0.18 : 0.08,
        depthWrite: false,
      });
      meridianGroup.add(new THREE.Line(lg, lm));
    }
    globe.add(meridianGroup);

    // Initial sun position from real UTC. The subsolar point moves ~15°/hour
    // west, so for a several-minute visit this is effectively static.
    function computeSunDirection(date: Date): THREE.Vector3 {
      const start = Date.UTC(date.getUTCFullYear(), 0, 0);
      const dayOfYear = Math.floor((date.getTime() - start) / 86_400_000);
      const decl =
        ((-23.45 * Math.PI) / 180) *
        Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365);
      const utcHours =
        date.getUTCHours() +
        date.getUTCMinutes() / 60 +
        date.getUTCSeconds() / 3600;
      const subSolarLng = (12 - utcHours) * 15;
      const subSolarLat = (decl * 180) / Math.PI;
      return latLngToVec3(subSolarLat, subSolarLng, 1).normalize();
    }
    sunUniform.value.copy(computeSunDirection(new Date()));

    // Atmospheric rim
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.06, 64, 64),
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: new THREE.Color(0xb8ae9b) },
          uIntensity: { value: 0.6 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform float uIntensity;
          varying vec3 vNormal;
          void main() {
            float f = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4);
            gl_FragColor = vec4(uColor, f * uIntensity);
          }
        `,
      }),
    );
    scene.add(atmosphere);

    // Stars
    const starCount = 220;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 14 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeom.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeom,
      new THREE.PointsMaterial({
        size: 0.025,
        color: 0xb8ae9b,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true,
        depthWrite: false,
      }),
    );
    scene.add(stars);

    // Pre-compute per-event sphere positions
    const overlayPoints = points.map((p) => ({
      id: p.id,
      vec: latLngToVec3(p.lat, p.lng, 1.012),
    }));

    // We re-query the DOM each frame so React reconciliation never leaves
    // us holding stale element references. 60 events × querySelector is
    // cheap (<0.1 ms) compared to the rest of the rAF tick.
    function getButton(id: string): HTMLElement | null {
      return overlay!.querySelector<HTMLElement>(
        `[data-event-id="${CSS.escape(id)}"]`,
      );
    }

    // Reusable temp vectors so we don't allocate every frame
    const worldVec = new THREE.Vector3();
    const projectedVec = new THREE.Vector3();
    const cameraToPoint = new THREE.Vector3();
    const pointNormal = new THREE.Vector3();
    let lastTime = performance.now();
    let lastSunUpdate = 0;
    let raf = 0;

    function tick(now: number) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (!prefersReduced) {
        globe.rotation.y += dt * 0.085;
        stars.rotation.y += dt * 0.005;
      }
      // Recompute sun direction every 30s. Real-world subsolar point moves
      // at ~0.25°/min, so this is well below visible-change threshold.
      if (now - lastSunUpdate > 30_000) {
        sunUniform.value.copy(computeSunDirection(new Date()));
        lastSunUpdate = now;
      }
      renderer.render(scene, camera);

      // Update overlay positions
      const w = wrap!.clientWidth;
      const h = wrap!.clientHeight;
      const EDGE = 22; // keep marker disc fully inside the viewable area
      for (const op of overlayPoints) {
        const btn = getButton(op.id);
        if (!btn) continue;
        worldVec.copy(op.vec).applyMatrix4(globe.matrixWorld);
        cameraToPoint.copy(worldVec).sub(camera.position).normalize();
        pointNormal.copy(worldVec).normalize();
        // facing camera when normal points opposite of camera ray
        const facing = pointNormal.dot(cameraToPoint) < -0.05;
        projectedVec.copy(worldVec).project(camera);
        const x = (projectedVec.x * 0.5 + 0.5) * w;
        const y = (-projectedVec.y * 0.5 + 0.5) * h;
        const inBounds = x >= EDGE && x <= w - EDGE && y >= EDGE && y <= h - EDGE;
        const visible = facing && inBounds;
        btn.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        btn.style.opacity = visible ? "1" : "0";
        btn.style.pointerEvents = visible ? "auto" : "none";
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    function onResize() {
      const w = wrap!.clientWidth;
      const h = wrap!.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.position.z = cameraZFor(w, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      geom.dispose();
      const curMat = globe.material as
        | THREE.MeshBasicMaterial
        | THREE.ShaderMaterial;
      // Both materials may carry a texture; dispose it explicitly
      const map =
        (curMat as THREE.MeshBasicMaterial).map ??
        (curMat as THREE.ShaderMaterial).uniforms?.uTexture?.value;
      if (map && typeof (map as THREE.Texture).dispose === "function") {
        (map as THREE.Texture).dispose();
      }
      curMat.dispose();
      atmosphere.geometry.dispose();
      (atmosphere.material as THREE.Material).dispose();
      starGeom.dispose();
      (stars.material as THREE.Material).dispose();
      meridianGroup.traverse((obj) => {
        if (obj instanceof THREE.Line) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === wrap) {
        wrap!.removeChild(renderer.domElement);
      }
    };
  }, [textureUrl, points]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <div ref={canvasWrapRef} className="absolute inset-0" aria-hidden="true" />

      {/* HTML overlay layer for interactive event icons */}
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none">
        {points.map((p) => (
          <button
            key={p.id}
            data-event-id={p.id}
            type="button"
            aria-label={`${categoryTitle[p.category]}: ${p.title}`}
            onMouseEnter={() => setActiveId(p.id)}
            onMouseLeave={() =>
              setActiveId((prev) => (prev === p.id ? null : prev))
            }
            onFocus={() => setActiveId(p.id)}
            onBlur={() =>
              setActiveId((prev) => (prev === p.id ? null : prev))
            }
            onClick={() => setOpenId(p.id)}
            className="globe-marker absolute left-0 top-0 inline-flex items-center justify-center"
            style={{
              ["--accent" as string]: `var(${accentVar[p.category]})`,
              transform: "translate3d(-9999px, -9999px, 0)",
              opacity: 0,
              willChange: "transform, opacity",
            }}
          >
            <span className="globe-marker-halo" aria-hidden="true" />
            <span className="globe-marker-icon">
              <CategoryIcon category={p.category} size={18} />
            </span>
          </button>
        ))}
      </div>

      {/* Texture reveal mask */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 60%, var(--color-ink) 85%)",
          opacity: textureReady ? 0 : 1,
        }}
        aria-hidden="true"
      />

      {/* Tooltip */}
      {activePoint && !openPoint ? (
        <GlobeTooltip point={activePoint} />
      ) : null}

      {/* Close-up modal */}
      {openPoint ? (
        <EventModal point={openPoint} onClose={() => setOpenId(null)} />
      ) : null}
    </div>
  );
}

function GlobeTooltip({ point }: { point: GlobePoint }) {
  const tipRef = useRef<HTMLDivElement>(null);

  // Position the tooltip near the active marker by reading its transform each
  // frame. This keeps it glued to the marker as the globe rotates.
  useEffect(() => {
    const button = document.querySelector<HTMLElement>(
      `[data-event-id="${point.id}"]`,
    );
    const tip = tipRef.current;
    if (!button || !tip) return;
    let raf = 0;
    function update() {
      const r = button!.getBoundingClientRect();
      // The tooltip container is itself positioned relative to viewport via fixed
      tip!.style.left = `${r.left + r.width / 2}px`;
      tip!.style.top = `${r.top}px`;
      raf = requestAnimationFrame(update);
    }
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [point.id]);

  return (
    <div
      ref={tipRef}
      role="tooltip"
      className="globe-tooltip fixed z-40 pointer-events-none"
      style={{ ["--accent" as string]: `var(${accentVar[point.category]})` }}
    >
      <div className="small-caps mb-1 text-[var(--accent)]">
        {categoryTitle[point.category]}
      </div>
      <div className="font-display text-[1.25rem] leading-[1.18] tracking-[-0.012em] text-[var(--color-paper)]">
        {point.title}
      </div>
      <p className="mt-2 text-[0.875rem] leading-[1.55] text-[color-mix(in_oklab,var(--color-paper)_82%,transparent)]">
        {point.reflectionShort}
      </p>
      <div className="mono mt-3 text-[0.72rem] text-[color-mix(in_oklab,var(--color-paper)_50%,transparent)]">
        {formatCoords(point.lat, point.lng)} · {formatDate(point.date)}
      </div>
    </div>
  );
}
