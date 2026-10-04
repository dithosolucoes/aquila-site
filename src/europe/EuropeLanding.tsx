import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AquilaNav, NavigationTab } from '../components/aquila/AquilaNav';
import { OriginRect, rectFrom } from '../components/ui/ExpandPopup';
import { SheetMedia, SheetPopup } from '../components/ui/SheetPopup';
import { Label, PillAction, TextButton, unit } from '../ds';
import { sound } from '../utils/audio';
import { emailHref, whatsappHref } from '../config/contact';
import {
  FoodTile,
  MockAds,
  MockGoogle,
  MockIdentity,
  MockPhoto,
  MockPresence,
  MockReport,
  MockSite,
  MockSocial,
  MockWhatsApp,
} from './Mocks';

gsap.registerPlugin(ScrollTrigger);

/**
 * Europe US landing (PT-PT), revealed over the landed map. Five acts:
 * I   O problema   – manifesto, isolated pieces → one system, the restaurant, why it happens
 * II  A equipa     – image + technology in one team, the cinema kit
 * III O ideal      – every business has an ideal; the pieces it demands
 * IV  O caminho    – how it works, continuity, why it's possible
 * V   Conversa     – questions, closing
 * Payment, guarantees, capacity and plans are left for the call.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

const ACTS = ['O problema', 'A equipa', 'O ideal', 'O caminho', 'Conversa'];
const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

const MANIFESTO =
  'O seu negócio não é vivido em peças. O cliente encontra-o no Google, vê as fotografias, abre o Instagram, visita o site e envia uma mensagem. Cada peça pode estar bem feita e, mesmo assim, o conjunto falhar.';

// In the order the customer meets them
const PIECES = [
  { id: 'ads', label: 'Anúncios', sub: 'Chegar a mais gente' },
  { id: 'google', label: 'Google', sub: 'Ser encontrado' },
  { id: 'foto', label: 'Fotografia', sub: 'Primeira impressão' },
  { id: 'reviews', label: 'Avaliações', sub: 'Confiança' },
  { id: 'insta', label: 'Instagram', sub: 'Personalidade' },
  { id: 'site', label: 'Site', sub: 'Compreender' },
  { id: 'whats', label: 'WhatsApp', sub: 'Contacto' },
];

// Scattered (isolated) positions, in % of the stage
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

const PAIRS = [
  ['Anúncios bem feitos, com fotografias fracas,', 'só levam mais gente a uma má primeira impressão.'],
  ['Conteúdo bonito, sem alcance,', 'é uma obra-prima que ninguém vê.'],
  ['Um site perfeito, sem Google,', 'é uma porta numa rua sem nome.'],
];

const BIG_IDEA_PIECES = 'peças.';

const HANDOVER = [
  {
    n: '01',
    t: 'Entrega completa',
    d: 'Tudo construído, ligado e publicado. As contas, o domínio e os acessos ficam em seu nome.',
    tag: 'Incluído',
  },
  {
    n: '02',
    t: 'Guia e suporte',
    d: 'Um guia simples para manter tudo em dia e o nosso acompanhamento nas semanas seguintes à entrega.',
    tag: 'Incluído',
  },
  {
    n: '03',
    t: 'Se quiser, continuamos',
    d: 'Podemos cuidar de tudo todos os meses, à distância. É uma opção, sem fidelização.',
    tag: 'Opcional',
  },
];

const VENDORS =['Fotógrafo', 'Web designer', 'SEO', 'Redes sociais', 'Anúncios'];

const SPECS = [
  { k: 'Câmara', v: 'Sony FX2', d: 'Qualidade cinematográfica em cada frame' },
  { k: 'Lente', v: 'Sigma 24–70 mm f/2.8', d: 'Do detalhe do prato à sala inteira' },
  { k: 'Luz', v: 'Kit profissional', d: 'A mesma luz, de manhã ou à noite' },
  { k: 'Aprovação', v: 'iPad Pro', d: 'Vê e aprova cada imagem na hora' },
];

const IDEAL_CHECKS = ['Perfil do Google', 'Fotografias', 'Site', 'Avaliações', 'WhatsApp'];

type Side = 'Imagem' | 'Tecnologia' | 'Os dois';

interface Sheet {
  id: string;
  title: string;
  eyebrow?: string;
  lead?: React.ReactNode;
  description: React.ReactNode;
  tags: string[];
  media: SheetMedia[];
}

interface Arm {
  id: string;
  title: string;
  side: Side;
  line: string;
  body: string;
  have: string;
  tags: string[];
  media: SheetMedia[];
}

const ARMS: Arm[] = [
  {
    id: 'foto',
    title: 'Fotografia e vídeo',
    side: 'Imagem',
    line: 'A primeira impressão, em todo o lado.',
    body: 'Sessão no seu espaço, com equipamento de cinema: pratos, sala, equipa e detalhes. Cada imagem pensada para o Google, o site, o Instagram e os anúncios, e vídeos verticais prontos a publicar.',
    have: 'As boas entram no conjunto. A sessão cobre o que falta.',
    tags: ['Sessão no local', 'Vídeo vertical', 'Edição'],
    media: [
      { node: <FoodTile seed={0} width={1600} className="h-full w-full" />, bleed: true, caption: 'Pratos com luz, textura e cor reais' },
      { node: <FoodTile seed={5} width={1600} className="h-full w-full" />, bleed: true, caption: 'Uma imagem pensada para cada canal' },
      { node: <MockSocial tone="ideal" />, caption: 'O banco de imagens a alimentar o Instagram' },
    ],
  },
  {
    id: 'id',
    title: 'Identidade visual',
    side: 'Imagem',
    line: 'Ser reconhecido à primeira vista.',
    body: 'Cores, tipografia e aplicações afinadas para que o menu, o site, as redes e o espaço pareçam do mesmo sítio.',
    have: 'Se a marca já é forte, respeitamo-la e aplicamo-la em tudo.',
    tags: ['Cores', 'Tipografia', 'Aplicações'],
    media: [{ node: <MockIdentity />, caption: 'Guia visual: tipografia, cores e aplicações' }],
  },
  {
    id: 'site',
    title: 'Site',
    side: 'Tecnologia',
    line: 'Onde o interesse vira decisão.',
    body: 'Menu, fotografias, localização, horários e um caminho direto para reservar ou falar consigo. Rápido no telemóvel e em várias línguas.',
    have: 'Se já está no ideal, fica e passa a trabalhar com o resto. Se não está, ajustamos.',
    tags: ['Design', 'Várias línguas', 'Telemóvel'],
    media: [
      { node: <MockSite tone="ideal" />, caption: 'Ideal: menu, fotografias e reserva num toque' },
      { node: <MockSite tone="today" />, caption: 'Hoje: um site que ninguém atualiza' },
    ],
  },
  {
    id: 'google',
    title: 'Google e SEO local',
    side: 'Tecnologia',
    line: 'Aparecer quando procuram perto.',
    body: 'Perfil completo e coerente com o site: categorias certas, horários, menu, fotografias novas e uma estratégia de avaliações.',
    have: 'Completamos o que falta e ligamo-lo a tudo o resto.',
    tags: ['Perfil do Google', 'SEO local', 'Avaliações'],
    media: [
      { node: <MockGoogle tone="ideal" />, caption: 'Ideal: perfil completo, fotografias novas, avaliações respondidas' },
      { node: <MockGoogle tone="today" />, caption: 'Hoje: horário em falta e poucas avaliações' },
    ],
  },
  {
    id: 'insta',
    title: 'Instagram',
    side: 'Os dois',
    line: 'Uma montra com a mesma história.',
    body: 'Bio, destaques, capas, um banco de fotografias editadas e modelos de publicação prontos, feitos com as imagens da sessão.',
    have: 'Organizamos o que existe para contar a mesma história que o resto.',
    tags: ['Perfil', 'Destaques', 'Modelos'],
    media: [
      { node: <MockSocial tone="ideal" />, caption: 'Ideal: uma montra coerente com o resto' },
      { node: <MockSocial tone="today" />, caption: 'Hoje: publicações sem fio condutor' },
    ],
  },
  {
    id: 'whats',
    title: 'WhatsApp',
    side: 'Tecnologia',
    line: 'Nenhum pedido perdido.',
    body: 'Perfil, catálogo, mensagens automáticas e etiquetas para organizar pedidos e reservas. O contacto deixa de depender de alguém ver a mensagem a tempo.',
    have: 'Configuramos o número que já usa. Nada muda para os seus clientes.',
    tags: ['WhatsApp Business', 'Automação', 'Reservas'],
    media: [{ node: <MockWhatsApp />, caption: 'Uma reserva feita em menos de um minuto' }],
  },
  {
    id: 'medir',
    title: 'Medição',
    side: 'Tecnologia',
    line: 'Saber o que funciona.',
    body: 'Google Analytics, Search Console e contagem de cliques no WhatsApp, resumidos num relatório simples, numa só página.',
    have: 'Ligamos o que já mede e acrescentamos o que falta.',
    tags: ['Analytics', 'Search Console', 'Relatório'],
    media: [{ node: <MockReport />, caption: 'O relatório: uma página, três próximas ações' }],
  },
  {
    id: 'ads',
    title: 'Anúncios',
    side: 'Os dois',
    line: 'Pronto para chegar a mais gente.',
    body: 'Contas, pixel e públicos configurados, com as imagens certas à espera. Quando quiser crescer, é só ligar.',
    have: 'Revemos as contas e deixamo-las prontas a usar.',
    tags: ['Google Ads', 'Meta Ads', 'Públicos'],
    media: [
      { node: <MockAds />, caption: 'Campanhas prontas a ligar' },
      { node: <FoodTile seed={1} width={1600} className="h-full w-full" />, bleed: true, caption: 'As imagens da sessão, prontas para anunciar' },
    ],
  },
];

const STEPS: { n: string; t: string; side: Side; d: string }[] = [
  { n: '01', t: 'Diagnóstico', side: 'Tecnologia', d: 'Olhamos para tudo o que existe e comparamos com o ideal. Os primeiros ajustes começam logo.' },
  { n: '02', t: 'Preparação', side: 'Tecnologia', d: 'Site, Google e estrutura ficam prontos antes de chegarmos.' },
  { n: '03', t: 'A sessão', side: 'Imagem', d: 'Algumas horas no seu espaço, com equipamento de cinema. Pratos, sala e equipa.' },
  { n: '04', t: 'Entrega', side: 'Os dois', d: 'Tudo publicado, ligado e explicado. As contas ficam sempre em seu nome.' },
  { n: '05', t: 'Suporte', side: 'Os dois', d: 'Um guia simples para manter tudo em dia e o nosso suporte nas semanas seguintes.' },
];

const TEAM = [
  {
    id: 'raphael',
    name: 'Raphael',
    side: 'Imagem',
    role: 'Fotografia e vídeo gastronómico, direção visual.',
    bio: 'Fotógrafo e videomaker gastronómico. Planeia cada sessão com uma lista de imagens pensada para o Google, o site, as redes e os anúncios, trabalha com equipamento de cinema e aprova cada imagem consigo, na hora.',
    tags: ['Fotografia', 'Vídeo', 'Direção visual'],
    media: [
      { node: <FoodTile seed={0} width={1600} className="h-full w-full" />, bleed: true, caption: 'Portfólio completo em breve' },
      { node: <FoodTile seed={6} width={1600} className="h-full w-full" />, bleed: true },
      { node: <FoodTile seed={1} width={1600} className="h-full w-full" />, bleed: true },
    ],
  },
  {
    id: 'thomas',
    name: 'Thomas',
    side: 'Tecnologia',
    role: 'Site, Google, anúncios e sistemas.',
    bio: 'Tecnologia e marketing. Constrói o site, o perfil do Google, o SEO, o WhatsApp, a medição e a estrutura de anúncios, e liga tudo para funcionar como um só.',
    tags: ['Site', 'Google', 'Anúncios', 'Sistemas'],
    media: [
      { node: <MockSite tone="ideal" />, caption: 'Sites rápidos, feitos para o telemóvel' },
      { node: <MockGoogle tone="ideal" />, caption: 'Google e SEO local' },
      { node: <MockReport />, caption: 'Medição e relatório' },
    ],
  },
];

const FAQ = [
  { q: 'Já tenho site. Faz sentido?', a: 'Sim. Se estiver no ideal, fica e passa a trabalhar com o resto. Se não estiver, ajustamos.' },
  { q: 'Preciso de fazer alguma coisa?', a: 'Quase nada: dar-nos os acessos e receber-nos no dia da sessão. O resto é connosco.' },
  {
    q: 'Vocês estão em Portugal?',
    a: 'Estaremos em Lisboa para as sessões. O resto é feito pela nossa equipa, à distância, com o mesmo acompanhamento.',
  },
  {
    q: 'E depois da entrega?',
    a: 'Fica tudo seu, com um guia simples para manter e o nosso suporte nas semanas seguintes. Se preferir, também podemos continuar a cuidar de tudo consigo.',
  },
  { q: 'Tenho de continuar convosco?', a: 'Não. A entrega vale por si: fica tudo pronto e em seu nome. Continuar é uma opção.' },
  { q: 'As contas ficam em nome de quem?', a: 'Sempre no seu: domínio, Google, redes e medição.' },
  { q: 'Em que línguas trabalham?', a: 'Português e inglês.' },
  { q: 'Como começamos?', a: 'Com um diagnóstico do seu negócio, sem compromisso.' },
];

interface EuropeLandingProps {
  cityName: string;
  onNavigate: (tab: NavigationTab) => void;
  onOpenAbout: (origin: OriginRect) => void;
  onOpenContact: (origin: OriginRect) => void;
  /** 0..1 over the first screen, so the map behind can recede. */
  onHeroProgress: (p: number) => void;
  /** Plays the flight again. */
  onReplayFlight?: () => void;
}

