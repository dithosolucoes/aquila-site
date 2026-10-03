import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/audio';

interface StudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudioModal: React.FC<StudioModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        sound.close();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyEmail = () => {
    sound.click();
    navigator.clipboard.writeText('studio@aquila.design');
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-xl select-none px-6 py-12 sm:px-12 md:px-20 overflow-y-auto"
        onClick={() => {
          sound.close();
          onClose();
        }}
      >
        {/* Top Dismiss Cue */}
        <div className="pointer-events-none absolute top-6 inset-x-0 flex items-center justify-between px-6 sm:px-12 md:px-16 text-neutral-400 font-mono-code text-[11px] tracking-widest z-20">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            <span>AQUILA // PRACTICE & MANIFESTO</span>
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.close();
              onClose();
            }}
            className="pointer-events-auto hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>DISMISS</span>
            <span className="text-neutral-500 text-[10px]">/ ESC</span>
          </button>
        </div>

        {/* Central Monolithic Typographic Shield (Jesper Landberg style) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-3xl w-full text-center flex flex-col items-center my-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Studio Label */}
          <span className="font-mono-code text-[11px] sm:text-xs uppercase tracking-[0.25em] text-neutral-400 mb-6">
            Autonomous Design & Digital Craft
          </span>

          {/* Primary Manifesto Statement */}
          <h2 className="font-sans text-xl sm:text-2xl md:text-3xl lg:text-[2rem] font-light leading-[1.35] tracking-[-0.03em] text-white/95 max-w-2xl">
            Aquila engineers visually rich, motion-driven spatial computing interfaces, WebGL installations, and digital brand identities.
          </h2>

          {/* Philosophy Subtitle */}
          <p className="font-sans text-sm sm:text-base text-neutral-400 font-normal leading-relaxed max-w-xl mt-6 tracking-[-0.01em]">
            Operating at the intersection of computational rigor and radical minimalism. Usually lead creative and engineering partner alongside visionary teams, international fashion houses, and progressive brands.
          </p>

          {/* Recognitions kicker */}
          <div className="font-mono-code text-[11px] sm:text-xs text-neutral-400 tracking-wider mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span className="text-white/80">18× Awwwards</span>
            <span className="text-neutral-600">·</span>
            <span className="text-white/80">12× FWA</span>
            <span className="text-neutral-600">·</span>
            <span className="text-white/80">4× Webby</span>
            <span className="text-neutral-600">·</span>
            <span>Studio of the Year Nominee</span>
          </div>

          {/* Hairline Separator */}
          <div className="w-16 h-[1px] bg-white/20 my-8" />

          {/* Three Unboxed Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 w-full max-w-2xl text-left font-mono-code text-xs">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-neutral-400 tracking-widest uppercase">Disciplines</span>
              <span className="text-neutral-300">WebGL & Three.js Engines</span>
              <span className="text-neutral-300">Spatial Typography</span>
              <span className="text-neutral-300">Dynamic Shaders & FX</span>
              <span className="text-neutral-300">Creative Direction</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-neutral-400 tracking-widest uppercase">Coordinates</span>
              <span className="text-neutral-300">Zurich // UTC+1</span>
              <span className="text-neutral-300">São Paulo // UTC-3</span>
              <span className="text-neutral-300">Tokyo // UTC+9</span>
              <span className="text-neutral-400 mt-1 text-[11px]">Worldwide Remote</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-neutral-400 tracking-widest uppercase">Availability</span>
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Q2 / Q3 2026</span>
              </span>
              <span className="text-neutral-400 text-[11px]">Select Commissions</span>
              <span className="text-neutral-400 text-[11px]">Direct Collaboration</span>
            </div>
          </div>

          {/* Direct Line Links */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono-code text-xs tracking-wider">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="relative text-white hover:text-amber-200 transition-colors cursor-pointer group flex items-center gap-1.5 underline decoration-white/30 underline-offset-4 hover:decoration-amber-200"
            >
              <span>{copied ? 'COPIED TO CLIPBOARD' : 'studio@aquila.design'}</span>
            </button>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer underline decoration-white/20 underline-offset-4 hover:decoration-white"
            >
              Instagram
            </a>

            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer underline decoration-white/20 underline-offset-4 hover:decoration-white"
            >
              X / Twitter
            </a>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer underline decoration-white/20 underline-offset-4 hover:decoration-white"
            >
              GitHub
            </a>
          </div>

          {/* Minimalist Return Prompt */}
          <p className="mt-12 text-[10px] font-mono-code text-neutral-400 tracking-widest uppercase">
            Click anywhere or press Esc to return
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
