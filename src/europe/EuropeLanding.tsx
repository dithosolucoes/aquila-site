import React, { useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AquilaNav, NavigationTab } from '../components/aquila/AquilaNav';
import { OriginRect, rectFrom } from '../components/ui/ExpandPopup';
import { SheetPopup } from '../components/ui/SheetPopup';
import { Label, PillAction, TextButton, unit } from '../ds';
import { sound } from '../utils/audio';
import { MockAds, MockGoogle, MockPhoto, MockPresence, MockSite, MockSocial, MockWhatsApp, FoodTile } from './Mocks';

gsap.registerPlugin(ScrollTrigger);

/**
 * Europe US landing (PT-PT), revealed over the landed map.
 * Narrative: the business isn't experienced in pieces → isolated pieces become
 * one system → restaurant analogy → diagnosis (today × ideal) → method →
 * what we build → why now → who we are → FAQ → contact.
 */

const CONTACT_HREF = 'mailto:studio@aquila.design?subject=Diagn%C3%B3stico%20Europe%20US';
const EASE = [0.16, 1, 0.3, 1] as const;

const MANIFESTO =
  'O seu negócio não é vivido em peças. O cliente encontra-o no Google, vê as fotografias, abre o Instagram, visita o site e envia uma mensagem. Cada peça pode estar bem feita e, mesmo assim, o conjunto falhar.';

const PIECES = [
  { id: 'google', label: 'Google', sub: 'Ser encontrado' },
  { id: 'foto', label: 'Fotografia', sub: 'Primeira impressão' },
  { id: 'insta', label: 'Instagram', sub: 'Personalidade' },
  { id: 'site', label: 'Site', sub: 'Compreender' },
  { id: 'reviews', label: 'Avaliações', sub: 'Confiança' },
  { id: 'whats', label: 'WhatsApp', sub: 'Contacto' },
  { id: 'ads', label: 'Anúncios', sub: 'Chegar a mais gente' },
];

// Scattered (isolated) and aligned (system) positions, in % of the stage
const SCATTER = [
  { x: 12, y: 18, r: -12 },
  { x: 72, y: 12, r: 9 },
  { x: 40, y: 72, r: -6 },
  { x: 84, y: 64, r: 14 },
  { x: 22, y: 58, r: 7 },
  { x: 58, y: 36, r: -15 },
  { x: 6, y: 84, r: 10 },
];

const ANALOGY = [
  'O melhor chef não salva um salão mal cuidado.',
  'O salão perfeito não salva uma cozinha fraca.',
  'E nada disso importa se ninguém entrar pela porta.',
];

const STEPS = [
  { n: '01', t: 'Diagnosticar', d: 'Olhamos para o seu negócio como um cliente o vê: Google, fotografias, site, redes e contacto.' },
  { n: '02', t: 'Definir', d: 'Definimos o padrão ideal para o seu tipo de negócio e medimos a distância até lá.' },
  { n: '03', t: 'Construir', d: 'Fotografia no local, site, perfil do Google e conteúdo. Cada peça feita para encaixar nas outras.' },
  { n: '04', t: 'Ligar', d: 'O Google leva ao site, o site leva à reserva, as fotografias alimentam tudo. Uma só experiência.' },
  { n: '05', t: 'Lançar', d: 'Pomos a nova presença a funcionar, medimos o que acontece e ajustamos.' },
];

interface Service {
  id: string;
  title: string;
  line: string;
  body: string;
  tags: string[];
  media: React.ReactNode[];
}

