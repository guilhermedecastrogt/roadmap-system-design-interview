'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Boxes,
  CheckCircle2,
  Cpu,
  Database,
  MonitorSmartphone,
  XCircle,
} from 'lucide-react';
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
import { apiOverviewContent, wire, type ScenarioId, type StageId } from './content';

const ACCENT = 'rgb(var(--accent))';
const EMERALD = 'rgb(16 185 129)';
const ROSE = 'rgb(244 63 94)';

const PTS: Record<'client' | 'api' | 'service' | 'db', Pt> = {
  client: { x: 8, y: 50 },
  api: { x: 36, y: 50 },
  service: { x: 64, y: 50 },
  db: { x: 92, y: 50 },
};

type Leg = { points: Pt[]; color: string; duration: number };

/**
 * The flagship visual of the overview lesson: one request travelling from a
 * client through the API, the service and the database — and back — with the
 * exact bytes the client sees on either end. The "missing credentials" scenario
 * makes the point that the contract also defines the rules for being let in.
 */
export function ApiJourney({ locale }: { locale: Locale }) {
  const c = apiOverviewContent[locale];
  const t = c.journey;

  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageId | null>(null);
  const [reached, setReached] = useState<StageId[]>([]);
  const [failed, setFailed] = useState(false);
  const [leg, setLeg] = useState<Leg | null>(null);
  const [legKey, setLegKey] = useState(0);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const runRef = useRef(0);

  const scenario = t.scenarios[scenarioIdx];
  const w = wire[scenario.id];
  const activeStage = t.stages.find((s) => s.id === stage) ?? null;

  function clear() {
    setStage(null);
    setReached([]);
    setFailed(false);
    setLeg(null);
    setActiveNode(null);
    setAnswered(false);
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

  function mark(id: StageId) {
    setStage(id);
    setReached((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  async function send() {
    if (running) return;
    const id = ++runRef.current;
    const alive = () => runRef.current === id;

    setRunning(true);
    clear();

    // 1 — client → API
    mark('send');
    setActiveNode('client');
    fly([PTS.client, PTS.api], ACCENT, 0.75);
    await sleep(800);
    if (!alive()) return;

    // 2 — the API checks the caller
    setActiveNode('api');
    mark('auth');
    await sleep(850);
    if (!alive()) return;

    if (w.failAt === 'auth') {
      setFailed(true);
      fly([PTS.api, PTS.client], ROSE, 0.7);
      await sleep(750);
      if (!alive()) return;
      setActiveNode('client');
      setAnswered(true);
      setRunning(false);
      return;
    }

    // 3 — the service applies the rules
    mark('service');
    fly([PTS.api, PTS.service], ACCENT, 0.6);
    await sleep(650);
    if (!alive()) return;
    setActiveNode('service');
    await sleep(400);
    if (!alive()) return;

    // 4 — storage is read or written
    mark('db');
    fly([PTS.service, PTS.db], ACCENT, 0.55);
    await sleep(600);
    if (!alive()) return;
    setActiveNode('db');
    await sleep(450);
    if (!alive()) return;
    fly([PTS.db, PTS.service], EMERALD, 0.55);
    await sleep(600);
    if (!alive()) return;

    // 5 — back to the client
    mark('back');
    setActiveNode('service');
    fly([PTS.service, PTS.api, PTS.client], EMERALD, 1.05);
    await sleep(1150);
    if (!alive()) return;
    setActiveNode('client');
    setAnswered(true);
    setRunning(false);
  }

  return (
    <div className="not-prose">
      <ApiHeading title={t.title} subtitle={t.subtitle} />

      <ApiPanel>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Segmented
            label={t.scenarioLabel}
            value={scenario.id}
            options={t.scenarios.map((s) => ({ id: s.id, label: s.label }))}
            onChange={(next: ScenarioId) => {
              runRef.current += 1;
              setRunning(false);
              clear();
              setScenarioIdx(t.scenarios.findIndex((s) => s.id === next));
            }}
          />
          <div className="flex items-center gap-2">
            <RunButton
              label={c.shared.send}
              runningLabel={c.shared.sending}
              running={running}
              onClick={send}
            />
            <ResetButton label={c.shared.reset} onClick={reset} />
          </div>
        </div>

        {/* the call being made */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <MethodChip method={w.method} path={w.path} />
          <AnimatePresence>
            {answered && (
              <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <StatusPill code={w.code} text={scenario.codeText} />
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* the trip */}
        <div className="relative h-32 rounded-xl border border-border bg-surface px-2 sm:h-36">
          <SceneRails
            edges={[
              { a: PTS.client, b: PTS.api, active: reached.length > 0 },
              { a: PTS.api, b: PTS.service, active: reached.includes('service') },
              { a: PTS.service, b: PTS.db, active: reached.includes('db') },
            ]}
          />
          <SceneNode
            pt={PTS.client}
            icon={MonitorSmartphone}
            label={c.shared.client}
            active={activeNode === 'client'}
          />
          <SceneNode
            pt={PTS.api}
            icon={Boxes}
            label={c.shared.api}
            active={activeNode === 'api'}
            badge={failed ? String(w.code) : undefined}
            badgeColor={ROSE}
          />
          <SceneNode
            pt={PTS.service}
            icon={Cpu}
            label={c.shared.service}
            active={activeNode === 'service'}
          />
          <SceneNode
            pt={PTS.db}
            icon={Database}
            label={c.shared.database}
            active={activeNode === 'db'}
          />
          {leg && (
            <Packet key={legKey} points={leg.points} color={leg.color} duration={leg.duration} />
          )}
        </div>

        {/* stage rail */}
        <ol className="mt-4 grid gap-1.5 sm:grid-cols-5">
          {t.stages.map((s, i) => {
            const done = reached.includes(s.id) && stage !== s.id;
            const isActive = stage === s.id;
            const isFail = isActive && failed;
            return (
              <li
                key={s.id}
                className={cn(
                  'flex items-start gap-1.5 rounded-lg border px-2 py-1.5 transition-colors',
                  isFail
                    ? 'border-rose-500/60 bg-rose-500/10'
                    : isActive
                      ? 'border-accent bg-accent/10'
                      : done
                        ? 'border-emerald-500/40 bg-emerald-500/[0.07]'
                        : 'border-border',
                )}
              >
                <span className="mt-[0.15rem] shrink-0">
                  {isFail ? (
                    <XCircle className="h-3.5 w-3.5 text-rose-500" aria-hidden />
                  ) : done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
                  ) : (
                    <span
                      className={cn(
                        'grid h-3.5 w-3.5 place-items-center rounded-full font-mono text-[0.5rem] font-bold',
                        isActive ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-muted',
                      )}
                    >
                      {i + 1}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'text-[0.68rem] font-medium leading-tight',
                    isActive || done ? 'text-fg' : 'text-muted',
                  )}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>

        <AnimatePresence mode="wait">
          <motion.p
            key={activeStage?.id ?? 'idle'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2.5 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted"
          >
            {activeStage ? activeStage.detail : t.hint}
          </motion.p>
        </AnimatePresence>

        {/* what the client actually sees */}
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <CodeSurface title={t.requestTitle} body={w.request} tone="accent" />
          <CodeSurface
            title={t.responseTitle}
            tone={answered ? (failed ? 'rose' : 'emerald') : 'muted'}
            dim={!answered}
            body={answered ? w.response : t.waiting}
            right={answered ? <StatusPill code={w.code} /> : undefined}
          />
        </div>

        <p className="mt-3 rounded-lg border border-border bg-surface-2/40 p-3 text-xs leading-relaxed text-fg/80">
          {scenario.note}
        </p>
      </ApiPanel>

      <ApiNote>{t.note}</ApiNote>
    </div>
  );
}
