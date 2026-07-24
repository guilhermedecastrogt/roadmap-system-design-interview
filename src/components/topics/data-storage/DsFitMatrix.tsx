'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, CircleDot, XCircle, type LucideIcon } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { dataStorageContent, type Fit, type StoreKind } from './content';
import { DsHeading, STORE_ICONS } from './DsKit';

const FIT_ICON: Record<Fit, LucideIcon> = {
  best: CheckCircle2,
  ok: CircleDot,
  poor: XCircle,
};

const FIT_TEXT: Record<Fit, string> = {
  best: 'text-emerald-500',
  ok: 'text-amber-500',
  poor: 'text-rose-500',
};

const FIT_CARD: Record<Fit, string> = {
  best: 'border-emerald-500/40 bg-emerald-500/[0.06]',
  ok: 'border-amber-500/30 bg-amber-500/[0.04]',
  poor: 'border-border bg-surface opacity-70',
};

/**
 * Fit matrix: tap a piece of data (user record, photo, 4K video, logs…) and
 * watch database, file system, and object storage light up by how well they
 * fit — with the reasoning spelled out underneath.
 */
export function DsFitMatrix({ locale }: { locale: Locale }) {
  const t = dataStorageContent[locale].compare;
  const [activeId, setActiveId] = useState(t.items[1].id);
  const active = t.items.find((i) => i.id === activeId) ?? t.items[0];

  return (
    <div className="not-prose">
      <DsHeading title={t.title} subtitle={t.subtitle} />

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-widest text-muted">
          {t.tapHint}
        </p>

        {/* data chips */}
        <div className="flex flex-wrap gap-2">
          {t.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                item.id === activeId
                  ? 'border-accent bg-accent text-accent-fg shadow-sm'
                  : 'border-border bg-surface text-muted hover:border-accent/40 hover:text-fg',
              )}
            >
              {item.label}
              <span
                className={cn(
                  'ml-1.5 font-mono text-[0.6rem]',
                  item.id === activeId ? 'text-accent-fg/80' : 'text-muted/70',
                )}
              >
                {item.size}
              </span>
            </button>
          ))}
        </div>

        {/* store fit cards */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {(['db', 'fs', 'obj'] as const).map((store: StoreKind) => {
            const fit = active.fit[store];
            const StoreIcon = STORE_ICONS[store];
            const FitIcon = FIT_ICON[fit];
            return (
              <motion.div
                key={store}
                layout
                animate={{ scale: fit === 'best' ? 1.02 : 1 }}
                className={cn('rounded-xl border p-4 transition-colors', FIT_CARD[fit])}
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface-2 text-muted">
                    <StoreIcon className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-fg">{t.stores[store].label}</p>
                    <p className="text-[0.65rem] text-muted">{t.stores[store].tagline}</p>
                  </div>
                </div>
                <motion.div
                  key={`${active.id}-${store}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold',
                    FIT_TEXT[fit],
                  )}
                >
                  <FitIcon className="h-3.5 w-3.5" aria-hidden />
                  {t.fitLabels[fit]}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* why */}
        <AnimatePresence mode="wait">
          <motion.p
            key={active.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-lg border border-accent/30 bg-accent/[0.06] p-3 text-xs leading-relaxed text-fg/85"
          >
            {active.why}
          </motion.p>
        </AnimatePresence>

        <p className="mt-3 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted">
          {t.note}
        </p>
      </div>
    </div>
  );
}
