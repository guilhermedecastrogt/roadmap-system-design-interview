'use client';

import { type ReactNode } from 'react';
import { RotateCcw, Send, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Shared UI primitives for the four API-communication lessons. Keeping them in
 * one place is what makes "What is an API?", REST, Webhooks and GraphQL feel
 * like one connected track instead of four unrelated pages.
 */

export type Tone = 'accent' | 'emerald' | 'rose' | 'amber' | 'violet' | 'sky' | 'muted';

export const toneText: Record<Tone, string> = {
  accent: 'text-accent',
  emerald: 'text-emerald-500',
  rose: 'text-rose-500',
  amber: 'text-amber-500',
  violet: 'text-violet-500',
  sky: 'text-sky-500',
  muted: 'text-muted',
};

export const toneBorder: Record<Tone, string> = {
  accent: 'border-accent',
  emerald: 'border-emerald-500',
  rose: 'border-rose-500',
  amber: 'border-amber-500',
  violet: 'border-violet-500',
  sky: 'border-sky-500',
  muted: 'border-border',
};

export const toneBg: Record<Tone, string> = {
  accent: 'bg-accent/10',
  emerald: 'bg-emerald-500/10',
  rose: 'bg-rose-500/10',
  amber: 'bg-amber-500/10',
  violet: 'bg-violet-500/10',
  sky: 'bg-sky-500/10',
  muted: 'bg-surface-2',
};

/** Section heading used above every interactive block in the track. */
export function ApiHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-fg">{title}</h3>
      {subtitle && <p className="mt-1 max-w-3xl text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

/** The standard bordered stage every simulation lives inside. */
export function ApiPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mt-5 rounded-2xl border border-border bg-surface/40 p-4 sm:p-5', className)}>
      {children}
    </div>
  );
}

/** Primary action ("Send request", "Run query", "Trigger event"). */
export function RunButton({
  label,
  onClick,
  running,
  runningLabel,
  icon: Icon = Send,
}: {
  label: string;
  onClick: () => void;
  running?: boolean;
  runningLabel?: string;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={running}
      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30 disabled:opacity-60"
    >
      <Icon className="h-4 w-4" aria-hidden />
      {running && runningLabel ? runningLabel : label}
    </button>
  );
}

/** Secondary action — clears the stage. */
export function ResetButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      <RotateCcw className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}

/** Pill row used for scenarios, methods, tabs. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
}: {
  options: { id: T; label: string; tone?: Tone }[];
  value: T;
  onChange: (id: T) => void;
  label?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {label && (
        <span className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">{label}</span>
      )}
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = o.id === value;
          const tone = o.tone ?? 'accent';
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={cn(
                'rounded-lg border font-medium transition-colors',
                size === 'sm' ? 'px-2 py-1 text-[0.7rem]' : 'px-2.5 py-1.5 text-xs',
                active
                  ? cn(toneBorder[tone], toneBg[tone], toneText[tone])
                  : 'border-border text-muted hover:text-fg',
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Boxed participant (client, API, service, database, provider…). */
export function ApiNode({
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
  tone?: Tone;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div
        className={cn(
          'grid place-items-center rounded-xl border bg-surface transition-all',
          size === 'sm' ? 'h-11 w-11' : 'h-14 w-14',
          active ? cn('border-current shadow-md', toneText[tone]) : 'border-border text-muted',
        )}
      >
        <Icon className={size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'} aria-hidden />
      </div>
      <div className="text-xs font-semibold leading-tight text-fg">{label}</div>
      {sub && <div className="font-mono text-[0.6rem] text-muted">{sub}</div>}
    </div>
  );
}

const METHOD_TONE: Record<string, Tone> = {
  GET: 'sky',
  POST: 'emerald',
  PUT: 'amber',
  PATCH: 'violet',
  DELETE: 'rose',
  QUERY: 'sky',
  MUTATION: 'emerald',
};

/** `GET /tweets` chip, coloured by method the way an HTTP client would. */
export function MethodChip({
  method,
  path,
  className,
}: {
  method: string;
  path?: string;
  className?: string;
}) {
  const tone = METHOD_TONE[method.toUpperCase()] ?? 'accent';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-xs',
        className,
      )}
    >
      <span className={cn('font-bold', toneText[tone])}>{method}</span>
      {path && <span className="text-fg/85">{path}</span>}
    </span>
  );
}

/** HTTP status pill — emerald for 2xx/3xx, amber for 4xx, rose for 5xx. */
export function StatusPill({ code, text }: { code: number; text?: string }) {
  const tone: Tone = code < 400 ? 'emerald' : code < 500 ? 'amber' : 'rose';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[0.65rem] font-bold',
        toneBg[tone],
        toneText[tone],
      )}
    >
      {code}
      {text && <span className="font-medium">{text}</span>}
    </span>
  );
}

/**
 * Monospace surface used for request/response/payload bodies. `lines` renders
 * pre-formatted text; `dim` fades it while a call is still in flight.
 */
export function CodeSurface({
  title,
  right,
  body,
  dim,
  tone = 'muted',
  className,
}: {
  title?: string;
  right?: ReactNode;
  body: string;
  dim?: boolean;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-surface transition-colors',
        tone === 'muted' ? 'border-border' : cn(toneBorder[tone], 'border-opacity-50'),
        className,
      )}
    >
      {(title || right) && (
        <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-2/60 px-3 py-1.5">
          <span className="font-mono text-[0.65rem] uppercase tracking-wide text-muted">
            {title}
          </span>
          {right}
        </div>
      )}
      <pre
        className={cn(
          'overflow-x-auto p-3 font-mono text-[0.7rem] leading-5 text-fg/85 transition-opacity',
          dim && 'opacity-40',
        )}
      >
        {body}
      </pre>
    </div>
  );
}

/** Small labelled fact, used under nodes and inside inspectors. */
export function FactRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-t border-border pt-2 first:border-0 first:pt-0">
      <dt className="font-mono text-[0.62rem] uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-[0.8rem] leading-relaxed text-fg/85">{value}</dd>
    </div>
  );
}

/** Footnote line closing an interactive block. */
export function ApiNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted">
      {children}
    </p>
  );
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
