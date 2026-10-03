import React, { useState } from 'react';
import { PopupLine } from '../ui/ExpandPopup';
import { PillAction, unit } from '../../ds';
import { sound } from '../../utils/audio';

const LINKS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'X', href: 'https://x.com' },
  { label: 'GitHub', href: 'https://github.com' },
];

const EmailPill: React.FC = () => {
  const [copied, setCopied] = useState(false);
  return (
    <PillAction
      label={copied ? 'Copiado' : 'studio@aquila.design'}
      icon={copied ? '✓' : '⧉'}
      onClick={() => {
        navigator.clipboard?.writeText('studio@aquila.design').catch(() => {});
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2400);
      }}
    />
  );
};

const Links: React.FC = () => (
  <ul className="flex flex-wrap items-center justify-center" style={{ columnGap: unit(2), rowGap: unit(0.8) }}>
    {LINKS.map((l) => (
      <li key={l.label}>
        <a
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sound.click()}
          className="j-label block transition-opacity duration-300 hover:opacity-60"
        >
          {l.label}
        </a>
      </li>
    ))}
  </ul>
);

/** About, laid out like Jesper's Profile: one paragraph, a label, links, the email pill. */
export const StudioPopup: React.FC = () => (
  <>
    <PopupLine>
      <p className="j-text mx-auto" style={{ maxWidth: unit(42) }}>
        Aquila engineers visually rich, motion-driven spatial computing interfaces, WebGL installations, and digital brand
        identities. Operating at the intersection of computational rigor and radical minimalism.
      </p>
    </PopupLine>
    <PopupLine>
      <p className="j-label opacity-60" style={{ marginTop: unit(2.5) }}>
        18× Awwwards, 12× FWA, 4× Webby
      </p>
    </PopupLine>
    <PopupLine className="w-full">
      <div style={{ marginTop: unit(2.5) }}>
        <Links />
      </div>
    </PopupLine>
    <PopupLine>
      <div style={{ marginTop: unit(2.5) }}>
        <EmailPill />
      </div>
    </PopupLine>
  </>
);

/** Contact: the shortest possible lens content. */
export const ContactPopup: React.FC = () => (
  <>
    <PopupLine>
      <p className="j-title">Vamos conversar.</p>
    </PopupLine>
    <PopupLine>
      <p className="j-text opacity-70 mx-auto" style={{ marginTop: unit(1.2), maxWidth: unit(30) }}>
        Conte-nos sobre o seu negócio. Respondemos no mesmo dia útil.
      </p>
    </PopupLine>
    <PopupLine>
      <div style={{ marginTop: unit(2.5) }}>
        <EmailPill />
      </div>
    </PopupLine>
    <PopupLine className="w-full">
      <div style={{ marginTop: unit(2.5) }}>
        <Links />
      </div>
    </PopupLine>
  </>
);
