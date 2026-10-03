import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/audio';

interface ShowreelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShowreelModal: React.FC<ShowreelModalProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeSequence, setActiveSequence] = useState(0);
  const [progress, setProgress] = useState(38);
  const [isMuted, setIsMuted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sequences = [
    { id: '01', title: 'MATHEMATICAL SURFACES & WIREFRAME KINETICS', location: 'ZURICH' },
    { id: '02', title: 'SPATIAL COMPUTING & REAL-TIME SHADERS', location: 'TOKYO' },
    { id: '03', title: 'AUTONOMOUS LIGHT SCULPTURE & VOLUMETRIC GLOW', location: 'SÃO PAULO' },
    { id: '04', title: 'HIGH-CRAFT EDITORIAL TYPOGRAPHY IN 3D SPACE', location: 'GLOBAL' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        sound.close();
        onClose();
      }
      if (e.key === ' ' && isOpen) {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sequence rotation & scrubber animation
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const interval = setInterval(() => {
      setActiveSequence((prev) => (prev + 1) % sequences.length);
    }, 4200);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 0.35));
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [isOpen, isPlaying, sequences.length]);

  // Generative Canvas animation in cinema view
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.02;
      const w = canvas.width = canvas.parentElement?.clientWidth || 1280;
      const h = canvas.height = canvas.parentElement?.clientHeight || 600;

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, w, h);

      // Perspective wireframe grid floor
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;
      const cx = w / 2;
      const cy = h / 2;

      // Draw radial radiating perspective lines
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle + time * 0.05) * Math.max(w, h), cy + Math.sin(angle + time * 0.05) * Math.max(w, h));
        ctx.stroke();
      }

      // Draw expanding concentric orbital wireframes
      for (let r = 40; r < Math.max(w, h); r += 60) {
        ctx.beginPath();
        ctx.arc(cx, cy, (r + (time * 25) % 60), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, 0.18 - r / (Math.max(w, h) * 0.9))})`;
        ctx.stroke();
      }

      // Draw rotating faceted monolith polyhedron wireframe
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.4);

      const polyPoints = 6;
      const polyRadius = 90 + Math.sin(time * 2) * 15;
      ctx.beginPath();
      for (let i = 0; i <= polyPoints; i++) {
        const theta = (i / polyPoints) * Math.PI * 2;
        const px = Math.cos(theta) * polyRadius;
        const py = Math.sin(theta) * polyRadius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner geometric star
      ctx.rotate(-time * 0.8);
      ctx.beginPath();
      for (let i = 0; i <= 3; i++) {
        const theta = (i / 3) * Math.PI * 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(theta) * (polyRadius * 0.65), Math.sin(theta) * (polyRadius * 0.65));
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-2xl select-none p-6 sm:p-10 md:p-14"
        onClick={() => {
          sound.close();
          onClose();
        }}
      >
        {/* Cinema Header */}
        <div className="flex items-center justify-between font-mono-code text-xs text-neutral-400 z-20">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="text-white tracking-widest uppercase">
              AQUILA // MOTION REEL 2026
            </span>
            <span className="hidden sm:inline text-neutral-400">· [2.39:1 CINEMASCOPE]</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.close();
              onClose();
            }}
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 uppercase tracking-widest text-[11px]"
          >
            <span>Exit Cinema</span>
            <span className="text-neutral-400 text-[10px]">/ ESC</span>
          </button>
        </div>

        {/* Central 21:9 Anamorphic Canvas Viewport */}
        <div
          className="relative my-auto w-full max-w-5xl mx-auto aspect-[21/9] overflow-hidden border border-white/15 bg-neutral-950/60 shadow-[0_0_80px_rgba(0,0,0,0.9)] cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setIsPlaying((p) => !p);
            sound.click();
          }}
        >
          {/* Animated Procedural Cinema Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

          {/* Film Grain & Scanline Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

          {/* Sequence Title Overlay */}
          <div className="pointer-events-none absolute bottom-6 inset-x-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white z-10">
            <div>
              <span className="font-mono-code text-[10px] text-neutral-400 uppercase tracking-widest block mb-1">
                SEQUENCE {sequences[activeSequence].id} // {sequences[activeSequence].location}
              </span>
              <h3 className="font-sans text-sm sm:text-base md:text-lg font-light tracking-wide text-white">
                {sequences[activeSequence].title}
              </h3>
            </div>

            <div className="font-mono-code text-[11px] text-neutral-400">
              <span>{Math.floor(progress * 1.8)} / 180s</span>
            </div>
          </div>

          {/* Center Play/Pause indicator when toggled */}
          {!isPlaying && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
              <span className="font-mono-code text-xs tracking-widest px-4 py-2 rounded-full border border-white/20 bg-black/80 text-white">
                PAUSED · CLICK TO RESUME
              </span>
            </div>
          )}
        </div>

        {/* Minimalist Cinema Transport Bar */}
        <div
          className="w-full max-w-5xl mx-auto flex flex-col gap-3 font-mono-code text-xs text-neutral-400 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Timeline Scrubber */}
          <div className="relative w-full h-[2px] bg-white/15 cursor-pointer overflow-hidden rounded-full">
            <motion.div
              className="absolute left-0 top-0 bottom-0 bg-white"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  sound.click();
                  setIsPlaying((p) => !p);
                }}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.click();
                  setIsMuted((m) => !m);
                }}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-400" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
                <span>{isMuted ? 'UNMUTE' : 'AUDIO ACTIVE'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-neutral-400">
              <span className="text-white/80">4K HDR</span>
              <span>·</span>
              <span>60 FPS</span>
              <span>·</span>
              <span>SPATIAL AUDIO</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
