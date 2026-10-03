import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

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
                href="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"
                x="0"
                y="10"
                width="460"
                height="320"
                preserveAspectRatio="xMidYMid slice"
                filter="url(#bwFilter)"
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
                AQUILA ARCHIVE // SEC-01
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
              <image
                href="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85"
                x="440"
                y="10"
                width="460"
                height="320"
                preserveAspectRatio="xMidYMid slice"
                filter="url(#bwFilter)"
                className="pointer-events-none"
              />

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
                SPATIAL VISION // SEC-02
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

        {/* Minimal indicator bar */}
        <div className="mt-4 flex items-center justify-center gap-3 text-center">
          <span className={`j-label transition-opacity duration-300 ${isRevealing ? 'opacity-100' : 'opacity-50'}`}>
            {isRevealing ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                Lente ativa, {isInsideLeft ? 'arquivo esquerdo revelado' : 'visão direita revelada'}
              </span>
            ) : (
              'Passe o mouse dentro da logo para descobrir'
            )}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
