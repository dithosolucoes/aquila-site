import React from 'react';
import { Volume2, VolumeX, Film } from 'lucide-react';
import { foodPhoto } from '../../europe/photos';
import { sound } from '../../utils/audio';
import { OriginRect, rectFrom } from '../ui/ExpandPopup';
import { AquilaNav, NavigationTab } from './AquilaNav';

export type { NavigationTab };


interface ContourFrameProps {
  children: React.ReactNode;
  is3dEnabled: boolean;
  onToggle3D: () => void;
  isSoundMuted: boolean;
  onToggleSound: () => void;
  onOpenReel: (origin: OriginRect) => void;
  glowMode: boolean;
  onToggleGlow: () => void;
  onOpenAbout?: (origin: OriginRect) => void;
  onOpenContact?: (origin: OriginRect) => void;
  activeTab?: NavigationTab;
  onSelectTab?: (tab: NavigationTab) => void;
}

export const ContourFrame: React.FC<ContourFrameProps> = ({
  children,
  is3dEnabled,
  onToggle3D,
  isSoundMuted,
  onToggleSound,
  onOpenReel,
  glowMode,
  onToggleGlow,
  onOpenAbout,
  onOpenContact,
  activeTab = 'HOME',
  onSelectTab,
}) => {
  return (
    <div className="relative min-h-screen w-full bg-black text-white p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-between overflow-hidden select-none">
      {/* Background grain texture */}
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-40" />

      {/* =========================================================================
          THE UNIFIED CONTOUR WIREFRAME SYSTEM:
          Top:
            - Brand Lockup
            - Line connecting to Nav
            - Nav menu (recuado à esquerda)
            - Folga generosa antes da curva
            - Canto superior direito curvado (rounded-tr-[56px])
          Right:
            - Linha vertical com os BOTÕES INTERCEPTANDO A LINHA (exatamente como
              os marcadores - 1 -, - 2 -, - 4 - de shaunscholtz.com!)
          Bottom:
            - Canto inferior direito curvado (rounded-br-[56px])
            - Linha horizontal conectando ao 2026
         ========================================================================= */}

      <div className="relative z-20 flex-1 flex flex-col justify-between">
<AquilaNav activeTab={activeTab} onSelectTab={onSelectTab} onOpenAbout={onOpenAbout} onOpenContact={onOpenContact} glowMode={glowMode} />

        {/* =====================================================================
            MIDDLE BODY: Linha vertical direita com os BOTÕES NA LINHA
           ===================================================================== */}
        <div className="relative flex-1 flex items-center justify-center my-2">
          {/*
            RIGHT VERTICAL BORDER STRUCTURE:
            A linha vertical desce do canto superior direito até os botões,
            interrompe suavemente com fundo preto sob cada botão (exatamente como
            o botão '- 4 -' no print original), e continua até o canto inferior direito!
          */}
          <div className="absolute right-0 inset-y-0 w-0 flex flex-col items-center justify-between">
            {/* Segmento superior da linha vertical */}
            <div
              className={`w-[1px] flex-1 transition-colors duration-700 ${
                glowMode ? 'bg-white/40 shadow-[0_0_8px_white]' : 'bg-white/25'
              }`}
            />

            {/*
              OS BOTÕES NA LINHA VERTICAL:
              Cada botão fica exatamente no eixo central da linha vertical (w-[1px]),
              com fundo preto sólido (bg-black) e borda fina, interrompendo a linha
              de forma idêntica ao botão pílula '- 4 -' na referência de shaunscholtz.com!
              Com folga espaçada e arejada entre eles (gap-5).
            */}
            <div className="flex flex-col items-center gap-5 my-6 z-30">
              {/* Item 1: Audio / Sound */}
              <div className="relative flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    sound.click();
                    onToggleSound();
                  }}
                  title={isSoundMuted ? 'Ativar Áudio Tátil' : 'Silenciar Áudio'}
                  className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black text-neutral-300 transition-all hover:border-white hover:text-white hover:scale-110 cursor-pointer shadow-[0_0_12px_rgba(0,0,0,0.9)]"
                >
                  {isSoundMuted ? (
                    <VolumeX className="h-4 w-4 text-neutral-500" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-white animate-pulse" />
                  )}
                </button>
              </div>

              {/* Item 2: Reel / Motion */}
              <div className="relative flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    sound.click();
                    onOpenReel(rectFrom(e.currentTarget, 8));
                  }}
                  title="Showreel do Estúdio"
                  className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black text-neutral-300 transition-all hover:border-white hover:text-white hover:scale-110 cursor-pointer shadow-[0_0_12px_rgba(0,0,0,0.9)]"
                >
                  <Film className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            </div>

            {/* Segmento inferior da linha vertical */}
            <div
              className={`w-[1px] flex-1 transition-colors duration-700 ${
                glowMode ? 'bg-white/40 shadow-[0_0_8px_white]' : 'bg-white/25'
              }`}
            />
          </div>

          {/* Central Logo Experience or 3D Showcase */}
          <div className={`relative z-20 flex w-full items-center justify-center transition-all duration-300 ${activeTab === 'CASES' ? 'h-full flex-1 max-w-none px-0' : 'max-w-5xl px-4'}`}>
            {children}
          </div>

          {/* Invitation to the season: Jesper's small media card, bottom-left */}
          {activeTab === 'HOME' && <button
            type="button"
            onClick={() => {
              sound.click();
              onSelectTab?.('EUROPE');
            }}
            onPointerEnter={() => sound.hover()}
            className="group absolute bottom-0 left-0 z-30 flex items-center rounded-2xl border border-white/15 bg-black/60 text-left backdrop-blur-md transition-colors duration-500 hover:border-white/40 cursor-pointer"
            style={{ padding: 'calc(var(--j) * 0.6)', paddingRight: 'calc(var(--j) * 1.6)', gap: 'calc(var(--j) * 1.2)' }}
          >
            <span className="relative block flex-none overflow-hidden rounded-xl" style={{ width: 'calc(var(--j) * 6)', height: 'calc(var(--j) * 6)' }}>
              <img
                src={foodPhoto(1, 240)}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                draggable={false}
              />
            </span>
            <span className="flex flex-col" style={{ gap: 'calc(var(--j) * 0.3)' }}>
              <span className="j-label flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-champagne" />
                Novo · Temporada 2026
              </span>
              <span className="j-title" style={{ fontSize: 'calc(var(--j) * 1.6)' }}>
                Lisboa e <em>Porto.</em>
              </span>
              <span className="j-label opacity-50 transition-opacity group-hover:opacity-100">Ver a experiência →</span>
            </span>
          </button>}
        </div>

        {/* =====================================================================
            BOTTOM ROW: Canto inferior direito curvado + linha horizontal até 2026
           ===================================================================== */}
        <div className="relative flex items-center justify-between w-full z-30 j-label">
          {/* Emblema + 2026 */}
          <div className="flex items-center gap-3 shrink-0 pr-4">
            <div className="flex items-center gap-2 text-white">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 opacity-90 transition-transform duration-300 hover:scale-110"
              >
                <path d="M12 2L15 8L22 9L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9L9 8L12 2Z" />
              </svg>
              <span>2026</span>
            </div>

            <span className="hidden sm:inline-block opacity-40">/</span>
            <span className="hidden sm:inline-block opacity-50">
              Belo Horizonte · Lisboa · Porto
            </span>
          </div>

          {/* Linha horizontal inferior do contorno conectando até o canto inferior direito */}
          <div
            className={`h-[1px] flex-1 transition-colors duration-700 ${
              glowMode ? 'bg-white/40 shadow-[0_0_8px_white]' : 'bg-white/25'
            }`}
          />

          {/* Canto Inferior Direito Curvado (rounded-br-[56px]) */}
          <div
            className={`h-[56px] w-[56px] shrink-0 border-b border-r rounded-br-[56px] transition-colors duration-700 -mt-[55px] ${
              glowMode ? 'border-white/40 shadow-[0_0_8px_white]' : 'border-white/25'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
