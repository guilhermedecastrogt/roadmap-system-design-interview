'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Inbox,
  Server,
  ShieldAlert,
  Webhook,
  XCircle,
  Zap,
} from 'lucide-react';
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
  StatusPill,
  sleep,
} from '../api-track/ApiKit';
import {
  deliveryHeaders,
  eventWire,
  webhooksContent,
  type DeliveryStage,
  type EventId,
  type OutcomeId,
} from './content';

const ACCENT = 'rgb(var(--accent))';
const EMERALD = 'rgb(16 185 129)';
const AMBER = 'rgb(245 158 11)';
const ROSE = 'rgb(244 63 94)';

const PTS: Record<'provider' | 'receiver' | 'dlq', Pt> = {
  provider: { x: 12, y: 38 },
  receiver: { x: 62, y: 38 },
  dlq: { x: 90, y: 84 },
};

type AttemptResult = 'ok' | 'timeout' | 'error' | 'rejected' | 'deduped';
type Attempt = { result: AttemptResult; code: number | null };

/** What each outcome does across attempts. The last entry decides the ending. */
const PLAN: Record<OutcomeId, Attempt[]> = {
  ok: [{ result: 'ok', code: 200 }],
  timeout: [
    { result: 'timeout', code: null },
    { result: 'timeout', code: null },
    { result: 'timeout', code: null },
  ],
  error500: [
    { result: 'error', code: 500 },
    { result: 'error', code: 500 },
    { result: 'ok', code: 200 },
  ],
  badSignature: [{ result: 'rejected', code: 400 }],
  duplicate: [
    { result: 'ok', code: 200 },
    { result: 'deduped', code: 200 },
  ],
};

const BACKOFF = ['5s', '25s', '2m'];

/** Which stages are part of the story for each outcome. */
const STAGES_FOR: Record<OutcomeId, DeliveryStage[]> = {
  ok: ['event', 'payload', 'sign', 'post', 'verify', 'ack', 'process'],
  duplicate: ['event', 'payload', 'sign', 'post', 'verify', 'ack', 'process', 'retry'],
  timeout: ['event', 'payload', 'sign', 'post', 'verify', 'retry', 'dlq'],
  error500: ['event', 'payload', 'sign', 'post', 'verify', 'retry', 'ack', 'process'],
  badSignature: ['event', 'payload', 'sign', 'post', 'verify'],
};

type LogRow = { id: number; attempt: number; result: AttemptResult; code: number | null; wait?: string };

/**
 * The delivery simulator: one event, five ways it can go. Retries, duplicates
 * and a dead-letter store are not edge cases here — they are the normal life of
 * a webhook, which is why the receiver has to be built for them.
 */
