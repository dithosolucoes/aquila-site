import React from 'react';
import { foodPhoto, roomPhoto } from './photos';

/**
 * Illustrative mockups drawn in HTML/CSS (no photos yet): a fictional local
 * restaurant, "Taberna do Largo", shown across the pieces of its digital presence.
 * `tone="today"` renders the fragmented version, `tone="ideal"` the connected one.
 */

export type MockTone = 'today' | 'ideal';
const u = (n: number) => `calc(var(--j) * ${n})`;

/**
 * A food photograph. `dull` renders it the way an unprepared business shows it
 * (grey, soft, underexposed) for the "today" side of comparisons.
 */
export const FoodTile: React.FC<{
  seed?: number;
  dull?: boolean;
  room?: boolean;
  width?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ seed = 0, dull = false, room = false, width = 900, className = '', style }) => (
  <div className={`${/\b(absolute|fixed)\b/.test(className) ? '' : 'relative '}overflow-hidden bg-[#1a1714] ${className}`} style={style}>
    <img
      src={room ? roomPhoto(seed, width) : foodPhoto(seed, width)}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
      className="absolute inset-0 h-full w-full object-cover"
      style={dull ? { filter: 'grayscale(0.85) brightness(0.75) contrast(0.85) blur(1px)' } : undefined}
    />
  </div>
);

const Line: React.FC<{ w: string; dark?: boolean; o?: number }> = ({ w, dark, o = 1 }) => (
  <div
    className="rounded-full"
    style={{ width: w, height: u(0.55), background: dark ? `rgba(0,0,0,${0.12 * o})` : `rgba(255,255,255,${0.16 * o})` }}
  />
);

export const MockGoogle: React.FC<{ tone?: MockTone }> = ({ tone = 'ideal' }) => {
  const ideal = tone === 'ideal';
  return (
    <div className="rounded-[inherit] bg-white text-black" style={{ padding: u(1.4), borderRadius: u(1.2) }}>
      <div className="grid grid-cols-3" style={{ gap: u(0.4), height: u(9) }}>
        <FoodTile seed={1} dull={!ideal} className="col-span-2 rounded-l-[8px]" />
        <div className="grid grid-rows-2" style={{ gap: u(0.4) }}>
          <FoodTile seed={2} dull={!ideal} className="rounded-tr-[8px]" />
          {ideal ? <FoodTile seed={3} className="rounded-br-[8px]" /> : <div className="rounded-br-[8px] bg-neutral-200" />}
        </div>
      </div>
      <p className="j-title" style={{ marginTop: u(1) }}>
        Taberna do Largo
      </p>
      <p className="j-label opacity-60" style={{ marginTop: u(0.2) }}>
        {ideal ? '4,8 ★★★★★ (326) · Restaurante português · €€' : '4,1 ★★★★ (23) · Restaurante'}
      </p>
      <div className="flex flex-wrap" style={{ gap: u(0.5), marginTop: u(1) }}>
        {(ideal ? ['Reservar', 'Menu', 'Direções', 'Ligar'] : ['Direções']).map((b, i) => (
          <span
            key={b}
            className={`j-label rounded-full ${i === 0 && ideal ? 'bg-black text-white' : 'bg-black/[0.07]'}`}
            style={{ paddingInline: u(1), paddingBlock: u(0.45) }}
          >
            {b}
          </span>
        ))}
      </div>
      <div className="flex flex-col" style={{ gap: u(0.45), marginTop: u(1.2) }}>
        <p className="j-label" style={{ color: ideal ? '#1a7f37' : '#b42318' }}>
          {ideal ? 'Aberto · Fecha às 23:00' : 'Horário não indicado'}
        </p>
        <Line w="80%" dark o={ideal ? 1 : 0.5} />
        <Line w="55%" dark o={ideal ? 1 : 0.5} />
      </div>
    </div>
  );
};

export const MockSite: React.FC<{ tone?: MockTone }> = ({ tone = 'ideal' }) => {
  const ideal = tone === 'ideal';
  return (
    <div className="overflow-hidden bg-[#111] text-white" style={{ borderRadius: u(1.2) }}>
      <div className="flex items-center bg-[#1c1c1c]" style={{ gap: u(0.4), padding: u(0.7) }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="rounded-full bg-white/20" style={{ width: u(0.6), height: u(0.6) }} />
        ))}
        <span className="j-mono opacity-40" style={{ marginLeft: u(1) }}>
          tabernadolargo.pt
        </span>
      </div>
      {ideal ? (
        <div className="relative" style={{ height: u(16) }}>
          <FoodTile seed={4} className="absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute flex items-center justify-between" style={{ top: u(1), left: u(1.2), right: u(1.2) }}>
            <span className="j-label">Taberna do Largo</span>
            <span className="j-label opacity-70">Menu · Sobre · Reservar</span>
          </div>
          <div className="absolute" style={{ bottom: u(1.4), left: u(1.4) }}>
            <p className="j-title">Cozinha portuguesa, desde 1987.</p>
            <span
              className="j-label inline-block rounded-full bg-white text-black"
              style={{ marginTop: u(0.8), paddingInline: u(1.1), paddingBlock: u(0.5) }}
            >
              Reservar mesa
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col bg-[#e9e6e1] text-black" style={{ height: u(16), padding: u(1.4), gap: u(0.7) }}>
          <p className="j-text" style={{ fontFamily: 'Times New Roman, serif' }}>
            Bem-vindo ao nosso restaurante!!
          </p>
          <FoodTile seed={5} dull className="rounded" style={{ height: u(6), width: '60%' }} />
          <Line w="90%" dark />
          <Line w="70%" dark />
          <p className="j-label opacity-50">Última atualização: 2017</p>
        </div>
      )}
    </div>
  );
};

