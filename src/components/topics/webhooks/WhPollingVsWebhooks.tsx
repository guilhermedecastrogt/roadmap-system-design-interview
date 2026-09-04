'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, PhoneCall, Play, Zap } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ApiHeading, ApiNote, ApiPanel, ResetButton } from '../api-track/ApiKit';
import { webhooksContent } from './content';

const WINDOW = 60; // virtual seconds shown
const POLL_EVERY = 10;
const EVENT_AT = 37;
const DELIVER_AT = 37.4;
const TICK_MS = 90; // one virtual second every 90ms

const POLLS = Array.from({ length: WINDOW / POLL_EVERY }, (_, i) => (i + 1) * POLL_EVERY);

/**
 * Two lanes over the same 60 seconds: an app polling every 10s, and a provider
 * pushing once. The numbers underneath are the whole argument — most polls find
 * nothing, and you still learn about the event later than a push would tell you.
 */
export function WhPollingVsWebhooks({ locale }: { locale: Locale }) {
  const c = webhooksContent[locale];
  const t = c.polling;

  const [now, setNow] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function run() {
    if (timer.current) clearInterval(timer.current);
    setNow(0);
    setRunning(true);
    timer.current = setInterval(() => {
      setNow((prev) => {
        if (prev >= WINDOW) {
          if (timer.current) clearInterval(timer.current);
          setRunning(false);
          return WINDOW;
        }
        return prev + 1;
      });
    }, TICK_MS);
  }

  function reset() {
    if (timer.current) clearInterval(timer.current);
    setRunning(false);
    setNow(0);
  }

  const firstHit = POLLS.find((p) => p >= EVENT_AT)!;
  const resolved = POLLS.filter((p) => p <= now);
  const wasted = resolved.filter((p) => p !== firstHit).length;
  const delivered = now >= DELIVER_AT;
  const pollLatency = now >= firstHit ? firstHit - EVENT_AT : null;

  return (
    <div className="not-prose">
      <ApiHeading title={t.title} subtitle={t.subtitle} />

      <ApiPanel>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[0.7rem] text-muted">
            t = {Math.min(now, WINDOW)}
            {t.seconds} / {WINDOW}
            {t.seconds}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={run}
              disabled={running}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30 disabled:opacity-60"
            >
              <Play className="h-4 w-4" aria-hidden />
              {running ? t.runningLabel : t.runLabel}
            </button>
            <ResetButton label={c.shared.reset} onClick={reset} />
          </div>
        </div>

        <Lane
          title={t.pollingTitle}
          subtitle={t.pollingSub}
          icon={PhoneCall}
          tone="amber"
          now={now}
        >
          {POLLS.map((p) => {
            const done = p <= now;
            const hit = p === firstHit;
            return (
              <Marker key={p} at={p} active={done}>
                <span
                  className={cn(
                    'whitespace-nowrap rounded px-1 py-0.5 font-mono text-[0.55rem] font-semibold',
                    !done
                      ? 'bg-surface-2 text-muted'
                      : hit
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : 'bg-amber-500/15 text-amber-500',
                  )}
                >
                  {done ? (hit ? t.gotIt : t.nothingNew) : t.asking}
                </span>
              </Marker>
            );
          })}
        </Lane>

        <Lane
          title={t.webhookTitle}
          subtitle={t.webhookSub}
          icon={Bell}
          tone="emerald"
          now={now}
        >
          <Marker at={DELIVER_AT} active={delivered}>
            <span
              className={cn(
                'whitespace-nowrap rounded px-1 py-0.5 font-mono text-[0.55rem] font-semibold',
                delivered ? 'bg-emerald-500/15 text-emerald-500' : 'bg-surface-2 text-muted',
              )}
            >
              {delivered ? t.delivered : t.idle}
            </span>
          </Marker>
        </Lane>

        {/* event marker legend */}
        <p className="mt-2 flex items-center justify-center gap-1.5 text-[0.7rem] text-muted">
          <Zap className="h-3 w-3 text-accent" aria-hidden />
          {t.eventHappens} (t = {EVENT_AT}
          {t.seconds})
        </p>

        {/* stats */}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Stat
            label={t.wastedLabel}
            polling={`${wasted}`}
            webhook="0"
            pollingTitle={t.pollingTitle}
            webhookTitle={t.webhookTitle}
          />
          <Stat
            label={t.latencyLabel}
            polling={pollLatency === null ? '—' : `${pollLatency}${t.seconds}`}
            webhook={delivered ? `<1${t.seconds}` : '—'}
            pollingTitle={t.pollingTitle}
            webhookTitle={t.webhookTitle}
          />
        </div>
      </ApiPanel>

      <ApiNote>{t.note}</ApiNote>
    </div>
  );
}

function Lane({
  title,
  subtitle,
  icon: Icon,
  tone,
  now,
  children,
}: {
  title: string;
  subtitle: string;
  icon: typeof Bell;
  tone: 'amber' | 'emerald';
  now: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3 rounded-xl border border-border bg-surface p-3">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-sm font-semibold',
            tone === 'amber' ? 'text-amber-500' : 'text-emerald-500',
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {title}
        </span>
        <span className="text-[0.7rem] text-muted">{subtitle}</span>
      </div>

      <div className="relative h-14">
        {/* rail */}
        <div className="absolute inset-x-0 top-9 h-px bg-border" />
        {/* event flag */}
        <div
          className="absolute top-4 h-8 w-px bg-accent/60"
          style={{ left: `${(EVENT_AT / WINDOW) * 100}%` }}
          aria-hidden
        />
        {/* playhead */}
        <motion.div
          className="absolute top-6 h-5 w-0.5 rounded-full bg-accent"
          animate={{ left: `${(Math.min(now, WINDOW) / WINDOW) * 100}%` }}
          transition={{ duration: 0.09, ease: 'linear' }}
          aria-hidden
        />
        {children}
      </div>
    </div>
  );
}

function Marker({
  at,
  active,
  children,
}: {
  at: number;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1"
      style={{ left: `${(at / WINDOW) * 100}%` }}
    >
      <motion.div animate={{ opacity: active ? 1 : 0.45, scale: active ? 1 : 0.95 }}>
        {children}
      </motion.div>
      <span
        className={cn(
          'mt-1 h-2 w-2 rounded-full transition-colors',
          active ? 'bg-accent' : 'bg-border',
        )}
        aria-hidden
      />
    </div>
  );
}

function Stat({
  label,
  polling,
  webhook,
  pollingTitle,
  webhookTitle,
}: {
  label: string;
  polling: string;
  webhook: string;
  pollingTitle: string;
  webhookTitle: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="font-mono text-[0.62rem] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2 flex items-end gap-5">
        <div>
          <div className="font-display text-xl font-bold text-amber-500">{polling}</div>
          <div className="text-[0.62rem] text-muted">{pollingTitle}</div>
        </div>
        <div>
          <div className="font-display text-xl font-bold text-emerald-500">{webhook}</div>
          <div className="text-[0.62rem] text-muted">{webhookTitle}</div>
        </div>
      </div>
    </div>
  );
}
