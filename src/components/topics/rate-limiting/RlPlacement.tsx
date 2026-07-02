'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Laptop, Network, Server, ShieldCheck, ArrowRight, Check, TriangleAlert } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { rateLimitContent, type PlacementLayer } from './content';

const ICONS = {
  client: Laptop,
  gateway: ShieldCheck,
  proxy: Network,
  backend: Server,
} as const;

export function RlPlacement({ locale }: { locale: Locale }) {
  const c = rateLimitContent[locale];
  const p = c.placement;
  const [active, setActive] = useState<PlacementLayer['id']>('gateway');
  const layer = p.layers.find((l) => l.id === active)!;

  return (
    <div className="not-prose">
      <h3 className="font-display text-xl font-semibold text-fg">{p.title}</h3>
      <p className="mt-1 max-w-3xl text-sm text-muted">{p.subtitle}</p>

      {/* flow of layers */}
      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        <div className="flex items-stretch gap-1 overflow-x-auto pb-2 sm:gap-2">
          {p.layers.map((l, i) => {
            const Icon = ICONS[l.id];
            const isActive = active === l.id;
            return (
              <div key={l.id} className="flex flex-1 items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setActive(l.id)}
                  className={cn(
                    'relative flex min-w-[6.5rem] flex-1 flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors',
                    isActive
                      ? 'border-accent bg-accent/[0.08] shadow-sm'
                      : 'border-border bg-surface hover:border-accent/40',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="rl-limit-badge"
                      className="absolute -top-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[0.6rem] font-bold text-accent-fg shadow"
                    >
                      <ShieldCheck className="h-3 w-3" aria-hidden />
                      limit
                    </motion.span>
                  )}
                  <span
                    className={cn(
                      'grid h-10 w-10 place-items-center rounded-lg border',
                      isActive ? 'border-accent/50 text-accent' : 'border-border text-muted',
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="text-xs font-semibold leading-tight text-fg">{l.label}</span>
                  <span className="font-mono text-[0.55rem] uppercase tracking-wide text-muted">
                    {l.tag}
                  </span>
                </button>
                {i < p.layers.length - 1 && (
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-1 text-center font-mono text-[0.6rem] uppercase tracking-wide text-muted">
          {p.tapHint}
        </p>

        {/* detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={layer.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mt-4 rounded-xl border border-border bg-surface p-4"
          >
            <p className="text-sm leading-relaxed text-fg/90">{layer.detail}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                <div>
                  <div className="font-mono text-[0.6rem] uppercase tracking-wide text-emerald-500">
                    {p.proLabel}
                  </div>
                  <div className="text-xs text-fg/85">{layer.pro}</div>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] p-2.5">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                <div>
                  <div className="font-mono text-[0.6rem] uppercase tracking-wide text-amber-500">
                    {p.conLabel}
                  </div>
                  <div className="text-xs text-fg/85">{layer.con}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
