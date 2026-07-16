'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeftRight,
  FileCheck2,
  Gauge,
  KeyRound,
  Shield,
  ShieldCheck,
  Split,
  Stamp,
  type LucideIcon,
} from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { gatewayContent } from './content';
import { GwHeading } from './GwKit';

const ICONS: Record<string, LucideIcon> = {
  auth: KeyRound,
  authz: ShieldCheck,
  approve: Stamp,
  validation: FileCheck2,
  ratelimit: Gauge,
  protection: Shield,
  routing: Split,
  protocol: ArrowLeftRight,
};

/**
 * Interactive map of everything a gateway can take on. Tap a responsibility
 * card to inspect what it does, a concrete example, and — the nuance the
 * lesson insists on — whether it belongs in the gateway or in the service.
 */
export function GwResponsibilities({ locale }: { locale: Locale }) {
  const t = gatewayContent[locale].responsibilities;
  const [selected, setSelected] = useState(0);
  const item = t.items[selected];
  const Icon = ICONS[item.id] ?? Shield;

  return (
    <div className="not-prose">
      <GwHeading title={t.title} subtitle={t.subtitle} />

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* card grid */}
        <div>
          <div className="grid grid-cols-2 gap-2">
            {t.items.map((it, i) => {
              const ItemIcon = ICONS[it.id] ?? Shield;
              const active = selected === i;
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setSelected(i)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all',
                    active
                      ? 'border-accent bg-accent/10 shadow-sm'
                      : 'border-border bg-surface hover:border-accent/40',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-8 w-8 shrink-0 place-items-center rounded-lg',
                      active ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-muted',
                    )}
                  >
                    <ItemIcon className="h-4 w-4" aria-hidden />
                  </span>
                  <span
                    className={cn(
                      'text-sm font-semibold leading-tight',
                      active ? 'text-accent' : 'text-fg',
                    )}
                  >
                    {it.label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-[0.7rem] text-muted">{t.tapHint}</p>
        </div>

        {/* detail panel */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h4 className="font-display text-lg font-semibold text-fg">{item.label}</h4>
              </div>

              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
                    {t.whatLabel}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-fg/85">{item.what}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
                    {t.exampleLabel}
                  </dt>
                  <dd className="mt-1 rounded-lg bg-surface-2 p-2.5 font-mono text-xs leading-relaxed text-fg/85">
                    {item.example}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
                    {t.whereLabel}
                  </dt>
                  <dd className="mt-1 text-sm font-medium leading-relaxed text-accent">
                    {item.where}
                  </dd>
                </div>
              </dl>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.07] p-3 text-xs leading-relaxed text-fg/85">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
        {t.warning}
      </p>
    </div>
  );
}
