'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Database, Cpu, MonitorSmartphone, TowerControl } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { Packet, SceneNode, SceneRails, type Pt } from '../cdn/scene';
import {
  ApiHeading,
  ApiNote,
  ApiPanel,
  CodeSurface,
  MethodChip,
  ResetButton,
  RunButton,
  Segmented,
  StatusPill,
  sleep,
} from '../api-track/ApiKit';
import {
  callWire,
  conditionWire,
  restContent,
  type CallId,
  type ConditionId,
  type StopAt,
} from './content';

const ACCENT = 'rgb(var(--accent))';
const EMERALD = 'rgb(16 185 129)';
const AMBER = 'rgb(245 158 11)';
const ROSE = 'rgb(244 63 94)';

const PTS: Record<'client' | 'gateway' | 'service' | 'db', Pt> = {
  client: { x: 8, y: 50 },
  gateway: { x: 36, y: 50 },
  service: { x: 64, y: 50 },
  db: { x: 92, y: 50 },
};

const ORDER: (keyof typeof PTS)[] = ['client', 'gateway', 'service', 'db'];

type LogEntry = { id: number; method: string; path: string; code: number; text: string };

/**
 * The REST playground: five calls crossed with seven conditions. The point is
 * not the animation — it is that each status code is produced at a different
 * depth of the system, so the code tells you where to go looking.
 */
