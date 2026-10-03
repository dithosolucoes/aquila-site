import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TransatlanticCanvas, FlightPhase } from './TransatlanticCanvas';
import { FlightHud, FlightIntro } from './FlightHud';
import { EuropeLanding } from './EuropeLanding';
import { LATIN_ORIGINS, PORTUGAL_CITIES } from './geoData';
import type { NavigationTab } from '../components/aquila/AquilaNav';
import type { OriginRect } from '../components/ui/ExpandPopup';
import { sound } from '../utils/audio';

const LANDING_DELAY_MS = 2600; // let the cities light up before the page arrives
const RETURN_DELAY_MS = 1100; // returning visitors: a short look at the map, then the page
const FLOWN_KEY = 'aquila:europe-flown';

const hasFlown = () => {
  try {
    return window.localStorage.getItem(FLOWN_KEY) === '1';
  } catch {
    return false;
  }
};

interface EuropeExperienceProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenAbout: (origin: OriginRect) => void;
  onOpenContact: (origin: OriginRect) => void;
}

/**
 * Europe US inside Aquila:
 * title cards → camera arrives from space → take-off → chaptered flight →
 * Portugal draws itself, cities light up → the landing page rises over the map.
 */
export default function EuropeExperience({ onNavigate, onOpenAbout, onOpenContact }: EuropeExperienceProps) {
  const origin = LATIN_ORIGINS[0];
  const targetCity = PORTUGAL_CITIES[0];
  // Returning visitors skip straight to the landing; "Rever o voo" plays it again
  const [returning] = useState(hasFlown);
  const [run, setRun] = useState(0);
  const [introDone, setIntroDone] = useState(returning);
  const [phase, setPhase] = useState<FlightPhase>('approach');
  const [progress, setProgress] = useState(0);
  const [skipSignal, setSkipSignal] = useState(returning ? 1 : 0);
  const [stage, setStage] = useState<'flight' | 'landing'>('flight');
  const skipped = useRef(returning);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sound.startAmbient();
    return () => sound.stopAmbient();
  }, []);

  const handlePhase = useCallback((p: FlightPhase) => {
    setPhase(p);
    if (p === 'cruise') sound.launch();
  }, []);

  useEffect(() => {
    if (phase !== 'landed' || stage === 'landing') return;
    const t = window.setTimeout(() => setStage('landing'), skipped.current ? RETURN_DELAY_MS : LANDING_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [phase, stage]);

  useEffect(() => {
    if (stage !== 'landing') return;
    sound.stopAmbient();
    try {
      window.localStorage.setItem(FLOWN_KEY, '1');
    } catch {
      /* private mode: the flight simply plays again next time */
    }
  }, [stage]);

  const skip = useCallback(() => {
    skipped.current = true;
    setIntroDone(true);
    setSkipSignal((s) => s + 1);
  }, []);

  const replay = useCallback(() => {
    skipped.current = false;
    const el = mapRef.current;
    if (el) {
      el.style.transform = '';
      el.style.filter = '';
      el.style.opacity = '';
    }
    setStage('flight');
    setPhase('approach');
    setProgress(0);
    setSkipSignal(0);
    setIntroDone(false);
    setRun((r) => r + 1);
    sound.startAmbient();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stage === 'flight') skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage, skip]);

  // The map recedes (scale + blur + dim) as the visitor scrolls past the hero
  const onHeroProgress = useCallback((p: number) => {
    const el = mapRef.current;
    if (!el) return;
    el.style.transform = `scale(${1 + p * 0.18})`;
    el.style.filter = `blur(${p * 8}px)`;
    el.style.opacity = String(1 - p * 0.75);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-40 bg-ink overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.35, duration: 1, ease: [0.16, 1, 0.3, 1] } }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
    >
      <div ref={mapRef} className="absolute inset-0 origin-center will-change-transform">
        <TransatlanticCanvas
          key={run}
          origin={origin}
          targetCity={targetCity}
          started={introDone}
          skipSignal={skipSignal}
          onPhaseChange={handlePhase}
          onProgress={setProgress}
        />
      </div>

      <FlightHud
        origin={origin}
        targetCity={targetCity}
        phase={phase}
        progress={progress}
        visible={introDone && stage === 'flight'}
        onSkip={skip}
      />

      <AnimatePresence>{!introDone && <FlightIntro key="intro" onDone={() => setIntroDone(true)} />}</AnimatePresence>

      {stage === 'landing' && (
        <EuropeLanding
          cityName={targetCity.name}
          onNavigate={onNavigate}
          onOpenAbout={onOpenAbout}
          onOpenContact={onOpenContact}
          onHeroProgress={onHeroProgress}
          onReplayFlight={replay}
        />
      )}
    </motion.div>
  );
}
