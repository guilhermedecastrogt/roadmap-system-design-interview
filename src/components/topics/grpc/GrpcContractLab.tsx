'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cpu, FileCode2, Server, Timer } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { Packet, SceneNode, SceneRails, type Pt } from '../cdn/scene';
import {
  ApiHeading,
  ApiNote,
  ApiPanel,
  CodeSurface,
  ResetButton,
  RunButton,
  Segmented,
  sleep,
} from '../api-track/ApiKit';
import {
  CLIENT_CALL,
  PROTO,
  SERVER_IMPL,
  grpcContent,
  statusWire,
  type CallOutcomeId,
} from './content';

const ACCENT = 'rgb(var(--accent))';
const EMERALD = 'rgb(16 185 129)';
const AMBER = 'rgb(245 158 11)';
const ROSE = 'rgb(244 63 94)';

const PTS: Record<'caller' | 'mid' | 'callee', Pt> = {
  caller: { x: 14, y: 45 },
  mid: { x: 50, y: 45 },
  callee: { x: 86, y: 45 },
};

/** Status colour: OK is green, a server-side refusal amber, a broken call red. */
function toneFor(id: CallOutcomeId) {
  if (id === 'ok') return { text: 'text-emerald-500', bg: 'bg-emerald-500/15', dot: EMERALD };
  if (id === 'unavailable' || id === 'deadline')
    return { text: 'text-rose-500', bg: 'bg-rose-500/15', dot: ROSE };
  return { text: 'text-amber-500', bg: 'bg-amber-500/15', dot: AMBER };
}

/**
 * The flagship gRPC visual: one .proto compiled into both sides, a call that
 * looks like a method invocation, and the two things that make it a *remote*
 * call anyway — status codes of its own, and a deadline the caller sets.
 */
