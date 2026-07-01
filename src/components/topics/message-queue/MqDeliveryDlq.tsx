'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Play,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { SceneRails, SceneNode, Packet, type Pt } from '../cdn/scene';
import { messageQueueContent, type DeliveryCard } from './content';

const ACCENT = 'rgb(var(--accent))';
const EMERALD = 'rgb(16 185 129)';
const AMBER = 'rgb(245 158 11)';
const RED = 'rgb(239 68 68)';
const MAX_ATTEMPTS = 3;

const cardTone: Record<DeliveryCard['id'], string> = {
  'at-most': 'text-amber-500',
  'at-least': 'text-accent',
  exactly: 'text-emerald-500',
};

const PTS: Record<string, Pt> = {
  queue: { x: 12, y: 42 },
  consumer: { x: 50, y: 26 },
  dlq: { x: 86, y: 72 },
};

type Phase = 'try' | 'retry' | 'deliver' | 'dlq';
type Leg = { points: Pt[]; color: string; phase: Phase; attempt: number };

export function MqDeliveryDlq({ locale }: { locale: Locale }) {
  const c = messageQueueContent[locale];
  const d = c.delivery;
  const q = c.dlq;

  const [poison, setPoison] = useState(false);
  const [legIndex, setLegIndex] = useState(-1);
  const [terminal, setTerminal] = useState<'delivered' | 'dlq' | null>(null);
  const [runKey, setRunKey] = useState(0);
  const legs = useRef<Leg[]>([]);

  const running = legIndex >= 0;
  const current = running ? legs.current[legIndex] : null;

  function process() {
    if (running) return;
    const built: Leg[] = [];
    if (!poison) {
      built.push({ points: [PTS.queue, PTS.consumer], color: ACCENT, phase: 'deliver', attempt: 1 });
    } else {
      for (let a = 1; a <= MAX_ATTEMPTS; a++) {
        built.push({ points: [PTS.queue, PTS.consumer], color: RED, phase: 'try', attempt: a });
        if (a < MAX_ATTEMPTS) {
          built.push({ points: [PTS.consumer, PTS.queue], color: AMBER, phase: 'retry', attempt: a });
        }
      }
      built.push({ points: [PTS.consumer, PTS.dlq], color: RED, phase: 'dlq', attempt: MAX_ATTEMPTS });
    }
    legs.current = built;
    setTerminal(null);
    setLegIndex(0);
    setRunKey((k) => k + 1);
  }

  function onLegDone() {
    const leg = legs.current[legIndex];
    const last = legIndex >= legs.current.length - 1;
    if (last) {
      setTerminal(leg.phase === 'deliver' ? 'delivered' : 'dlq');
      setLegIndex(-1);
      return;
    }
    setLegIndex((i) => i + 1);
  }

  function reset() {
    setLegIndex(-1);
    setTerminal(null);
    legs.current = [];
  }

  const attemptNum = current?.attempt ?? (terminal ? MAX_ATTEMPTS : 0);
  const consumerFailing = current?.phase === 'try' || current?.phase === 'dlq' || (terminal === 'dlq');

  let status: { text: string; tone: string } | null = null;
  if (terminal === 'delivered') status = { text: q.delivered, tone: 'text-emerald-500' };
  else if (terminal === 'dlq') status = { text: q.movedToDlq, tone: 'text-red-500' };
  else if (current?.phase === 'retry') status = { text: q.retrying, tone: 'text-amber-500' };
  else if (current?.phase === 'try') status = { text: `${q.attempt} ${current.attempt} ${q.of} ${MAX_ATTEMPTS}`, tone: 'text-muted' };
  else if (current?.phase === 'dlq') status = { text: q.failed, tone: 'text-red-500' };
  else if (current?.phase === 'deliver') status = { text: `${q.attempt} 1 ${q.of} ${MAX_ATTEMPTS}`, tone: 'text-muted' };

  return (
    <div className="not-prose space-y-10">
      {/* delivery semantics cards */}
      <div>
        <h3 className="font-display text-xl font-semibold text-fg">{d.title}</h3>
        <p className="mt-1 max-w-3xl text-sm text-muted">{d.subtitle}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {d.cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <div className={cn('font-display text-lg font-semibold', cardTone[card.id])}>
                {card.label}
              </div>
              <div className="mt-0.5 font-mono text-[0.7rem] uppercase tracking-wide text-muted">
                {card.tagline}
              </div>
              <dl className="mt-4 space-y-2.5 text-sm">
                <Row icon={card.id === 'at-most' ? 'bad' : 'good'} label={d.rowLoss} value={card.loss} />
                <Row icon={card.id === 'at-least' ? 'bad' : 'good'} label={d.rowDup} value={card.dup} />
                <Row label={d.rowCost} value={card.cost} />
              </dl>
              <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted">
                <span className="font-semibold text-fg/80">{d.rowWhen}: </span>
                {card.when}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* DLQ retry visualization */}
      <div>
        <h3 className="font-display text-xl font-semibold text-fg">{q.title}</h3>
        <p className="mt-1 max-w-3xl text-sm text-muted">{q.subtitle}</p>

        <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setPoison((p) => !p)}
              disabled={running}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60',
                poison
                  ? 'border-red-500/60 bg-red-500/10 text-red-500'
                  : 'border-border text-muted hover:text-fg',
              )}
            >
              <AlertTriangle className="h-4 w-4" aria-hidden />
              {poison ? q.poisonOn : q.poisonOff}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={process}
                disabled={running}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30 disabled:opacity-70"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden />
                {running ? q.processing : q.process}
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                {q.reset}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="relative h-[15rem] min-w-[560px]">
              <SceneRails
                edges={[
                  { a: PTS.queue, b: PTS.consumer, active: running },
                  { a: PTS.consumer, b: PTS.dlq, active: terminal === 'dlq' || current?.phase === 'dlq' },
                ]}
              />

              <SceneNode pt={PTS.queue} icon={Layers} label={q.mainQueue} active={running} />
              <SceneNode
                pt={PTS.consumer}
                icon={consumerFailing ? XCircle : terminal === 'delivered' ? CheckCircle2 : Cpu}
                label={q.consumer}
                active={running}
                badge={attemptNum > 0 ? `${q.attempt} ${attemptNum}/${MAX_ATTEMPTS}` : undefined}
                badgeColor={consumerFailing ? RED : ACCENT}
              />
              <SceneNode
                pt={PTS.dlq}
                icon={AlertTriangle}
                label={q.dlqLabel}
                active={terminal === 'dlq'}
                badge={terminal === 'dlq' ? '1' : undefined}
                badgeColor={RED}
              />

              {current && (
                <Packet
                  key={`${runKey}-${legIndex}`}
                  points={current.points}
                  color={current.color}
                  duration={current.phase === 'retry' ? 0.7 : 0.9}
                  onDone={onLegDone}
                />
              )}
            </div>
          </div>

          <div className="mt-3 min-h-[1.25rem] text-center text-sm font-medium">
            {status ? (
              <span className={status.tone}>{status.text}</span>
            ) : (
              <span className="text-muted">{q.idleHint}</span>
            )}
          </div>

          <p className="mt-2 text-xs leading-relaxed text-muted">{q.note}</p>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon?: 'good' | 'bad'; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="inline-flex items-center gap-1.5 font-medium text-fg/85">
        {icon === 'good' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />}
        {icon === 'bad' && <XCircle className="h-3.5 w-3.5 text-red-500" aria-hidden />}
        <span className="text-right">{value}</span>
      </dd>
    </div>
  );
}
