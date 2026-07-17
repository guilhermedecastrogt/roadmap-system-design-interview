'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppWindow, KeyRound, Search, Sparkles, Table2, type LucideIcon } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { databaseContent, type PolyglotStore } from './content';
import { DbHeading } from './DbKit';

type StoreId = PolyglotStore['id'];

const STORE_META: Record<StoreId, { icon: LucideIcon; text: string; dot: string; y: number }> = {
  core: { icon: Table2, text: 'text-accent', dot: 'bg-accent shadow-accent/40', y: 11 },
  kv: { icon: KeyRound, text: 'text-rose-500', dot: 'bg-rose-500 shadow-rose-500/40', y: 37 },
  search: { icon: Search, text: 'text-sky-500', dot: 'bg-sky-500 shadow-sky-500/40', y: 63 },
  vector: { icon: Sparkles, text: 'text-fuchsia-500', dot: 'bg-fuchsia-500 shadow-fuchsia-500/40', y: 89 },
};

type FlyingDot = { id: number; store: StoreId };

/**
 * Polyglot persistence in motion: one application, four stores. Tapping a
 * feature fires a request dot along the lane to the database that fits that
 * job, pulses it, and explains why that store — and not another — gets it.
 */
export function DbPolyglot({ locale }: { locale: Locale }) {
  const t = databaseContent[locale].polyglot;

  const [dots, setDots] = useState<FlyingDot[]>([]);
  const [hits, setHits] = useState<Record<StoreId, number>>({ core: 0, kv: 0, search: 0, vector: 0 });
  const [lastAction, setLastAction] = useState<number | null>(null);
  const [pulse, setPulse] = useState<StoreId | null>(null);
  const idRef = useRef(0);

  function fire(actionIdx: number) {
    const store = t.actions[actionIdx].store;
    setLastAction(actionIdx);
    setDots((prev) => [...prev, { id: idRef.current++, store }]);
  }

  function land(dot: FlyingDot) {
    setDots((prev) => prev.filter((d) => d.id !== dot.id));
    setHits((prev) => ({ ...prev, [dot.store]: prev[dot.store] + 1 }));
    setPulse(dot.store);
    setTimeout(() => setPulse((p) => (p === dot.store ? null : p)), 400);
  }

  const activeStore = lastAction !== null ? t.actions[lastAction].store : null;

  return (
    <div className="not-prose">
      <DbHeading title={t.title} subtitle={t.subtitle} />

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        {/* feature buttons */}
        <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
          {t.actions.map((action, i) => (
            <button
              key={action.id}
              type="button"
              onClick={() => fire(i)}
              className={cn(
                'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                lastAction === i
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border bg-surface text-fg hover:border-accent/50',
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
        <p className="mb-4 text-center text-[0.7rem] text-muted">{t.tapHint}</p>

        {/* stage */}
        <div className="grid grid-cols-[auto_1fr_auto] items-stretch gap-2 sm:gap-4">
          {/* app */}
          <div className="grid place-items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className="grid h-14 w-14 place-items-center rounded-xl border-2 border-accent/60 bg-surface text-accent shadow-sm">
                <AppWindow className="h-6 w-6" aria-hidden />
              </div>
              <div className="text-xs font-semibold text-fg">{t.app}</div>
            </div>
          </div>

          {/* lanes */}
          <div className="relative min-w-[3rem]">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              {t.stores.map((store) => (
                <path
                  key={store.id}
                  d={`M 0 50 C 45 50, 55 ${STORE_META[store.id].y}, 100 ${STORE_META[store.id].y}`}
                  fill="none"
                  strokeWidth={activeStore === store.id ? 2.5 : 1.5}
                  vectorEffect="non-scaling-stroke"
                  className={cn(
                    'transition-all',
                    activeStore === store.id ? 'stroke-accent/70' : 'stroke-border',
                  )}
                />
              ))}
            </svg>
            <AnimatePresence>
              {dots.map((dot) => {
                const meta = STORE_META[dot.store];
                return (
                  <motion.div
                    key={dot.id}
                    className={cn('absolute z-10 h-3 w-3 rounded-full shadow', meta.dot)}
                    initial={{ left: '0%', top: '50%', x: '-50%', y: '-50%', opacity: 0 }}
                    animate={{
                      left: ['0%', '50%', '97%'],
                      top: ['50%', `${(50 + meta.y) / 2}%`, `${meta.y}%`],
                      opacity: [0, 1, 1],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                    onAnimationComplete={() => land(dot)}
                  />
                );
              })}
            </AnimatePresence>
          </div>

          {/* stores */}
          <div className="flex flex-col justify-between gap-3 py-1">
            {t.stores.map((store) => {
              const meta = STORE_META[store.id];
              const StoreIcon = meta.icon;
              return (
                <motion.div
                  key={store.id}
                  animate={pulse === store.id ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className={cn(
                    'flex w-52 items-center gap-2.5 rounded-xl border bg-surface p-2.5 transition-colors sm:w-60',
                    pulse === store.id || activeStore === store.id
                      ? 'border-accent/60 shadow-sm'
                      : 'border-border',
                  )}
                >
                  <span
                    className={cn(
                      'grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-2',
                      meta.text,
                    )}
                  >
                    <StoreIcon className="h-[18px] w-[18px]" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-fg">{store.label}</div>
                    <div className="truncate font-mono text-[0.6rem] text-muted">{store.tech}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-mono text-sm font-bold tabular-nums text-fg">
                      {hits[store.id]}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* action note */}
        <div className="mt-4 min-h-[3rem]">
          <AnimatePresence mode="wait">
            {lastAction !== null && (
              <motion.p
                key={lastAction}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-lg border border-accent/30 bg-accent/[0.06] p-3 text-xs leading-relaxed text-fg/85"
              >
                {t.actions[lastAction].note}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* store roles */}
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {t.stores.map((store) => (
            <div key={store.id} className="rounded-lg border border-border bg-surface p-2.5 text-xs">
              <span className={cn('font-semibold', STORE_META[store.id].text)}>{store.label}: </span>
              <span className="text-muted">{store.role}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted">
          {t.note}
        </p>
      </div>
    </div>
  );
}
