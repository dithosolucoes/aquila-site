import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

/**
 * Jesper-style preloader: three short rounded bars fill one after another,
 * then the black curtain lifts. Waits for fonts so nothing flashes.
 */
export const Preloader: React.FC<{ minDuration?: number }> = ({ minDuration = 1500 }) => {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wait = new Promise((r) => window.setTimeout(r, reduce ? 200 : minDuration));
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready ?? Promise.resolve();
    const timeout = new Promise((r) => window.setTimeout(r, 4000));
    Promise.all([wait, Promise.race([fonts, timeout])]).then(() => setDone(true));
  }, [minDuration]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          exit={{ clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          aria-label="A carregar"
          role="status"
        >
          <motion.div className="flex" style={{ gap: 'calc(var(--j) * 0.8)' }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-full bg-white/15"
                style={{ width: 'calc(var(--j) * 5)', height: 5 }}
              >
                <motion.div
                  className="absolute inset-0 origin-left rounded-full bg-white"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1, transition: { delay: 0.15 + i * 0.35, duration: 0.5, ease: [0.76, 0, 0.24, 1] } }}
                />
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
