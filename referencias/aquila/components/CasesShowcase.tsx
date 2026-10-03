import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { sound } from '../utils/audio';

interface CasesShowcaseProps {
  onReturnHome: () => void;
}

export const CasesShowcase: React.FC<CasesShowcaseProps> = ({ onReturnHome }) => {
  // Listen for message from the 3D portfolio (e.g. on ESC or back action)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'AQUILA_CLOSE_CASES') {
        sound.click();
        onReturnHome();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.click();
        onReturnHome();
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onReturnHome]);

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-black overflow-hidden select-none animate-fadeIn">
      {/* 100% Fullscreen real WebGL 3D Portfolio experience from the zip */}
      <iframe
        src="/cases"
        title="Jesper Landberg - Design Engineer Portfolio"
        className="w-full h-full border-0 bg-black block"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />

      {/* Discrete Top Return Bar back to Aquila */}
      <div className="pointer-events-none absolute top-4 inset-x-0 flex items-center justify-between px-6 sm:px-10 z-50">
        <button
          type="button"
          onClick={() => {
            sound.click();
            onReturnHome();
          }}
          className="pointer-events-auto group flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-black/70 backdrop-blur-xl text-white/80 hover:text-white hover:border-white/50 hover:bg-black/95 transition-all cursor-pointer font-mono-code text-[11px] tracking-wider shadow-2xl"
          title="Return to Aquila Home"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>AQUILA</span>
          <span className="hidden sm:inline text-[10px] text-neutral-400 pl-1">/ ESC</span>
        </button>

        <div className="hidden md:flex items-center gap-2 font-mono-code text-[10px] text-white/50 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
          <span>DRAG 3D CARDS TO BROWSE • CLICK CARD TO OPEN CASE STUDY</span>
        </div>
      </div>
    </div>
  );
};
