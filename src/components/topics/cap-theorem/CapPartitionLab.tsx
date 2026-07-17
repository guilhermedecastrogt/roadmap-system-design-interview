'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  PenLine,
  RotateCcw,
  Search,
  Unplug,
  Wifi,
  XCircle,
  ZapOff,
} from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { capContent, type CapPair } from './content';
import { CapHeading } from './CapKit';

const REPL_MS = 1000;
const START_BALANCE = 1000;
const WITHDRAW = 100;

/** Each dot carries the value of A at send time; B adopts it on arrival. */
type Dot = { id: number; kind: 'repl' | 'sync'; value: number };
type Tone = 'ok' | 'stale' | 'error' | 'info';
type Response = { id: number; tone: Tone; text: string; value?: number };

const TONE_STYLE: Record<Tone, string> = {
  ok: 'border-emerald-500/30 bg-emerald-500/[0.06] text-fg/85',
  stale: 'border-amber-500/30 bg-amber-500/[0.06] text-fg/85',
  error: 'border-rose-500/30 bg-rose-500/[0.06] text-fg/85',
  info: 'border-border bg-surface text-muted',
};

const TONE_ICON: Record<Tone, typeof CheckCircle2> = {
  ok: CheckCircle2,
  stale: AlertTriangle,
  error: XCircle,
  info: Wifi,
};

/**
 * The CAP partition lab: one account balance on replicas A and B, a network
 * link you can cut, and an AP / CP / CA stance switch. Write to A, read from
 * B, and watch each stance answer differently while the partition holds.
 */
