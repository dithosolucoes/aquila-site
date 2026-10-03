import React, { useState } from 'react';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { AquilaNav } from '../components/aquila/AquilaNav';
import { ExpandPopup, OriginRect, PopupLine, rectFrom } from '../components/ui/ExpandPopup';
import { Card, Label, PillAction, RoundButton, TextButton, unit } from '.';

/** Living reference of the Aquila Design System (Jesper Landberg's system, applied to Aquila). */

const TYPE = [
  { cls: 'j-label', name: 'Label', spec: '10 · 500 · maiúsculas', sample: 'Featured / Full, Profile, Newsletter' },
  { cls: 'j-text', name: 'Texto', spec: '14 · 1.4 · −2%', sample: 'Site, Google, fotografia e aquisição de clientes, entregues por um time que vai até a sua cidade.' },
  { cls: 'j-title', name: 'Título', spec: 'Playfair 18 · 600', sample: 'Casa Di Solare' },
  { cls: 'j-heading', name: 'Chamada', spec: 'Playfair 28 · 700 · uma por tela', sample: <>Conteúdo que faz seus pratos <em>venderem.</em></> },
  { cls: 'j-display', name: 'Display', spec: 'Playfair 52 · 800', sample: '€1.000' },
];

const COLORS = [
  ['Preto', '#000000', 'Fundo'],
  ['Surface', '#0A0A0A', 'Cards'],
  ['Branco', '#FFFFFF', 'Texto e botões redondos'],
  ['Branco 60%', 'opacity-60', 'Texto de apoio, labels'],
  ['Branco 50%', 'opacity-50', 'Itens inativos do menu'],
  ['Champagne', '#DFCEBA', 'Rota do voo e Portugal no mapa'],
];

const Row: React.FC<{ title: string; note: string; children: React.ReactNode }> = ({ title, note, children }) => (
  <section className="grid grid-cols-1 md:grid-cols-[1fr_3fr] border-t border-line" style={{ paddingBlock: unit(6), gap: unit(3) }}>
    <div>
      <p className="j-label">{title}</p>
      <p className="j-text opacity-60" style={{ marginTop: unit(0.8), maxWidth: unit(24) }}>
        {note}
      </p>
    </div>
    <div className="min-w-0">{children}</div>
  </section>
);

