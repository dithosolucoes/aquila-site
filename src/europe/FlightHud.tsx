import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CityHub, PortugalCity, getDistanceKm } from './geoData';
import type { FlightPhase } from './TransatlanticCanvas';
import { sound } from '../utils/audio';
import { TextButton } from '../ds';

const EASE = [0.16, 1, 0.3, 1] as const;

/** Cinematic title cards before take-off. Calls onDone when finished or skipped. */
export const FlightIntro: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const lines = ['São Paulo, 23° 33′ S', 'Lisboa, 38° 43′ N', '7.949 km de oceano.', 'A Áquila está a chegar.'];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      onDone();
      return;
    }
    if (index >= lines.length) {
      onDone();
      return;
    }
    const t = window.setTimeout(() => setIndex((i) => i + 1), index === lines.length - 1 ? 1900 : 1350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <motion.div
      className="flight-type absolute inset-0 z-20 flex items-center justify-center bg-black"
      exit={{ opacity: 0, transition: { duration: 1.2, ease: EASE } }}
    >
      <AnimatePresence mode="wait">
        {index < lines.length && (
          <motion.p
            key={index}
            className={index === lines.length - 1 ? 'j-heading text-center' : 'j-title text-center'}
            initial={{ opacity: 0, y: 14, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE } }}
            exit={{ opacity: 0, y: -10, filter: 'blur(8px)', transition: { duration: 0.45 } }}
          >
            {lines[index]}
          </motion.p>
        )}
      </AnimatePresence>
      <div className="absolute inset-x-0 bottom-0 flex justify-end j-chrome">
        <TextButton onClick={onDone}>Saltar introdução</TextButton>
      </div>
    </motion.div>
  );
};

const CHAPTERS: { at: number; title: string; sub: string }[] = [
  { at: 0, title: 'Partida', sub: 'São Paulo, Brasil' },
  { at: 0.12, title: 'Costa brasileira', sub: 'A deixar o continente' },
  { at: 0.3, title: 'Atlântico Sul', sub: 'Sobre o oceano' },
  { at: 0.44, title: 'Linha do Equador', sub: 'Do sul para o norte' },
  { at: 0.58, title: 'Atlântico Norte', sub: 'A Europa no horizonte' },
  { at: 0.76, title: 'Aproximação', sub: 'Costa portuguesa' },
];

interface FlightHudProps {
  origin: CityHub;
  targetCity: PortugalCity;
  phase: FlightPhase;
  progress: number;
  visible: boolean;
  onSkip: () => void;
}

/** In-flight chrome, Jesper-style corners: chapter + live distance, sound, skip. */
export const FlightHud: React.FC<FlightHudProps> = ({ origin, targetCity, phase, progress, visible, onSkip }) => {
  const [muted, setMuted] = useState(!sound.enabled);
  const total = getDistanceKm(origin.coordinates, targetCity.coordinates);
  const flown = Math.round(total * progress);

  const chapter =
    phase === 'landed'
      ? { title: targetCity.name, sub: 'Chegada' }
      : phase === 'approach'
        ? { title: 'A preparar a rota', sub: `${origin.name} para ${targetCity.name}` }
        : [...CHAPTERS].reverse().find((c) => progress >= c.at) ?? CHAPTERS[0];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="flight-type pointer-events-none absolute inset-0 flex flex-col justify-between j-chrome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.4, duration: 0.8 } }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
        >
          <div className="flex items-start justify-between">
            <p className="j-label">Europe US</p>
            <TextButton
              className="pointer-events-auto"
              onClick={() => {
                const next = !muted;
                setMuted(next);
                sound.setEnabled(!next);
              }}
            >
              {muted ? 'Som desligado' : 'Som ligado'}
            </TextButton>
          </div>

          <div className="flex items-end justify-between" style={{ gap: 'calc(var(--j) * 3)' }}>
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={chapter.title}
                  initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE } }}
                  exit={{ opacity: 0, y: -6, transition: { duration: 0.3 } }}
                >
                  <p className="j-label opacity-50">{chapter.sub}</p>
                  <p className="j-title" style={{ marginTop: 'calc(var(--j) * 0.4)' }} aria-live="polite">
                    {chapter.title}
                  </p>
                </motion.div>
              </AnimatePresence>
              {/* Live distance, Jesper-style thin bar */}
              <div className="flex items-center" style={{ marginTop: 'calc(var(--j) * 1.2)', gap: 'calc(var(--j) * 1)' }}>
                <div className="relative h-px overflow-hidden bg-white/20" style={{ width: 'calc(var(--j) * 18)' }}>
                  <div className="absolute inset-0 origin-left bg-white" style={{ transform: `scaleX(${progress})` }} />
                </div>
                <p className="j-mono opacity-60">
                  {flown.toLocaleString('pt-PT')} / {total.toLocaleString('pt-PT')} km
                </p>
              </div>
            </div>
            <TextButton className="pointer-events-auto" onClick={onSkip}>
              Saltar voo
            </TextButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
