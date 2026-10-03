import React, { useMemo } from 'react';
import { geoOrthographic, geoPath, geoGraticule, geoInterpolate } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import land110 from 'world-atlas/land-110m.json';
import type { CaseVisual as Visual } from '../../data/cases';

/**
 * Line-art plates for each case, drawn in Aquila's hairline language.
 * Portrait viewBox (400×560) so they fill the cards and the expanded view alike.
 */

const W = 400;
const H = 560;
const STROKE = 'rgba(255,255,255,';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const topo = land110 as any;
const landFc = feature(topo, topo.objects.land) as unknown as FeatureCollection<Geometry>;

const SAO_PAULO: [number, number] = [-46.63, -23.55];
const LISBOA: [number, number] = [-9.14, 38.72];

const GlobePlate: React.FC = () => {
  const paths = useMemo(() => {
    const projection = geoOrthographic()
      .scale(230)
      .translate([W / 2, H / 2])
      .rotate([28, -8, 0])
      .clipAngle(90);
    const path = geoPath(projection);
    const interp = geoInterpolate(SAO_PAULO, LISBOA);
    const route = Array.from({ length: 61 }, (_, i) => projection(interp(i / 60))).filter(Boolean) as [
      number,
      number,
    ][];
    return {
      graticule: path(geoGraticule().step([15, 15])()) ?? '',
      land: path(landFc) ?? '',
      route: 'M' + route.map((p) => p.join(',')).join('L'),
      from: projection(SAO_PAULO),
      to: projection(LISBOA),
    };
  }, []);

  return (
    <>
      <circle cx={W / 2} cy={H / 2} r={230} fill="#060606" stroke={`${STROKE}0.25)`} strokeWidth={1} />
      <path d={paths.graticule} fill="none" stroke={`${STROKE}0.06)`} strokeWidth={0.6} />
      <path d={paths.land} fill="#111" stroke={`${STROKE}0.35)`} strokeWidth={0.7} />
      <path d={paths.route} fill="none" stroke="#EFE6DD" strokeWidth={1.6} strokeLinecap="round" />
      {paths.from && <circle cx={paths.from[0]} cy={paths.from[1]} r={4} fill="#EFE6DD" />}
      {paths.to && (
        <>
          <circle cx={paths.to[0]} cy={paths.to[1]} r={10} fill="none" stroke="#EFE6DD" strokeWidth={1} />
          <circle cx={paths.to[0]} cy={paths.to[1]} r={4} fill="#fff" />
        </>
      )}
    </>
  );
};

const OrbitsPlate: React.FC = () => (
  <g fill="none">
    {Array.from({ length: 14 }, (_, i) => (
      <ellipse
        key={i}
        cx={W / 2}
        cy={H / 2}
        rx={30 + i * 13}
        ry={(30 + i * 13) * 0.42}
        transform={`rotate(${-24 + i * 3.5} ${W / 2} ${H / 2})`}
        stroke={`${STROKE}${0.7 - i * 0.04})`}
        strokeWidth={0.8}
      />
    ))}
    <circle cx={W / 2} cy={H / 2} r={6} fill="#fff" />
  </g>
);

const PolyhedronPlate: React.FC = () => {
  const lines = useMemo(() => {
    const out: string[] = [];
    const cx = W / 2;
    const cy = H / 2;
    for (let ring = 0; ring < 6; ring++) {
      const r = 50 + ring * 26;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const t = (i / 6) * Math.PI * 2 + ring * 0.18;
        return `${cx + Math.cos(t) * r},${cy + Math.sin(t) * r}`;
      });
      out.push('M' + pts.join('L') + 'Z');
    }
    for (let i = 0; i < 6; i++) {
      const t = (i / 6) * Math.PI * 2;
      out.push(`M${cx},${cy}L${cx + Math.cos(t) * 180},${cy + Math.sin(t) * 180}`);
    }
    return out;
  }, []);
  return (
    <g fill="none">
      {lines.map((d, i) => (
        <path key={i} d={d} stroke={`${STROKE}${i < 6 ? 0.75 - i * 0.1 : 0.2})`} strokeWidth={i === 0 ? 1.4 : 0.8} />
      ))}
    </g>
  );
};

