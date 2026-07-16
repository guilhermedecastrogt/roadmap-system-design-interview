'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  CreditCard,
  FileCheck2,
  Gauge,
  KeyRound,
  MonitorSmartphone,
  Package,
  RotateCcw,
  Send,
  ShieldCheck,
  Split,
  TowerControl,
  UserRound,
  XCircle,
} from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { gatewayContent, type ServiceId } from './content';
import { GwHeading, GwNode, GwRequestChip, GwStatusBadge } from './GwKit';

type CheckState = 'idle' | 'checking' | 'pass' | 'fail';
type DotZone = 'in' | 'reject' | 'out' | 'back-out' | 'back-in' | null;

type LogEntry = {
  id: number;
  method: string;
  path: string;
  code: number;
  codeText: string;
  layer?: string;
};

const CHECK_ICONS = [KeyRound, ShieldCheck, FileCheck2, Gauge, Split];

const SERVICES: { id: ServiceId; icon: typeof UserRound; tone: 'violet' | 'emerald' | 'amber' }[] = [
  { id: 'users', icon: UserRound, tone: 'violet' },
  { id: 'payments', icon: CreditCard, tone: 'emerald' },
  { id: 'orders', icon: Package, tone: 'amber' },
];

/** Vertical centre (%) of each service node inside the services column. */
const SERVICE_Y: Record<ServiceId, number> = { users: 14, payments: 50, orders: 86 };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The flagship "control tower" simulator: a request flies from the frontend
 * into the gateway, clears (or fails) each policy checkpoint in sequence, and
 * is either routed to the matching service — with the response flying back —
 * or bounced out at the exact layer that rejected it.
 */
