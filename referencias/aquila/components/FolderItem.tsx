import React, { useState } from 'react';
import { motion } from 'motion/react';
import { sound } from '../utils/audio';

interface FolderItemProps {
  label: string;
  countBadge?: string;
  onClick: () => void;
  accentTitle?: string;
}

export const FolderItem: React.FC<FolderItemProps> = ({
  label,
  countBadge,
  onClick,
  accentTitle,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    sound.hover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    sound.open();
    onClick();
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="group relative flex flex-col items-center justify-center p-3 outline-none cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-xl"
      aria-label={`Abrir pasta ${label}`}
    >
      {/* Folder Icon SVG (Exact macOS Aesthetic) */}
      <div className="relative h-12 w-14 sm:h-14 sm:w-16 md:h-16 md:w-20 transition-all duration-300">
        {/* Soft folder neon glow on hover */}
        <div
          className={`absolute -inset-2 rounded-2xl bg-cyan-400/20 blur-md transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <svg
          viewBox="0 0 100 82"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative h-full w-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:-translate-y-1"
        >
          {/* Back folder tab & body */}
          <path
            d="M6 16C6 11.5817 9.58172 8 14 8H35.8579C38.51 8 41.0536 9.05357 42.9289 10.9289L48 16H86C90.4183 16 94 19.5817 94 24V70C94 74.4183 90.4183 78 86 78H14C9.58172 78 6 74.4183 6 70V16Z"
            fill="url(#folderBackGradient)"
          />

          {/* Folder back tab highlight */}
          <path
            d="M7 16C7 12.134 10.134 9 14 9H35.8579C38.2449 9 40.5341 9.94821 42.2218 11.6359L47.4142 16.8284C47.7893 17.2036 48.2979 17.4142 48.8284 17.4142H86C89.866 17.4142 93 20.5482 93 24.4142V28H7V16Z"
            fill="white"
            fillOpacity="0.18"
          />

          {/* Front flap */}
          <rect
            x="6"
            y="26"
            width="88"
            height="52"
            rx="8"
            fill="url(#folderFrontGradient)"
          />

          {/* Top highlight line on front flap */}
          <rect
            x="6.5"
            y="26.5"
            width="87"
            height="1.5"
            rx="0.75"
            fill="white"
            fillOpacity="0.4"
          />

          {/* Subtle horizontal emboss line inside folder */}
          <path
            d="M18 42H82"
            stroke="white"
            strokeOpacity="0.12"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Gradients */}
          <defs>
            <linearGradient
              id="folderBackGradient"
              x1="50"
              y1="8"
              x2="50"
              y2="78"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient
              id="folderFrontGradient"
              x1="50"
              y1="26"
              x2="50"
              y2="78"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#60a5fa" />
              <stop offset="0.6" stopColor="#3b82f6" />
              <stop offset="1" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Count badge indicator */}
        {countBadge && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black shadow-md">
            {countBadge}
          </span>
        )}
      </div>

      {/* Label underneath */}
      <span
        className={`mt-2 font-mono-code text-xs sm:text-sm font-medium tracking-tight text-white transition-colors duration-200 ${
          isHovered
            ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]'
            : 'text-neutral-200'
        }`}
      >
        {label}
      </span>

      {/* Hover action pill tooltip */}
      <motion.div
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 4 }}
        className="pointer-events-none absolute -bottom-6 flex items-center gap-1.5 whitespace-nowrap rounded-md bg-white/10 px-2 py-0.5 text-[10px] tracking-wide text-neutral-300 backdrop-blur-md border border-white/10"
      >
        <span>{accentTitle || 'Abrir pasta'}</span>
        <span className="opacity-50">↵</span>
      </motion.div>
    </motion.button>
  );
};