const SERVICES: Service[] = [
  {
    id: 'foto',
    title: 'Fotografia',
    line: 'Feita no seu espaço, por um fotógrafo gastronómico.',
    body: 'Pratos, sala, equipa e detalhes. Uma sessão planeada antes de chegarmos, com a lista de fotografias definida para alimentar o site, o Google, as redes e os anúncios.',
    tags: ['Sessão no local', 'Edição', 'Direção visual'],
    media: [<MockPhoto key="a" />, <MockSocial key="b" tone="ideal" />],
  },
  {
    id: 'site',
    title: 'Site',
    line: 'Rápido, claro e feito para converter em reservas.',
    body: 'Estrutura pensada para quem chega pelo telemóvel: menu, localização, horários e um caminho direto para reservar ou falar consigo.',
    tags: ['Design', 'Texto', 'Telemóvel'],
    media: [<MockSite key="a" tone="ideal" />, <MockSite key="b" tone="today" />],
  },
  {
    id: 'google',
    title: 'Google e SEO local',
    line: 'Ser a escolha óbvia para quem procura perto.',
    body: 'Perfil completo e coerente com o site: categorias, horários, fotografias, menu e uma estratégia de avaliações. A base para aparecer quando procuram por si.',
    tags: ['Perfil do Google', 'SEO local', 'Avaliações'],
    media: [<MockGoogle key="a" tone="ideal" />, <MockGoogle key="b" tone="today" />],
  },
  {
    id: 'social',
    title: 'Conteúdo e redes',
    line: 'Uma identidade reconhecível em cada publicação.',
    body: 'Organização do perfil, direção visual e conteúdos iniciais feitos com as fotografias da sessão, para que o Instagram conte a mesma história que o resto.',
    tags: ['Instagram', 'Identidade', 'Calendário'],
    media: [<MockSocial key="a" tone="ideal" />, <MockSocial key="b" tone="today" />],
  },
  {
    id: 'ads',
    title: 'Anúncios',
    line: 'Levar mais gente a uma experiência que já está pronta.',
    body: 'Campanhas no Google e no Meta que só fazem sentido quando o resto está ligado. Por isso vêm depois: primeiro preparamos a casa, depois abrimos a porta.',
    tags: ['Google Ads', 'Meta Ads', 'Medição'],
    media: [<MockAds key="a" />],
  },
  {
    id: 'whats',
    title: 'WhatsApp e automação',
    line: 'Nenhum pedido de reserva perdido.',
    body: 'Respostas rápidas, reservas organizadas e lembretes automáticos. O contacto deixa de depender de alguém ver a mensagem a tempo.',
    tags: ['WhatsApp', 'Reservas', 'CRM'],
    media: [<MockWhatsApp key="a" />],
  },
];

const FAQ = [
  { q: 'Preciso de ter site para começar?', a: 'Não. Construímos a partir do que já existe ou começamos do zero.' },
  {
    q: 'Vocês estão em Portugal?',
    a: 'Estaremos em Lisboa durante a operação, para fotografar e trabalhar com cada negócio de perto. O restante é feito pela nossa equipa, à distância, com o mesmo acompanhamento.',
  },
  { q: 'Quanto tempo demora?', a: 'O prazo é definido no diagnóstico e fica fechado antes de começarmos.' },
  {
    q: 'E depois da entrega?',
    a: 'Pode continuar connosco em anúncios, conteúdo e crescimento, ou seguir sozinho com tudo o que entregámos. Tudo fica seu.',
  },
  { q: 'Em que línguas trabalham?', a: 'Português e inglês.' },
];

interface EuropeLandingProps {
  cityName: string;
  onNavigate: (tab: NavigationTab) => void;
  onOpenAbout: (origin: OriginRect) => void;
  onOpenContact: (origin: OriginRect) => void;
  /** 0..1 over the first screen, so the map behind can recede. */
  onHeroProgress: (p: number) => void;
}