export function WhDeliveryLab({ locale }: { locale: Locale }) {
  const c = webhooksContent[locale];
  const t = c.delivery;

  const [eventId, setEventId] = useState<EventId>('payment');
  const [outcomeId, setOutcomeId] = useState<OutcomeId>('ok');
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<DeliveryStage | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [badge, setBadge] = useState<{ text: string; color: string } | null>(null);
  const [leg, setLeg] = useState<{ points: Pt[]; color: string; duration: number } | null>(null);
  const [legKey, setLegKey] = useState(0);
  const [log, setLog] = useState<LogRow[]>([]);
  const [dlq, setDlq] = useState<string[]>([]);
  const [waiting, setWaiting] = useState<string | null>(null);
  const [finished, setFinished] = useState<'acked' | 'dlq' | 'rejected' | null>(null);

  const runRef = useRef(0);
  const rowId = useRef(0);

  const event = eventWire[eventId];
  const outcome = t.outcomes.find((o) => o.id === outcomeId)!;
  const signatureValid = outcomeId !== 'badSignature';

  function clear() {
    setStage(null);
    setAttempt(0);
    setBadge(null);
    setLeg(null);
    setLog([]);
    setDlq([]);
    setWaiting(null);
    setFinished(null);
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

  function push(row: Omit<LogRow, 'id'>) {
    setLog((prev) => [...prev, { id: rowId.current++, ...row }]);
  }

  async function trigger() {
    if (running) return;
    const id = ++runRef.current;
    const alive = () => runRef.current === id;

    setRunning(true);
    clear();

    // the provider side
    for (const s of ['event', 'payload', 'sign'] as DeliveryStage[]) {
      setStage(s);
      await sleep(520);
      if (!alive()) return;
    }

    const plan = PLAN[outcomeId];

    for (let i = 0; i < plan.length; i++) {
      const step = plan[i];
      setAttempt(i + 1);
      setBadge(null);
      setStage('post');
      fly([PTS.provider, PTS.receiver], ACCENT, 0.7);
      await sleep(760);
      if (!alive()) return;

      setStage('verify');
      await sleep(600);
      if (!alive()) return;

      if (step.result === 'rejected') {
        setBadge({ text: '400', color: ROSE });
        fly([PTS.receiver, PTS.provider], ROSE, 0.6);
        push({ attempt: i + 1, result: 'rejected', code: 400 });
        await sleep(700);
        if (!alive()) return;
        setStage(null);
        setFinished('rejected');
        setRunning(false);
        return;
      }

      if (step.result === 'timeout') {
        setBadge({ text: '⏱', color: AMBER });
        push({ attempt: i + 1, result: 'timeout', code: null });
        await sleep(800);
        if (!alive()) return;
      } else if (step.result === 'error') {
        setBadge({ text: '500', color: ROSE });
        fly([PTS.receiver, PTS.provider], ROSE, 0.6);
        push({ attempt: i + 1, result: 'error', code: 500 });
        await sleep(700);
        if (!alive()) return;
      } else {
        // ok or deduped
        setBadge({ text: '200', color: EMERALD });
        setStage('ack');
        fly([PTS.receiver, PTS.provider], EMERALD, 0.6);
        push({ attempt: i + 1, result: step.result, code: 200 });
        await sleep(700);
        if (!alive()) return;

        if (step.result === 'ok') {
          setStage('process');
          await sleep(650);
          if (!alive()) return;
        }

        if (i === plan.length - 1) {
          setStage(null);
          setFinished('acked');
          setRunning(false);
          return;
        }
      }

      // between attempts: backoff
      if (i < plan.length - 1) {
        setStage('retry');
        const wait = BACKOFF[Math.min(i, BACKOFF.length - 1)];
        setWaiting(wait);
        setLog((prev) =>
          prev.map((r, idx) => (idx === prev.length - 1 ? { ...r, wait } : r)),
        );
        await sleep(900);
        if (!alive()) return;
        setWaiting(null);
      }
    }

    // every attempt failed
    setStage('dlq');
    setBadge(null);
    fly([PTS.provider, PTS.dlq], AMBER, 0.7);
    await sleep(760);
    if (!alive()) return;
    setDlq([event.id]);
    setStage(null);
    setFinished('dlq');
    setRunning(false);
  }

  const activeStages = t.stages.filter((s) => STAGES_FOR[outcomeId].includes(s.id));

  return (
    <div className="not-prose">
      <ApiHeading title={t.title} subtitle={t.subtitle} />

      <ApiPanel>
        <div className="mb-4 space-y-2.5">
          <Segmented
            label={t.eventLabel}
            value={eventId}
            options={t.events.map((e) => ({ id: e.id, label: e.label }))}
            onChange={(next: EventId) => {
              runRef.current += 1;
              setRunning(false);
              clear();
              setEventId(next);
            }}
          />
          <Segmented
            label={t.outcomeLabel}
            size="sm"
            value={outcomeId}
            options={t.outcomes.map((o) => ({
              id: o.id,
              label: o.label,
              tone: o.id === 'ok' ? ('emerald' as const) : ('amber' as const),
            }))}
            onChange={(next: OutcomeId) => {
              runRef.current += 1;
              setRunning(false);
              clear();
              setOutcomeId(next);
            }}
          />
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-xs">
            <Zap className="h-3 w-3 text-accent" aria-hidden />
            <span className="font-bold text-accent">{event.name}</span>
            <span className="text-muted">{event.id}</span>
          </span>
          {attempt > 0 && (
            <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[0.65rem] text-muted">
              {t.attemptLabel} {attempt}
            </span>
          )}
          <AnimatePresence>
            {waiting && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold text-amber-500"
              >
                <Clock className="h-3 w-3" aria-hidden />
                {t.backoffLabel} {waiting}
              </motion.span>
            )}
          </AnimatePresence>
          <div className="ml-auto flex items-center gap-2">
            <RunButton
              label={c.shared.trigger}
              runningLabel={c.shared.running}
              running={running}
              onClick={trigger}
              icon={Zap}
            />
            <ResetButton label={c.shared.reset} onClick={reset} />
          </div>
        </div>

        {/* stage */}
        <div className="relative h-40 rounded-xl border border-border bg-surface px-2 sm:h-44">
          <SceneRails
            edges={[
              { a: PTS.provider, b: PTS.receiver, active: attempt > 0 },
              { a: PTS.provider, b: PTS.dlq, active: dlq.length > 0 },
            ]}
          />
          <SceneNode
            pt={PTS.provider}
            icon={Server}
            label={c.shared.provider}
            active={stage === 'event' || stage === 'payload' || stage === 'sign' || stage === 'post'}
          />
          <SceneNode
            pt={PTS.receiver}
            icon={Webhook}
            label={c.shared.receiver}
            active={stage === 'verify' || stage === 'ack' || stage === 'process'}
            badge={badge?.text}
            badgeColor={badge?.color}
          />
          <SceneNode
            pt={PTS.dlq}
            icon={Inbox}
            label={t.dlqTitle}
            active={dlq.length > 0}
            badge={dlq.length ? String(dlq.length) : undefined}
            badgeColor={AMBER}
          />
          {leg && (
            <Packet key={legKey} points={leg.points} color={leg.color} duration={leg.duration} />
          )}
        </div>

        {/* stage rail */}
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {activeStages.map((s) => (
            <li
              key={s.id}
              className={cn(
                'rounded-lg border px-2 py-1 text-[0.68rem] font-medium transition-colors',
                stage === s.id
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted',
              )}
            >
              {s.label}
            </li>
          ))}
        </ul>

        {/* headers + payload */}
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <CodeSurface
            title={t.headersTitle}
            body={deliveryHeaders(event, Math.max(attempt, 1), signatureValid)}
            tone={signatureValid ? 'accent' : 'rose'}
            right={
              !signatureValid ? (
                <span className="inline-flex items-center gap-1 text-[0.6rem] font-semibold text-rose-500">
                  <ShieldAlert className="h-3 w-3" aria-hidden />
                  signature
                </span>
              ) : undefined
            }
          />
          <CodeSurface title={t.payloadTitle} body={event.payload} />
        </div>

        {/* timeline */}
        <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="mb-2 font-mono text-[0.65rem] uppercase tracking-wide text-muted">
              {t.timelineTitle}
            </div>
            {log.length === 0 ? (
              <p className="text-xs text-muted">{t.timelineEmpty}</p>
            ) : (
              <ul className="space-y-1.5">
                <AnimatePresence initial={false}>
                  {log.map((row) => (
                    <motion.li
                      key={row.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-wrap items-center gap-2 text-xs"
                    >
                      <span className="font-mono text-[0.65rem] text-muted">
                        #{row.attempt}
                      </span>
                      <ResultChip result={row.result} code={row.code} />
                      {row.wait && (
                        <span className="inline-flex items-center gap-1 font-mono text-[0.62rem] text-amber-500">
                          <Clock className="h-3 w-3" aria-hidden />
                          {t.backoffLabel} {row.wait}
                        </span>
                      )}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
            {finished === 'acked' && (
              <p className="mt-2 rounded-lg bg-emerald-500/10 p-2 text-[0.72rem] leading-snug text-emerald-600 dark:text-emerald-400">
                {t.ackedNote}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface p-3">
            <div className="mb-2 inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-wide text-muted">
              <Inbox className="h-3 w-3" aria-hidden />
              {t.dlqTitle}
            </div>
            {dlq.length === 0 ? (
              <p className="text-xs text-muted">{t.dlqEmpty}</p>
            ) : (
              <>
                <ul className="space-y-1">
                  {dlq.map((id) => (
                    <li
                      key={id}
                      className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-1 font-mono text-[0.68rem] text-amber-500"
                    >
                      <AlertTriangle className="h-3 w-3" aria-hidden />
                      {id}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[0.7rem] leading-snug text-muted">{t.dlqNote}</p>
              </>
            )}
          </div>
        </div>

        <p className="mt-3 rounded-lg border border-border bg-surface-2/40 p-3 text-xs leading-relaxed text-fg/80">
          {outcome.explain}
        </p>
      </ApiPanel>

      <ApiNote>{t.note}</ApiNote>
    </div>
  );
}

function ResultChip({ result, code }: { result: AttemptResult; code: number | null }) {
  if (result === 'timeout') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 font-mono text-[0.65rem] font-bold text-amber-500">
        <Clock className="h-3 w-3" aria-hidden />
        timeout
      </span>
    );
  }
  if (result === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-1.5 py-0.5 font-mono text-[0.65rem] font-bold text-rose-500">
        <XCircle className="h-3 w-3" aria-hidden />
        {code} rejected
      </span>
    );
  }
  if (result === 'deduped') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/15 px-1.5 py-0.5 font-mono text-[0.65rem] font-bold text-sky-500">
        <CheckCircle2 className="h-3 w-3" aria-hidden />
        {code} duplicate ignored
      </span>
    );
  }
  return <StatusPill code={code ?? 0} />;
}