export default function DesignSystemPage() {
  const [popup, setPopup] = useState<OriginRect | null>(null);

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 overflow-y-auto bg-ink text-paper">
        <header
          className="sticky top-0 z-30 bg-gradient-to-b from-ink via-ink/85 to-transparent px-4 pt-4 sm:px-8 sm:pt-8"
          style={{ paddingBottom: unit(4) }}
        >
          <AquilaNav withCorner={false} onSelectTab={() => (window.location.href = '/')} onOpenAbout={(o) => setPopup(o)} />
        </header>

        <main className="j-gutter" style={{ paddingBottom: unit(10) }}>
          <div className="flex flex-col items-center text-center" style={{ paddingBlock: unit(10) }}>
            <Label>Aquila Design System</Label>
            <p className="j-heading" style={{ marginTop: unit(1.5), maxWidth: unit(50) }}>
              O sistema do Jesper Landberg, vestindo a Aquila.
            </p>
            <p className="j-text opacity-70" style={{ marginTop: unit(2), maxWidth: unit(42) }}>
              Títulos serifados com a última palavra em itálico, texto limpo, tamanhos que acompanham a largura da tela, labels pequenas em maiúsculas, botões
              redondos brancos e popups sem caixa. Da Aquila ficam o logo, as linhas de contorno, o fundo 3D e o voo.
            </p>
          </div>

          <Row title="Unidade" note="Tudo é medido numa unidade que cresce com a tela, como no site do Jesper.">
            <p className="j-text">1 unidade = largura da tela ÷ 150 no computador, ÷ 39 no celular.</p>
            <p className="j-label opacity-50" style={{ marginTop: unit(1) }}>
              Em 1500px de largura: label 10px, texto 14px, título 18px
            </p>
          </Row>

          <Row title="Tipografia" note="Da proposta da Áquila: Playfair Display nos títulos (última palavra em itálico) e Inter no texto.">
            <div className="flex flex-col" style={{ gap: unit(3) }}>
              {TYPE.map((t) => (
                <div key={t.name} className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] items-baseline" style={{ gap: unit(1) }}>
                  <div>
                    <p className="j-label">{t.name}</p>
                    <p className="j-label opacity-40">{t.spec}</p>
                  </div>
                  <p className={t.cls}>{t.sample}</p>
                </div>
              ))}
            </div>
          </Row>

          <Row title="Cores" note="Preto e branco. Hierarquia por transparência, não por cor.">
            <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: unit(1.5) }}>
              {COLORS.map(([name, value, use]) => (
                <div key={name}>
                  <div
                    className="aspect-[4/3]"
                    style={{
                      borderRadius: unit(1.5),
                      background: value.startsWith('#') ? value : `rgba(255,255,255,${value === 'opacity-60' ? 0.6 : 0.5})`,
                      boxShadow: value === '#000000' ? 'inset 0 0 0 1px rgba(255,255,255,0.18)' : undefined,
                    }}
                  />
                  <p className="j-label" style={{ marginTop: unit(0.8) }}>
                    {name}
                  </p>
                  <p className="j-label opacity-50">{use}</p>
                </div>
              ))}
            </div>
          </Row>

          <Row title="Navegação" note="Labels que escurecem no hover. A página atual em branco, as outras a 50%.">
            <div className="flex flex-wrap items-center" style={{ gap: unit(2) }}>
              <TextButton>Featured</TextButton>
              <span className="j-label">/</span>
              <TextButton dim>Full</TextButton>
              <span style={{ width: unit(4) }} />
              <TextButton>Profile</TextButton>
              <TextButton>Newsletter</TextButton>
            </div>
          </Row>

          <Row title="Botões" note="Pílula preta + círculo branco para a ação principal. Círculo branco sozinho para controles.">
            <div className="flex flex-wrap items-center" style={{ gap: unit(3) }}>
              <PillAction label="Agendar diagnóstico" />
              <RoundButton label="Abrir">+</RoundButton>
              <RoundButton label="Abrir" size={2.5}>
                +
              </RoundButton>
            </div>
          </Row>

          <Row title="Popup" note="Sem caixa. O fundo escurece num círculo que abre a partir do clique, e o texto flutua no centro.">
            <TextButton onClick={(e) => setPopup(rectFrom(e.currentTarget))}>Abrir popup</TextButton>
          </Row>

          <Row title="Cards" note="Cantos de 20 unidades, sem borda. Título embaixo à esquerda, círculo branco embaixo à direita.">
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: unit(1.5) }}>
              {['Casa Di Solare', 'Site profissional'].map((t) => (
                <Card key={t} className="group relative aspect-[4/3] overflow-hidden">
                  <span
                    className="absolute flex items-end justify-between"
                    style={{ bottom: unit(1.5), left: unit(2), right: unit(1.5) }}
                  >
                    <span className="j-title">{t}</span>
                    <span
                      className="flex items-center justify-center rounded-full bg-paper text-ink transition-transform duration-500 group-hover:rotate-90"
                      style={{ width: unit(2.5), height: unit(2.5), fontSize: unit(1.4) }}
                    >
                      +
                    </span>
                  </span>
                </Card>
              ))}
            </div>
          </Row>

          <Row title="Movimento" note="Duas curvas para o site inteiro.">
            <p className="j-text">Forma: cubic-bezier(0.76, 0, 0.24, 1), 0,75s. Para popups e transições de tela.</p>
            <p className="j-text" style={{ marginTop: unit(0.8) }}>
              Conteúdo: cubic-bezier(0.16, 1, 0.3, 1), 0,6 a 1s. O texto entra linha por linha, saindo do desfoque.
            </p>
          </Row>
        </main>

        <AnimatePresence>
          {popup && (
            <ExpandPopup origin={popup} onClose={() => setPopup(null)} label="Exemplo de popup">
              <PopupLine>
                <p className="j-text mx-auto" style={{ maxWidth: unit(40) }}>
                  Este é o popup do sistema. Ele não tem caixa: o fundo escurece a partir do clique e o texto aparece
                  flutuando, linha por linha, como no Profile do Jesper.
                </p>
              </PopupLine>
              <PopupLine>
                <p className="j-label opacity-60" style={{ marginTop: unit(2.5) }}>
                  Usado no About, Contact e serviços do Europe US
                </p>
              </PopupLine>
              <PopupLine>
                <div style={{ marginTop: unit(3) }}>
                  <PillAction label="Ação principal" />
                </div>
              </PopupLine>
            </ExpandPopup>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
