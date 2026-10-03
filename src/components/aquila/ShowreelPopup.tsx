import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { sound } from '../../utils/audio';
import { RoundButton } from '../../ds';

const SEQUENCES = [
  { id: '01', title: 'Mathematical surfaces & wireframe kinetics', location: 'Zurich' },
  { id: '02', title: 'Spatial computing & real-time shaders', location: 'Tokyo' },
  { id: '03', title: 'Autonomous light sculpture & volumetric glow', location: 'São Paulo' },
  { id: '04', title: 'High-craft editorial typography in 3D space', location: 'Global' },
];

const SEQUENCE_MS = 4200;

export const ShowreelPopup: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [active, setActive] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const playingRef = useRef(isPlaying);
  playingRef.current = isPlaying;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Generative cinema canvas + progress bar, all in one rAF loop (no React re-render per frame)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let animId = 0;
    let time = 0;
    let elapsed = 0;
    let last = performance.now();
    let seq = 0;

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (playingRef.current) {
        time += dt;
        elapsed += dt * 1000;
        if (elapsed >= SEQUENCE_MS) {
          elapsed = 0;
          seq = (seq + 1) % SEQUENCES.length;
          setActive(seq);
        }
      }
      if (barRef.current) {
        const total = ((seq + elapsed / SEQUENCE_MS) / SEQUENCES.length) * 100;
        barRef.current.style.transform = `scaleX(${total / 100})`;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const max = Math.max(w, h);

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a + time * 0.1) * max, cy + Math.sin(a + time * 0.1) * max);
        ctx.stroke();
      }
      for (let r = 40; r < max; r += 60) {
        ctx.beginPath();
        ctx.arc(cx, cy, r + ((time * 50) % 60), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, 0.18 - r / (max * 0.9))})`;
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.8);
      const radius = 90 + Math.sin(time * 4) * 15;
      ctx.beginPath();
      for (let i = 0; i <= 6; i++) {
        const t = (i / 6) * Math.PI * 2;
        if (i === 0) ctx.moveTo(Math.cos(t) * radius, Math.sin(t) * radius);
        else ctx.lineTo(Math.cos(t) * radius, Math.sin(t) * radius);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.rotate(-time * 1.6);
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const t = (i / 3) * Math.PI * 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(t) * radius * 0.65, Math.sin(t) * radius * 0.65);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  const toggle = () => {
    sound.click();
    setIsPlaying((p) => !p);
  };

  const s = SEQUENCES[active];

  return (
    <div className="relative h-full w-full bg-[#050505]">
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
        className="absolute inset-0 block w-full h-full cursor-pointer"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full block" />
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.65)_100%)]" />
      </button>

      {!isPlaying && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="j-label">Pausado</span>
        </div>
      )}

      {/* Caption, Jesper card style: title bottom-left, white round control bottom-right */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between"
        style={{ padding: 'calc(var(--j) * 2)', gap: 'calc(var(--j) * 2)' }}
      >
        <div>
          <p className="j-label opacity-60">Aquila motion reel 2026, {s.location}</p>
          <p key={s.id} className="j-title animate-[fadeUp_0.6s_cubic-bezier(0.16,1,0.3,1)]" style={{ marginTop: 'calc(var(--j) * 0.4)' }}>
            {s.title}
          </p>
          <div className="h-px bg-white/20 overflow-hidden" style={{ marginTop: 'calc(var(--j) * 1.5)', width: 'calc(var(--j) * 30)' }}>
            <div ref={barRef} className="h-full w-full origin-left bg-white" style={{ transform: 'scaleX(0)' }} />
          </div>
        </div>
        <RoundButton label={isPlaying ? 'Pausar' : 'Reproduzir'} onClick={toggle} className="pointer-events-auto">
          {isPlaying ? <Pause className="h-[45%] w-[45%]" /> : <Play className="h-[45%] w-[45%] translate-x-[1px]" />}
        </RoundButton>
      </div>
    </div>
  );
};