export function GrpcContractLab({ locale }: { locale: Locale }) {
  const c = grpcContent[locale];
  const t = c.lab;

  const [outcomeId, setOutcomeId] = useState<CallOutcomeId>('ok');
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<string | null>(null);
  const [leg, setLeg] = useState<{ points: Pt[]; color: string; duration: number } | null>(null);
  const [legKey, setLegKey] = useState(0);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [serverBusy, setServerBusy] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [deadlineRun, setDeadlineRun] = useState(false);

  const runRef = useRef(0);

  const outcome = t.outcomes.find((o) => o.id === outcomeId)!;
  const status = statusWire[outcomeId];
  const tone = toneFor(outcomeId);

  function clear() {
    setStage(null);
    setLeg(null);
    setActiveNode(null);
    setServerBusy(false);
    setAnswered(false);
    setDeadlineRun(false);
  }

  function reset() {
    runRef.current += 1;
    setRunning(false);
    clear();
  }

  function fly(points: Pt[], color: string, duration: number) {
    setLeg({ points, color, duration });
    setLegKey((k) => k + 1);
  }

  async function call() {
    if (running) return;
    const id = ++runRef.current;
    const alive = () => runRef.current === id;

    setRunning(true);
    clear();
    setDeadlineRun(true);

    setStage('serialize');
    setActiveNode('caller');
    await sleep(520);
    if (!alive()) return;

    setStage('send');
    if (outcomeId === 'unavailable') {
      // the connection never reaches the other side
      fly([PTS.caller, PTS.mid], ROSE, 0.5);
      await sleep(620);
      if (!alive()) return;
      setStage(null);
      setActiveNode('caller');
      setAnswered(true);
      setRunning(false);
      return;
    }

    fly([PTS.caller, PTS.callee], ACCENT, 0.65);
    await sleep(700);
    if (!alive()) return;

    setStage('handle');
    setActiveNode('callee');

    if (outcomeId === 'deadline') {
      // the caller gives up first — and the server keeps going
      await sleep(700);
      if (!alive()) return;
      setAnswered(true);
      setActiveNode('caller');
      setServerBusy(true);
      setRunning(false);
      await sleep(1400);
      if (!alive()) return;
      setServerBusy(false);
      return;
    }

    await sleep(650);
    if (!alive()) return;

    setStage('return');
    fly([PTS.callee, PTS.caller], outcomeId === 'ok' ? EMERALD : AMBER, 0.65);
    await sleep(700);
    if (!alive()) return;

    setStage(null);
    setActiveNode('caller');
    setAnswered(true);
    setRunning(false);
  }

  return (
    <div className="not-prose">
      <ApiHeading title={t.title} subtitle={t.subtitle} />

      <ApiPanel>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Segmented
            label={t.outcomeLabel}
            size="sm"
            value={outcomeId}
            options={t.outcomes.map((o) => ({
              id: o.id,
              label: o.label,
              tone: o.id === 'ok' ? ('emerald' as const) : ('amber' as const),
            }))}
            onChange={(next: CallOutcomeId) => {
              runRef.current += 1;
              setRunning(false);
              clear();
              setOutcomeId(next);
            }}
          />
          <div className="flex items-center gap-2">
            <RunButton
              label={c.shared.call}
              runningLabel={c.shared.calling}
              running={running}
              onClick={call}
            />
            <ResetButton label={c.shared.reset} onClick={reset} />
          </div>
        </div>

        {/* the call */}
        <div className="relative h-32 rounded-xl border border-border bg-surface px-2 sm:h-36">
          <SceneRails edges={[{ a: PTS.caller, b: PTS.callee, active: stage !== null }]} />
          <span
            className="absolute left-1/2 top-[30%] -translate-x-1/2 rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[0.6rem] text-muted"
            aria-hidden
          >
            {c.shared.channel}
          </span>
          <SceneNode
            pt={PTS.caller}
            icon={Cpu}
            label={c.shared.caller}
            active={activeNode === 'caller'}
            badge={answered ? status.name : undefined}
            badgeColor={tone.dot}
          />
          <SceneNode
            pt={PTS.callee}
            icon={Server}
            label={c.shared.callee}
            active={activeNode === 'callee' || serverBusy}
            badge={serverBusy ? '…' : undefined}
            badgeColor={AMBER}
          />
          {leg && (
            <Packet key={legKey} points={leg.points} color={leg.color} duration={leg.duration} />
          )}
        </div>

        {/* deadline + status */}
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="rounded-xl border border-border bg-surface px-3 py-2">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-wide text-muted">
                <Timer className="h-3 w-3" aria-hidden />
                {t.deadlineLabel}
              </span>
              <span className="font-mono text-[0.62rem] text-muted">300 ms</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <motion.div
                key={legKey + (deadlineRun ? 1000 : 0)}
                className={cn(
                  'h-full rounded-full',
                  outcomeId === 'deadline' ? 'bg-rose-500' : 'bg-accent',
                )}
                initial={{ width: '0%' }}
                animate={{ width: deadlineRun ? '100%' : '0%' }}
                transition={{ duration: outcomeId === 'deadline' ? 1.9 : 2.6, ease: 'linear' }}
              />
            </div>
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-xs font-bold',
                  tone.bg,
                  tone.text,
                )}
              >
                <span className="opacity-70">{t.statusLabel}</span>
                {status.code} {status.name}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* stage rail */}
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {t.stages.map((s) => (
            <li
              key={s.id}
              className={cn(
                'rounded-lg border px-2 py-1 text-[0.68rem] font-medium transition-colors',
                stage === s.id ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted',
              )}
            >
              {s.label}
            </li>
          ))}
        </ul>

        {/* contract + both generated sides */}
        <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_1fr]">
          <CodeSurface
            title={t.protoTitle}
            body={PROTO}
            tone="accent"
            right={
              <span className="inline-flex items-center gap-1 text-[0.6rem] text-muted">
                <FileCode2 className="h-3 w-3" aria-hidden />
                {t.generatedLabel}
              </span>
            }
          />
          <div className="space-y-3">
            <CodeSurface title={t.clientTitle} body={CLIENT_CALL} tone="emerald" />
            <CodeSurface title={t.serverTitle} body={SERVER_IMPL} tone="violet" />
          </div>
        </div>

        <p className="mt-3 rounded-lg border border-border bg-surface-2/40 p-3 text-xs leading-relaxed text-fg/80">
          {outcome.explain}
        </p>
        <p className="mt-2 rounded-lg border border-accent/30 bg-accent/[0.05] p-3 text-xs leading-relaxed text-fg/80">
          {t.deadlineNote}
        </p>
      </ApiPanel>

      <ApiNote>{t.note}</ApiNote>
    </div>
  );
}
