import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { foodPhoto } from '../../europe/photos';

/**
 * The "technology" half of the logo: a site, a Google listing and a WhatsApp
 * reply drawn in hairlines, in the right void's coordinate space (≈456–846 × 54–286).
 */
const TechScene: React.FC = () => (
  <g className="pointer-events-none" fontFamily="'Inter', sans-serif">
    <rect x="440" y="0" width="460" height="420" fill="#0b0b0b" />
    {/* site window */}
    <rect x="500" y="88" width="220" height="168" rx="10" fill="#141414" stroke="rgba(255,255,255,0.35)" />
    <circle cx="514" cy="100" r="3" fill="rgba(255,255,255,0.4)" />
    <circle cx="524" cy="100" r="3" fill="rgba(255,255,255,0.4)" />
    <circle cx="534" cy="100" r="3" fill="rgba(255,255,255,0.4)" />
    <rect x="552" y="96" width="120" height="8" rx="4" fill="rgba(255,255,255,0.12)" />
    <image href={foodPhoto(1, 600)} x="510" y="112" width="200" height="86" preserveAspectRatio="xMidYMid slice" />
    <text x="514" y="218" fill="#ffffff" fontSize="13" fontFamily="'Playfair Display', serif" fontWeight="700">
      Taberna do Largo
    </text>
    <rect x="514" y="228" width="92" height="7" rx="3.5" fill="rgba(255,255,255,0.18)" />
    <rect x="640" y="214" width="68" height="22" rx="11" fill="#ffffff" />
    <text x="674" y="229" fill="#000" fontSize="9" fontWeight="600" textAnchor="middle" letterSpacing="0.5">
      RESERVAR
    </text>
    {/* google listing */}
    <rect x="730" y="96" width="104" height="70" rx="10" fill="#ffffff" />
    <text x="740" y="116" fill="#111" fontSize="9" fontWeight="700">
      4,8 ★★★★★
    </text>
    <text x="740" y="130" fill="rgba(0,0,0,0.55)" fontSize="8">
      326 avaliações
    </text>
    <text x="740" y="152" fill="#1a7f37" fontSize="8" fontWeight="600">
      ABERTO
    </text>
    {/* whatsapp reply */}
    <rect x="730" y="178" width="104" height="44" rx="10" fill="#005c4b" />
    <text x="740" y="196" fill="#fff" fontSize="8">
      Reserva feita:
    </text>
    <text x="740" y="210" fill="#fff" fontSize="8">
      hoje, 20h30 ✓
    </text>
  </g>
);

interface AquilaLogoProps {
  is3dEnabled?: boolean;
}

