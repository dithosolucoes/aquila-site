import React, { useEffect, useRef } from 'react';
import { geoOrthographic, geoPath, geoInterpolate, geoGraticule, geoDistance } from 'd3-geo';
import {
  worldLandFeatures,
  latinAmericaFeatures,
  portugalMainlandFeature,
  portugalFeature,
  spainFeature,
  CityHub,
  PortugalCity,
  PORTUGAL_CITIES,
} from './geoData';
import { sound } from '../utils/audio';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxLife: number;
  life: number;
  color: string;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  delay: number;
}

export type FlightPhase = 'approach' | 'cruise' | 'descent' | 'landed';

const PORTUGAL_REGIONS = [
  { name: 'NORTE', coordinates: [-7.8, 41.5] as [number, number] },
  { name: 'CENTRO', coordinates: [-8.3, 40.2] as [number, number] },
  { name: 'LISBOA', coordinates: [-8.9, 38.95] as [number, number] },
  { name: 'ALENTEJO', coordinates: [-7.8, 38.4] as [number, number] },
  { name: 'ALGARVE', coordinates: [-8.1, 37.15] as [number, number] },
];

const APPROACH_SECONDS = 3.4; // camera arriving from space
const FLIGHT_SECONDS = 9;
const ZOOM_THRESHOLD = 0.6;
const PORTUGAL_CENTER: [number, number] = [-8.4, 39.6];
const SPACE_VIEW: [number, number] = [-22, 6]; // mid-Atlantic, seen from far away
const BEIGE_TONES = ['#FFFFFF', '#EFE6DD', '#DFCEBA', '#C7B299'];

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Small airliner silhouette pointing along +x, ~1 unit long. */
function drawPlane(ctx: CanvasRenderingContext2D, size: number) {
  ctx.save();
  ctx.scale(size, size);
  ctx.beginPath();
  // fuselage
  ctx.moveTo(0.62, 0);
  ctx.quadraticCurveTo(0.55, -0.055, 0.35, -0.06);
  ctx.lineTo(0.08, -0.06);
  // right wing (screen up)
  ctx.lineTo(-0.12, -0.5);
  ctx.lineTo(-0.24, -0.5);
  ctx.lineTo(-0.1, -0.06);
  ctx.lineTo(-0.36, -0.05);
  // tail fin
  ctx.lineTo(-0.48, -0.2);
  ctx.lineTo(-0.56, -0.2);
  ctx.lineTo(-0.5, -0.03);
  ctx.lineTo(-0.58, 0);
  ctx.lineTo(-0.5, 0.03);
  ctx.lineTo(-0.56, 0.2);
  ctx.lineTo(-0.48, 0.2);
  ctx.lineTo(-0.36, 0.05);
  ctx.lineTo(-0.1, 0.06);
  // left wing
  ctx.lineTo(-0.24, 0.5);
  ctx.lineTo(-0.12, 0.5);
  ctx.lineTo(0.08, 0.06);
  ctx.lineTo(0.35, 0.06);
  ctx.quadraticCurveTo(0.55, 0.055, 0.62, 0);
  ctx.closePath();
  ctx.restore();
}

interface TransatlanticCanvasProps {
  origin: CityHub;
  targetCity: PortugalCity;
  /** false: holding in deep space; true: camera arrives, then the plane takes off. */
  started: boolean;
  /** Incrementing this jumps straight to the landing. */
  skipSignal?: number;
  onPhaseChange: (phase: FlightPhase) => void;
  /** Eased flight progress 0..1, throttled. */
  onProgress?: (progress: number) => void;
}

