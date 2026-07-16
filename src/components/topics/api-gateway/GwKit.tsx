'use client';

import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

/** Small heading used above each interactive section. */
export function GwHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-fg">{title}</h3>
      {subtitle && <p className="mt-1 max-w-3xl text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

/** Boxed node (frontend / gateway / service) used across the gateway visuals. */
export function GwNode({
  icon: Icon,
  label,
  sub,
  active,
  tone = 'accent',
  size = 'md',
}: {
  icon: LucideIcon;
  label: string;
  sub?: string;
  active?: boolean;
  tone?: 'accent' | 'emerald' | 'rose' | 'violet' | 'amber';
  size?: 'sm' | 'md';
}) {
  const toneText = {
    accent: 'text-accent',
    emerald: 'text-emerald-500',
    rose: 'text-rose-500',
    violet: 'text-violet-500',
    amber: 'text-amber-500',
  }[tone];

  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div
        className={cn(
          'grid place-items-center rounded-xl border bg-surface transition-all',
          size === 'sm' ? 'h-11 w-11' : 'h-14 w-14',
          active ? cn('border-current shadow-md', toneText) : 'border-border text-muted',
        )}
      >
        <Icon className={size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'} aria-hidden />
      </div>
      <div className="text-xs font-semibold leading-tight text-fg">{label}</div>
      {sub && <div className="font-mono text-[0.6rem] text-muted">{sub}</div>}
    </div>
  );
}

/** Monospace method + path chip, e.g. `GET /users/42`. */
export function GwRequestChip({
  method,
  path,
  className,
}: {
  method: string;
  path: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-xs',
        className,
      )}
    >
      <span className="font-bold text-accent">{method}</span>
      <span className="text-fg/85">{path}</span>
    </span>
  );
}

/** Coloured HTTP status badge — emerald for 2xx, rose otherwise. */
export function GwStatusBadge({ code, text }: { code: number; text?: string }) {
  const ok = code < 400;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[0.65rem] font-bold',
        ok ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500',
      )}
    >
      {code}
      {text && <span className="font-medium">{text}</span>}
    </span>
  );
}