export const MockSocial: React.FC<{ tone?: MockTone }> = ({ tone = 'ideal' }) => {
  const ideal = tone === 'ideal';
  return (
    <div className="bg-white text-black" style={{ borderRadius: u(1.2), padding: u(1.2) }}>
      <div className="flex items-center" style={{ gap: u(0.8) }}>
        <div className="rounded-full bg-black" style={{ width: u(3), height: u(3) }} />
        <div>
          <p className="j-label">tabernadolargo</p>
          <p className="j-label opacity-50">{ideal ? 'Cozinha portuguesa · Reservas no link' : 'restaurante'}</p>
        </div>
      </div>
      <div className="grid grid-cols-3" style={{ gap: u(0.3), marginTop: u(1) }}>
        {Array.from({ length: 9 }, (_, i) =>
          ideal ? (
            <FoodTile key={i} seed={i} className="aspect-square" />
          ) : (
            <div key={i} className="aspect-square" style={{ background: i % 3 === 0 ? '#c7c2ba' : i % 2 ? '#8a8580' : '#b5b0a8' }} />
          )
        )}
      </div>
    </div>
  );
};

export const MockWhatsApp: React.FC = () => (
  <div className="bg-[#0b141a] text-white" style={{ borderRadius: u(1.2), padding: u(1.4) }}>
    <p className="j-label opacity-60">Taberna do Largo · resposta automática</p>
    <div className="flex flex-col" style={{ gap: u(0.6), marginTop: u(1.2) }}>
      {[
        { me: true, t: 'Olá! Têm mesa para 4 hoje às 20h30?' },
        { me: false, t: 'Olá! Temos sim. Confirmo a reserva em nome de quem?' },
        { me: true, t: 'Ana Ribeiro.' },
        { me: false, t: 'Reserva feita: hoje, 20h30, 4 pessoas. Até logo!' },
      ].map((m, i) => (
        <p
          key={i}
          className="j-text max-w-[80%]"
          style={{
            alignSelf: m.me ? 'flex-end' : 'flex-start',
            background: m.me ? '#005c4b' : '#202c33',
            borderRadius: u(0.8),
            padding: `${u(0.6)} ${u(0.9)}`,
          }}
        >
          {m.t}
        </p>
      ))}
    </div>
  </div>
);

export const MockAds: React.FC = () => (
  <div className="bg-white text-black" style={{ borderRadius: u(1.2), padding: u(1.4) }}>
    <p className="j-label opacity-50">Patrocinado</p>
    <p className="j-title" style={{ marginTop: u(0.4) }}>
      Jantar português no coração de Lisboa
    </p>
    <FoodTile seed={2} className="rounded-lg" style={{ height: u(9), marginTop: u(1) }} />
    <div className="grid grid-cols-3" style={{ marginTop: u(1.2), gap: u(1) }}>
      {[
        ['Alcance', '18,2 mil'],
        ['Cliques', '1.240'],
        ['Reservas', '96'],
      ].map(([k, v]) => (
        <div key={k}>
          <p className="j-label opacity-50">{k}</p>
          <p className="j-title">{v}</p>
        </div>
      ))}
    </div>
    <p className="j-label opacity-40" style={{ marginTop: u(1) }}>
      Números ilustrativos
    </p>
  </div>
);

export const MockPhoto: React.FC = () => (
  <div className="grid grid-cols-6" style={{ gap: u(0.4) }}>
    <FoodTile seed={0} className="col-span-4 aspect-[4/3] rounded-lg" />
    <div className="col-span-2 grid grid-rows-2" style={{ gap: u(0.4) }}>
      <FoodTile seed={3} className="rounded-lg" />
      <FoodTile seed={5} className="rounded-lg" />
    </div>
    <FoodTile seed={1} className="col-span-3 aspect-square rounded-lg" />
    <FoodTile seed={4} className="col-span-3 aspect-square rounded-lg" />
  </div>
);

