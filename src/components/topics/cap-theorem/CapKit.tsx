'use client';

import { CheckCircle2, Globe, ShieldCheck, type LucideIcon } from 'lucide-react';
import { type CapLetter } from './content';

/** Small heading used above each interactive section. */
export function CapHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-fg">{title}</h3>
      {subtitle && <p className="mt-1 max-w-3xl text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

/** One icon per CAP letter, shared by the triangle and the pair cards. */
export const CAP_ICONS: Record<CapLetter, LucideIcon> = {
  c: CheckCircle2,
  a: ShieldCheck,
  p: Globe,
};

/** Accent text class per letter, for consistent colour-coding across visuals. */
export const CAP_TEXT: Record<CapLetter, string> = {
  c: 'text-sky-500',
  a: 'text-emerald-500',
  p: 'text-violet-500',
};

/** Solid background class per letter (vertex chips). */
export const CAP_BG: Record<CapLetter, string> = {
  c: 'bg-sky-500',
  a: 'bg-emerald-500',
  p: 'bg-violet-500',
};

/** Border tint per letter. */
export const CAP_BORDER: Record<CapLetter, string> = {
  c: 'border-sky-500/40',
  a: 'border-emerald-500/40',
  p: 'border-violet-500/40',
};
