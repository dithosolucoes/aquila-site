import React from 'react';
import { sound } from '../utils/audio';

/**
 * Aquila Design System building blocks, following Jesper Landberg's interface:
 * uppercase 10-unit labels that dim on hover, white round buttons, black pills,
 * 20-unit rounded cards, no borders or shadows.
 */

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

const unit = (n: number) => `calc(var(--j) * ${n})`;

/** Jesper's text link: an uppercase label that dims on hover. */
export const TextButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; dim?: boolean }
> = ({ active = true, dim = false, className, onClick, ...rest }) => (
  <button
    type="button"
    {...rest}
    onClick={(e) => {
      sound.click();
      onClick?.(e);
    }}
    className={cx(
      'j-label relative cursor-pointer transition-opacity duration-300 ease-out before:absolute before:-inset-3',
      active && !dim ? 'opacity-100 hover:opacity-60' : 'opacity-50 hover:opacity-100',
      className
    )}
  />
);

/** White circle with a black glyph (Jesper's "+", subscribe and close buttons). */
export const RoundButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; size?: number; tone?: 'light' | 'dark' }
> = ({ label, size = 4.5, tone = 'light', className, onClick, children, style, ...rest }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    {...rest}
    onClick={(e) => {
      sound.click();
      onClick?.(e);
    }}
    style={{ width: unit(size), height: unit(size), fontSize: unit(1.6), ...style }}
    className={cx(
      'inline-flex flex-none items-center justify-center rounded-full cursor-pointer transition-transform duration-500 ease-[var(--ease-content)] hover:scale-105',
      tone === 'light' ? 'bg-paper text-ink' : 'bg-ink text-paper',
      className
    )}
  >
    {children}
  </button>
);

/** Jesper's newsletter form shape: a black pill + a white round button. */
export const PillAction: React.FC<{
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  icon?: React.ReactNode;
  className?: string;
}> = ({ label, onClick, icon = '↗', className }) => (
  <button
    type="button"
    onClick={(e) => {
      sound.click();
      onClick?.(e);
    }}
    className={cx('group inline-flex items-center cursor-pointer', className)}
    style={{ gap: unit(0.8) }}
  >
    <span
      className="flex items-center rounded-full bg-white/[0.09] j-text text-paper transition-colors duration-300 group-hover:bg-white/[0.16]"
      style={{ height: unit(4.5), paddingInline: unit(2) }}
    >
      {label}
    </span>
    <span
      className="flex flex-none items-center justify-center rounded-full bg-paper text-ink transition-transform duration-500 ease-[var(--ease-content)] group-hover:rotate-45"
      style={{ width: unit(4.5), height: unit(4.5), fontSize: unit(1.6) }}
      aria-hidden="true"
    >
      {icon}
    </span>
  </button>
);

export const Label: React.FC<{ children: React.ReactNode; className?: string; dim?: boolean }> = ({
  children,
  className,
  dim = true,
}) => <p className={cx('j-label', dim && 'opacity-60', className)}>{children}</p>;

/** 20-unit rounded surface, no border, no shadow. */
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, style, ...rest }) => (
  <div {...rest} className={cx('bg-surface', className)} style={{ borderRadius: unit(2), ...style }} />
);

/** Aquila's hairline. */
export const Rule: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cx('h-px w-full bg-line', className)} />
);

export { unit };
