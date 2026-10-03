import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { sound } from '../../utils/audio';
import type { OriginRect } from './ExpandPopup';

/**
 * Jesper's case sheet: a white panel grows out of the clicked card, the world
 * behind dims, text sits in a sticky left column, media scrolls on the right,
 * and a round black button closes it back into the card.
 * Render inside <AnimatePresence>.
 */

interface SheetPopupProps {
  origin: OriginRect;
  onClose: () => void;
  title: string;
  description: React.ReactNode;
  tags?: string[];
  media: React.ReactNode[];
  footer?: React.ReactNode;
}

const EASE_SHAPE = [0.76, 0, 0.24, 1] as const;
const EASE_CONTENT = [0.16, 1, 0.3, 1] as const;

export const SheetPopup: React.FC<SheetPopupProps> = ({ origin, onClose, title, description, tags = [], media, footer }) => {
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
  const gutter = vp.w < 768 ? 8 : j * 2;
  const target = { top: gutter, left: gutter, width: vp.w - gutter * 2, height: vp.h - gutter * 2, borderRadius: j * 2 };
  const from = { top: origin.top, left: origin.left, width: origin.width, height: origin.height, borderRadius: origin.radius ?? j * 2 };

  const close = () => {
    sound.close();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={title}>
      <motion.div
        className="absolute inset-0 bg-black/60 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.6 } }}
        exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.1 } }}
        onClick={close}
      />

      <motion.div
        className="absolute overflow-hidden bg-white text-black"
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
            className="grid grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]"
            style={{ padding: 'calc(var(--j) * 2.5)', gap: 'calc(var(--j) * 4)' }}
          >
            {/* Sticky text column */}
            <div className="md:sticky md:top-0 md:self-start" style={{ paddingTop: 'calc(var(--j) * 0.5)' }}>
              <motion.h2
                className="j-heading"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.55, duration: 0.8, ease: EASE_CONTENT } }}
              >
                {title}
              </motion.h2>
              <motion.div
                className="j-text"
                style={{ marginTop: 'calc(var(--j) * 1.5)', maxWidth: 'calc(var(--j) * 36)' }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.65, duration: 0.8, ease: EASE_CONTENT } }}
              >
                {description}
              </motion.div>
              {tags.length > 0 && (
                <motion.ul
                  className="flex flex-wrap items-center"
                  style={{ marginTop: 'calc(var(--j) * 2)', gap: 'calc(var(--j) * 0.6)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.75, duration: 0.6 } }}
                >
                  <li
                    className="flex items-center justify-center rounded-full bg-black text-white"
                    style={{ width: 'calc(var(--j) * 2.6)', height: 'calc(var(--j) * 2.6)', fontSize: 'calc(var(--j) * 1.2)' }}
                    aria-hidden="true"
                  >
                    ↗
                  </li>
                  {tags.map((t) => (
                    <li
                      key={t}
                      className="j-label rounded-full bg-black/[0.07]"
                      style={{ paddingInline: 'calc(var(--j) * 1.2)', paddingBlock: 'calc(var(--j) * 0.6)' }}
                    >
                      {t}
                    </li>
                  ))}
                </motion.ul>
              )}
              {footer && <div style={{ marginTop: 'calc(var(--j) * 3)' }}>{footer}</div>}
            </div>

            {/* Scrolling media column */}
            <div className="flex flex-col" style={{ gap: 'calc(var(--j) * 1.2)' }}>
              {media.map((m, i) => (
                <motion.div
                  key={i}
                  className="overflow-hidden"
                  style={{ borderRadius: 'calc(var(--j) * 0.6)' }}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.6 + i * 0.08, duration: 0.9, ease: EASE_CONTENT } }}
                >
                  {m}
                </motion.div>
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
          style={{ right: 'calc(var(--j) * 1.6)', top: 'calc(var(--j) * 1.6)', width: 'calc(var(--j) * 3.6)', height: 'calc(var(--j) * 3.6)' }}
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
