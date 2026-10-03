import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { sound } from '../../utils/audio';

interface CasesShowcaseProps {
  onReturnHome: () => void;
}

/**
 * Case Studies: the full Jesper WebGL experience, as downloaded, in full screen.
 * Its own "AQUILA / VOLTAR" button and Esc post AQUILA_CLOSE_CASES back to us.
 */
export const CasesShowcase: React.FC<CasesShowcaseProps> = ({ onReturnHome }) => {
  useEffect(() => {
    const close = () => {
      sound.close();
      onReturnHome();
    };
    const handleMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === 'AQUILA_CLOSE_CASES') close();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('message', handleMessage);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onReturnHome]);

  return (
    <motion.div
      className="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
      exit={{ opacity: 0, transition: { duration: 0.4 } }}
    >
      <iframe
        src="/cases.html"
        title="Case studies"
        className="block h-full w-full border-0 bg-black"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </motion.div>
  );
};
