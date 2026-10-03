import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { sound } from '../../utils/audio';

/**
 * Popups in Jesper Landberg's manner.
 *
 * - "float" (default): no box. The world behind darkens and blurs in a circle that
 *   opens from the exact point that was clicked; the content floats, centred,
 *   and arrives line by line. Closes with the corner label, Esc or a click outside.
 * - "media": for video/imagery. A rounded frame grows out of the clicked element
 *   and folds back into it on close.
 *
 * Render inside <AnimatePresence> so the exit can play.
 */

export type OriginRect = { top: number; left: number; width: number; height: number; radius?: number };

export const rectFrom = (el: Element, radius = 8): OriginRect => {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height, radius };
};

type Size = { width: number; height: number };

interface ExpandPopupProps {
  origin: OriginRect;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  variant?: 'float' | 'media';
  /** media only: desired frame size, clamped to the viewport. */
  size?: (viewport: Size) => Size;
}

const EASE_SHAPE = [0.76, 0, 0.24, 1] as const;
const EASE_CONTENT = [0.16, 1, 0.3, 1] as const;

const useViewport = (): Size => {
  const [vp, setVp] = useState<Size>({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const onResize = () => setVp({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return vp;
};

export const ExpandPopup: React.FC<ExpandPopupProps> = ({
  origin,
  onClose,
  label,
  children,
  variant = 'float',
  size = (vp) => ({ width: vp.width * 0.8, height: vp.height * 0.7 }),
}) => {
  const vp = useViewport();
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<Element | null>(null);

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

  const close = () => {
    sound.close();
    onClose();
  };

  // Circle that opens from the click point and covers the farthest corner
  const ox = origin.left + origin.width / 2;
  const oy = origin.top + origin.height / 2;
  const reach = Math.hypot(Math.max(ox, vp.width - ox), Math.max(oy, vp.height - oy));

  const closeLabel = (
    <motion.button
      ref={closeRef}
      type="button"
      onClick={close}
      className="j-label absolute right-0 top-0 z-20 j-chrome cursor-pointer transition-opacity duration-300 hover:opacity-60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.45, duration: 0.5 } }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
    >
      Fechar
    </motion.button>
  );

  if (variant === 'media') {
    const wanted = size(vp);
    const width = Math.min(wanted.width, vp.width - 32);
    const height = Math.min(wanted.height, vp.height - 32);
    const radius = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--j')) * 2 || 20;
    const target = { top: (vp.height - height) / 2, left: (vp.width - width) / 2, width, height, borderRadius: radius };
    const from = { top: origin.top, left: origin.left, width: origin.width, height: origin.height, borderRadius: origin.radius ?? 8 };

    return (
      <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={label}>
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-xl cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5 } }}
          exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.1 } }}
          onClick={close}
        />
        {closeLabel}
        <motion.div
          className="absolute overflow-hidden bg-surface"
          initial={from}
          animate={{ ...target, transition: { duration: 0.75, ease: EASE_SHAPE } }}
          exit={{ ...from, transition: { duration: 0.6, ease: EASE_SHAPE, delay: 0.1 } }}
        >
          <motion.div
            className="absolute left-0 top-0"
            style={{ width, height }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.45, duration: 0.6 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            {children}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={label}>
      <motion.div
        className="absolute inset-0 bg-black/75 backdrop-blur-xl"
        initial={{ clipPath: `circle(0px at ${ox}px ${oy}px)` }}
        animate={{ clipPath: `circle(${reach}px at ${ox}px ${oy}px)`, transition: { duration: 0.8, ease: EASE_SHAPE } }}
        exit={{ clipPath: `circle(0px at ${ox}px ${oy}px)`, transition: { duration: 0.6, ease: EASE_SHAPE, delay: 0.15 } }}
      />
      {closeLabel}
      <div
        className="absolute inset-0 overflow-y-auto overscroll-contain"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div
          className="flex min-h-full items-center justify-center j-chrome"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            className="w-full text-center"
            style={{ maxWidth: 'calc(var(--j) * 60)' }}
            initial="hidden"
            animate="shown"
            exit="gone"
            variants={{
              hidden: {},
              shown: { transition: { staggerChildren: 0.06, delayChildren: 0.35 } },
              gone: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
            }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

/** Wrap each block of popup content so it arrives line by line. */
export const PopupLine: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
      shown: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE_CONTENT } },
      gone: { opacity: 0, y: -6, filter: 'blur(4px)', transition: { duration: 0.25 } },
    }}
  >
    {children}
  </motion.div>
);