export function GwControlTower({ locale }: { locale: Locale }) {
  const c = gatewayContent[locale];
  const t = c.tower;
  const s = c.shared;

  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [checks, setChecks] = useState<CheckState[]>(Array(5).fill('idle'));
  const [dot, setDot] = useState<DotZone>(null);
  const [dotOk, setDotOk] = useState(true);
  const [activeService, setActiveService] = useState<ServiceId | null>(null);
  const [flash, setFlash] = useState<{ code: number; text: string } | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);

  const runRef = useRef(0);
  const logIdRef = useRef(0);

  const scenario = t.scenarios[scenarioIdx];
  const targetY = SERVICE_Y[scenario.service];

  function setCheck(i: number, state: CheckState) {
    setChecks((prev) => prev.map((v, idx) => (idx === i ? state : v)));
  }

  function clearStage() {
    setChecks(Array(5).fill('idle'));
    setDot(null);
    setDotOk(true);
    setActiveService(null);
    setFlash(null);
  }

  function reset() {
    runRef.current += 1;
    setRunning(false);
    clearStage();
    setLog([]);
  }

  function pushLog(entry: Omit<LogEntry, 'id'>) {
    setLog((prev) => [{ id: logIdRef.current++, ...entry }, ...prev].slice(0, 5));
  }

  async function send() {
    if (running) return;
    const id = ++runRef.current;
    const sc = t.scenarios[scenarioIdx];
    const failIdx = sc.failAt ? t.checkpoints.findIndex((cp) => cp.id === sc.failAt) : -1;

    setRunning(true);
    clearStage();

    setDotOk(true);
    setDot('in');
    await sleep(700);
    if (runRef.current !== id) return;
    setDot(null);

    for (let i = 0; i < t.checkpoints.length; i++) {
      setCheck(i, 'checking');
      await sleep(620);
      if (runRef.current !== id) return;

      if (i === failIdx) {
        setCheck(i, 'fail');
        setDotOk(false);
        setDot('reject');
        setFlash({ code: sc.code, text: sc.codeText });
        pushLog({
          method: sc.method,
          path: sc.path,
          code: sc.code,
          codeText: sc.codeText,
          layer: t.checkpoints[i].label,
        });
        await sleep(850);
        if (runRef.current !== id) return;
        setDot(null);
        setRunning(false);
        return;
      }
      setCheck(i, 'pass');
    }

    setDot('out');
    await sleep(800);
    if (runRef.current !== id) return;
    setDot(null);
    setActiveService(sc.service);
    await sleep(400);
    if (runRef.current !== id) return;

    setDot('back-out');
    await sleep(800);
    if (runRef.current !== id) return;

    setDot('back-in');
    await sleep(700);
    if (runRef.current !== id) return;
    setDot(null);
    setActiveService(null);
    setFlash({ code: sc.code, text: sc.codeText });
    pushLog({ method: sc.method, path: sc.path, code: sc.code, codeText: sc.codeText });
    setRunning(false);
  }

  return (
    <div className="not-prose">
      <GwHeading title={t.title} subtitle={t.subtitle} />

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        {/* scenario picker + controls */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
              {t.scenarioLabel}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {t.scenarios.map((sc, i) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    runRef.current += 1;
                    setRunning(false);
                    clearStage();
                    setScenarioIdx(i);
                  }}
                  className={cn(
                    'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                    scenarioIdx === i
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-muted hover:text-fg',
                  )}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={send}
              disabled={running}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30 disabled:opacity-60"
            >
              <Send className="h-4 w-4" aria-hidden />
              {running ? s.sending : s.send}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              {s.reset}
            </button>
          </div>
        </div>

        {/* current request */}
        <div className="mb-4 flex items-center gap-2">
          <GwRequestChip method={scenario.method} path={scenario.path} />
          <AnimatePresence>
            {flash && (
              <motion.span
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <GwStatusBadge code={flash.code} text={flash.text} />
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* stage */}
        <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-stretch gap-1 sm:gap-2">
          {/* client */}
          <div className="grid place-items-center">
            <GwNode icon={MonitorSmartphone} label={s.client} active={running} tone="accent" />
          </div>

          {/* lane: client -> gateway */}
          <div className="relative min-w-[2.5rem]">
            <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-border" />
            <AnimatePresence>
              {dot === 'in' && (
                <motion.div
                  key="in"
                  className="absolute top-1/2 z-10 h-3 w-3 rounded-full bg-accent shadow shadow-accent/40"
                  initial={{ left: '0%', y: '-50%', opacity: 0 }}
                  animate={{ left: '96%', y: '-50%', opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: 'easeInOut' }}
                />
              )}
              {dot === 'reject' && (
                <motion.div
                  key="reject"
                  className="absolute top-1/2 z-10 h-3 w-3 rounded-full bg-rose-500 shadow shadow-rose-500/40"
                  initial={{ left: '96%', y: '-50%', opacity: 1 }}
                  animate={{ left: '0%', y: ['-50%', '-130%', '-50%'], opacity: [1, 1, 0.4] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              )}
              {dot === 'back-in' && (
                <motion.div
                  key="back-in"
                  className="absolute top-1/2 z-10 h-3 w-3 rounded-full bg-emerald-500 shadow shadow-emerald-500/40"
                  initial={{ left: '96%', y: '-50%', opacity: 1 }}
                  animate={{ left: '0%', y: '-50%' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: 'easeInOut' }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* gateway tower */}
          <div
            className={cn(
              'w-44 rounded-2xl border-2 bg-surface p-2.5 shadow-sm transition-colors sm:w-56 sm:p-3',
              checks.some((v) => v === 'fail')
                ? 'border-rose-500/60'
                : running
                  ? 'border-accent/70'
                  : 'border-border',
            )}
          >
            <div className="mb-2 flex items-center justify-center gap-1.5 text-accent">
              <TowerControl className="h-4 w-4" aria-hidden />
              <span className="text-xs font-bold text-fg">{s.gateway}</span>
            </div>
            <div className="space-y-1.5">
              {t.checkpoints.map((cp, i) => {
                const Icon = CHECK_ICONS[i];
                const state = checks[i];
                return (
                  <motion.div
                    key={cp.id}
                    animate={state === 'checking' ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                    transition={{ duration: 0.5, repeat: state === 'checking' ? Infinity : 0 }}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors',
                      state === 'checking' && 'border-accent bg-accent/10',
                      state === 'pass' && 'border-emerald-500/50 bg-emerald-500/10',
                      state === 'fail' && 'border-rose-500/60 bg-rose-500/10',
                      state === 'idle' && 'border-border/70 bg-surface-2/50',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-3.5 w-3.5 shrink-0',
                        state === 'pass'
                          ? 'text-emerald-500'
                          : state === 'fail'
                            ? 'text-rose-500'
                            : state === 'checking'
                              ? 'text-accent'
                              : 'text-muted',
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[0.7rem] font-semibold leading-tight text-fg">
                        {cp.label}
                      </div>
                      <div className="hidden truncate text-[0.62rem] leading-tight text-muted sm:block">
                        {cp.question}
                      </div>
                    </div>
                    <span className="shrink-0">
                      {state === 'pass' && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
                      )}
                      {state === 'fail' && (
                        <XCircle className="h-3.5 w-3.5 text-rose-500" aria-hidden />
                      )}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* lane: gateway -> services */}
          <div className="relative min-w-[2.5rem]">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              {SERVICES.map((sv) => (
                <path
                  key={sv.id}
                  d={`M 0 50 C 45 50, 55 ${SERVICE_Y[sv.id]}, 100 ${SERVICE_Y[sv.id]}`}
                  fill="none"
                  strokeWidth={activeService === sv.id || (dot && scenario.service === sv.id && (dot === 'out' || dot === 'back-out')) ? 2.5 : 1.5}
                  vectorEffect="non-scaling-stroke"
                  className={cn(
                    'transition-all',
                    activeService === sv.id ||
                      (scenario.service === sv.id && (dot === 'out' || dot === 'back-out'))
                      ? 'stroke-emerald-500/70'
                      : 'stroke-border',
                  )}
                />
              ))}
            </svg>
            <AnimatePresence>
              {dot === 'out' && (
                <motion.div
                  key="out"
                  className="absolute z-10 h-3 w-3 rounded-full bg-emerald-500 shadow shadow-emerald-500/40"
                  initial={{ left: '0%', top: '50%', x: '-50%', y: '-50%', opacity: 1 }}
                  animate={{
                    left: ['0%', '50%', '96%'],
                    top: ['50%', `${(50 + targetY) / 2}%`, `${targetY}%`],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75, ease: 'easeInOut' }}
                />
              )}
              {dot === 'back-out' && (
                <motion.div
                  key="back-out"
                  className="absolute z-10 h-3 w-3 rounded-full bg-emerald-500 shadow shadow-emerald-500/40"
                  initial={{ left: '96%', top: `${targetY}%`, x: '-50%', y: '-50%', opacity: 1 }}
                  animate={{
                    left: ['96%', '50%', '0%'],
                    top: [`${targetY}%`, `${(50 + targetY) / 2}%`, '50%'],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75, ease: 'easeInOut' }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* services */}
          <div className="flex flex-col justify-between gap-3 py-1">
            {SERVICES.map((sv) => (
              <motion.div
                key={sv.id}
                animate={activeService === sv.id ? { scale: [1, 1.07, 1] } : { scale: 1 }}
                transition={{ duration: 0.45 }}
              >
                <GwNode
                  icon={sv.icon}
                  label={s.services[sv.id]}
                  active={activeService === sv.id}
                  tone={sv.tone}
                  size="sm"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* scenario note */}
        <p className="mt-4 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted">
          {scenario.note}
        </p>

        {/* log */}
        <div className="mt-3 rounded-xl border border-border bg-surface p-3">
          <div className="mb-2 font-mono text-[0.65rem] uppercase tracking-wide text-muted">
            {t.logLabel}
          </div>
          {log.length === 0 ? (
            <p className="text-xs text-muted">{t.logEmpty}</p>
          ) : (
            <ul className="space-y-1.5">
              <AnimatePresence initial={false}>
                {log.map((entry) => (
                  <motion.li
                    key={entry.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-wrap items-center gap-2 font-mono text-xs"
                  >
                    <span className="font-bold text-accent">{entry.method}</span>
                    <span className="text-fg/85">{entry.path}</span>
                    <span aria-hidden className="text-muted">→</span>
                    <GwStatusBadge code={entry.code} text={entry.codeText} />
                    {entry.layer && (
                      <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[0.65rem] font-medium text-rose-500">
                        {entry.layer}
                      </span>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        <p className="mt-3 text-center text-xs text-muted">{running ? t.idleHint : t.note}</p>
      </div>
    </div>
  );
}