const GridPlate: React.FC = () => {
  const horizon = H * 0.42;
  const vanishX = W / 2;
  return (
    <g fill="none" strokeWidth={0.8}>
      {Array.from({ length: 21 }, (_, i) => {
        const x = -W + (i / 20) * W * 3;
        return <line key={`v${i}`} x1={vanishX} y1={horizon} x2={x} y2={H} stroke={`${STROKE}0.28)`} />;
      })}
      {Array.from({ length: 14 }, (_, i) => {
        const y = horizon + Math.pow(i / 13, 2.2) * (H - horizon);
        return <line key={`h${i}`} x1={0} y1={y} x2={W} y2={y} stroke={`${STROKE}${0.1 + (i / 13) * 0.4})`} />;
      })}
      <rect x={W / 2 - 46} y={horizon - 150} width={92} height={150} stroke={`${STROKE}0.8)`} strokeWidth={1.2} />
      <line x1={W / 2 - 46} y1={horizon - 150} x2={W / 2 + 46} y2={horizon} stroke={`${STROKE}0.3)`} />
    </g>
  );
};

const ContourPlate: React.FC = () => {
  const paths = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const y0 = 70 + i * 20;
        let d = `M0,${y0}`;
        for (let x = 0; x <= W; x += 10) {
          const y = y0 + Math.sin(x * 0.018 + i * 0.45) * 18 * Math.sin((x / W) * Math.PI) + Math.cos(x * 0.04 + i) * 3;
          d += `L${x},${y.toFixed(1)}`;
        }
        return d;
      }),
    []
  );
  return (
    <g fill="none">
      {paths.map((d, i) => (
        <path key={i} d={d} stroke={`${STROKE}${0.15 + Math.sin((i / 21) * Math.PI) * 0.6})`} strokeWidth={0.8} />
      ))}
    </g>
  );
};

const RaysPlate: React.FC = () => (
  <g fill="none">
    {Array.from({ length: 48 }, (_, i) => {
      const t = (i / 48) * Math.PI * 2;
      const r1 = 40;
      const r2 = i % 2 ? 150 : 230;
      return (
        <line
          key={i}
          x1={W / 2 + Math.cos(t) * r1}
          y1={H / 2 + Math.sin(t) * r1}
          x2={W / 2 + Math.cos(t) * r2}
          y2={H / 2 + Math.sin(t) * r2}
          stroke={`${STROKE}${i % 2 ? 0.25 : 0.6})`}
          strokeWidth={0.8}
        />
      );
    })}
    <circle cx={W / 2} cy={H / 2} r={40} stroke={`${STROKE}0.9)`} strokeWidth={1.2} />
    <circle cx={W / 2} cy={H / 2} r={16} fill="#fff" />
  </g>
);

const DotsPlate: React.FC = () => {
  const dots = useMemo(() => {
    const out: { x: number; y: number; r: number }[] = [];
    for (let y = 20; y < H; y += 18) {
      for (let x = 20; x < W; x += 18) {
        const d = Math.hypot(x - W / 2, y - H * 0.55);
        const r = Math.max(0.4, 3.2 - d / 70 + Math.sin(x * 0.05 + y * 0.03) * 0.6);
        out.push({ x, y, r });
      }
    }
    return out;
  }, []);
  return (
    <g fill="#fff">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} opacity={Math.min(1, d.r / 3)} />
      ))}
    </g>
  );
};

const PLATES: Record<Visual, React.FC> = {
  globe: GlobePlate,
  orbits: OrbitsPlate,
  polyhedron: PolyhedronPlate,
  grid: GridPlate,
  contour: ContourPlate,
  rays: RaysPlate,
  dots: DotsPlate,
};

export const CaseVisual: React.FC<{ visual: Visual; className?: string }> = ({ visual, className }) => {
  const Plate = PLATES[visual];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <rect width={W} height={H} fill="#070707" />
      <Plate />
    </svg>
  );
};
