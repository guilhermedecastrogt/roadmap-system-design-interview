'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Rss, Smartphone, Star, Users, Zap } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { SceneRails, Packet, type Pt } from '../cdn/scene';
import { twContent } from './content';
import { TwHeading, TwStage, TwButton, TwNode, STORE_META } from './TwKit';

const PTS: Record<string, Pt> = {
  client: { x: 8, y: 52 },
  timeline: { x: 38, y: 52 },
  redis: { x: 38, y: 15 },
  mongo: { x: 82, y: 32 },
  follow: { x: 82, y: 74 },
};

const EMERALD = 'rgb(16 185 129)';
const AMBER = 'rgb(245 158 11)';

type Result = { type: 'hit' | 'miss'; ms: number } | null;

export function TwTimeline({ locale }: { locale: Locale }) {
  const c = twContent[locale].timeline;
  const [warm, setWarm] = useState(false);
  const [running, setRunning] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [pending, setPending] = useState<{ type: 'hit' | 'miss'; ms: number; points: Pt[]; color: string; dur: number } | null>(null);
  const [last, setLast] = useState<Result>(null);
  const [stats, setStats] = useState({ hits: 0, misses: 0 });
  const [fanoutMode, setFanoutMode] = useState<'write' | 'read'>('write');

  function load() {
    if (running) return;
    let p: NonNullable<typeof pending>;
    if (warm) {
      p = {
        type: 'hit',
        ms: 6 + Math.floor(Math.random() * 8),
        points: [PTS.client, PTS.timeline, PTS.redis, PTS.timeline, PTS.client],
        color: EMERALD,
        dur: 1.0,
      };
      setStats((s) => ({ ...s, hits: s.hits + 1 }));
    } else {
      p = {
        type: 'miss',
        ms: 160 + Math.floor(Math.random() * 60),
        points: [PTS.client, PTS.timeline, PTS.redis, PTS.mongo, PTS.follow, PTS.timeline, PTS.client],
        color: AMBER,
        dur: 1.9,
      };
      setStats((s) => ({ ...s, misses: s.misses + 1 }));
    }
    setPending(p);
    setLast(null);
    setRunning(true);
    setRunKey((k) => k + 1);
  }

  function onArrive() {
    if (pending) {
      setLast({ type: pending.type, ms: pending.ms });
      if (pending.type === 'miss') setWarm(true);
    }
    setRunning(false);
  }

  function reset() {
    setWarm(false);
    setRunning(false);
    setLast(null);
    setStats({ hits: 0, misses: 0 });
    setPending(null);
  }

  const total = stats.hits + stats.misses;
  const hitRate = total ? Math.round((stats.hits / total) * 100) : 0;
  const resultColor = last?.type === 'hit' ? EMERALD : AMBER;
  const f = c.fanout;

  return (
    <div className="not-prose">
      <TwHeading title={c.title} subtitle={c.subtitle} />

      <TwStage>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.68rem] uppercase tracking-wide text-muted">Redis</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide',
                warm ? 'bg-emerald-500/15 text-emerald-500' : 'bg-surface-2 text-muted',
              )}
            >
              {warm ? c.cachedBadge : c.coldBadge}
            </span>
          </div>
          <div className="flex gap-2">
            <TwButton onClick={load} disabled={running}>
              <Rss className="h-4 w-4" aria-hidden />
              {running ? c.loading : c.load}
            </TwButton>
            <TwButton onClick={() => setWarm(false)} variant="ghost">
              {c.invalidate}
            </TwButton>
            <TwButton onClick={reset} variant="ghost">
              {c.reset}
            </TwButton>
          </div>
        </div>

        {/* scene */}
        <div className="overflow-x-auto">
          <div className="relative h-[16rem] min-w-[560px]">
            <SceneRails
              edges={[
                { a: PTS.client, b: PTS.timeline, active: running },
                { a: PTS.timeline, b: PTS.redis, active: running },
                { a: PTS.timeline, b: PTS.mongo, active: running && !warm },
                { a: PTS.timeline, b: PTS.follow, active: running && !warm },
              ]}
            />

            <TwNode x={PTS.client.x} y={PTS.client.y} icon={Smartphone} label={c.nodes.client} active={running} />
            <TwNode x={PTS.timeline.x} y={PTS.timeline.y} icon={Rss} label={c.nodes.timeline} active={running} />
            <TwNode
              x={PTS.redis.x}
              y={PTS.redis.y}
              icon={Zap}
              label={c.nodes.redis}
              color={STORE_META.redis.color}
              active={warm}
              badge={last?.type === 'hit' ? c.hit : last?.type === 'miss' ? c.miss : undefined}
              badgeColor={last?.type === 'hit' ? EMERALD : AMBER}
              width="w-24"
            />
            <TwNode x={PTS.mongo.x} y={PTS.mongo.y} icon={Database} label={c.nodes.mongo} color={STORE_META.mongodb.color} active={running && !warm} />
            <TwNode x={PTS.follow.x} y={PTS.follow.y} icon={Users} label={c.nodes.follow} active={running && !warm} width="w-28" />

            {running && pending && (
              <Packet key={runKey} points={pending.points} color={pending.color} duration={pending.dur} onDone={onArrive} />
            )}
          </div>
        </div>

        {/* result + stats */}
        <div className="mt-4 grid gap-4 sm:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted">
                {last ? (last.type === 'hit' ? c.hitText : c.missText) : c.hitText}
              </span>
              <AnimatePresence mode="wait">
                {last && (
                  <motion.span
                    key={`${last.type}-${last.ms}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono text-lg font-bold tabular-nums"
                    style={{ color: resultColor }}
                  >
                    ~{last.ms} ms
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className="h-full rounded-full"
                style={{ background: resultColor }}
                animate={{ width: last ? `${Math.min(100, (last.ms / 240) * 100)}%` : '0%' }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-surface p-3 text-center">
            <Stat value={stats.hits} label={c.statHits} />
            <Stat value={stats.misses} label={c.statMisses} />
            <Stat value={`${hitRate}%`} label={c.statHitRate} />
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted">{c.note}</p>
      </TwStage>

      {/* Fanout on write vs read */}
      <div className="mt-8">
        <TwHeading title={f.title} subtitle={f.subtitle} />
        <TwStage>
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {(['write', 'read'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setFanoutMode(m)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  fanoutMode === m ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg',
                )}
              >
                {m === 'write' ? f.write : f.read}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={fanoutMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="mt-4"
            >
              <FanoutDiagram mode={fanoutMode} />
              <p className="mt-4 text-sm leading-relaxed text-fg/85">
                {fanoutMode === 'write' ? f.writeDesc : f.readDesc}
              </p>
              <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] px-3 py-2 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                {fanoutMode === 'write' ? f.writeCost : f.readCost}
              </p>
            </motion.div>
          </AnimatePresence>

          <p className="mt-4 rounded-lg border border-accent/30 bg-accent/[0.06] px-3 py-2.5 text-xs leading-relaxed text-fg/85">
            {f.hybrid}
          </p>

          {/* real-world usage */}
          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-fg">{f.realWorld.title}</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-3 font-mono text-[0.62rem] uppercase tracking-wide text-muted">{f.realWorld.cols.system}</th>
                    <th className="py-2 pr-3 font-mono text-[0.62rem] uppercase tracking-wide text-muted">{f.realWorld.cols.approach}</th>
                    <th className="py-2 font-mono text-[0.62rem] uppercase tracking-wide text-muted">{f.realWorld.cols.note}</th>
                  </tr>
                </thead>
                <tbody>
                  {f.realWorld.rows.map((r) => (
                    <tr key={r.system} className="border-b border-border/60 last:border-0">
                      <td className="py-2.5 pr-3 align-top text-sm font-semibold text-fg">{r.system}</td>
                      <td className="py-2.5 pr-3 align-top">
                        <span className="whitespace-nowrap rounded-full bg-accent/15 px-2 py-0.5 text-[0.68rem] font-semibold text-accent">
                          {r.approach}
                        </span>
                      </td>
                      <td className="py-2.5 align-top text-xs leading-relaxed text-muted">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 flex items-start gap-2 rounded-lg border border-violet-500/30 bg-violet-500/[0.06] px-3 py-2.5 text-xs leading-relaxed text-fg/85">
              <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" aria-hidden />
              {f.realWorld.celebrities}
            </p>
          </div>
        </TwStage>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div>
      <div className="font-mono text-lg font-bold tabular-nums text-fg">{value}</div>
      <div className="text-[0.58rem] uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

/**
 * A compact schematic contrasting where the work happens: on write, a tweet
 * fans out into many follower timelines; on read, a feed pulls from many
 * authors at load time. Arrows flow the opposite way for each mode.
 */
function FanoutDiagram({ mode }: { mode: 'write' | 'read' }) {
  const followers = [0, 1, 2, 3];
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-4">
        {/* left: single node */}
        <div className="flex flex-col items-center gap-1">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-accent bg-accent/10 text-accent">
            {mode === 'write' ? <Rss className="h-5 w-5" aria-hidden /> : <Smartphone className="h-5 w-5" aria-hidden />}
          </div>
          <span className="font-mono text-[0.62rem] text-muted">
            {mode === 'write' ? 'new tweet' : 'feed load'}
          </span>
        </div>

        {/* arrows */}
        <div className="flex flex-1 flex-col gap-1.5">
          {followers.map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                'h-0.5 origin-left rounded-full bg-gradient-to-r',
                mode === 'write'
                  ? 'from-accent to-emerald-400'
                  : 'from-emerald-400 to-accent',
              )}
              style={mode === 'read' ? { transformOrigin: 'right' } : undefined}
            />
          ))}
        </div>

        {/* right: many nodes */}
        <div className="flex flex-col gap-1.5">
          {followers.map((i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2 py-1"
            >
              <Users className="h-3 w-3 text-muted" aria-hidden />
              <span className="font-mono text-[0.6rem] text-muted">
                {mode === 'write' ? `timeline ${i + 1}` : `author ${i + 1}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