export const TransatlanticCanvas: React.FC<TransatlanticCanvasProps> = ({
  origin,
  targetCity,
  started,
  skipSignal = 0,
  onPhaseChange,
  onProgress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const propsRef = useRef({ origin, targetCity, started, onPhaseChange, onProgress });
  propsRef.current = { origin, targetCity, started, onPhaseChange, onProgress };

  const state = useRef({ pre: 0, t: 0, playing: true, phase: 'approach' as FlightPhase, landedAt: 0 });
  const particles = useRef<Particle[]>([]);
  const shockwaves = useRef<Shockwave[]>([]);

  useEffect(() => {
    if (skipSignal > 0) {
      state.current.pre = 1;
      state.current.t = 1;
    }
  }, [skipSignal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const graticule = geoGraticule().step([15, 15])();
    const stars = Array.from({ length: 260 }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: Math.random() * 1.2 + 0.3,
      a: Math.random() * 0.45 + 0.08,
      d: Math.random() * 0.6 + 0.2, // parallax depth
    }));
    let lastTime = performance.now();
    let lastProgressEmit = 0;
    let interpKey = '';
    let interpolator = geoInterpolate([0, 0], [0, 0]);
    let citiesByDistance: PortugalCity[] = PORTUGAL_CITIES;
    let animId = 0;

    const render = (timestamp: number) => {
      const { origin, targetCity, started } = propsRef.current;
      const s = state.current;

      const key = `${origin.id}>${targetCity.id}`;
      if (key !== interpKey) {
        interpKey = key;
        interpolator = geoInterpolate(origin.coordinates, targetCity.coordinates);
        citiesByDistance = [...PORTUGAL_CITIES].sort(
          (a, b) => geoDistance(a.coordinates, targetCity.coordinates) - geoDistance(b.coordinates, targetCity.coordinates)
        );
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const dt = Math.min(0.05, (timestamp - lastTime) / 1000);
      lastTime = timestamp;

      // Timeline: approach from space → take-off → flight → landing
      if (started && s.pre < 1) s.pre = reduceMotion ? 1 : Math.min(1, s.pre + dt / APPROACH_SECONDS);
      if (started && s.pre >= 1 && s.playing) {
        s.t = reduceMotion ? 1 : Math.min(1, s.t + dt / FLIGHT_SECONDS);
      }
      const pre = easeInOutCubic(s.pre);
      const progress = easeInOutCubic(s.t);

      const phase: FlightPhase =
        s.t >= 1 ? 'landed' : s.t > 0 ? (progress >= ZOOM_THRESHOLD ? 'descent' : 'cruise') : 'approach';
      if (phase !== s.phase) {
        s.phase = phase;
        propsRef.current.onPhaseChange(phase);
      }
      if (timestamp - lastProgressEmit > 90) {
        lastProgressEmit = timestamp;
        propsRef.current.onProgress?.(progress);
      }

      // Deep space + parallax stardust
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      const drift = (1 - pre) * 40 + progress * 120;
      for (const st of stars) {
        const x = (((st.x * width - drift * st.d) % width) + width) % width;
        ctx.fillStyle = `rgba(239, 230, 221, ${st.a * 0.4})`;
        ctx.beginPath();
        ctx.arc(x, st.y * height, st.s * st.d * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Camera
      const zoomT = progress > ZOOM_THRESHOLD ? smoothstep((progress - ZOOM_THRESHOLD) / (1 - ZOOM_THRESHOLD)) : 0;
      const flightCamera = interpolator(Math.min(1, progress * 1.04));
      const preLon = lerp(SPACE_VIEW[0], origin.coordinates[0], pre);
      const preLat = lerp(SPACE_VIEW[1], origin.coordinates[1], pre);
      const baseLon = s.t > 0 ? flightCamera[0] : preLon;
      const baseLat = s.t > 0 ? flightCamera[1] : preLat;
      const cameraLon = baseLon * (1 - zoomT) + PORTUGAL_CENTER[0] * zoomT;
      const cameraLat = baseLat * (1 - zoomT) + PORTUGAL_CENTER[1] * zoomT;

      const minSide = Math.min(width, height);
      const baseRadius = minSide * 0.46;
      const spaceRadius = minSide * 0.1;
      const targetRadius = minSide * 3.6;
      // Slight pull-back at cruise altitude, dive on descent
      const altitude = Math.sin(Math.min(1, progress / ZOOM_THRESHOLD) * Math.PI) * 0.06;
      const radius =
        s.t > 0
          ? baseRadius * (1 - altitude) + (targetRadius - baseRadius) * zoomT
          : lerp(spaceRadius, baseRadius, pre);

      const projection = geoOrthographic()
        .scale(radius)
        .translate([width / 2, height / 2])
        .rotate([-cameraLon, -cameraLat, 0])
        .clipAngle(90);
      const path = geoPath().projection(projection).context(ctx);

      const cx = width / 2;
      const cy = height / 2;
      // Globe body + atmosphere
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#030303';
      ctx.fill();
      const atmo = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.06);
      atmo.addColorStop(0, 'rgba(239, 230, 221, 0)');
      atmo.addColorStop(0.65, 'rgba(223, 206, 186, 0.08)');
      atmo.addColorStop(0.8, 'rgba(239, 230, 221, 0.22)');
      atmo.addColorStop(1, 'rgba(239, 230, 221, 0)');
      ctx.fillStyle = atmo;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.06, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = 'rgba(239, 230, 221, 0.045)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.beginPath();
      for (const land of worldLandFeatures) path(land);
      ctx.fillStyle = '#0f0f0f';
      ctx.fill();
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      if (spainFeature) {
        ctx.beginPath();
        path(spainFeature);
        ctx.fillStyle = '#121212';
        ctx.fill();
        ctx.strokeStyle = '#303030';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      for (const country of latinAmericaFeatures) {
        const isOrigin = String(country.id).padStart(3, '0') === origin.iso;
        ctx.beginPath();
        path(country);
        ctx.fillStyle = isOrigin ? '#171513' : '#111111';
        ctx.fill();
        ctx.strokeStyle = isOrigin ? 'rgba(223, 206, 186, 0.6)' : 'rgba(223, 206, 186, 0.16)';
        ctx.lineWidth = isOrigin ? 1.1 : 0.6;
        ctx.stroke();
      }

      // Portugal: faint body, then its outline draws itself in light on descent
      const pt = portugalMainlandFeature || portugalFeature;
      if (pt) {
        ctx.beginPath();
        path(pt);
        const glowIn = clamp01((zoomT - 0.05) / 0.7);
        ctx.fillStyle = `rgba(24, 22, 15, ${0.6 + glowIn * 0.4})`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(223, 206, 186, 0.45)';
        ctx.lineWidth = 1;
        ctx.stroke();
        if (glowIn > 0) {
          ctx.save();
          ctx.beginPath();
          path(pt);
          const L = 6000;
          ctx.setLineDash([L * smoothstep(glowIn), L * 4]);
          ctx.strokeStyle = '#EFE6DD';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#EFE6DD';
          ctx.shadowBlur = 16;
          ctx.stroke();
          ctx.restore();
        }
      }

      // Route
      const full: [number, number][] = [];
      const done: [number, number][] = [];
      for (let i = 0; i <= 120; i++) {
        const k = i / 120;
        const p = projection(interpolator(k));
        if (!p) continue;
        full.push(p);
        if (k <= progress) done.push(p);
      }
      const strokePath = (pts: [number, number][]) => {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.stroke();
      };
      const routeAlpha = s.t > 0 ? 1 : clamp01((s.pre - 0.55) / 0.45);
      if (full.length > 1 && routeAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = routeAlpha;
        ctx.setLineDash([2, 6]);
        ctx.strokeStyle = 'rgba(223, 206, 186, 0.3)';
        ctx.lineWidth = 1;
        strokePath(full);
        ctx.restore();
      }
      if (done.length > 1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(239, 230, 221, 0.28)';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#DFCEBA';
        ctx.shadowBlur = 12;
        strokePath(done);
        ctx.restore();
        ctx.strokeStyle = '#EFE6DD';
        ctx.lineWidth = 1.6;
        strokePath(done);
      }

      // Origin beacon
      const originPt = projection(origin.coordinates);
      if (originPt && routeAlpha > 0) {
        const [ox, oy] = originPt;
        const cycle = (timestamp % 1600) / 1600;
        ctx.save();
        ctx.globalAlpha = routeAlpha;
        ctx.beginPath();
        ctx.arc(ox, oy, 6 + cycle * 18, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(223, 206, 186, ${(1 - cycle) * 0.6})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ox, oy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#EFE6DD';
        ctx.shadowColor = '#EFE6DD';
        ctx.shadowBlur = 8;
        ctx.fill();
        if (zoomT < 0.5) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#DFCEBA';
          ctx.font = '500 10px "Inter", sans-serif';
          ctx.fillText(`${origin.name.toUpperCase()}, ${origin.country.toUpperCase()}`, ox + 10, oy - 8);
        }
        ctx.restore();
      }

      // Landing: regions, then cities light up one by one outward from the destination
      if (s.landedAt === 0 && s.t >= 1) s.landedAt = timestamp;
      const sinceLanding = s.landedAt ? timestamp - s.landedAt : -1;

      const target = projection(targetCity.coordinates);
      if (target && zoomT > 0.3) {
        const [x, y] = target;
        const a = clamp01((zoomT - 0.3) / 0.4);
        const cycle = (timestamp % 1400) / 1400;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(x, y, 8 + cycle * 20, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 230, 221, ${1 - cycle})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#DFCEBA';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      }

      if (sinceLanding >= 0) {
        ctx.save();
        const regionAlpha = clamp01(sinceLanding / 1200);
        ctx.font = '500 10px "Inter", sans-serif';
        for (const reg of PORTUGAL_REGIONS) {
          const r = projection(reg.coordinates);
          if (!r) continue;
          ctx.fillStyle = `rgba(223, 206, 186, ${0.4 * regionAlpha})`;
          ctx.fillText(reg.name, r[0] - 20, r[1]);
        }
        citiesByDistance.forEach((city, i) => {
          const c = projection(city.coordinates);
          if (!c) return;
          const appear = clamp01((sinceLanding - 350 - i * 230) / 500);
          if (appear <= 0) return;
          const [x, y] = c;
          const isTarget = city.id === targetCity.id;
          ctx.globalAlpha = easeOutCubic(appear);
          if (!isTarget) {
            ctx.beginPath();
            ctx.arc(x, y, 2.5 + (1 - appear) * 6, 0, Math.PI * 2);
            ctx.fillStyle = '#DFCEBA';
            ctx.fill();
          }
          ctx.fillStyle = isTarget ? '#FFFFFF' : '#DFCEBA';
          ctx.font = isTarget ? '500 11px "Inter", sans-serif' : '500 10px "Inter", sans-serif';
          ctx.fillText(city.name.toUpperCase(), x + (isTarget ? 12 : 7), y - (isTarget ? 6 : 3));
        });
        ctx.restore();
      }

      // The plane
      if (s.t > 0 || s.pre >= 1) {
        const current = projection(interpolator(progress));
        if (current) {
          const [ax, ay] = current;
          const next = projection(interpolator(Math.min(1, progress + 0.004)));
          const prev = projection(interpolator(Math.max(0, progress - 0.004)));
          const angle = next && prev ? Math.atan2(next[1] - prev[1], next[0] - prev[0]) : -Math.PI / 4;
          const flying = s.playing && s.t > 0 && s.t < 1;

          if (flying && !reduceMotion) {
            for (let k = 0; k < 3; k++) {
              const speed = Math.random() * 30 + 12;
              const spread = angle + Math.PI + (Math.random() - 0.5) * 0.5;
              particles.current.push({
                x: ax - Math.cos(angle) * 8,
                y: ay - Math.sin(angle) * 8,
                vx: Math.cos(spread) * speed,
                vy: Math.sin(spread) * speed,
                size: Math.random() * 2 + 0.8,
                maxLife: Math.random() * 1 + 0.6,
                life: 0,
                color: BEIGE_TONES[Math.floor(Math.random() * BEIGE_TONES.length)],
              });
            }
          }

          if (s.t >= 1 && s.playing) {
            s.playing = false;
            sound.arrival();
            shockwaves.current.push(
              { x: ax, y: ay, radius: 2, maxRadius: 110, delay: 0 },
              { x: ax, y: ay, radius: 2, maxRadius: 110, delay: 0.35 },
              { x: ax, y: ay, radius: 2, maxRadius: 110, delay: 0.7 }
            );
          }

          for (let i = shockwaves.current.length - 1; i >= 0; i--) {
            const sw = shockwaves.current[i];
            if (sw.delay > 0) {
              sw.delay -= dt;
              continue;
            }
            sw.radius += dt * 70;
            const alpha = 1 - sw.radius / sw.maxRadius;
            if (alpha <= 0) {
              shockwaves.current.splice(i, 1);
              continue;
            }
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(223, 206, 186, ${alpha * 0.7})`;
            ctx.lineWidth = 1.4;
            ctx.stroke();
          }

          // Plane grows at cruise altitude, shrinks as it lands
          const planeSize = s.t >= 1 ? 0 : 26 * (1 + Math.sin(Math.min(1, progress) * Math.PI) * 0.35) * (1 - zoomT * 0.25);
          if (planeSize > 0) {
            ctx.save();
            ctx.translate(ax, ay);
            ctx.rotate(angle);
            // shadow on the "ground"
            ctx.save();
            ctx.translate(6 + progress * 6, 10 + progress * 8);
            drawPlane(ctx, planeSize);
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.fill();
            ctx.restore();
            drawPlane(ctx, planeSize);
            const body = ctx.createLinearGradient(0, -planeSize / 2, 0, planeSize / 2);
            body.addColorStop(0, '#FFFFFF');
            body.addColorStop(1, '#DFCEBA');
            ctx.fillStyle = body;
            ctx.shadowColor = '#EFE6DD';
            ctx.shadowBlur = 14;
            ctx.fill();
            ctx.restore();
          }
        }
      }

      // Contrail particles (additive)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.94;
        p.vy *= 0.94;
        const lifeT = p.life / p.maxLife;
        if (lifeT >= 1) {
          particles.current.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = (1 - lifeT) * 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - lifeT * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-lens-source
      className="absolute inset-0 h-full w-full block"
      aria-label={`Mapa do voo de ${origin.name} até ${targetCity.name}, Portugal`}
      role="img"
    />
  );
};