export const AquilaLogo: React.FC<AquilaLogoProps> = ({
  is3dEnabled = true,
}) => {
  // 3D Tilt calculation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);

  // Mouse tracking inside SVG (0 0 900 420 coordinate space)
  const svgRef = useRef<SVGSVGElement>(null);
  const [torchPos, setTorchPos] = useState({ x: -500, y: -500 });
  const [isInsideLeft, setIsInsideLeft] = useState(false);
  const [isInsideRight, setIsInsideRight] = useState(false);

  const updateCoordinates = (clientX: number, clientY: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 900 / rect.width;
    const scaleY = 420 / rect.height;
    const svgX = (clientX - rect.left) * scaleX;
    const svgY = (clientY - rect.top) * scaleY;
    setTorchPos({ x: svgX, y: svgY });
  };

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (is3dEnabled) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    }
    updateCoordinates(e.clientX, e.clientY);
  };

  const handleContainerMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsInsideLeft(false);
    setIsInsideRight(false);
    setTorchPos({ x: -500, y: -500 });
  };

  // Touch screens can't hover: the two halves light up in turn on their own
  const [touch] = useState(() => window.matchMedia('(hover: none)').matches);
  useEffect(() => {
    if (!touch) return;
    const steps = [
      { l: true, r: false, x: 270, y: 170, ms: 2600 },
      { l: false, r: true, x: 650, y: 170, ms: 2600 },
      { l: false, r: false, x: -500, y: -500, ms: 1200 },
    ];
    let i = 0;
    let t = 0;
    const run = () => {
      const s = steps[i % steps.length];
      setIsInsideLeft(s.l);
      setIsInsideRight(s.r);
      setTorchPos({ x: s.x, y: s.y });
      i += 1;
      t = window.setTimeout(run, s.ms);
    };
    t = window.setTimeout(run, 1800);
    return () => window.clearTimeout(t);
  }, [touch]);

  const isRevealing = isInsideLeft || isInsideRight;

  return (
    <div
      data-aquila-logo
      className="relative flex w-full max-w-[880px] items-center justify-center select-none"
      style={{ perspective: 1200 }}
      onMouseMove={handleContainerMouseMove}
      onMouseLeave={handleContainerMouseLeave}
    >
      <motion.div
        className="relative w-full"
        style={{
          rotateX: is3dEnabled ? rotateX : 0,
          rotateY: is3dEnabled ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      >
        {/* Ambient backlight glow */}
        <div
          className={`pointer-events-none absolute -inset-8 opacity-25 blur-3xl transition-opacity duration-700 ${
            isRevealing ? 'opacity-40' : 'opacity-20'
          }`}
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 50%, transparent 75%)',
          }}
        />

        {/* Vector SVG with exact geometries and clip masks */}
        <svg
          ref={svgRef}
          viewBox="0 0 900 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full drop-shadow-[0_0_24px_rgba(255,255,255,0.14)]"
        >
          <defs>
            {/* Stroke glow */}
            <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ffffff" floodOpacity="0.25" />
            </filter>

            {/* High contrast dramatic black & white photo conversion */}
            <filter id="bwFilter">
              <feColorMatrix
                type="matrix"
                values="0.33 0.33 0.33 0 0
                        0.33 0.33 0.33 0 0
                        0.33 0.33 0.33 0 0
                        0    0    0    1 0"
              />
              <feComponentTransfer>
                <feFuncR type="linear" slope="1.4" intercept="-0.12" />
                <feFuncG type="linear" slope="1.4" intercept="-0.12" />
                <feFuncB type="linear" slope="1.4" intercept="-0.12" />
              </feComponentTransfer>
            </filter>

            {/*
              LEFT VOID CLIP PATH
              Inner edge boundary strictly inside left loop:
              Center of left semicircular cap: (170, 170), inner radius = 116
              Straight top inner line: (170, 54) -> (424, 54)
              Left leg diagonal inner slope: down-left from (424, 54) -> (332, 286)
              Straight bottom inner line: (332, 286) -> (170, 286)
              Around inner semicircle: A 116 116 0 0 1 170 54
            */}
            <clipPath id="leftVoidClip">
              <path
                d="
                  M 170 54
                  L 424 54
                  L 332 286
                  L 170 286
                  A 116 116 0 0 1 170 54
                  Z
                "
              />
            </clipPath>

            {/*
              RIGHT VOID CLIP PATH
              Inner edge boundary strictly inside right loop:
              Center of right semicircular cap: (730, 170), inner radius = 116
              Straight top inner line: (456, 75) -> (730, 54)
              Around inner semicircle: A 116 116 0 0 1 730 286
              Straight bottom inner line: (730, 286) -> (548, 286)
              Right leg diagonal inner slope: up-left towards apex (456, 75)
            */}
            <clipPath id="rightVoidClip">
              <path
                d="
                  M 456 75
                  L 730 54
                  A 116 116 0 0 1 730 286
                  L 548 286
                  L 456 75
                  Z
                "
              />
            </clipPath>

            {/* Dynamic Radial Torch for Left Void */}
            <radialGradient
              id="torchLeftGrad"
              cx={torchPos.x}
              cy={torchPos.y}
              r="220"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>

            <mask id="torchLeftMask">
              <rect x="0" y="0" width="900" height="420" fill="url(#torchLeftGrad)" />
            </mask>

            {/* Dynamic Radial Torch for Right Void */}
            <radialGradient
              id="torchRightGrad"
              cx={torchPos.x}
              cy={torchPos.y}
              r="220"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>

            <mask id="torchRightMask">
              <rect x="0" y="0" width="900" height="420" fill="url(#torchRightGrad)" />
            </mask>
          </defs>

          {/* ==========================================================
              LEFT VOID: REVEAL PHOTOGRAPHY
              Dark until mouse hovers inside left loop
             ========================================================== */}
          <g clipPath="url(#leftVoidClip)">
            {/* Pure Black Base */}
            <rect x="0" y="0" width="460" height="420" fill="#000000" />

            {/* Revealed Photo Layer */}
            <g
              mask="url(#torchLeftMask)"
              style={{
                opacity: isInsideLeft ? 1 : 0,
                transition: 'opacity 0.3s ease-out',
              }}
            >
              <image
                href={foodPhoto(0, 1200)}
                x="0"
                y="10"
                width="460"
                height="320"
                preserveAspectRatio="xMidYMid slice"
                className="pointer-events-none"
              />

              {/* Fine lens reticle overlay inside left space */}
              <circle
                cx={torchPos.x}
                cy={torchPos.y}
                r="45"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1"
                strokeDasharray="3 3"
                fill="none"
                className="pointer-events-none"
              />

              {/* Monogram Coordinate Tag */}
              <text
                x="70"
                y="272"
                fill="rgba(255,255,255,0.8)"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="10"
                letterSpacing="2"
                className="pointer-events-none uppercase font-semibold"
              >
                IMAGEM // RAPHAEL
              </text>
            </g>

            {/* Interactive Hit Area for Left Void */}
            <path
              d="
                M 170 54
                L 424 54
                L 332 286
                L 170 286
                A 116 116 0 0 1 170 54
                Z
              "
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setIsInsideLeft(true)}
              onMouseLeave={() => setIsInsideLeft(false)}
            />
          </g>

          {/* ==========================================================
              RIGHT VOID: REVEAL PHOTOGRAPHY
              Dark until mouse hovers inside right loop
             ========================================================== */}
          <g clipPath="url(#rightVoidClip)">
            {/* Pure Black Base */}
            <rect x="440" y="0" width="460" height="420" fill="#000000" />

            {/* Revealed Photo Layer */}
            <g
              mask="url(#torchRightMask)"
              style={{
                opacity: isInsideRight ? 1 : 0,
                transition: 'opacity 0.3s ease-out',
              }}
            >
              <TechScene />

              {/* Fine lens reticle overlay inside right space */}
              <circle
                cx={torchPos.x}
                cy={torchPos.y}
                r="45"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1"
                strokeDasharray="3 3"
                fill="none"
                className="pointer-events-none"
              />

              {/* Monogram Coordinate Tag */}
              <text
                x="560"
                y="272"
                fill="rgba(255,255,255,0.8)"
                fontFamily="'JetBrains Mono', monospace"
                fontSize="10"
                letterSpacing="2"
                className="pointer-events-none uppercase font-semibold"
              >
                TECNOLOGIA // THOMAS
              </text>
            </g>

            {/* Interactive Hit Area for Right Void */}
            <path
              d="
                M 456 75
                L 730 54
                A 116 116 0 0 1 730 286
                L 548 286
                L 456 75
                Z
              "
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setIsInsideRight(true)}
              onMouseLeave={() => setIsInsideRight(false)}
            />
          </g>

          {/* ==========================================================
              TRIÂNGULO CENTRAL (A):
              "no meio no 'trinanguloi', deixa do jeito q ta ali"
              Mantido 100% puro, preto e sem foto por trás.
             ========================================================== */}

          {/* ==========================================================
              AQUILA VECTOR OUTLINE (RENDERED ON TOP)
             ========================================================== */}
          {/* Outer capsule contour */}
          <path
            d="
              M 170 40
              L 730 40
              A 130 130 0 0 1 730 300
              L 540 300
              L 340 300
              L 170 300
              A 130 130 0 0 1 170 40
              Z
            "
            stroke="#ffffff"
            strokeWidth="28"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#subtleGlow)"
            className="pointer-events-none"
          />

          {/* Inner Chevron 'A' with extended leg */}
          <path
            d="
              M 340 300
              L 440 75
              L 615 395
            "
            stroke="#ffffff"
            strokeWidth="28"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#subtleGlow)"
            className="pointer-events-none"
          />
        </svg>

        {/* The idea, then what each half holds */}
        <div className="flex flex-col items-center text-center" style={{ marginTop: 'calc(var(--j) * 1.6)', gap: 'calc(var(--j) * 0.8)' }}>
          <p className="j-title" style={{ fontSize: 'calc(var(--j) * 2)' }}>
            Não fazemos peças. Fazemos o <em>conjunto.</em>
          </p>
          <p className="j-label h-[1.4em] opacity-60" aria-live="polite">
            {isInsideLeft ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
                Imagem · fotografia e vídeo, por Raphael
              </span>
            ) : isInsideRight ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
                Tecnologia · site, Google e anúncios, por Thomas
              </span>
            ) : touch ? (
              'Imagem e tecnologia, numa só equipa'
            ) : (
              'Explore a logo: imagem de um lado, tecnologia do outro'
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
};
