import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { CASES, CaseStudy } from '../../data/cases';
import { CaseVisual } from './CaseVisual';
import { ExpandPopup, OriginRect, rectFrom } from '../ui/ExpandPopup';
import { sound } from '../../utils/audio';

interface CasesViewProps {
  onClose: () => void;
  onLaunch: (experience: NonNullable<CaseStudy['experience']>) => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;
const DRAG_THRESHOLD = 6;

const pad = (n: number) => String(n).padStart(2, '0');

export const CasesView: React.FC<CasesViewProps> = ({ onClose, onLaunch }) => {
  const [selected, setSelected] = useState<{ item: CaseStudy; origin: OriginRect } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cursor, setCursor] = useState<'hidden' | 'drag' | 'open'>('hidden');

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Physics state lives in refs: the rAF loop never triggers React renders
  const pos = useRef({ current: 0, target: 0, min: 0, max: 0 });
  const drag = useRef({ active: false, startX: 0, startTarget: 0, moved: false, lastX: 0, lastT: 0, velocity: 0 });
  const lastDragEnd = useRef(0);
  const mouse = useRef({ x: -200, y: -200, cx: -200, cy: -200 });
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const measure = useCallback(() => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!vp || !track) return;
    const overflow = track.scrollWidth - vp.clientWidth;
    pos.current.min = Math.min(0, -overflow);
    pos.current.max = 0;
    pos.current.target = Math.max(pos.current.min, Math.min(pos.current.max, pos.current.target));
  }, []);

  // Main loop: inertia, rubber-band edges, velocity skew, inner parallax, progress, cursor
  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let lastActive = -1;

    const loop = () => {
      const p = pos.current;
      if (!drag.current.active) {
        if (p.target > p.max) p.target += (p.max - p.target) * 0.15;
        if (p.target < p.min) p.target += (p.min - p.target) * 0.15;
      }
      p.current += (p.target - p.current) * (reduce ? 1 : 0.085);
      const vel = p.target - p.current;

      if (trackRef.current) {
        const skew = reduce ? 0 : Math.max(-6, Math.min(6, vel * -0.025));
        trackRef.current.style.transform = `translate3d(${p.current}px,0,0) skewX(${skew}deg)`;
      }

      const vpWidth = viewportRef.current?.clientWidth ?? window.innerWidth;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const center = card.offsetLeft + card.offsetWidth / 2 + p.current;
        const offset = (center - vpWidth / 2) / vpWidth;
        const media = mediaRefs.current[i];
        if (media && !reduce) media.style.transform = `translate3d(${offset * -12}%,0,0) scale(1.25)`;
      });

      // Counter follows scroll progress, so the first card reads 01 at rest
      const range = p.max - p.min || 1;
      const prog = Math.max(0, Math.min(1, (p.max - p.current) / range));
      const active = Math.round(prog * (CASES.length - 1));
      if (active !== lastActive) {
        lastActive = active;
        setActiveIndex(active);
      }
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${0.08 + prog * 0.92})`;
      }

      const m = mouse.current;
      m.cx += (m.x - m.cx) * 0.2;
      m.cy += (m.y - m.cy) * 0.2;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${m.cx}px,${m.cy}px,0) translate(-50%,-50%)`;
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  // Wheel / trackpad scroll moves the row horizontally
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      if (selectedRef.current) return;
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      pos.current.target -= delta * 1.1;
      pos.current.target = Math.max(pos.current.min - 80, Math.min(pos.current.max + 80, pos.current.target));
    };
    vp.addEventListener('wheel', onWheel, { passive: false });
    return () => vp.removeEventListener('wheel', onWheel);
  }, []);

  const stepTo = useCallback((index: number) => {
    const card = cardRefs.current[index];
    const vp = viewportRef.current;
    if (!card || !vp) return;
    const p = pos.current;
    p.target = Math.max(p.min, Math.min(p.max, vp.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2)));
  }, []);

  // Keyboard: arrows browse, Esc leaves (the popup handles its own Esc first)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selectedRef.current) return;
      if (e.key === 'Escape') {
        sound.close();
        onClose();
      } else if (e.key === 'ArrowRight') {
        stepTo(Math.min(CASES.length - 1, activeIndex + 1));
      } else if (e.key === 'ArrowLeft') {
        stepTo(Math.max(0, activeIndex - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, onClose, stepTo]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startTarget: pos.current.target,
      moved: false,
      lastX: e.clientX,
      lastT: performance.now(),
      velocity: 0,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > DRAG_THRESHOLD) {
      d.moved = true;
      viewportRef.current?.setPointerCapture(e.pointerId);
    }
    if (!d.moved) return;
    const now = performance.now();
    d.velocity = (e.clientX - d.lastX) / Math.max(1, now - d.lastT);
    d.lastX = e.clientX;
    d.lastT = now;
    let next = d.startTarget + dx * 1.15;
    const p = pos.current;
    if (next > p.max) next = p.max + (next - p.max) * 0.35;
    if (next < p.min) next = p.min + (next - p.min) * 0.35;
    p.target = next;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    if (d.moved) {
      lastDragEnd.current = performance.now();
      pos.current.target += d.velocity * 260;
      viewportRef.current?.releasePointerCapture?.(e.pointerId);
    }
  };

  const openCase = (item: CaseStudy, el: HTMLElement) => {
    // A drag that just ended must never count as a click on the card under the pointer
    if (drag.current.active || performance.now() - lastDragEnd.current < 250) return;
    setSelected({ item, origin: rectFrom(el, 20) });
  };

  const launch = (item: CaseStudy) => {
    if (!item.experience) return;
    sound.click();
    setSelected(null);
    onLaunch(item.experience);
  };

  return (
    <motion.section
      className="fixed inset-0 z-40 bg-black text-white overflow-hidden select-none"
      initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      animate={{ clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
      exit={{ clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
      aria-label="Case studies"
    >
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-30" />

      {/* Header */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 pt-4 sm:px-8 sm:pt-7">
        <button
          type="button"
          onClick={() => {
            sound.close();
            onClose();
          }}
          className="group flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-[13px] tracking-[-0.01em] text-white/85 backdrop-blur-md transition-colors hover:border-white/60 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span className="font-grotesk font-semibold tracking-wider">AQUILA</span>
          <span className="hidden sm:inline text-white/40">Esc</span>
        </button>

        <p className="hidden md:block text-[14px] tracking-[-0.02em] text-white/60">Case studies</p>

        <p className="font-mono-code text-[12px] tabular-nums text-white/70" aria-live="polite">
          {pad(activeIndex + 1)} <span className="text-white/30">/ {pad(CASES.length)}</span>
        </p>
      </header>

      {/* Draggable row */}
      <div
        ref={viewportRef}
        className="absolute inset-0 flex items-center cursor-none touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setCursor('drag')}
        onPointerLeave={() => setCursor('hidden')}
      >
        <div
          ref={trackRef}
          className="flex items-center gap-4 sm:gap-6 px-[8vw] sm:px-[12vw] will-change-transform"
          style={{ transformOrigin: 'center center' }}
        >
          {CASES.map((item, i) => (
            <motion.button
              key={item.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              type="button"
              onClick={(e) => openCase(item, e.currentTarget)}
              onFocus={() => stepTo(i)}
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse') {
                  setCursor('open');
                  sound.hover();
                }
              }}
              onPointerLeave={(e) => e.pointerType === 'mouse' && setCursor('drag')}
              aria-label={`Abrir case ${item.title}`}
              className="group relative flex-none overflow-hidden rounded-[16px] sm:rounded-[20px] bg-neutral-950 text-left cursor-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              style={{
                height: 'min(56svh, 560px, calc(72vw / 0.72))',
                width: 'min(calc(min(56svh, 560px) * 0.72), 72vw)',
                visibility: selected?.item.id === item.id ? 'hidden' : 'visible',
              }}
              initial={{ opacity: 0, x: 160 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.45 + i * 0.07, duration: 1, ease: EASE } }}
            >
              <div
                ref={(el) => {
                  mediaRefs.current[i] = el;
                }}
                className="absolute inset-0 will-change-transform"
                style={{ transform: 'scale(1.25)' }}
              >
                <CaseVisual
                  visual={item.visual}
                  className="h-full w-full transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                />
              </div>
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
              <span className="pointer-events-none absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 flex items-end justify-between gap-3">
                <span>
                  <span className="block text-[12px] text-white/55 tracking-[-0.01em]">{item.category}</span>
                  <span className="block whitespace-nowrap text-[16px] sm:text-[18px] tracking-[-0.05em] text-white">
                    {item.title}
                  </span>
                </span>
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white text-black text-[15px] leading-none transition-transform duration-500 group-hover:rotate-90">
                  +
                </span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Footer: progress + hint */}
      <footer className="pointer-events-none absolute bottom-0 inset-x-0 z-20 flex items-center justify-between gap-6 px-4 pb-5 sm:px-8 sm:pb-7">
        <p className="text-[13px] tracking-[-0.01em] text-white/45">
          <span className="hidden sm:inline">Arraste ou role para navegar. Clique para abrir.</span>
          <span className="sm:hidden">Arraste para navegar</span>
        </p>
        <div className="h-px w-[min(16rem,40vw)] bg-white/15 overflow-hidden">
          <div ref={progressRef} className="h-full w-full origin-left bg-white" style={{ transform: 'scaleX(0.08)' }} />
        </div>
      </footer>

      {/* Custom cursor (mouse only) */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-30 hidden [@media(pointer:fine)]:flex items-center justify-center rounded-full bg-white text-black text-[12px] font-medium tracking-[-0.01em] transition-[width,height,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          width: cursor === 'open' ? 84 : cursor === 'drag' ? 64 : 0,
          height: cursor === 'open' ? 84 : cursor === 'drag' ? 64 : 0,
          opacity: cursor === 'hidden' || selected ? 0 : 1,
        }}
      >
        {cursor === 'open' ? 'Abrir' : cursor === 'drag' ? '← →' : ''}
      </div>

      {/* Case detail: grows out of the clicked card */}
      <AnimatePresence>
        {selected && (
          <ExpandPopup
            key={selected.item.id}
            origin={selected.origin}
            onClose={() => setSelected(null)}
            size={(vp) => ({ width: Math.min(1200, vp.width - 48), height: vp.height - 48 })}
            label={selected.item.title}
          >
            <CaseDetail item={selected.item} onLaunch={() => launch(selected.item)} />
          </ExpandPopup>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

const CaseDetail: React.FC<{ item: CaseStudy; onLaunch: () => void }> = ({ item, onLaunch }) => (
  <div className="flex min-h-full flex-col md:flex-row">
    <div className="relative h-[42svh] md:h-auto md:w-[52%] flex-none overflow-hidden">
      <CaseVisual visual={item.visual} className="absolute inset-0 h-full w-full" />
    </div>

    <div className="flex flex-1 flex-col justify-between gap-10 px-6 py-8 sm:px-10 sm:py-12 md:px-14 md:py-16">
      <div>
        <p className="text-[13px] text-white/50 tracking-[-0.01em]">
          {item.category}, {item.year}
        </p>
        <h2 className="mt-3 text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.055em] font-light text-white">
          {item.title}
        </h2>
        <p className="mt-8 max-w-[34rem] text-[15px] sm:text-[16px] leading-[1.6] tracking-[-0.02em] text-white/75">
          {item.description}
        </p>
      </div>

      <div className="space-y-8">
        <dl className="grid grid-cols-2 gap-6 text-[13px] tracking-[-0.01em]">
          <div>
            <dt className="text-white/45">Cliente</dt>
            <dd className="mt-2 text-white/90">{item.client}</dd>
          </div>
          <div>
            <dt className="text-white/45">Tecnologias</dt>
            <dd className="mt-2 text-white/90">
              <ul className="space-y-1">
                {item.technologies.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>

        {item.experience && (
          <div className="flex max-w-[24rem] items-center gap-2">
            <button
              type="button"
              onClick={onLaunch}
              className="flex h-12 flex-1 items-center justify-center rounded-full bg-white text-black text-[14px] font-medium tracking-[-0.02em] transition-transform hover:scale-[1.02] cursor-pointer"
            >
              Iniciar experiência
            </button>
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full border border-white/25 text-[18px]" aria-hidden="true">
              ↗
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);