export function CapPartitionLab({ locale }: { locale: Locale }) {
  const t = capContent[locale].lab;
  const money = (v: number) => (locale === 'pt-BR' ? `R$ ${v}` : `$${v}`);

  const [mode, setMode] = useState<CapPair>('ap');
  const [partitioned, setPartitioned] = useState(false);
  const [balances, setBalances] = useState({ a: START_BALANCE, b: START_BALANCE });
  const [dots, setDots] = useState<Dot[]>([]);
  const [response, setResponse] = useState<Response | null>(null);
  const [caWarning, setCaWarning] = useState(false);
  const [rejectFlash, setRejectFlash] = useState<'a' | 'b' | null>(null);
  const idRef = useRef(0);

  const diverged = balances.a !== balances.b;

  function respond(tone: Tone, text: string, value?: number) {
    setResponse({ id: ++idRef.current, tone, text, value });
  }

  function flashReject(node: 'a' | 'b') {
    setRejectFlash(node);
    setTimeout(() => setRejectFlash((cur) => (cur === node ? null : cur)), 500);
  }

  function resetAll(nextMode: CapPair = mode) {
    setMode(nextMode);
    setPartitioned(false);
    setBalances({ a: START_BALANCE, b: START_BALANCE });
    setDots([]);
    setResponse(null);
    setCaWarning(false);
    setRejectFlash(null);
  }

  function togglePartition() {
    if (mode === 'ca' && !partitioned) {
      // CA has no answer for a partition — surface the warning instead.
      setCaWarning(true);
      return;
    }
    if (!partitioned) {
      // The split drops every replication message still in flight.
      setDots([]);
      setPartitioned(true);
      setResponse(null);
      return;
    }
    setPartitioned(false);
    if (balances.a !== balances.b) {
      respond('info', t.responses.healing);
      setDots((prev) => [...prev, { id: idRef.current++, kind: 'sync', value: balances.a }]);
    }
  }

  function writeToA() {
    if (balances.a < WITHDRAW) return;
    if (partitioned && mode === 'cp') {
      flashReject('a');
      respond('error', t.responses.writeRejected);
      return;
    }
    const next = balances.a - WITHDRAW;
    setBalances((prev) => ({ ...prev, a: next }));
    if (partitioned) {
      respond('stale', t.responses.writeLocalOnly);
      return;
    }
    setDots((prev) => [...prev, { id: idRef.current++, kind: 'repl', value: next }]);
    respond('ok', t.responses.writeReplicated);
  }

  function readFromB() {
    if (partitioned && mode === 'cp') {
      flashReject('b');
      respond('error', t.responses.readRejected);
      return;
    }
    if (diverged) {
      respond('stale', t.responses.readStale, balances.b);
      return;
    }
    respond('ok', t.responses.readFresh, balances.b);
  }

  function dotArrived(dot: Dot) {
    setDots((prev) => prev.filter((d) => d.id !== dot.id));
    setBalances((prev) => ({ ...prev, b: dot.value }));
  }

  return (
    <div className="not-prose">
      <CapHeading title={t.title} subtitle={t.subtitle} />

      {/* guided steps */}
      <ol className="mt-4 flex flex-wrap gap-2">
        {t.steps.map((step, i) => (
          <li
            key={step}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[0.7rem] text-muted"
          >
            <span className="grid h-4 w-4 place-items-center rounded-full bg-accent/15 font-mono text-[0.6rem] font-bold text-accent">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <div className="mt-4 rounded-2xl border border-border bg-surface/40 p-5">
        {/* controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
              {t.modeLabel}
            </span>
            <div className="inline-flex rounded-lg border border-border bg-surface p-1">
              {(['ap', 'cp', 'ca'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => resetAll(opt)}
                  className={cn(
                    'rounded-md px-3.5 py-1.5 font-mono text-sm font-bold uppercase transition-colors',
                    mode === opt ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg',
                  )}
                >
                  {t.modes[opt].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePartition}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md',
                partitioned
                  ? 'bg-emerald-500 hover:shadow-emerald-500/30'
                  : 'bg-rose-500 hover:shadow-rose-500/30',
              )}
            >
              {partitioned ? (
                <Wifi className="h-4 w-4" aria-hidden />
              ) : (
                <Unplug className="h-4 w-4" aria-hidden />
              )}
              {partitioned ? t.healPartition : t.createPartition}
            </button>
            <button
              type="button"
              onClick={() => resetAll()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-fg"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              {t.reset}
            </button>
          </div>
        </div>

        {/* CA warning */}
        <AnimatePresence>
          {caWarning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <motion.div
                animate={{ x: [0, -6, 6, -4, 4, 0] }}
                transition={{ duration: 0.4 }}
                className="mt-4 flex gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/[0.08] p-4"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-fg">{t.caWarningTitle}</p>
                  <p className="mt-1 text-xs leading-relaxed text-fg/80">{t.caWarningBody}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* stage */}
        <div className="mt-5 grid grid-cols-[1fr_minmax(4rem,9rem)_1fr] items-stretch gap-1 sm:gap-2">
          <ReplicaPanel
            label={t.replicaA}
            balance={money(balances.a)}
            balanceKey={balances.a}
            balanceLabel={t.balanceLabel}
            badge={null}
            freshBadge={t.freshBadge}
            staleBadge={t.staleBadge}
            rejected={rejectFlash === 'a'}
            action={
              <button
                type="button"
                onClick={writeToA}
                disabled={balances.a < WITHDRAW}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-fg shadow-sm transition hover:shadow-md sm:text-sm disabled:opacity-50"
              >
                <PenLine className="h-3.5 w-3.5" aria-hidden />
                {t.writeBtn}
              </button>
            }
          />

          {/* network lane */}
          <div className="relative min-h-[9rem]">
            {/* link line — splits apart when partitioned */}
            <motion.div
              animate={{ left: 0, right: partitioned ? '58%' : '50%' }}
              className={cn(
                'absolute top-1/2 h-0.5 -translate-y-1/2 border-t-2',
                partitioned ? 'border-solid border-rose-500/70' : 'border-dashed border-border',
              )}
            />
            <motion.div
              animate={{ right: 0, left: partitioned ? '58%' : '50%' }}
              className={cn(
                'absolute top-1/2 h-0.5 -translate-y-1/2 border-t-2',
                partitioned ? 'border-solid border-rose-500/70' : 'border-dashed border-border',
              )}
            />

            <div className="absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
              <AnimatePresence mode="wait">
                {partitioned ? (
                  <motion.span
                    key="broken"
                    initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    className="grid h-8 w-8 place-items-center rounded-full border border-rose-500/50 bg-rose-500/10 text-rose-500"
                  >
                    <ZapOff className="h-4 w-4" aria-hidden />
                  </motion.span>
                ) : (
                  <motion.span
                    key="ok"
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    className="text-muted/60"
                  >
                    <Wifi className="h-5 w-5" aria-hidden />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* replication / sync dots (always A → B) */}
            <AnimatePresence>
              {dots.map((dot) => (
                <motion.div
                  key={dot.id}
                  className={cn(
                    'absolute top-1/2 z-10 h-3 w-3 rounded-full shadow',
                    dot.kind === 'sync'
                      ? 'bg-emerald-500 shadow-emerald-500/40'
                      : 'bg-sky-500 shadow-sky-500/40',
                  )}
                  initial={{ left: '0%', y: '-50%', opacity: 0 }}
                  animate={{ left: '94%', y: '-50%', opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: REPL_MS / 1000, ease: 'easeInOut' }}
                  onAnimationComplete={() => dotArrived(dot)}
                />
              ))}
            </AnimatePresence>

            {/* lane status */}
            <div className="absolute inset-x-0 top-[70%] text-center font-mono text-[0.6rem] leading-tight">
              {partitioned ? (
                <span className="text-rose-500">{t.linkBroken}</span>
              ) : dots.length > 0 ? (
                <span className="text-sky-500">{t.linkHealthy}…</span>
              ) : null}
            </div>
          </div>

          <ReplicaPanel
            label={t.replicaB}
            balance={money(balances.b)}
            balanceKey={balances.b}
            balanceLabel={t.balanceLabel}
            badge={diverged ? 'stale' : 'fresh'}
            freshBadge={t.freshBadge}
            staleBadge={t.staleBadge}
            rejected={rejectFlash === 'b'}
            action={
              <button
                type="button"
                onClick={readFromB}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-fg shadow-sm transition hover:border-accent/40 sm:text-sm"
              >
                <Search className="h-3.5 w-3.5" aria-hidden />
                {t.readBtn}
              </button>
            }
          />
        </div>

        {/* divergence status */}
        <div className="mt-3 min-h-[1.25rem] text-center text-xs font-medium">
          {diverged ? (
            <span className="text-amber-500">{t.divergedNote}</span>
          ) : (
            <span className="text-emerald-500">{t.convergedNote}</span>
          )}
        </div>

        {/* last response */}
        <div className="mt-2 min-h-[3.25rem]">
          <AnimatePresence mode="wait">
            {response && (
              <motion.div
                key={response.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'flex items-start gap-2 rounded-lg border p-3 text-xs leading-relaxed',
                  TONE_STYLE[response.tone],
                )}
              >
                {(() => {
                  const Icon = TONE_ICON[response.tone];
                  return <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />;
                })()}
                <span>
                  {response.value !== undefined && (
                    <span className="mr-1.5 rounded bg-surface-2 px-1.5 py-0.5 font-mono font-bold text-fg">
                      {money(response.value)}
                    </span>
                  )}
                  {response.text}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* stance explanation */}
        <AnimatePresence mode="wait">
          <motion.p
            key={mode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              'mt-2 rounded-lg border p-3 text-xs leading-relaxed text-fg/85',
              mode === 'ap' && 'border-emerald-500/30 bg-emerald-500/[0.06]',
              mode === 'cp' && 'border-sky-500/30 bg-sky-500/[0.06]',
              mode === 'ca' && 'border-amber-500/30 bg-amber-500/[0.06]',
            )}
          >
            {t.modes[mode].note}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ReplicaPanel({
  label,
  balance,
  balanceKey,
  balanceLabel,
  badge,
  freshBadge,
  staleBadge,
  rejected,
  action,
}: {
  label: string;
  balance: string;
  balanceKey: number;
  balanceLabel: string;
  badge: 'fresh' | 'stale' | null;
  freshBadge: string;
  staleBadge: string;
  rejected: boolean;
  action: React.ReactNode;
}) {
  return (
    <motion.div
      animate={rejected ? { x: [0, -5, 5, -3, 3, 0] } : {}}
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border bg-surface p-4 transition-colors',
        rejected ? 'border-rose-500/60' : 'border-border',
      )}
    >
      <div className="text-xs font-bold text-fg">{label}</div>

      <div className="flex flex-col items-center gap-1">
        <div className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-surface-2 text-muted">
          <Database className="h-5 w-5" aria-hidden />
        </div>
        <motion.div
          key={balanceKey}
          initial={{ scale: 1.25 }}
          animate={{ scale: 1 }}
          className="font-mono text-lg font-bold tabular-nums text-fg sm:text-xl"
        >
          {balance}
        </motion.div>
        <div className="flex items-center gap-1.5">
          <span className="text-[0.6rem] uppercase tracking-wide text-muted">{balanceLabel}</span>
          {badge && (
            <motion.span
              key={badge}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                'rounded-full px-1.5 py-px font-mono text-[0.55rem] font-bold',
                badge === 'stale'
                  ? 'bg-amber-500/15 text-amber-500'
                  : 'bg-emerald-500/15 text-emerald-500',
              )}
            >
              {badge === 'stale' ? staleBadge : freshBadge}
            </motion.span>
          )}
        </div>
      </div>

      {action}
    </motion.div>
  );
}
