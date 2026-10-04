/**
 * Aquila — Autonomous Design & Digital Craft Studio
 * Home (logo + contour frame) → popups, Case Studies (Jesper experience) and Europe US.
 */

import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ThreeCanvas } from './components/aquila/ThreeCanvas';
import { AquilaLogo } from './components/aquila/AquilaLogo';
import { ContourFrame } from './components/aquila/ContourFrame';
import type { NavigationTab } from './components/aquila/AquilaNav';
import { StudioPopup, ContactPopup } from './components/aquila/StudioPopup';
import { ShowreelPopup } from './components/aquila/ShowreelPopup';
import { CasesShowcase } from './components/cases/CasesShowcase';
import { ExpandPopup, OriginRect } from './components/ui/ExpandPopup';
import { LensPopup } from './components/ui/LensPopup';
import { Preloader } from './components/ui/Preloader';
import { sound } from './utils/audio';

const EuropeExperience = lazy(() => import('./europe/EuropeExperience'));

type View = 'home' | 'cases' | 'europe';
type Popup = { kind: 'about' | 'contact' | 'reel'; origin: OriginRect } | null;

export default function App({ initialView = 'home' }: { initialView?: 'home' | 'europe' }) {
  const [is3dEnabled, setIs3dEnabled] = useState(true);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [glowMode, setGlowMode] = useState(false);
  const [popup, setPopup] = useState<Popup>(null);
  const [view, setView] = useState<View>(initialView);

  // Keep the address shareable: /lisboa while in Europe US, / elsewhere
  useEffect(() => {
    const target = view === 'europe' ? '/lisboa' : '/';
    if (window.location.pathname !== target) window.history.replaceState(null, '', target);
  }, [view]);

  const toggleSound = useCallback(() => {
    setIsSoundMuted((muted) => {
      sound.setEnabled(muted);
      return !muted;
    });
  }, []);

  // Hotkeys on the home screen: M toggles sound, T toggles the 3D tilt
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (view !== 'home' || popup || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'm' || e.key === 'M') {
        toggleSound();
        sound.click();
      }
      if (e.key === 't' || e.key === 'T') {
        setIs3dEnabled((v) => !v);
        sound.click();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, popup, toggleSound]);

  const navigate = useCallback((tab: NavigationTab) => {
    if (tab === 'HOME') setView('home');
    if (tab === 'CASES') setView('cases');
    if (tab === 'EUROPE') setView('europe');
  }, []);

  const openAbout = useCallback((origin: OriginRect) => setPopup({ kind: 'about', origin }), []);
  const openContact = useCallback((origin: OriginRect) => setPopup({ kind: 'contact', origin }), []);

  return (
    <MotionConfig reducedMotion="user">
      <Preloader />
      <main className="relative h-screen w-full bg-black text-white font-sans overflow-hidden">
        {/* Home: leaves with a slow push-in and blur when Europe US takes over */}
        <AnimatePresence>
          {view !== 'europe' && (
            <motion.div
              key="home"
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ opacity: 0, scale: 1.12, filter: 'blur(10px)', transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
            >
              <ThreeCanvas interactive={is3dEnabled} />
              <ContourFrame
                is3dEnabled={is3dEnabled}
                onToggle3D={() => setIs3dEnabled((v) => !v)}
                isSoundMuted={isSoundMuted}
                onToggleSound={toggleSound}
                onOpenReel={(origin) => setPopup({ kind: 'reel', origin })}
                glowMode={glowMode}
                onToggleGlow={() => setGlowMode((v) => !v)}
                onOpenAbout={openAbout}
                onOpenContact={openContact}
                activeTab={view === 'cases' ? 'CASES' : 'HOME'}
                onSelectTab={navigate}
              >
                <AquilaLogo is3dEnabled={is3dEnabled} />
              </ContourFrame>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {view === 'europe' && (
            <Suspense key="europe" fallback={null}>
              <EuropeExperience onNavigate={navigate} onOpenAbout={openAbout} onOpenContact={openContact} />
            </Suspense>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {view === 'cases' && <CasesShowcase key="cases" onReturnHome={() => setView('home')} />}
        </AnimatePresence>

        {popup?.kind === 'about' && (
          <LensPopup key="about" origin={popup.origin} onClose={() => setPopup(null)} label="Sobre a Aquila">
            <StudioPopup />
          </LensPopup>
        )}
        {popup?.kind === 'contact' && (
          <LensPopup key="contact" origin={popup.origin} onClose={() => setPopup(null)} label="Contacto">
            <ContactPopup />
          </LensPopup>
        )}

        <AnimatePresence>
          {popup?.kind === 'reel' && (
            <ExpandPopup
              key="reel"
              origin={popup.origin}
              onClose={() => setPopup(null)}
              size={(vp) => {
                const width = Math.min(1200, vp.width - 48);
                return { width, height: vp.width < 640 ? width * 1.25 : width * (9 / 21) };
              }}
              variant="media"
              label="Showreel Aquila"
            >
              <ShowreelPopup />
            </ExpandPopup>
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}
