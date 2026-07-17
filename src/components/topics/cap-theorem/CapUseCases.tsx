'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Banknote,
  Heart,
  MessageCircle,
  PackageCheck,
  ServerCog,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { capContent } from './content';
import { CapHeading } from './CapKit';

const CASE_ICONS: Record<string, LucideIcon> = {
  feed: Heart,
  bank: Banknote,
  cart: ShoppingCart,
  inventory: PackageCheck,
  chat: MessageCircle,
  config: ServerCog,
};

/**
 * AP-or-CP guessing game: for each real-world system the learner picks which
 * side should win during a partition, then sees the usual industry choice and
 * why. Reinforces that the stance is chosen per data type, not per company.
 */
export function CapUseCases({ locale }: { locale: Locale }) {
  const t = capContent[locale].useCases;
  const [guesses, setGuesses] = useState<Record<string, 'ap' | 'cp'>>({});

  return (
    <div className="not-prose">
      <CapHeading title={t.title} subtitle={t.subtitle} />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {t.cases.map((c, i) => {
          const Icon = CASE_ICONS[c.id] ?? Heart;
          const guess = guesses[c.id];
          const revealed = guess !== undefined;
          const right = guess === c.answer;

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.35, delay: (i % 2) * 0.08 }}
              className={cn(
                'flex flex-col rounded-2xl border bg-surface p-4 transition-colors',
                revealed
                  ? c.answer === 'ap'
                    ? 'border-emerald-500/40'
                    : 'border-sky-500/40'
                  : 'border-border hover:border-accent/40',
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-fg">{c.label}</p>
                  <p className="text-xs text-muted">{c.detail}</p>
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {!revealed ? (
                  <motion.div
                    key="ask"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-3"
                  >
                    <p className="text-xs text-muted">{t.question}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setGuesses((g) => ({ ...g, [c.id]: 'ap' }))}
                        className="flex-1 rounded-lg border border-emerald-500/40 bg-emerald-500/[0.06] px-2 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/15 dark:text-emerald-400"
                      >
                        {t.apBtn}
                      </button>
                      <button
                        type="button"
                        onClick={() => setGuesses((g) => ({ ...g, [c.id]: 'cp' }))}
                        className="flex-1 rounded-lg border border-sky-500/40 bg-sky-500/[0.06] px-2 py-1.5 text-xs font-semibold text-sky-600 transition-colors hover:bg-sky-500/15 dark:text-sky-400"
                      >
                        {t.cpBtn}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="reveal"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'rounded-md px-2 py-0.5 font-mono text-xs font-bold uppercase text-white',
                          c.answer === 'ap' ? 'bg-emerald-500' : 'bg-sky-500',
                        )}
                      >
                        {t.revealPrefix} {c.answer.toUpperCase()}
                      </span>
                      <span
                        className={cn(
                          'text-xs font-medium',
                          right ? 'text-emerald-500' : 'text-amber-500',
                        )}
                      >
                        {right ? t.correct : t.incorrect}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-fg/85">{c.why}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-4 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted">
        {t.note}
      </p>
    </div>
  );
}
