'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, ListChecks, ShieldCheck } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { twContent, type ReqGroup } from './content';
import { TwHeading, TwStage } from './TwKit';

const LENS_ICON: Record<ReqGroup, typeof ListChecks> = {
  functional: ListChecks,
  nonFunctional: Gauge,
  operational: ShieldCheck,
};

/**
 * Requirements board — three lenses (functional, non-functional, operational)
 * over the same system. Tapping a lens animates the card grid, reinforcing
 * that each view reframes the whole design.
 */
export function TwRequirements({ locale }: { locale: Locale }) {
  const c = twContent[locale].requirements;
  const [lens, setLens] = useState<ReqGroup>('functional');
  const items = c.groups[lens];

  return (
    <div className="not-prose">
      <TwHeading title={c.title} subtitle={c.subtitle} />

      <TwStage>
        <div className="inline-flex flex-wrap rounded-lg border border-border bg-surface p-1">
          {c.lenses.map((l) => {
            const Icon = LENS_ICON[l.id];
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => setLens(l.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  lens === l.id ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {l.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={lens}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/40"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-fg">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <p className="mt-4 text-xs leading-relaxed text-muted">{c.hint}</p>
      </TwStage>
    </div>
  );
}
