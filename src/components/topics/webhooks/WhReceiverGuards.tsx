'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ApiHeading, ApiNote, ApiPanel } from '../api-track/ApiKit';
import { webhooksContent, type GuardId } from './content';

/**
 * Five guards every webhook receiver needs, as switches. Turning one off does
 * not break an animation — it adds the incident it was preventing to the panel
 * below, which is the point: each guard exists because of a real failure.
 */
export function WhReceiverGuards({ locale }: { locale: Locale }) {
  const t = webhooksContent[locale].receiver;
  const [off, setOff] = useState<GuardId[]>([]);

  const exposed = t.guards.filter((g) => off.includes(g.id));

  function toggle(id: GuardId) {
    setOff((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="not-prose">
      <ApiHeading title={t.title} subtitle={t.subtitle} />

      <ApiPanel>
        <ul className="space-y-2">
          {t.guards.map((g) => {
            const on = !off.includes(g.id);
            return (
              <li
                key={g.id}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-3 transition-colors',
                  on ? 'border-emerald-500/40 bg-emerald-500/[0.05]' : 'border-rose-500/40 bg-rose-500/[0.05]',
                )}
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => toggle(g.id)}
                  className={cn(
                    'mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors',
                    on ? 'bg-emerald-500' : 'bg-surface-2',
                  )}
                >
                  <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                    className={cn(
                      'h-4 w-4 rounded-full bg-surface shadow',
                      on ? 'ml-auto' : 'mr-auto',
                    )}
                  />
                </button>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-fg">{g.label}</span>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 font-mono text-[0.58rem] font-bold uppercase',
                        on ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500',
                      )}
                    >
                      {on ? t.onLabel : t.offLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.78rem] leading-relaxed text-muted">{g.does}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <AnimatePresence mode="wait">
          {exposed.length === 0 ? (
            <motion.div
              key="healthy"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/[0.07] p-3.5"
            >
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-500">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                {t.healthyTitle}
              </p>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-fg/85">{t.healthy}</p>
            </motion.div>
          ) : (
            <motion.div
              key="risk"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/[0.06] p-3.5"
            >
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-500">
                <AlertTriangle className="h-4 w-4" aria-hidden />
                {t.riskTitle}
              </p>
              <ul className="mt-2 space-y-2">
                {exposed.map((g) => (
                  <motion.li
                    key={g.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[0.8rem] leading-relaxed text-fg/85"
                  >
                    <span className="font-semibold text-fg">{g.label}: </span>
                    {g.risk}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </ApiPanel>

      <ApiNote>{t.note}</ApiNote>
    </div>
  );
}