export const EuropeLanding: React.FC<EuropeLandingProps> = ({
  cityName,
  onNavigate,
  onOpenAbout,
  onOpenContact,
  onHeroProgress,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [service, setService] = useState<{ item: Service; origin: OriginRect } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const contact = () => {
    window.location.href = CONTACT_HREF;
  };

  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    // Full-screen sections use the real height of the scroll area (avoids svh/vh mismatches)
    const setVh = () => scroller.style.setProperty('--vh', `${scroller.clientHeight}px`);
    setVh();
    window.addEventListener('resize', setVh);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      const st = { scroller } as const;

      // Map recedes as the hero scrolls away
      ScrollTrigger.create({
        ...st,
        trigger: '[data-hero]',
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => onHeroProgress(self.progress),
      });

      if (reduce) return;

      // Hero content lifts and fades
      gsap.to('[data-hero-inner]', {
        yPercent: -25,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { ...st, trigger: '[data-hero]', start: 'top top', end: 'bottom 20%', scrub: true },
      });

      // Manifesto: word-by-word light
      gsap.fromTo(
        '[data-manifesto] .w',
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.06,
          ease: 'none',
          scrollTrigger: { ...st, trigger: '[data-manifesto]', start: 'top 78%', end: 'bottom 40%', scrub: true },
        }
      );

      // Pieces → system (pinned)
      const mobile = window.innerWidth < 768;
      // On phones the heading is taller, so the pieces live in the lower part of the stage
      const aligned = PIECES.map((_, i) =>
        mobile ? { x: 50, y: 30 + i * 9.6 } : { x: 8 + i * (84 / (PIECES.length - 1)), y: 56 }
      );
      gsap.set('[data-piece]', {
        left: (i: number) => `${mobile ? 18 + (SCATTER[i].x * 0.64) : SCATTER[i].x}%`,
        top: (i: number) => `${mobile ? 32 + SCATTER[i].y * 0.6 : SCATTER[i].y}%`,
        rotation: (i: number) => SCATTER[i].r,
      });
      const tl = gsap.timeline({
        scrollTrigger: { ...st, trigger: '[data-pieces]', start: 'top top', end: '+=180%', scrub: 0.8, pin: true },
      });
      tl.to('[data-piece]', {
        left: (i: number) => `${aligned[i].x}%`,
        top: (i: number) => `${aligned[i].y}%`,
        rotation: 0,
        duration: 1,
        ease: 'power2.inOut',
        stagger: 0.04,
      })
        .to('[data-pieces-a]', { opacity: 0, y: -20, duration: 0.3 }, 0.35)
        .fromTo('[data-pieces-b]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, 0.6)
        .fromTo('[data-pieces-line]', { scale: 0 }, { scale: 1, duration: 0.5, ease: 'none' }, 0.75)
        .to('[data-piece]', { backgroundColor: 'rgba(255,255,255,1)', color: '#000', duration: 0.3, stagger: 0.03 }, 0.85);

      // Restaurant analogy: line by line
      gsap.utils.toArray<HTMLElement>('[data-analogy] [data-line]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0.1, x: -20 },
          { opacity: 1, x: 0, ease: 'none', scrollTrigger: { ...st, trigger: el, start: 'top 80%', end: 'top 50%', scrub: true } }
        );
      });

      // Today × Ideal: the divider sweeps open when the section arrives
      gsap.fromTo(
        '[data-compare]',
        { '--split': '92%' },
        { '--split': '50%', ease: 'power2.out', scrollTrigger: { ...st, trigger: '[data-compare]', start: 'top 70%', end: 'top 25%', scrub: true } }
      );

      // Method: horizontal track (pinned)
      const track = scroller.querySelector<HTMLElement>('[data-track]');
      if (track) {
        gsap.to(track, {
          x: () => -(track.scrollWidth - scroller.clientWidth),
          ease: 'none',
          scrollTrigger: {
            ...st,
            trigger: '[data-method]',
            start: 'top top',
            end: () => `+=${track.scrollWidth}`,
            scrub: 0.6,
            pin: true,
            invalidateOnRefresh: true,
          },
        });
      }

      // Why now: 5 → 1
      gsap.fromTo(
        '[data-vendor]',
        { opacity: 1, scale: 1 },
        {
          // the four separate suppliers slide into the Áquila circle, which grows
          opacity: (i: number) => (i === 0 ? 1 : 0),
          scale: (i: number) => (i === 0 ? 1.35 : 0.7),
          x: (i: number) => {
            const j = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--j')) || 10;
            return i === 0 ? 0 : -i * j * 6.2;
          },
          stagger: 0.04,
          ease: 'power2.inOut',
          scrollTrigger: { ...st, trigger: '[data-why]', start: 'top 60%', end: 'center 45%', scrub: true },
        }
      );

      // Generic reveals
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40, filter: 'blur(8px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.1,
            ease: 'expo.out',
            scrollTrigger: { ...st, trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      });
    }, scroller);

    // Fonts/layout settle → recompute pins
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', setVh);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <motion.div
        ref={scrollRef}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden text-paper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.8 } }}
      >
        <header
          className="fixed inset-x-0 top-0 z-40 bg-gradient-to-b from-ink via-ink/70 to-transparent px-4 pt-4 sm:px-6 sm:pt-6 md:px-8 md:pt-8 lg:px-10 lg:pt-10"
          style={{ paddingBottom: unit(4) }}
        >
          <AquilaNav
            activeTab="EUROPE"
            onSelectTab={onNavigate}
            onOpenAbout={onOpenAbout}
            onOpenContact={onOpenContact}
            withCorner={false}
          />
        </header>

        {/* 1 · HERO over the landed map */}
        <section data-hero className="relative flex h-[var(--vh,100dvh)] flex-col items-center justify-center text-center j-gutter">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 50% 42% at 50% 52%, rgba(0,0,0,0.85), rgba(0,0,0,0.35) 62%, transparent 85%)' }}
          />
          <motion.div
            data-hero-inner
            className="relative flex flex-col items-center"
            initial="hidden"
            animate="shown"
            variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }}
          >
            {[
              <Label key="k">Europe US, {cityName}</Label>,
              <h1 key="h" className="j-display" style={{ marginTop: unit(2), maxWidth: unit(70) }}>
                A Áquila está a chegar a {cityName}.
              </h1>,
              <p key="p" className="j-text opacity-80" style={{ marginTop: unit(2.4), maxWidth: unit(40) }}>
                Construímos e ligamos todas as peças da presença digital de negócios locais. Site, Google, fotografia,
                conteúdo e aquisição, a trabalhar como uma só.
              </p>,
              <div key="c" className="flex flex-wrap items-center justify-center" style={{ marginTop: unit(3.2), gap: unit(2.5) }}>
                <PillAction label="Pedir diagnóstico" onClick={contact} />
              </div>,
            ].map((node, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center"
                variants={{
                  hidden: { opacity: 0, y: 24, filter: 'blur(10px)' },
                  shown: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1.1, ease: EASE } },
                }}
              >
                {node}
              </motion.div>
            ))}
          </motion.div>

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between j-chrome">
            <p className="j-label opacity-50 text-left">
              38° 43′ N
              <br />
              9° 08′ W
            </p>
            <div className="flex flex-col items-center" style={{ gap: unit(1) }}>
              <p className="j-label opacity-60">Role para descobrir</p>
              <div className="relative h-10 w-px overflow-hidden bg-white/20">
                <div className="absolute inset-x-0 top-0 h-1/2 bg-white animate-[scrollcue_1.8s_cubic-bezier(0.76,0,0.24,1)_infinite]" />
              </div>
            </div>
            <p className="j-label opacity-50 text-right">
              Brasil
              <br />
              Portugal
            </p>
          </div>
        </section>

        <div className="relative bg-ink">
          {/* 2 · MANIFESTO */}
          <section className="j-gutter flex min-h-[90svh] items-center justify-center" style={{ paddingBlock: unit(14) }}>
            <p data-manifesto className="j-heading text-center" style={{ maxWidth: unit(78) }}>
              {MANIFESTO.split(' ').map((w, i) => (
                <span key={i} className="w inline-block" style={{ marginRight: '0.28em' }}>
                  {w}
                </span>
              ))}
            </p>
          </section>

          {/* 3 · PIECES → SYSTEM (pinned) */}
          <section data-pieces className="relative h-[var(--vh,100dvh)] overflow-hidden">
            <div className="absolute inset-x-0 top-0 z-10 text-center j-gutter" style={{ paddingTop: unit(12) }}>
              <Label>O problema</Label>
              <div className="relative" style={{ marginTop: unit(1.2), minHeight: unit(9) }}>
                <div data-pieces-a className="absolute inset-x-0">
                  <p className="j-heading">Peças isoladas.</p>
                  <p className="j-text opacity-70 mx-auto" style={{ marginTop: unit(1), maxWidth: unit(44) }}>
                    Uma agência para os anúncios. Outra para o site. Um fotógrafo. Alguém para o Instagram. E o dono a tentar ligar
                    tudo.
                  </p>
                </div>
                <div data-pieces-b className="absolute inset-x-0" style={{ opacity: 0 }}>
                  <p className="j-heading">Um sistema.</p>
                  <p className="j-text opacity-70 mx-auto" style={{ marginTop: unit(1), maxWidth: unit(44) }}>
                    Cada peça alimenta a seguinte. A fotografia serve o Google, o site e os anúncios. O cliente sente uma marca só.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute inset-0" style={{ top: unit(10) }}>
              {/* Connection line: grows from the left (desktop) / top (phone) once the pieces align */}
              <div
                data-pieces-line
                aria-hidden="true"
                className="absolute hidden h-px origin-left bg-champagne/70 md:block"
                style={{ left: '8%', width: '84%', top: '56%', transform: 'scale(0)' }}
              />
              <div
                data-pieces-line
                aria-hidden="true"
                className="absolute w-px origin-top bg-champagne/70 md:hidden"
                style={{ left: '50%', top: '30%', height: '58%', transform: 'scale(0)' }}
              />
              {PIECES.map((p) => (
                <div
                  key={p.id}
                  data-piece
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-start rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-sm"
                  style={{ paddingInline: unit(1.6), paddingBlock: unit(0.9) }}
                >
                  <span className="j-title whitespace-nowrap" style={{ fontSize: 'calc(var(--j) * 1.5)' }}>
                    {p.label}
                  </span>
                  <span className="j-label opacity-60 whitespace-nowrap">{p.sub}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 4 · RESTAURANT ANALOGY */}
          <section data-analogy className="j-gutter" style={{ paddingBlock: unit(16) }}>
            <div className="mx-auto" style={{ maxWidth: unit(80) }}>
              <Label>Pense num restaurante</Label>
              <div className="flex flex-col" style={{ marginTop: unit(3), gap: unit(2.4) }}>
                {ANALOGY.map((line, i) => (
                  <p key={i} data-line className="j-heading">
                    {line}
                  </p>
                ))}
                <p data-line className="j-heading text-champagne" style={{ marginTop: unit(2) }}>
                  Na presença digital é igual.
                </p>
              </div>
            </div>
          </section>

          {/* 5 · DIAGNOSIS: today × ideal */}
          <section className="j-gutter" style={{ paddingBlock: unit(10) }}>
            <div data-reveal className="mx-auto text-center" style={{ maxWidth: unit(56) }}>
              <Label>O diagnóstico</Label>
              <h2 className="j-heading" style={{ marginTop: unit(1.4) }}>
                Olhamos para o seu negócio antes de falarmos consigo.
              </h2>
              <p className="j-text opacity-70 mx-auto" style={{ marginTop: unit(1.6), maxWidth: unit(44) }}>
                Comparamos o que o cliente vê hoje com o que deveria ver. E construímos exatamente o que falta entre os dois.
              </p>
            </div>
            <CompareSlider />
            <p className="j-label opacity-40 text-center" style={{ marginTop: unit(1.4) }}>
              Exemplo ilustrativo de um restaurante fictício. Arraste para comparar.
            </p>
          </section>

          {/* 6 · METHOD: horizontal */}
          <section data-method className="relative flex h-[var(--vh,100dvh)] flex-col justify-center overflow-hidden">
            <div className="flex items-end justify-between j-gutter" style={{ marginBottom: unit(3) }}>
              <div>
                <Label>O método</Label>
                <p className="j-heading" style={{ marginTop: unit(1) }}>
                  Cinco passos, do diagnóstico ao lançamento.
                </p>
              </div>
              <p className="j-label opacity-50 hidden md:block">Role para avançar</p>
            </div>
            <div data-track className="flex items-center will-change-transform" style={{ paddingLeft: '8vw', gap: '3vw' }}>
              {STEPS.map((s, i) => (
                <article
                  key={s.n}
                  className="relative flex-none overflow-hidden bg-surface"
                  style={{ width: 'min(78vw, 46rem)', height: 'min(52svh, 30rem)', borderRadius: unit(2) }}
                >
                  <FoodTile seed={i + 1} className="absolute inset-0 opacity-40" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
                  {/* Big step number as the card's visual */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-0 top-0 j-display opacity-[0.08]"
                    style={{ fontSize: 'calc(var(--j) * 22)', lineHeight: 0.8, padding: unit(2) }}
                  >
                    {s.n}
                  </span>
                  <div className="relative flex h-full flex-col justify-between" style={{ padding: unit(3) }}>
                    <span className="j-mono opacity-60">{s.n} / 05</span>
                    <div>
                      <h3 className="j-display">{s.t}</h3>
                      <p className="j-text opacity-80" style={{ marginTop: unit(1.4), maxWidth: unit(34) }}>
                        {s.d}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
              <div className="flex-none" style={{ width: '8vw' }} />
            </div>
          </section>

          {/* 7 · WHAT WE BUILD → white case sheets */}
          <section className="j-gutter" style={{ paddingBlock: unit(14) }}>
            <div data-reveal className="flex flex-col md:flex-row md:items-end md:justify-between" style={{ gap: unit(2) }}>
              <div>
                <Label>O que construímos</Label>
                <h2 className="j-heading" style={{ marginTop: unit(1.4), maxWidth: unit(44) }}>
                  Seis peças. Uma presença.
                </h2>
              </div>
              <p className="j-text opacity-60" style={{ maxWidth: unit(30) }}>
                Toque numa peça para ver o que inclui.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ marginTop: unit(5), gap: unit(1.5) }}>
              {SERVICES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  data-reveal
                  onClick={(e) => setService({ item: s, origin: rectFrom(e.currentTarget, 20) })}
                  onPointerEnter={() => sound.hover()}
                  style={{ borderRadius: unit(2), visibility: service?.item.id === s.id ? 'hidden' : 'visible' }}
                  className="group relative block aspect-[4/3] overflow-hidden bg-surface text-left cursor-pointer"
                >
                  <FoodTile
                    seed={i}
                    className="absolute inset-0 opacity-30 transition-all duration-[1.2s] ease-[var(--ease-content)] group-hover:scale-105 group-hover:opacity-60"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <span className="absolute j-text opacity-70" style={{ top: unit(2), left: unit(2), right: unit(2) }}>
                    {s.line}
                  </span>
                  <span className="absolute flex items-end justify-between" style={{ bottom: unit(1.5), left: unit(2), right: unit(1.5) }}>
                    <span className="j-title whitespace-nowrap">{s.title}</span>
                    <span
                      className="flex flex-none items-center justify-center rounded-full bg-paper text-ink transition-transform duration-500 group-hover:rotate-90"
                      style={{ width: unit(2.5), height: unit(2.5), fontSize: unit(1.4) }}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* 8 · WHY NOW */}
          <section data-why className="j-gutter" style={{ paddingBlock: unit(14) }}>
            <div className="grid grid-cols-1 items-center md:grid-cols-2" style={{ gap: unit(6) }}>
              <div className="flex flex-col items-center justify-center" style={{ minHeight: unit(28) }}>
                <div className="relative flex">
                  {['Áquila', 'Site', 'Fotografia', 'Redes', 'Anúncios'].map((v, i) => (
                    <div
                      key={v}
                      data-vendor
                      className={`flex flex-none flex-col items-center justify-center rounded-full ${
                        i === 0 ? 'bg-paper text-ink' : 'border border-white/30 bg-ink'
                      }`}
                      style={{ width: unit(10), height: unit(10), marginLeft: i === 0 ? 0 : unit(-3.8), zIndex: 10 - i }}
                    >
                      <span className="j-label">{v}</span>
                    </div>
                  ))}
                </div>
                <p className="j-label opacity-50" style={{ marginTop: unit(3) }}>
                  Cinco fornecedores, uma equipa
                </p>
              </div>
              <div data-reveal>
                <Label>Porquê agora</Label>
                <h2 className="j-heading" style={{ marginTop: unit(1.4) }}>
                  Antes eram cinco fornecedores. Hoje é uma equipa.
                </h2>
                <p className="j-text opacity-70" style={{ marginTop: unit(1.6), maxWidth: unit(40) }}>
                  Uma presença digital integrada exigia várias empresas, meses de coordenação e orçamento de grande marca. Com
                  tecnologia e processos, hoje é possível entregá-la a um restaurante de bairro, com a mesma exigência.
                </p>
              </div>
            </div>
          </section>

          {/* 9 · WHO WE ARE */}
          <section className="j-gutter" style={{ paddingBlock: unit(10) }}>
            <div data-reveal className="text-center">
              <Label>Quem somos</Label>
              <h2 className="j-heading mx-auto" style={{ marginTop: unit(1.4), maxWidth: unit(50) }}>
                Dois irmãos. Do Brasil para a Europa.
              </h2>
            </div>
            <div className="mx-auto grid grid-cols-1 sm:grid-cols-2" style={{ marginTop: unit(5), gap: unit(1.5), maxWidth: unit(90) }}>
              {[
                { i: 'T', n: 'Thomas', r: 'Estratégia, site, Google e aquisição' },
                { i: 'R', n: 'Rafael', r: 'Fotografia gastronómica e direção visual' },
              ].map((p) => (
                <div key={p.n} data-reveal className="relative aspect-[4/5] overflow-hidden bg-surface" style={{ borderRadius: unit(2) }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="j-display opacity-10" style={{ fontSize: 'calc(var(--j) * 16)' }}>
                      {p.i}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0" style={{ padding: unit(2) }}>
                    <p className="j-title">{p.n}</p>
                    <p className="j-label opacity-60" style={{ marginTop: unit(0.4) }}>
                      {p.r}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 10 · FAQ */}
          <section className="j-gutter" style={{ paddingBlock: unit(10) }}>
            <div className="mx-auto" style={{ maxWidth: unit(80) }}>
              <Label>Perguntas</Label>
              <ul style={{ marginTop: unit(3) }}>
                {FAQ.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <li key={f.q} className="border-t border-line">
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => {
                          sound.click();
                          setOpenFaq(open ? null : i);
                        }}
                        className="flex w-full items-center justify-between text-left cursor-pointer"
                        style={{ paddingBlock: unit(2), gap: unit(2) }}
                      >
                        <span className="j-title">{f.q}</span>
                        <span
                          className="flex flex-none items-center justify-center rounded-full bg-paper text-ink transition-transform duration-500"
                          style={{ width: unit(2.5), height: unit(2.5), fontSize: unit(1.4), transform: open ? 'rotate(45deg)' : 'none' }}
                          aria-hidden="true"
                        >
                          +
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1, transition: { duration: 0.5, ease: EASE } }}
                            exit={{ height: 0, opacity: 0, transition: { duration: 0.3 } }}
                            className="overflow-hidden"
                          >
                            <p className="j-text opacity-70" style={{ paddingBottom: unit(2), maxWidth: unit(52) }}>
                              {f.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          {/* 11 · CLOSING */}
          <section className="j-gutter" style={{ paddingTop: unit(14), paddingBottom: unit(6) }}>
            <div data-reveal className="flex flex-col items-center text-center">
              <h2 className="j-display" style={{ maxWidth: unit(60) }}>
                Vamos pôr o seu negócio no mapa.
              </h2>
              <p className="j-text opacity-70" style={{ marginTop: unit(2), maxWidth: unit(36) }}>
                Diga-nos o nome do seu negócio. Enviamos o diagnóstico antes de qualquer conversa.
              </p>
              <div style={{ marginTop: unit(3.5) }}>
                <PillAction label="Pedir diagnóstico" onClick={contact} />
              </div>
            </div>
          </section>

          <footer className="flex items-center j-chrome" style={{ gap: unit(1.5) }}>
            <span className="j-label">2026</span>
            <span className="j-label opacity-40">/</span>
            <span className="j-label opacity-50">Áquila, Europe US</span>
            <div className="h-px flex-1 bg-white/25" />
            <TextButton onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}>Topo</TextButton>
          </footer>
        </div>
      </motion.div>

      <AnimatePresence>
        {service && (
          <SheetPopup
            key={service.item.id}
            origin={service.origin}
            onClose={() => setService(null)}
            title={service.item.title}
            description={
              <>
                <p className="opacity-70">{service.item.line}</p>
                <p style={{ marginTop: 'calc(var(--j) * 1)' }}>{service.item.body}</p>
              </>
            }
            tags={service.item.tags}
            media={service.item.media}
            footer={
              <button
                type="button"
                onClick={contact}
                className="j-text inline-flex items-center rounded-full bg-black text-white cursor-pointer transition-transform hover:scale-[1.02]"
                style={{ height: unit(4.5), paddingInline: unit(2) }}
              >
                Pedir diagnóstico
              </button>
            }
          />
        )}
      </AnimatePresence>
    </>
  );
};

/** Draggable divider between "Hoje" and "Ideal"; GSAP also sweeps it on arrival. */
const CompareSlider: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromPointer = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pct = Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100));
    el.style.setProperty('--split', `${pct}%`);
  };

  return (
    <div
      ref={ref}
      data-compare
      data-reveal
      className="relative mx-auto select-none overflow-hidden bg-[#0d0d0d] touch-pan-y cursor-ew-resize"
      style={{ marginTop: unit(5), maxWidth: unit(110), borderRadius: unit(2), ['--split' as string]: '50%' }}
      onPointerDown={(e) => {
        dragging.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setFromPointer(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && setFromPointer(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      onKeyDown={(e) => {
        const el = ref.current;
        if (!el) return;
        const cur = parseFloat(getComputedStyle(el).getPropertyValue('--split')) || 50;
        if (e.key === 'ArrowLeft') el.style.setProperty('--split', `${Math.max(4, cur - 5)}%`);
        if (e.key === 'ArrowRight') el.style.setProperty('--split', `${Math.min(96, cur + 5)}%`);
      }}
      tabIndex={0}
      role="slider"
      aria-label="Comparar hoje e ideal"
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Ideal (full) */}
      <div className="relative">
        <MockPresence tone="ideal" />
      </div>
      {/* Today (clipped on the left) */}
      <div className="absolute inset-0 bg-[#1a1918]" style={{ clipPath: 'inset(0 calc(100% - var(--split)) 0 0)' }}>
        <MockPresence tone="today" />
      </div>
      {/* Divider */}
      <div className="pointer-events-none absolute inset-y-0" style={{ left: 'var(--split)' }}>
        <div className="absolute inset-y-0 -translate-x-1/2 w-px bg-white" />
        <div
          className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black j-label"
          style={{ width: unit(5), height: unit(5) }}
        >
          ⟷
        </div>
      </div>
      <span className="pointer-events-none absolute j-label rounded-full bg-black/70" style={{ left: unit(1.4), top: unit(1.4), padding: `${unit(0.5)} ${unit(1)}` }}>
        Hoje
      </span>
      <span className="pointer-events-none absolute j-label rounded-full bg-white text-black" style={{ right: unit(1.4), top: unit(1.4), padding: `${unit(0.5)} ${unit(1)}` }}>
        Ideal
      </span>
    </div>
  );
};
