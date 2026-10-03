import React from 'react';
import { sound } from '../../utils/audio';
import { OriginRect, rectFrom } from '../ui/ExpandPopup';

export type NavigationTab = 'HOME' | 'CASES' | 'EUROPE' | 'ABOUT' | 'ARTICLES' | 'CONTACT';

interface AquilaNavProps {
  activeTab?: NavigationTab;
  onSelectTab?: (tab: NavigationTab) => void;
  onOpenAbout?: (origin: OriginRect) => void;
  onOpenContact?: (origin: OriginRect) => void;
  glowMode?: boolean;
  /** Draw the curved top-right corner that starts the contour frame. */
  withCorner?: boolean;
}

/**
 * Aquila's square-logo menu and continuous hairline, typeset in Jesper's
 * system: uppercase labels, the current page at full opacity, the rest dimmed.
 */
export const AquilaNav: React.FC<AquilaNavProps> = ({
  activeTab = 'HOME',
  onSelectTab,
  onOpenAbout,
  onOpenContact,
  glowMode = false,
  withCorner = true,
}) => {
  const line = glowMode ? 'bg-white/40 shadow-[0_0_8px_white]' : 'bg-white/25';

  const item = (tab: NavigationTab, label: React.ReactNode, extra = '', onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void) => (
    <button
      type="button"
      onClick={(e) => {
        sound.click();
        if (onClick) onClick(e);
        else onSelectTab?.(tab);
      }}
      aria-current={activeTab === tab ? 'page' : undefined}
      className={`j-label relative whitespace-nowrap cursor-pointer transition-opacity duration-500 ease-out before:absolute before:-inset-2 ${
        activeTab === tab ? 'opacity-100' : 'opacity-50 hover:opacity-100'
      } ${extra}`}
    >
      {label}
    </button>
  );

  const openAbout = (e: React.MouseEvent<HTMLButtonElement>) => onOpenAbout?.(rectFrom(e.currentTarget, 14));
  const openContact = (e: React.MouseEvent<HTMLButtonElement>) =>
    (onOpenContact ?? onOpenAbout)?.(rectFrom(e.currentTarget, 14));

  return (
    <div className="relative flex items-center w-full z-30">
      {/* Square monogram + wordmark */}
      <button
        type="button"
        onClick={() => {
          sound.click();
          onSelectTab?.('HOME');
        }}
        aria-label="Aquila, início"
        className="flex items-center shrink-0 cursor-pointer group text-left"
        style={{ gap: 'calc(var(--j) * 1.4)', paddingRight: 'calc(var(--j) * 2)' }}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/5 backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
          <svg viewBox="0 0 40 40" className="h-6 w-6" fill="none" aria-hidden="true">
            <rect x="4" y="10" width="32" height="20" rx="10" stroke="currentColor" strokeWidth="2.5" />
            <path d="M14 28L20 14L28 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </span>
        <span className="hidden lg:flex flex-col">
          <span className="j-label">Aquila</span>
          <span className="j-label opacity-50">Autonomous design & digital craft</span>
        </span>
      </button>

      <div className={`h-[1px] flex-1 min-w-[12px] transition-colors duration-700 ${line}`} />

      <nav
        className="flex items-center shrink-0 z-30"
        style={{ gap: 'calc(var(--j) * 2)', paddingInline: 'calc(var(--j) * 2)' }}
        aria-label="Menu principal"
      >
        {item('HOME', 'Home', 'hidden sm:inline-block')}
        {item('ABOUT', 'About', '', openAbout)}
        {item('CASES', 'Cases')}
        {item('EUROPE', 'Europe US')}
        {item('ARTICLES', 'Articles', 'hidden xl:inline-block', () => {})}
        {item('CONTACT', 'Contact', 'hidden sm:inline-block', openContact)}
      </nav>

      <div className={`hidden sm:block h-[1px] w-16 md:w-32 lg:w-48 shrink-0 transition-colors duration-700 ${line}`} />

      {withCorner && (
        <div
          className={`h-[56px] w-[56px] shrink-0 border-t border-r rounded-tr-[56px] transition-colors duration-700 -mb-[55px] ${
            glowMode ? 'border-white/40 shadow-[0_0_8px_white]' : 'border-white/25'
          }`}
        />
      )}
    </div>
  );
};
