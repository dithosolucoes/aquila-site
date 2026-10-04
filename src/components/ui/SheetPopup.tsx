import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { sound } from '../../utils/audio';
import type { OriginRect } from './ExpandPopup';

/**
 * Jesper's case sheet: a white panel grows out of the clicked card while the
 * world behind stays visible at the edges. A narrow sticky column holds the
 * title, text and tags; the wide column scrolls large presentation boards —
 * every image sits on its own warm-grey stage, like a case-study deck.
 * Render inside <AnimatePresence>.
 */

export interface SheetMedia {
  node: React.ReactNode;
  caption?: string;
  /** Fill the stage edge to edge (photographs) instead of floating on it (mockups). */
  bleed?: boolean;
}

interface SheetPopupProps {
  origin: OriginRect;
  onClose: () => void;
  title: string;
  /** Small uppercase line above the title. */
  eyebrow?: string;
  /** One line under the title, set larger than the body. */
  lead?: React.ReactNode;
  description: React.ReactNode;
  tags?: string[];
  media: SheetMedia[];
  footer?: React.ReactNode;
}

const EASE_SHAPE = [0.76, 0, 0.24, 1] as const;
const EASE_CONTENT = [0.16, 1, 0.3, 1] as const;
const u = (n: number) => `calc(var(--j) * ${n})`;

export const SheetPopup: React.FC<SheetPopupProps> = ({ origin, onClose, title, eyebrow, lead, description, tags = [], media, footer }) => {
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<Element | null>(null);

  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useLayoutEffect(() => {
    returnFocus.current = document.activeElement;
    sound.open();
    const t = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 500);
    return () => {
      window.clearTimeout(t);
      (returnFocus.current as HTMLElement | null)?.focus?.({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        sound.close();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const j = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--j')) || 10;
  const phone = vp.w < 768;
  // Like Jesper's: the sheet leaves a sliver of the world visible left and right
  const side = phone ? 8 : Math.max(j * 2, vp.w * 0.035);
  const top = phone ? 8 : j * 1.6;
  const target = { top, left: side, width: vp.w - side * 2, height: vp.h - top * 2, borderRadius: j * 2 };
  const from = { top: origin.top, left: origin.left, width: origin.width, height: origin.height, borderRadius: origin.radius ?? j * 2 };

  const close = () => {
    sound.close();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={title}>
      <motion.div
        className="absolute inset-0 bg-black/55 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.6 } }}
        exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.1 } }}
        onClick={close}
      />

      <motion.div
        className="absolute overflow-hidden bg-white text-[#111]"
        initial={from}
        animate={{ ...target, transition: { duration: 0.85, ease: EASE_SHAPE } }}
        exit={{ ...from, transition: { duration: 0.65, ease: EASE_SHAPE, delay: 0.08 } }}
      >
        <motion.div
          className="absolute left-0 top-0 overflow-y-auto overscroll-contain"
          style={{ width: target.width, height: target.height }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.5 } }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
        >
          <div
            className="grid grid-cols-1 md:grid-cols-[minmax(0,0.72fr)_minmax(0,1.6fr)]"
            style={{ padding: phone ? u(2.4) : u(3.2), columnGap: u(6), rowGap: u(4) }}
          >
            {/* Sticky text column */}
            <div className="md:sticky md:top-0 md:self-start" style={{ paddingTop: u(0.6), paddingRight: phone ? u(4) : 0 }}>
              {eyebrow && (
                <motion.p
                  className="j-label text-black/45"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.55, duration: 0.6 } }}
                >
                  {eyebrow}
                </motion.p>
              )}
              <motion.h2
                className="j-heading"
                style={{ fontWeight: 500, fontSize: u(3.2), marginTop: eyebrow ? u(1) : 0 }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.55, duration: 0.8, ease: EASE_CONTENT } }}
              >
                {title}
              </motion.h2>
              {lead && (
                <motion.p
                  className="j-title"
                  style={{ marginTop: u(1.2), fontWeight: 400, fontStyle: 'italic', color: 'rgba(0,0,0,0.6)' }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.62, duration: 0.8, ease: EASE_CONTENT } }}
                >
                  {lead}
                </motion.p>
              )}
              <motion.div
                className="j-text text-black/80"
                style={{ marginTop: u(1.6), maxWidth: u(34) }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.68, duration: 0.8, ease: EASE_CONTENT } }}
              >
                {description}
              </motion.div>
              {tags.length > 0 && (
                <motion.ul
                  className="flex flex-wrap items-center"
                  style={{ marginTop: u(2.2), gap: u(0.6) }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.78, duration: 0.6 } }}
                >
                  <li
                    className="flex items-center justify-center rounded-full bg-black text-white"
                    style={{ width: u(2.6), height: u(2.6), fontSize: u(1.2) }}
                    aria-hidden="true"
                  >
                    ↗
                  </li>
                  {tags.map((t) => (
                    <li key={t} className="j-label rounded-full bg-black/[0.06]" style={{ paddingInline: u(1.2), paddingBlock: u(0.6) }}>
                      {t}
                    </li>
                  ))}
                </motion.ul>
              )}
              {footer && (
                <motion.div
                  style={{ marginTop: u(3) }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.85, duration: 0.6 } }}
                >
                  {footer}
                </motion.div>
              )}
            </div>

            {/* Presentation boards */}
            <div className="flex flex-col" style={{ gap: u(2.4) }}>
              {media.map((m, i) => (
                <motion.figure
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.6 + i * 0.08, duration: 0.9, ease: EASE_CONTENT } }}
                >
                  <div
                    className="relative flex items-center justify-center overflow-hidden bg-[#efebe4]"
                    style={{ borderRadius: u(1.2), aspectRatio: m.bleed ? '3 / 2' : undefined, padding: m.bleed ? 0 : phone ? u(2) : '7% 12%' }}
                  >
                    {m.bleed ? (
                      <div className="absolute inset-0">{m.node}</div>
                    ) : (
                      <div className="w-full" style={{ maxWidth: u(54), filter: 'drop-shadow(0 30px 40px rgba(40,30,20,0.18))' }}>
                        {m.node}
                      </div>
                    )}
                  </div>
                  {m.caption && (
                    <figcaption className="j-label text-black/45" style={{ marginTop: u(0.8) }}>
                      {m.caption}
                    </figcaption>
                  )}
                </motion.figure>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Fechar"
          className="absolute z-10 flex items-center justify-center rounded-full bg-black text-white cursor-pointer transition-transform duration-500 hover:rotate-90"
          style={{ right: u(1.6), top: u(1.6), width: u(3.6), height: u(3.6) }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: 0.6, duration: 0.5, ease: EASE_CONTENT } }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
        >
          <X className="h-[40%] w-[40%]" />
        </motion.button>
      </motion.div>
    </div>
  );
};