export const EuropeLanding: React.FC<EuropeLandingProps> = ({
  cityName,
  onNavigate,
  onOpenAbout,
  onOpenContact,
  onHeroProgress,
  onReplayFlight,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [sheet, setSheet] = useState<{ item: Sheet; origin: OriginRect } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [act, setAct] = useState(-1);
  const [closingInView, setClosingInView] = useState(false);
  const [paper, setPaper] = useState(false);
  // The choreography differs between phone and desktop: rebuild it when the breakpoint flips
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const wa = whatsappHref();

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => setDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const contactFrom = (el: Element) => onOpenContact(rectFrom(el, 999));
  const contact = (e: React.MouseEvent<HTMLElement>) => contactFrom(e.currentTarget);

  const openSheet = (item: Sheet, el: HTMLElement) => setSheet({ item, origin: rectFrom(el, 20) });

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

      if (!reduce) animate();

      // Created after the pins so their positions include the pin spacing.
      // Light: the whole page turns to paper while an editorial zone holds the middle of the screen.
      const paperZones = new Set<number>();
      gsap.utils.toArray<HTMLElement>('[data-light="paper"]').forEach((el, i) => {
        ScrollTrigger.create({
          ...st,
          trigger: el,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => {
            if (self.isActive) paperZones.add(i);
            else paperZones.delete(i);
            setPaper(paperZones.size > 0);
          },
        });
      });
      // Reading progress (phones) and the current act (rail + floating CTA).
      ScrollTrigger.create({
        ...st,
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          if (progressRef.current) progressRef.current.style.transform = `scaleX(${self.progress})`;
        },
      });
      ScrollTrigger.create({ ...st, trigger: '[data-hero]', start: 'top top', end: 'bottom 55%', onEnterBack: () => setAct(-1) });
      gsap.utils.toArray<HTMLElement>('[data-act]').forEach((el) => {
        const i = Number(el.dataset.act);
        ScrollTrigger.create({
          ...st,
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onEnter: () => setAct(i),
          onEnterBack: () => setAct(i),
        });
      });
      ScrollTrigger.create({
        ...st,
        trigger: '[data-closing]',
        start: 'top 85%',
        onEnter: () => setClosingInView(true),
        onLeaveBack: () => setClosingInView(false),
      });
    }, scroller);

    function animate() {
      if (!scroller) return;
      const st = { scroller } as const;

      // Hero content lifts and fades
      gsap.to('[data-hero-inner]', {
        yPercent: -25,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { ...st, trigger: '[data-hero]', start: 'top top', end: 'bottom 20%', scrub: true },
      });

      // Big idea: the letters of "peças" arrive scattered and snap together, then "o conjunto" lands
      const scatter = (i: number) => ({ x: (((i * 37 + 5) % 11) - 5) * 14, y: ((i * 53) % 9 - 4) * 16, r: ((i * 29) % 13 - 6) * 9 });
      gsap.fromTo(
        '[data-bigidea] .ch',
        {
          x: (i: number) => scatter(i).x,
          y: (i: number) => scatter(i).y,
          rotation: (i: number) => scatter(i).r,
          opacity: 0.25,
        },
        {
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: { ...st, trigger: '[data-bigidea]', start: 'top 85%', end: 'top 35%', scrub: true },
        }
      );
      gsap.fromTo(
        '[data-bigidea-b]',
        { opacity: 0, y: 30, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          ease: 'none',
          scrollTrigger: { ...st, trigger: '[data-bigidea]', start: 'top 45%', end: 'top 20%', scrub: true },
        }
      );

      // Manifesto: word-by-word light
      gsap.fromTo(
        '[data-manifesto] .w',
        { opacity: 0.15 },
        {
          opacity: 1,
          stagger: 0.06,
          ease: 'none',
          scrollTrigger: { ...st, trigger: '[data-manifesto]', start: 'top 85%', end: 'bottom 55%', scrub: true },
        }
      );

      // Pieces → system (pinned): they line up in the order the customer meets them
      const mobile = !desktop;
      const aligned = PIECES.map((_, i) =>
        mobile ? { x: 50, y: 30 + i * 9.6 } : { x: 8 + i * (84 / (PIECES.length - 1)), y: 56 }
      );
      gsap.set('[data-piece]', {
        left: (i: number) => `${mobile ? 18 + SCATTER[i].x * 0.64 : SCATTER[i].x}%`,
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
        .fromTo('[data-path-label]', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.85)
        .fromTo('[data-piece-n]', { opacity: 0 }, { opacity: 0.5, duration: 0.3 }, 0.85)
        .to('[data-piece]', { backgroundColor: 'rgba(255,255,255,1)', color: '#000', duration: 0.3, stagger: 0.03 }, 0.85);

      // Restaurant: line by line
      gsap.utils.toArray<HTMLElement>('[data-analogy] [data-line]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0.1, x: -20 },
          { opacity: 1, x: 0, ease: 'none', scrollTrigger: { ...st, trigger: el, start: 'top 80%', end: 'top 50%', scrub: true } }
        );
      });

      // Pairs: each half drifts in from its side and meets the other
      gsap.utils.toArray<HTMLElement>('[data-pair]').forEach((row) => {
        const d = mobile ? 0 : 1;
        gsap.fromTo(
          row.querySelector('[data-half="a"]'),
          { opacity: 0.08, x: -60 * d, y: 20 * (1 - d) },
          { opacity: 1, x: 0, y: 0, ease: 'none', scrollTrigger: { ...st, trigger: row, start: 'top 85%', end: 'top 50%', scrub: true } }
        );
        gsap.fromTo(
          row.querySelector('[data-half="b"]'),
          { opacity: 0, x: 60 * d, y: 20 * (1 - d) },
          { opacity: 0.6, x: 0, y: 0, ease: 'none', scrollTrigger: { ...st, trigger: row, start: 'top 75%', end: 'top 42%', scrub: true } }
        );
        gsap.fromTo(
          row.querySelector('[data-seam]'),
          { scaleY: 0 },
          { scaleY: 1, ease: 'none', scrollTrigger: { ...st, trigger: row, start: 'top 75%', end: 'top 45%', scrub: true } }
        );
      });

      // Five specialists converge into one team
      const circles = scroller.querySelector<HTMLElement>('[data-vendors]');
      if (circles) {
        const center = () => circles.offsetWidth / 2;
        const vtl = gsap.timeline({
          scrollTrigger: { ...st, trigger: '[data-why]', start: 'top 55%', end: 'center 40%', scrub: true, invalidateOnRefresh: true },
        });
        vtl
          .to('[data-vendor]', {
            x: (_: number, el: HTMLElement) => center() - (el.offsetLeft + el.offsetWidth / 2),
            scale: 0.6,
            opacity: 0,
            ease: 'power2.inOut',
            stagger: 0.03,
            duration: 1,
          })
          .fromTo('[data-aquila-dot]', { scale: 0, opacity: 0 }, { scale: 1.15, opacity: 1, ease: 'back.out(1.6)', duration: 0.5 }, 0.6)
          .fromTo('[data-vendors-caption]', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.8);
      }

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

      // Handover: the solid line runs through what's included, then turns dashed into the option
      gsap.fromTo(
        '[data-handover-line]',
        { scaleX: 0 },
        { scaleX: 1, ease: 'none', scrollTrigger: { ...st, trigger: '[data-handover]', start: 'top 75%', end: 'top 35%', scrub: true } }
      );

      // Spec sheet rows draw their hairlines
      gsap.utils.toArray<HTMLElement>('[data-spec]').forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay: i * 0.08,
            ease: 'expo.out',
            scrollTrigger: { ...st, trigger: '[data-specs]', start: 'top 80%', toggleActions: 'play none none reverse' },
          }
        );
      });

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
    }

    // Fonts/layout settle → recompute pins
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', setVh);
      ctx.revert();
      setPaper(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desktop]);

  const showFloatingCta = act >= 0 && !closingInView && !sheet;

  return (
    <>
      <motion.div
        ref={scrollRef}
        className={`theme-switch absolute inset-0 overflow-y-auto overflow-x-hidden text-paper ${paper ? 'is-paper' : ''}`}
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

        {/* Reading progress (phones) */}
        <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] md:hidden">
          <div ref={progressRef} className="h-full origin-left bg-champagne" style={{ transform: 'scaleX(0)' }} />
        </div>

        {/* Act rail (desktop) */}
        <ActRail act={act} />

        {/* ───────────── HERO ───────────── */}
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
              <Label key="k">Áquila · {cityName}</Label>,
              <h1 key="h" className="j-display" style={{ marginTop: unit(2), maxWidth: unit(70) }}>
                A Áquila está a chegar a <em>{cityName}.</em>
              </h1>,
              <p key="p" className="j-text opacity-80" style={{ marginTop: unit(2.4), maxWidth: unit(40) }}>
                Fotografia, vídeo, site, Google e anúncios, feitos por uma só equipa para funcionarem juntos.
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
            <p className="j-mono opacity-50 text-left">
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
          {/* ═════════════ ACT I · O PROBLEMA ═════════════ */}
          <div data-act="0">
            {/* The big idea, then the manifesto that explains it */}
            <section className="j-gutter flex flex-col items-center text-center" style={{ paddingTop: unit(16), paddingBottom: unit(12) }}>
              <Label>A ideia</Label>
              <h2 data-bigidea className="j-display" style={{ marginTop: unit(2.4), maxWidth: unit(90), fontSize: 'min(calc(var(--j) * 7), 13vw)' }}>
                <span className="block">
                  Não fazemos{' '}
                  <span className="inline-block whitespace-nowrap" aria-label={BIG_IDEA_PIECES}>
                    {BIG_IDEA_PIECES.split('').map((c, i) => (
                      <span key={i} aria-hidden="true" className="ch inline-block">
                        {c}
                      </span>
                    ))}
                  </span>
                </span>
                <span data-bigidea-b className="block">
                  Fazemos o <em>conjunto.</em>
                </span>
              </h2>
              <div className="bg-line" style={{ width: 1, height: unit(8), marginTop: unit(6) }} />
              <p data-manifesto className="j-title" style={{ marginTop: unit(6), maxWidth: unit(66), fontSize: 'calc(var(--j) * 2.2)' }}>
                {MANIFESTO.split(' ').map((w, i) => (
                  <span key={i} className="w inline-block" style={{ marginRight: '0.28em' }}>
                    {w}
                  </span>
                ))}
              </p>
            </section>

            {/* Pieces → system (pinned) */}
            <section data-pieces className="relative h-[var(--vh,100dvh)] overflow-hidden">
              <div className="absolute inset-x-0 top-0 z-10 text-center j-gutter" style={{ paddingTop: unit(12) }}>
                <Label>O problema</Label>
                <div className="relative" style={{ marginTop: unit(1.2), minHeight: unit(9) }}>
                  <div data-pieces-a className="absolute inset-x-0">
                    <p className="j-heading">
                      Peças <em>isoladas.</em>
                    </p>
                    <p className="j-text opacity-70 mx-auto" style={{ marginTop: unit(1), maxWidth: unit(44) }}>
                      Uma agência para os anúncios. Outra para o site. Um fotógrafo. Alguém para o Instagram. E o dono a tentar
                      ligar tudo.
                    </p>
                  </div>
                  <div data-pieces-b className="absolute inset-x-0" style={{ opacity: 0 }}>
                    <p className="j-heading">
                      Um <em>sistema.</em>
                    </p>
                    <p className="j-text opacity-70 mx-auto" style={{ marginTop: unit(1), maxWidth: unit(44) }}>
                      Cada peça alimenta a seguinte. A fotografia serve o Google, o site e os anúncios. O cliente sente uma marca
                      só.
                    </p>
                    <p className="j-label text-champagne" style={{ marginTop: unit(1.2) }}>
                      Visto de cima, como a águia vê
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0" style={{ top: unit(10) }}>
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
                <p
                  data-path-label
                  className="absolute j-label text-champagne"
                  style={desktop ? { left: '8%', top: 'calc(56% - var(--j) * 6)', opacity: 0 } : { left: '50%', top: 'calc(30% - var(--j) * 5)', transform: 'translateX(-50%)', opacity: 0 }}
                >
                  O caminho do seu cliente →
                </p>
                {PIECES.map((p, i) => (
                  <div
                    key={p.id}
                    data-piece
                    className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-start rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-sm"
                    style={{ paddingInline: unit(1.6), paddingBlock: unit(0.9) }}
                  >
                    <span className="flex items-baseline" style={{ gap: unit(0.6) }}>
                      <span data-piece-n className="j-mono" style={{ opacity: 0 }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="j-title whitespace-nowrap" style={{ fontSize: 'calc(var(--j) * 1.5)' }}>
                        {p.label}
                      </span>
                    </span>
                    <span className="j-label opacity-60 whitespace-nowrap">{p.sub}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* The restaurant + the digital pairs */}
            <section data-analogy className="j-gutter" style={{ paddingBlock: unit(16) }}>
              <div className="mx-auto" style={{ maxWidth: unit(84) }}>
                <Label>Pense num restaurante</Label>
                <div className="flex flex-col" style={{ marginTop: unit(3), gap: unit(2.4) }}>
                  {ANALOGY.map((line, i) => (
                    <p key={i} data-line className="j-heading">
                      {line}
                    </p>
                  ))}
                  <p data-line className="j-heading text-champagne" style={{ marginTop: unit(2) }}>
                    Na presença digital é <em>igual.</em>
                  </p>
                </div>

                <div className="flex flex-col" style={{ marginTop: unit(8) }}>
                  {PAIRS.map(([a, b]) => (
                    <div
                      key={a}
                      data-pair
                      className="relative grid grid-cols-1 border-t border-line md:grid-cols-2"
                      style={{ paddingBlock: unit(3), columnGap: unit(6), rowGap: unit(0.8) }}
                    >
                      <p data-half="a" className="j-title" style={{ fontSize: 'calc(var(--j) * 2.2)' }}>
                        {a}
                      </p>
                      <p data-half="b" className="j-title opacity-60" style={{ fontSize: 'calc(var(--j) * 2.2)' }}>
                        <em>{b}</em>
                      </p>
                      <span
                        data-seam
                        aria-hidden="true"
                        className="absolute hidden w-px origin-top bg-champagne/60 md:block"
                        style={{ left: '50%', top: unit(3), bottom: unit(3) }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Why it happens: specialists converge into one team */}
            <section data-why className="j-gutter" style={{ paddingBlock: unit(12) }}>
              <div className="grid grid-cols-1 items-center md:grid-cols-2" style={{ gap: unit(6) }}>
                <div data-reveal>
                  <Label>Porque acontece</Label>
                  <h2 className="j-heading" style={{ marginTop: unit(1.4) }}>
                    Não é falta de <em>talento.</em>
                  </h2>
                  <p className="j-text opacity-70" style={{ marginTop: unit(1.6), maxWidth: unit(42) }}>
                    O mercado organizou-se em especialistas. De um lado, quem cria a imagem. Do outro, quem a faz chegar às pessoas.
                    Cada um faz bem a sua parte. Mas ninguém responde pelo conjunto.
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center" style={{ minHeight: unit(28) }}>
                  <div data-vendors className="relative flex items-center justify-center">
                    {VENDORS.map((v, i) => (
                      <div
                        key={v}
                        data-vendor
                        className="flex flex-none items-center justify-center rounded-full border border-white/30 text-center"
                        style={{
                          width: 'min(calc(var(--j) * 9), 16vw)',
                          height: 'min(calc(var(--j) * 9), 16vw)',
                          marginLeft: i === 0 ? 0 : 'min(calc(var(--j) * 0.8), 1.4vw)',
                        }}
                      >
                        <span className="j-label" style={{ paddingInline: unit(0.6) }}>
                          {v}
                        </span>
                      </div>
                    ))}
                    <div
                      data-aquila-dot
                      className="absolute left-1/2 top-1/2 z-20 flex items-center justify-center rounded-full bg-paper text-ink"
                      style={{
                        width: 'min(calc(var(--j) * 12), 24vw)',
                        height: 'min(calc(var(--j) * 12), 24vw)',
                        marginLeft: 'calc(min(calc(var(--j) * 12), 24vw) / -2)',
                        marginTop: 'calc(min(calc(var(--j) * 12), 24vw) / -2)',
                        transform: 'scale(0)',
                        opacity: 0,
                      }}
                    >
                      <span className="j-title">
                        <em>Áquila</em>
                      </span>
                    </div>
                  </div>
                  <p data-vendors-caption className="j-label opacity-50" style={{ marginTop: unit(4), opacity: 0 }}>
                    Cinco especialistas, uma equipa
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* ═════════════ ACT II · A EQUIPA ═════════════ */}
          <div data-act="1" data-light="paper">
            <section className="j-gutter" style={{ paddingBlock: unit(12) }}>
              <div data-reveal className="text-center">
                <Label>Quem somos</Label>
                <h2 className="j-heading mx-auto" style={{ marginTop: unit(1.4), maxWidth: unit(56) }}>
                  Imagem e tecnologia. Na mesma <em>equipa.</em>
                </h2>
                <p className="j-text opacity-70 mx-auto" style={{ marginTop: unit(1.6), maxWidth: unit(44) }}>
                  Uma metade cria a imagem. A outra fá-la chegar às pessoas. Juntas, fazem o conjunto.
                </p>
              </div>
              <div className="mx-auto grid grid-cols-1 sm:grid-cols-2" style={{ marginTop: unit(5), gap: unit(1.5), maxWidth: unit(96) }}>
                {TEAM.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    data-reveal
                    onPointerEnter={() => sound.hover()}
                    onClick={(e) =>
                      openSheet(
                        {
                          id: p.id,
                          title: p.name,
                          eyebrow: p.side,
                          lead: p.role,
                          description: <p>{p.bio}</p>,
                          tags: p.tags,
                          media: p.media,
                        },
                        e.currentTarget
                      )
                    }
                    style={{ borderRadius: unit(2), visibility: sheet?.item.id === p.id ? 'hidden' : 'visible' }}
                    className="theme-ink group relative block aspect-[4/5] overflow-hidden bg-surface text-left cursor-pointer"
                  >
                    <FoodTile
                      seed={i * 3 + 1}
                      room={p.id === 'thomas'}
                      className="absolute inset-0 opacity-50 transition-all duration-[1.2s] ease-[var(--ease-content)] group-hover:scale-105 group-hover:opacity-75"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <span className="absolute j-label rounded-full bg-black/50" style={{ top: unit(1.6), left: unit(1.6), padding: `${unit(0.5)} ${unit(1)}` }}>
                      {p.side}
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="j-display opacity-10" style={{ fontSize: 'calc(var(--j) * 16)' }}>
                        {p.name[0]}
                      </span>
                    </span>
                    <span className="absolute flex items-end justify-between" style={{ bottom: unit(2), left: unit(2), right: unit(1.6), gap: unit(1) }}>
                      <span>
                        <span className="j-heading block">{p.name}</span>
                        <span className="j-text block opacity-70" style={{ marginTop: unit(0.4) }}>
                          {p.role}
                        </span>
                      </span>
                      <PlusDot />
                    </span>
                  </button>
                ))}
              </div>
              <p data-reveal className="j-text opacity-70 mx-auto text-center" style={{ marginTop: unit(4), maxWidth: unit(46) }}>
                Fazemos isto no Brasil há vários anos, com restaurantes, cafés e padarias. Agora, também em Portugal.
              </p>
            </section>

            {/* The kit */}
            <section className="j-gutter" style={{ paddingBlock: unit(12) }}>
              <div className="grid grid-cols-1 items-center lg:grid-cols-[1.1fr_1fr]" style={{ gap: unit(6) }}>
                <div data-reveal className="relative">
                  <LensVisual />
                </div>
                <div>
                  <div data-reveal>
                    <Label>No seu espaço</Label>
                    <h2 className="j-heading" style={{ marginTop: unit(1.4) }}>
                      Equipamento de <em>cinema.</em>
                    </h2>
                    <p className="j-text opacity-70" style={{ marginTop: unit(1.6), maxWidth: unit(38) }}>
                      A qualidade de um anúncio de televisão, feita na sua sala, com os seus pratos.
                    </p>
                  </div>
                  <dl data-specs style={{ marginTop: unit(4) }}>
                    {SPECS.map((s) => (
                      <div
                        key={s.k}
                        data-spec
                        className="group grid grid-cols-[minmax(0,0.7fr)_minmax(0,1.6fr)] items-baseline border-t border-line transition-colors duration-300 hover:border-white/60"
                        style={{ paddingBlock: unit(1.6), columnGap: unit(2) }}
                      >
                        <dt className="j-label opacity-50 transition-opacity group-hover:opacity-100">{s.k}</dt>
                        <dd>
                          <p className="j-title">{s.v}</p>
                          <p className="j-text opacity-60" style={{ marginTop: unit(0.2) }}>
                            {s.d}
                          </p>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </section>
          </div>

          {/* ═════════════ ACT III · O IDEAL ═════════════ */}
          <div data-act="2" data-light="paper">
            <section className="j-gutter" style={{ paddingBlock: unit(12) }}>
              <div data-reveal className="mx-auto text-center" style={{ maxWidth: unit(62) }}>
                <Label>O diagnóstico</Label>
                <h2 className="j-heading" style={{ marginTop: unit(1.4) }}>
                  Para cada negócio, existe um <em>ideal.</em>
                </h2>
                <p className="j-text opacity-70 mx-auto" style={{ marginTop: unit(1.6), maxWidth: unit(48) }}>
                  Como deve aparecer no Google. Que fotografias deve ter. O que o site deve responder. Quão depressa responde a uma
                  mensagem. Olhamos para como está hoje, comparamos com o ideal e completamos o que falta. O que já está bem, fica.
                </p>
              </div>
              <IdealCompare />
              <p className="j-label opacity-40 text-center" style={{ marginTop: unit(1.4) }}>
                Exemplo ilustrativo de um restaurante fictício. Arraste para comparar.
              </p>
            </section>

            {/* The pieces the ideal demands */}
            <section className="j-gutter" style={{ paddingBlock: unit(10) }}>
              <div data-reveal className="flex flex-col md:flex-row md:items-end md:justify-between" style={{ gap: unit(2) }}>
                <div>
                  <Label>As peças</Label>
                  <h2 className="j-heading" style={{ marginTop: unit(1.4), maxWidth: unit(44) }}>
                    Tudo o que o ideal <em>exige.</em>
                  </h2>
                </div>
                <p className="j-text opacity-60" style={{ maxWidth: unit(30) }}>
                  Toque numa peça para ver o que inclui.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ marginTop: unit(5), gap: unit(1.5) }}>
                {ARMS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    data-reveal
                    onClick={(e) =>
                      openSheet(
                        {
                          id: s.id,
                          title: s.title,
                          eyebrow: `${String(i + 1).padStart(2, '0')} · ${s.side}`,
                          lead: s.line,
                          description: (
                            <>
                              <p>{s.body}</p>
                              <div className="border-t border-black/10" style={{ marginTop: unit(2), paddingTop: unit(1.2) }}>
                                <p className="j-label text-black/45">Já tem?</p>
                                <p style={{ marginTop: unit(0.4) }}>{s.have}</p>
                              </div>
                            </>
                          ),
                          tags: s.tags,
                          media: s.media,
                        },
                        e.currentTarget
                      )
                    }
                    onPointerEnter={() => sound.hover()}
                    style={{ borderRadius: unit(2), visibility: sheet?.item.id === s.id ? 'hidden' : 'visible' }}
                    className="theme-ink group relative block aspect-[4/3] overflow-hidden bg-surface text-left cursor-pointer lg:aspect-[4/5]"
                  >
                    <FoodTile
                      seed={i}
                      className="absolute inset-0 opacity-55 transition-all duration-[1.2s] ease-[var(--ease-content)] group-hover:scale-105 group-hover:opacity-85"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <span className="absolute flex items-start justify-between" style={{ top: unit(1.6), left: unit(1.8), right: unit(1.6), gap: unit(1) }}>
                      <span className="j-mono opacity-50">{String(i + 1).padStart(2, '0')}</span>
                      <span className="j-label rounded-full bg-black/50" style={{ padding: `${unit(0.4)} ${unit(0.9)}` }}>
                        {s.side}
                      </span>
                    </span>
                    <span className="absolute" style={{ bottom: unit(1.6), left: unit(1.8), right: unit(1.6) }}>
                      <span className="j-text block opacity-70">{s.line}</span>
                      <span className="flex items-end justify-between" style={{ marginTop: unit(0.6), gap: unit(1) }}>
                        <span className="j-title">{s.title}</span>
                        <PlusDot />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* ═════════════ ACT IV · O CAMINHO ═════════════ */}
          <div data-act="3">
            {/* How it works: horizontal */}
            <section data-method className="relative flex h-[var(--vh,100dvh)] flex-col justify-center overflow-hidden">
              <div className="flex items-end justify-between j-gutter" style={{ marginBottom: unit(3) }}>
                <div>
                  <Label>Como funciona</Label>
                  <p className="j-heading" style={{ marginTop: unit(1) }}>
                    Do diagnóstico ao <em>ideal.</em>
                  </p>
                </div>
                <p className="j-label opacity-50 hidden md:block">Role para avançar</p>
              </div>
              <div data-track className="flex items-center will-change-transform" style={{ paddingLeft: '8vw', gap: '3vw' }}>
                {STEPS.map((s, i) => (
                  <article
                    key={s.n}
                    className="theme-ink relative flex-none overflow-hidden bg-surface"
                    style={{ width: 'min(78vw, 46rem)', height: 'min(52svh, 30rem)', borderRadius: unit(2) }}
                  >
                    <FoodTile seed={i + 2} className="absolute inset-0 opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-0 top-0 j-display opacity-[0.08]"
                      style={{ fontSize: 'calc(var(--j) * 22)', lineHeight: 0.8, padding: unit(2) }}
                    >
                      {s.n}
                    </span>
                    <div className="relative flex h-full flex-col justify-between" style={{ padding: unit(3) }}>
                      <div className="flex items-center justify-between">
                        <span className="j-mono opacity-60">{s.n} / 05</span>
                        <span className="j-label rounded-full bg-black/50" style={{ padding: `${unit(0.4)} ${unit(0.9)}` }}>
                          {s.side}
                        </span>
                      </div>
                      <div>
                        <h3 className="j-display" style={{ fontSize: 'min(calc(var(--j) * 5.2), 10.5vw)' }}>
                          {s.t}
                        </h3>
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

            {/* The handover: the value is in what's delivered; continuing is an option */}
            <div data-light="paper">
            <section data-handover className="j-gutter" style={{ paddingTop: unit(16), paddingBottom: unit(10) }}>
              <div data-reveal className="mx-auto text-center" style={{ maxWidth: unit(64) }}>
                <Label>A entrega</Label>
                <h2 className="j-heading" style={{ marginTop: unit(1.4) }}>
                  Fica tudo <em>pronto.</em> E fica tudo <em>seu.</em>
                </h2>
                <p className="j-text opacity-70 mx-auto" style={{ marginTop: unit(1.6), maxWidth: unit(48) }}>
                  Entregamos o conjunto a funcionar, com as contas em seu nome e um guia simples para o manter. Nas semanas seguintes,
                  acompanhamos de perto para tirar dúvidas. E se preferir que continuemos a cuidar de tudo, também pode.
                </p>
              </div>
              <div className="relative mx-auto" style={{ marginTop: unit(6), maxWidth: unit(110) }}>
                {/* solid through what's included, dashed into the option (desktop) */}
                <div className="pointer-events-none absolute inset-x-0 hidden md:block" style={{ top: unit(1.2) }}>
                  <div data-handover-line className="flex origin-left">
                    <div className="h-px bg-paper" style={{ width: '66.6%' }} />
                    <div className="h-px flex-1" style={{ backgroundImage: 'linear-gradient(90deg, var(--color-paper) 50%, transparent 50%)', backgroundSize: '10px 1px', opacity: 0.5 }} />
                  </div>
                </div>
                <ol className="relative grid grid-cols-1 md:grid-cols-3" style={{ gap: unit(2) }}>
                  {HANDOVER.map((h, i) => {
                    const optional = i === 2;
                    return (
                      <li key={h.n} data-reveal className="flex flex-col" style={{ gap: unit(1.4) }}>
                        <span
                          className={`relative z-10 flex items-center justify-center rounded-full ${optional ? 'border border-dashed border-line bg-ink' : 'bg-paper text-ink'}`}
                          style={{ width: unit(2.4), height: unit(2.4) }}
                          aria-hidden="true"
                        >
                          <span className="j-mono" style={{ fontSize: unit(0.8) }}>
                            {h.n}
                          </span>
                        </span>
                        <div
                          className={`flex flex-1 flex-col ${optional ? 'border border-dashed border-line' : 'bg-surface'}`}
                          style={{ borderRadius: unit(2), padding: unit(2.4), gap: unit(1) }}
                        >
                          <span className={`j-label self-start rounded-full ${optional ? 'opacity-60' : 'bg-paper text-ink'}`} style={{ padding: `${unit(0.4)} ${unit(0.9)}` }}>
                            {h.tag}
                          </span>
                          <p className="j-title" style={{ marginTop: unit(1.6) }}>
                            {h.t}
                          </p>
                          <p className="j-text opacity-70">{h.d}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </section>

            {/* Why it's possible */}
            <section className="j-gutter" style={{ paddingTop: unit(8), paddingBottom: unit(14) }}>
              <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: unit(6) }}>
                <div data-reveal>
                  <Label>Porque é possível</Label>
                  <h2 className="j-heading" style={{ marginTop: unit(1.4) }}>
                    Mais resultado. Menos <em>desperdício.</em>
                  </h2>
                  <p className="j-text opacity-70" style={{ marginTop: unit(1.6), maxWidth: unit(42) }}>
                    Anos de trabalho com restaurantes tornaram-se processos e tecnologia: modelos testados, automação e uma equipa que
                    não perde tempo a coordenar fornecedores. É isso que nos permite entregar o conjunto completo, com o nível de uma
                    equipa inteira, num único investimento, bem abaixo do que custaria juntar cada fornecedor.
                  </p>
                </div>
                <ul data-reveal className="self-end">
                  {[
                    ['Processos', 'Cada entrega nasce de um modelo testado.'],
                    ['Tecnologia', 'A automação faz o trabalho repetitivo.'],
                    ['Uma equipa', 'Ninguém perde tempo a coordenar fornecedores.'],
                  ].map(([k, d], i) => (
                    <li
                      key={k}
                      className="grid grid-cols-[auto_1fr] items-baseline border-t border-line"
                      style={{ paddingBlock: unit(1.8), columnGap: unit(2) }}
                    >
                      <span className="j-mono opacity-40">0{i + 1}</span>
                      <span>
                        <span className="j-title block">{k}</span>
                        <span className="j-text block opacity-60" style={{ marginTop: unit(0.2) }}>
                          {d}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
            </div>
          </div>

          {/* ═════════════ ACT V · CONVERSA ═════════════ */}
          <div data-act="4">
            <section data-light="paper" className="j-gutter" style={{ paddingBlock: unit(12) }}>
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

            {/* Closing: back to the first line */}
            <section data-closing className="j-gutter" style={{ paddingTop: unit(14), paddingBottom: unit(6) }}>
              <div data-reveal className="flex flex-col items-center text-center">
                <p className="j-title opacity-50" style={{ maxWidth: unit(50) }}>
                  Não fazemos peças. Fazemos o <em>conjunto.</em>
                </p>
                <h2 className="j-display" style={{ marginTop: unit(2), maxWidth: unit(64) }}>
                  Vamos pôr o seu negócio no <em>mapa.</em>
                </h2>
                <p className="j-text opacity-70" style={{ marginTop: unit(2), maxWidth: unit(36) }}>
                  Diga-nos o nome do seu negócio. Enviamos o diagnóstico antes de qualquer conversa.
                </p>
                <div className="flex flex-col items-center" style={{ marginTop: unit(3.5), gap: unit(2) }}>
                  <PillAction label="Pedir diagnóstico" onClick={contact} />
                  {wa ? (
                    <TextButton onClick={() => window.open(wa, '_blank', 'noopener')}>ou fale connosco no WhatsApp</TextButton>
                  ) : (
                    <TextButton onClick={() => (window.location.href = emailHref())}>ou escreva-nos por e-mail</TextButton>
                  )}
                </div>
              </div>
            </section>

            <footer className="flex items-center j-chrome" style={{ gap: unit(1.5) }}>
              <span className="j-label">2026</span>
              <span className="j-label opacity-40">/</span>
              <span className="j-label opacity-50">Áquila · Lisboa e Porto</span>
              <div className="h-px flex-1 bg-white/25" />
              {onReplayFlight && (
                <TextButton dim onClick={onReplayFlight}>
                  Rever o voo
                </TextButton>
              )}
              <TextButton onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}>Topo</TextButton>
            </footer>
          </div>
        </div>
      </motion.div>

      {/* Floating CTA (phones) */}
      <AnimatePresence>
        {showFloatingCta && (
          <motion.div
            className="fixed inset-x-0 z-50 flex justify-center md:hidden"
            style={{ bottom: 'calc(var(--j) * 2 + env(safe-area-inset-bottom))' }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } }}
            exit={{ opacity: 0, y: 24, transition: { duration: 0.3 } }}
          >
            <div className="rounded-full bg-black/60 backdrop-blur-md" style={{ padding: unit(0.5) }}>
              <PillAction label="Pedir diagnóstico" onClick={contact} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sheet && (
          <SheetPopup
            key={sheet.item.id}
            origin={sheet.origin}
            onClose={() => setSheet(null)}
            title={sheet.item.title}
            eyebrow={sheet.item.eyebrow}
            lead={sheet.item.lead}
            description={sheet.item.description}
            tags={sheet.item.tags}
            media={sheet.item.media}
            footer={
              <button
                type="button"
                onClick={(e) => {
                  const r = rectFrom(e.currentTarget, 999);
                  sound.click();
                  setSheet(null);
                  window.setTimeout(() => onOpenContact(r), 700);
                }}
                className="group inline-flex items-center cursor-pointer"
                style={{ gap: unit(0.8) }}
              >
                <span
                  className="flex items-center rounded-full bg-black/[0.06] j-text transition-colors duration-300 group-hover:bg-black/[0.1]"
                  style={{ height: unit(4.5), paddingInline: unit(2) }}
                >
                  Pedir diagnóstico
                </span>
                <span
                  className="flex items-center justify-center rounded-full bg-black text-white transition-transform duration-500 group-hover:rotate-45"
                  style={{ width: unit(4.5), height: unit(4.5), fontSize: unit(1.6) }}
                  aria-hidden="true"
                >
                  ↗
                </span>
              </button>
            }
          />
        )}
      </AnimatePresence>
    </>
  );
};

/** Jesper's white "+" in a circle. */
const PlusDot: React.FC = () => (
  <span
    className="flex flex-none items-center justify-center rounded-full bg-paper text-ink transition-transform duration-500 group-hover:rotate-90"
    style={{ width: unit(2.5), height: unit(2.5), fontSize: unit(1.4) }}
    aria-hidden="true"
  >
    +
  </span>
);

/** Desktop rail: which act of the story the visitor is in. */
const ActRail: React.FC<{ act: number }> = ({ act }) => (
  <nav
    aria-label="Capítulos"
    className="pointer-events-none fixed top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end transition-opacity duration-500 md:flex"
    style={{ right: unit(2), gap: unit(1.2), opacity: act < 0 ? 0 : 1 }}
  >
    {ACTS.map((name, i) => {
      const on = i === act;
      return (
        <div key={name} className="flex items-center" style={{ gap: unit(0.6) }} title={name} aria-current={on ? 'step' : undefined}>
          <span
            className="block h-px bg-champagne transition-all duration-500"
            style={{ width: on ? unit(1.6) : 0, opacity: on ? 1 : 0 }}
          />
          <span className={`j-mono transition-opacity duration-500 ${on ? 'text-champagne' : ''}`} style={{ opacity: on ? 1 : 0.3, minWidth: unit(1.6), textAlign: 'right' }}>
            {ROMAN[i]}
          </span>
          <span className="sr-only">{name}</span>
        </div>
      );
    })}
  </nav>
);

/** A cinema lens seen from the front, drawn in CSS until the real photo of the kit arrives. */
const LensVisual: React.FC = () => (
  <div className="relative mx-auto w-full" style={{ maxWidth: unit(52) }}>
  <div className="theme-ink relative aspect-square w-full rounded-full shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)]">
    <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #050505 70%)' }} />
    {[0, 6, 11, 15, 22, 30].map((inset, i) => (
      <div
        key={inset}
        className="absolute rounded-full"
        style={{
          inset: `${inset}%`,
          border: `1px solid rgba(255,255,255,${i === 0 ? 0.18 : 0.08 + i * 0.015})`,
          background: i === 4 ? 'radial-gradient(circle at 50% 50%, #0b0b0d 0%, #000 60%)' : undefined,
        }}
      />
    ))}
    {/* Coatings: the warm/cool reflections of a real front element */}
    <div
      className="absolute rounded-full mix-blend-screen"
      style={{
        inset: '22%',
        background:
          'radial-gradient(ellipse 38% 22% at 34% 30%, rgba(223,206,186,0.55), transparent 70%), radial-gradient(ellipse 26% 14% at 66% 70%, rgba(120,160,255,0.35), transparent 70%), radial-gradient(ellipse 18% 10% at 60% 36%, rgba(180,120,255,0.25), transparent 70%)',
      }}
    />
    <div className="absolute rounded-full" style={{ inset: '44%', background: '#000', boxShadow: '0 0 40px rgba(0,0,0,0.9)' }} />
    <p
      className="absolute inset-x-0 j-mono text-center opacity-40"
      style={{ top: '8.5%', letterSpacing: '0.2em' }}
    >
      24–70 MM · F/2.8
    </p>
  </div>
    <p className="j-label text-center opacity-40" style={{ marginTop: unit(2) }}>
      Fotografia do equipamento em breve
    </p>
  </div>
);

/** Today × Ideal: draggable divider, plus a checklist that flips as the ideal side grows. */
const IdealCompare: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [idealCount, setIdealCount] = useState(3);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const pct = parseFloat(el.style.getPropertyValue('--split')) || 50;
      setIdealCount(Math.max(0, Math.min(IDEAL_CHECKS.length, Math.round(((100 - pct) / 100) * IDEAL_CHECKS.length))));
    };
    const obs = new MutationObserver(read);
    obs.observe(el, { attributes: true, attributeFilter: ['style'] });
    read();
    return () => obs.disconnect();
  }, []);

  const setFromPointer = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pct = Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100));
    el.style.setProperty('--split', `${pct}%`);
  };

  return (
    <>
      <div
        ref={ref}
        data-compare
        data-reveal
        className="theme-ink relative mx-auto select-none overflow-hidden bg-[#0d0d0d] touch-pan-y cursor-ew-resize"
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
          const cur = parseFloat(el.style.getPropertyValue('--split')) || 50;
          if (e.key === 'ArrowLeft') el.style.setProperty('--split', `${Math.max(4, cur - 5)}%`);
          if (e.key === 'ArrowRight') el.style.setProperty('--split', `${Math.min(96, cur + 5)}%`);
        }}
        tabIndex={0}
        role="slider"
        aria-label="Comparar hoje e ideal"
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="relative">
          <MockPresence tone="ideal" />
        </div>
        <div className="absolute inset-0 bg-[#1a1918]" style={{ clipPath: 'inset(0 calc(100% - var(--split)) 0 0)' }}>
          <MockPresence tone="today" />
        </div>
        <div className="pointer-events-none absolute inset-y-0" style={{ left: 'var(--split)' }}>
          <div className="absolute inset-y-0 -translate-x-1/2 w-px bg-champagne" />
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
        <span
          className="pointer-events-none absolute j-label rounded-full bg-champagne text-black"
          style={{ right: unit(1.4), top: unit(1.4), padding: `${unit(0.5)} ${unit(1)}` }}
        >
          Ideal
        </span>
      </div>

      <ul className="mx-auto flex flex-wrap items-center justify-center" style={{ marginTop: unit(2.4), gap: unit(0.8), maxWidth: unit(110) }} aria-live="polite">
        {IDEAL_CHECKS.map((c, i) => {
          const on = i < idealCount;
          return (
            <li
              key={c}
              className={`j-label flex items-center rounded-full border transition-all duration-500 ${
                on ? 'border-champagne/70 text-champagne' : 'border-white/15 text-white/45'
              }`}
              style={{ paddingInline: unit(1.2), paddingBlock: unit(0.6), gap: unit(0.6) }}
            >
              <span aria-hidden="true">{on ? '✓' : '–'}</span>
              {c}
            </li>
          );
        })}
      </ul>
    </>
  );
};
