'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, LifeBuoy, ShieldCheck, Wrench } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { twContent } from './content';
import { TwHeading, TwStage } from './TwKit';

type Status = 'ok' | 'degraded' | 'down';

/** Per-scenario health of each component. Language-independent, so it lives here. */
const MATRIX: Record<string, Record<string, Status>> = {
  redis: { writes: 'ok', reads: 'degraded', cache: 'down', content: 'ok', events: 'ok', search: 'ok', media: 'ok' },
  mongo: { writes: 'degraded', reads: 'ok', cache: 'ok', content: 'degraded', events: 'ok', search: 'ok', media: 'ok' },
  kafka: { writes: 'ok', reads: 'degraded', cache: 'ok', content: 'ok', events: 'down', search: 'degraded', media: 'ok' },
  region: { writes: 'degraded', reads: 'degraded', cache: 'degraded', content: 'degraded', events: 'degraded', search: 'degraded', media: 'degraded' },
};

const STATUS_STYLE: Record<Status, { dot: string; chip: string; text: string }> = {
  ok: { dot: 'rgb(16 185 129)', chip: 'border-emerald-500/40 bg-emerald-500/[0.06]', text: 'text-emerald-500' },
  degraded: { dot: 'rgb(245 158 11)', chip: 'border-amber-500/40 bg-amber-500/[0.07]', text: 'text-amber-500' },
  down: { dot: 'rgb(239 68 68)', chip: 'border-red-500/50 bg-red-500/[0.08]', text: 'text-red-500' },
};

export function TwFailureSim({ locale }: { locale: Locale }) {
  const c = twContent[locale].failures;
  const [active, setActive] = useState(c.scenarios[0].id);
  const scenario = c.scenarios.find((s) => s.id === active)!;
  const statuses = MATRIX[active];

  return (
    <div className="not-prose">
      <TwHeading title={c.title} subtitle={c.subtitle} />

      <TwStage>
        {/* scenario picker */}
        <div className="flex flex-wrap gap-2">
          {c.scenarios.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                active === s.id
                  ? 'border-red-500/60 bg-red-500/10 text-red-500'
                  : 'border-border text-muted hover:text-fg',
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
              {s.label}
            </button>
          ))}
        </div>

        {/* blast radius */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-mono text-[0.62rem] uppercase tracking-widest text-muted">{c.componentsLabel}</p>
            <div className="flex gap-3">
              {(['ok', 'degraded', 'down'] as Status[]).map((s) => (
                <span key={s} className="inline-flex items-center gap-1 text-[0.62rem] text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ background: STATUS_STYLE[s].dot }} aria-hidden />
                  {c.statusLabels[s]}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {c.components.map((comp) => {
              const st = statuses[comp.id];
              const style = STATUS_STYLE[st];
              return (
                <motion.div
                  key={comp.id}
                  layout
                  animate={{ scale: st === 'down' ? [1, 1.04, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: st === 'down' ? Infinity : 0, repeatDelay: 0.6 }}
                  className={cn('rounded-xl border p-2.5 text-center', style.chip)}
                >
                  <span className="mx-auto mb-1 block h-2 w-2 rounded-full" style={{ background: style.dot }} aria-hidden />
                  <span className="block text-[0.68rem] font-semibold leading-tight text-fg">{comp.label}</span>
                  <span className={cn('mt-0.5 block text-[0.58rem] font-bold uppercase tracking-wide', style.text)}>
                    {c.statusLabels[st]}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* explanation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="mt-5 grid gap-3 md:grid-cols-3"
          >
            <ExplainCard icon={AlertTriangle} tint="rgb(239 68 68)" label={c.impactLabel} text={scenario.impact} />
            <ExplainCard icon={ShieldCheck} tint="rgb(16 185 129)" label={c.survivesLabel} text={scenario.survives} />
            <ExplainCard icon={Wrench} tint="rgb(56 189 248)" label={c.recoveryLabel} text={scenario.recovery} />
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/[0.06] px-3 py-2.5">
          <LifeBuoy className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          <p className="text-xs leading-relaxed text-fg/85">{c.note}</p>
        </div>
      </TwStage>
    </div>
  );
}

function ExplainCard({
  icon: Icon,
  tint,
  label,
  text,
}: {
  icon: typeof AlertTriangle;
  tint: string;
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3.5">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon className="h-4 w-4" style={{ color: tint }} aria-hidden />
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: tint }}>
          {label}
        </span>
      </div>
      <p className="text-[0.78rem] leading-relaxed text-fg/85">{text}</p>
    </div>
  );
}