/** Visual identity sheet: palette, type pairing and applications. */
export const MockIdentity: React.FC = () => (
  <div className="bg-[#f4f1ec] text-black" style={{ borderRadius: u(1.2), padding: u(1.6) }}>
    <p className="j-label opacity-50">Taberna do Largo · guia visual</p>
    <div className="flex items-end justify-between" style={{ marginTop: u(1.4), gap: u(1) }}>
      <p className="j-heading">
        Aa <em>Aa</em>
      </p>
      <p className="j-label opacity-50 text-right">
        Playfair Display
        <br />
        Inter
      </p>
    </div>
    <div className="grid grid-cols-5" style={{ gap: u(0.4), marginTop: u(1.4) }}>
      {['#1f1a17', '#7a2e1d', '#c9873f', '#e9dcc7', '#ffffff'].map((c) => (
        <div key={c}>
          <div className="aspect-square rounded-md border border-black/10" style={{ background: c }} />
          <p className="j-mono opacity-50" style={{ marginTop: u(0.3), fontSize: u(0.8) }}>
            {c.toUpperCase()}
          </p>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-3" style={{ gap: u(0.4), marginTop: u(1.2) }}>
      {['Menu', 'Cartão', 'Post'].map((t, i) => (
        <div key={t} className="relative aspect-[3/4] overflow-hidden rounded-md">
          <FoodTile seed={i + 2} className="absolute inset-0" />
          <span className="absolute j-label text-white" style={{ left: u(0.6), bottom: u(0.5) }}>
            {t}
          </span>
        </div>
      ))}
    </div>
  </div>
);

/** One-page monthly report. */
export const MockReport: React.FC = () => (
  <div className="bg-white text-black" style={{ borderRadius: u(1.2), padding: u(1.6) }}>
    <div className="flex items-center justify-between">
      <p className="j-label opacity-50">Relatório · Março</p>
      <p className="j-label opacity-50">1 página</p>
    </div>
    <div className="grid grid-cols-2" style={{ gap: u(1.2), marginTop: u(1.4) }}>
      {[
        ['Pesquisas no Google', '2.430', '+38%'],
        ['Cliques no WhatsApp', '184', '+52%'],
        ['Nota média', '4,8', '+0,3'],
        ['Visitas ao site', '1.120', '+27%'],
      ].map(([k, v, d]) => (
        <div key={k} className="border-t border-black/10" style={{ paddingTop: u(0.8) }}>
          <p className="j-label opacity-50">{k}</p>
          <p className="j-heading" style={{ marginTop: u(0.3) }}>
            {v}
          </p>
          <p className="j-label" style={{ color: '#1a7f37' }}>
            {d}
          </p>
        </div>
      ))}
    </div>
    <p className="j-label opacity-50" style={{ marginTop: u(1.4) }}>
      Próximas ações
    </p>
    <ol className="j-text" style={{ marginTop: u(0.5) }}>
      <li>1. Novas fotografias do menu de primavera</li>
      <li>2. Responder às 6 avaliações em inglês</li>
      <li>3. Ativar campanha para o fim de semana</li>
    </ol>
    <p className="j-label opacity-40" style={{ marginTop: u(1) }}>
      Números ilustrativos
    </p>
  </div>
);

/** A full "presence" composite for the Today × Ideal comparison: site · Google · Instagram + messages. */
export const MockPresence: React.FC<{ tone: MockTone }> = ({ tone }) => (
  <div className="grid h-full grid-cols-2 items-start md:grid-cols-3" style={{ gap: u(1.2), padding: u(1.6) }}>
    <MockSite tone={tone} />
    <MockGoogle tone={tone} />
    <div className="hidden flex-col md:flex" style={{ gap: u(1.2) }}>
      <MockSocial tone={tone} />
      {tone === 'ideal' ? (
        <div className="bg-[#0b141a] text-white" style={{ borderRadius: u(1.2), padding: u(1.2) }}>
          <p className="j-label opacity-60">Mensagens</p>
          <p className="j-text" style={{ marginTop: u(0.8), background: '#005c4b', borderRadius: u(0.8), padding: `${u(0.5)} ${u(0.8)}` }}>
            Reserva feita para hoje, 20h30.
          </p>
          <p className="j-label opacity-50" style={{ marginTop: u(0.6) }}>
            Respondido em 1 minuto
          </p>
        </div>
      ) : (
        <div className="bg-[#0b141a] text-white/70" style={{ borderRadius: u(1.2), padding: u(1.2) }}>
          <p className="j-label opacity-60">Mensagens</p>
          <p className="j-text" style={{ marginTop: u(0.8) }}>
            Olá, têm mesa hoje?
          </p>
          <p className="j-label" style={{ marginTop: u(0.6), color: '#f97066' }}>
            Sem resposta há 2 dias
          </p>
        </div>
      )}
    </div>
  </div>
);