export function RestPlayground({ locale }: { locale: Locale }) {
  const c = restContent[locale];
  const t = c.playground;

  const [callId, setCallId] = useState<CallId>('list');
  const [condId, setCondId] = useState<ConditionId>('ok');
  const [running, setRunning] = useState(false);
  const [reached, setReached] = useState<number>(-1);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [leg, setLeg] = useState<{ points: Pt[]; color: string; duration: number } | null>(null);
  const [legKey, setLegKey] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);

  const runRef = useRef(0);
  const logId = useRef(0);

  const call = callWire[callId];
  const cond = t.conditions.find((x) => x.id === condId)!;
  const failure = condId === 'ok' ? null : conditionWire[condId];
  const code = failure ? failure.code : call.okCode;
  const codeText = condId === 'ok' ? '' : cond.codeText;
  const stopAt: StopAt | null = failure ? failure.stopAt : null;

  const requestText = [
    `${call.method} ${call.path} HTTP/1.1`,
    'Host: api.example.com',
    condId === 'noToken' ? null : 'Authorization: Bearer eyJhbGci...',
    call.body ? 'Content-Type: application/json' : null,
    call.body ? '' : null,
    call.body ? (condId === 'malformed' ? '{ "text": 42 }' : call.body) : null,
  ]
    .filter((l) => l !== null)
    .join('\n');

  function clear() {
    setReached(-1);
    setActiveNode(null);
    setLeg(null);
    setAnswered(false);
  }

  function reset() {
    runRef.current += 1;
    setRunning(false);
    clear();
    setLog([]);
  }

  function fly(points: Pt[], color: string, duration: number) {
    setLeg({ points, color, duration });
    setLegKey((k) => k + 1);
  }

  async function send() {
    if (running) return;
    const id = ++runRef.current;
    const alive = () => runRef.current === id;

    setRunning(true);
    clear();

    const stopIndex = stopAt ? ORDER.indexOf(stopAt) : ORDER.length - 1;

    // forward: hop by hop up to the node that answers
    for (let i = 0; i < stopIndex; i++) {
      setActiveNode(ORDER[i]);
      fly([PTS[ORDER[i]], PTS[ORDER[i + 1]]], ACCENT, 0.55);
      await sleep(600);
      if (!alive()) return;
      setReached(i + 1);
    }

    setActiveNode(ORDER[stopIndex]);
    await sleep(520);
    if (!alive()) return;

    // back: straight to the client, coloured by outcome
    const back = ORDER.slice(0, stopIndex + 1)
      .reverse()
      .map((k) => PTS[k]);
    fly(back, failure ? (code >= 500 ? ROSE : AMBER) : EMERALD, 0.35 * back.length);
    await sleep(400 * back.length);
    if (!alive()) return;

    setActiveNode('client');
    setAnswered(true);
    setLog((prev) =>
      [
        { id: logId.current++, method: call.method, path: call.path, code, text: codeText },
        ...prev,
      ].slice(0, 5),
    );
    setRunning(false);
  }

  return (
    <div className="not-prose">
      <ApiHeading title={t.title} subtitle={t.subtitle} />

      <ApiPanel>
        <div className="mb-4 space-y-2.5">
          <Segmented
            label={t.callLabel}
            value={callId}
            options={t.calls.map((x) => ({ id: x.id, label: x.label }))}
            onChange={(next: CallId) => {
              runRef.current += 1;
              setRunning(false);
              clear();
              setCallId(next);
            }}
          />
          <Segmented
            label={t.conditionLabel}
            size="sm"
            value={condId}
            options={t.conditions.map((x) => ({
              id: x.id,
              label: x.label,
              tone: x.id === 'ok' ? ('emerald' as const) : ('amber' as const),
            }))}
            onChange={(next: ConditionId) => {
              runRef.current += 1;
              setRunning(false);
              clear();
              setCondId(next);
            }}
          />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <MethodChip method={call.method} path={call.path} />
          <AnimatePresence>
            {answered && (
              <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <StatusPill code={code} text={codeText} />
              </motion.span>
            )}
          </AnimatePresence>
          <div className="ml-auto flex items-center gap-2">
            <RunButton
              label={c.shared.send}
              runningLabel={c.shared.sending}
              running={running}
              onClick={send}
            />
            <ResetButton label={c.shared.reset} onClick={reset} />
          </div>
        </div>

        {/* the chain */}
        <div className="relative h-32 rounded-xl border border-border bg-surface px-2 sm:h-36">
          <SceneRails
            edges={[
              { a: PTS.client, b: PTS.gateway, active: reached >= 1 },
              { a: PTS.gateway, b: PTS.service, active: reached >= 2 },
              { a: PTS.service, b: PTS.db, active: reached >= 3 },
            ]}
          />
          <SceneNode
            pt={PTS.client}
            icon={MonitorSmartphone}
            label={c.shared.client}
            active={activeNode === 'client'}
          />
          <SceneNode
            pt={PTS.gateway}
            icon={TowerControl}
            label={c.shared.gateway}
            active={activeNode === 'gateway'}
            badge={answered && stopAt === 'gateway' ? String(code) : undefined}
            badgeColor={AMBER}
          />
          <SceneNode
            pt={PTS.service}
            icon={Cpu}
            label={c.shared.service}
            active={activeNode === 'service'}
            badge={answered && stopAt === 'service' ? String(code) : undefined}
            badgeColor={AMBER}
          />
          <SceneNode
            pt={PTS.db}
            icon={Database}
            label={c.shared.database}
            active={activeNode === 'db'}
            badge={answered && stopAt === 'db' ? String(code) : undefined}
            badgeColor={code >= 500 ? ROSE : AMBER}
          />
          {leg && (
            <Packet key={legKey} points={leg.points} color={leg.color} duration={leg.duration} />
          )}
        </div>

        {answered && stopAt && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2.5 text-center text-xs text-muted"
          >
            <span className="font-mono uppercase tracking-wide">{t.stoppedAt}</span>{' '}
            {t.stops[stopAt]}
          </motion.p>
        )}

        {/* request / response */}
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <CodeSurface title={t.requestTitle} body={requestText} tone="accent" />
          <CodeSurface
            title={t.responseTitle}
            tone={answered ? (failure ? (code >= 500 ? 'rose' : 'amber') : 'emerald') : 'muted'}
            dim={!answered}
            body={answered ? (failure ? failure.body : call.okBody) : t.waiting}
            right={answered ? <StatusPill code={code} /> : undefined}
          />
        </div>

        {/* explanations */}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <p className="rounded-lg border border-border bg-surface-2/40 p-3 text-xs leading-relaxed text-fg/80">
            {t.calls.find((x) => x.id === callId)!.note}
          </p>
          <p
            className={cn(
              'rounded-lg border p-3 text-xs leading-relaxed',
              condId === 'ok'
                ? 'border-emerald-500/30 bg-emerald-500/[0.07] text-fg/80'
                : 'border-amber-500/30 bg-amber-500/[0.07] text-fg/80',
            )}
          >
            {cond.explain}
          </p>
        </div>

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
                {log.map((e) => (
                  <motion.li
                    key={e.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-wrap items-center gap-2 font-mono text-xs"
                  >
                    <MethodChip method={e.method} path={e.path} />
                    <span aria-hidden className="text-muted">
                      →
                    </span>
                    <StatusPill code={e.code} text={e.text} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </ApiPanel>

      <ApiNote>{t.note}</ApiNote>
    </div>
  );
}
