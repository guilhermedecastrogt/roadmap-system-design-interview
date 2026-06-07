'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, RotateCcw, Scale, Send, Server, Users } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { SceneRails, type Pt } from '../cdn/scene';
import { lbContent, type LbAlgo, type LbContent } from './content';

type ServerId = 'A' | 'B' | 'C';
type ServerState = {
  id: ServerId;
  healthy: boolean;
  weight: number;
  latency: number;
  active: number;
  total: number;
};

type Fly = { key: number; points: Pt[]; color: string; label: string };

const PTS: Record<string, Pt> = {
  clients: { x: 8, y: 50 },
  lb: { x: 38, y: 50 },
  A: { x: 84, y: 16 },
  B: { x: 84, y: 50 },
  C: { x: 84, y: 84 },
};

const ACCENT = 'rgb(var(--accent))';
const PALETTE = ['rgb(45 212 191)', 'rgb(139 92 246)', 'rgb(245 158 11)'];
const IP_POOL = ['198.51.7', '203.0.42', '192.0.9'];
const URL_POOL = ['/video', '/profile', '/admin'];

const INITIAL: ServerState[] = [
  { id: 'A', healthy: true, weight: 3, latency: 10, active: 0, total: 0 },
  { id: 'B', healthy: true, weight: 2, latency: 5, active: 0, total: 0 },
  { id: 'C', healthy: true, weight: 1, latency: 120, active: 0, total: 0 },
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const ALGOS: LbAlgo[] = [
  'round-robin',
  'weighted',
  'least-conn',
  'least-response',
  'ip-hash',
  'url-hash',
];

export function LbSimulator({ locale }: { locale: Locale }) {
  const c = lbContent[locale].sim;
  const [algo, setAlgo] = useState<LbAlgo>('round-robin');
  const [running, setRunning] = useState(false);
  const [servers, setServers] = useState<ServerState[]>(INITIAL);
  const [flying, setFlying] = useState<Fly[]>([]);

  const serversRef = useRef(servers);
  const algoRef = useRef(algo);
  const rr = useRef(0);
  const credit = useRef<Record<ServerId, number>>({ A: 0, B: 0, C: 0 });
  const ipIdx = useRef(0);
  const urlIdx = useRef(0);
  const reqId = useRef(0);
  const flyKey = useRef(0);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    serversRef.current = servers;
  }, [servers]);
  useEffect(() => {
    algoRef.current = algo;
  }, [algo]);

  const bump = useCallback((id: ServerId, dActive: number, dTotal: number) => {
    setServers((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, active: Math.max(0, s.active + dActive), total: s.total + dTotal }
          : s,
      ),
    );
  }, []);

  const pick = useCallback((): { id: ServerId; label: string; color: string } | null => {
    const list = serversRef.current.filter((s) => s.healthy);
    if (list.length === 0) return null;
    const a = algoRef.current;

    if (a === 'ip-hash' || a === 'url-hash') {
      const pool = a === 'ip-hash' ? IP_POOL : URL_POOL;
      const idxRef = a === 'ip-hash' ? ipIdx : urlIdx;
      const which = idxRef.current % pool.length;
      idxRef.current++;
      const value = pool[which];
      // stable mapping across all servers; probe forward if unhealthy
      let i = hash(value) % serversRef.current.length;
      for (let n = 0; n < serversRef.current.length; n++) {
        const s = serversRef.current[(i + n) % serversRef.current.length];
        if (s.healthy) {
          return { id: s.id, label: value, color: PALETTE[which] };
        }
      }
      return null;
    }

    let target = list[0];
    if (a === 'round-robin') {
      target = list[rr.current % list.length];
      rr.current++;
    } else if (a === 'weighted') {
      const total = list.reduce((n, s) => n + s.weight, 0);
      for (const s of list) credit.current[s.id] += s.weight;
      target = list.reduce((best, s) =>
        credit.current[s.id] > credit.current[best.id] ? s : best,
      );
      credit.current[target.id] -= total;
    } else if (a === 'least-conn') {
      target = list.reduce((best, s) => (s.active < best.active ? s : best));
    } else if (a === 'least-response') {
      target = list.reduce((best, s) => (s.latency < best.latency ? s : best));
    }
    return { id: target.id, label: `#${++reqId.current}`, color: ACCENT };
  }, []);

  const emit = useCallback(() => {
    const choice = pick();
    if (!choice) return;
    bump(choice.id, 1, 0);
    const key = flyKey.current++;
    setFlying((prev) => [
      ...prev,
      { key, points: [PTS.clients, PTS.lb, PTS[choice.id]], color: choice.color, label: choice.label },
    ]);
    const life = 1400 + Math.random() * 1600;
    const t = setTimeout(() => bump(choice.id, -1, 1), life);
    timeouts.current.push(t);
  }, [pick, bump]);

  // auto traffic
  useEffect(() => {
    if (!running) return;
    interval.current = setInterval(emit, 760);
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [running, emit]);

  useEffect(
    () => () => {
      if (interval.current) clearInterval(interval.current);
      timeouts.current.forEach(clearTimeout);
    },
    [],
  );

  function toggleHealth(id: ServerId) {
    setServers((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, healthy: !s.healthy, active: s.healthy ? 0 : s.active } : s,
      ),
    );
  }

  function reset() {
    setRunning(false);
    if (interval.current) clearInterval(interval.current);
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    rr.current = 0;
    credit.current = { A: 0, B: 0, C: 0 };
    ipIdx.current = 0;
    urlIdx.current = 0;
    reqId.current = 0;
    setFlying([]);
    setServers(INITIAL.map((s) => ({ ...s })));
  }

  const maxTotal = Math.max(1, ...servers.map((s) => s.total));

  return (
    <div className="not-prose">
      <h3 className="font-display text-xl font-semibold text-fg">{c.title}</h3>
      <p className="mt-1 text-sm text-muted">{c.subtitle}</p>

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        {/* method chips */}
        <div className="mb-1 font-mono text-[0.7rem] uppercase tracking-wide text-muted">
          {c.method}
        </div>
        <div className="flex flex-wrap gap-2">
          {ALGOS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAlgo(a)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                algo === a
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-border text-muted hover:bg-surface-2 hover:text-fg',
              )}
            >
              {c.algos[a].name}
            </button>
          ))}
        </div>

        <p className="mt-3 min-h-[2.5rem] text-sm text-fg/80">{c.algos[algo].blurb}</p>

        {/* controls */}
        <div className="mb-4 mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30"
          >
            {running ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4 fill-current" aria-hidden />}
            {running ? c.stop : c.start}
          </button>
          <button
            type="button"
            onClick={emit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
          >
            <Send className="h-4 w-4" aria-hidden />
            {c.sendOne}
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            {c.reset}
          </button>
        </div>

        {/* canvas */}
        <div className="overflow-x-auto">
          <div className="relative h-[22rem] min-w-[640px]">
            <SceneRails
              edges={[
                { a: PTS.clients, b: PTS.lb },
                { a: PTS.lb, b: PTS.A },
                { a: PTS.lb, b: PTS.B },
                { a: PTS.lb, b: PTS.C },
              ]}
            />

            {/* clients */}
            <Marker pt={PTS.clients} label={c.clients} icon={Users} pulse={running} />

            {/* load balancer */}
            <div
              className="absolute z-[5] -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${PTS.lb.x}%`, top: `${PTS.lb.y}%` }}
            >
              <div className="flex w-32 flex-col items-center gap-1 rounded-xl border border-accent/50 bg-surface px-3 py-2.5 text-center shadow-md shadow-accent/10">
                <Scale className="h-5 w-5 text-accent" aria-hidden />
                <span className="text-xs font-semibold text-fg">{c.lb}</span>
                <span className="font-mono text-[0.65rem] leading-tight text-muted">
                  {c.algos[algo].name}
                </span>
              </div>
            </div>

            {/* servers */}
            {servers.map((s) => (
              <ServerCard
                key={s.id}
                s={s}
                algo={algo}
                c={c}
                maxTotal={maxTotal}
                onToggle={() => toggleHealth(s.id)}
              />
            ))}

            {/* flying requests */}
            <AnimatePresence>
              {flying.map((f) => (
                <ReqDot
                  key={f.key}
                  f={f}
                  onDone={() => setFlying((prev) => prev.filter((x) => x.key !== f.key))}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted">{c.healthHint}</p>
      </div>
    </div>
  );
}

function Marker({
  pt,
  label,
  icon: Icon,
  pulse,
}: {
  pt: Pt;
  label: string;
  icon: typeof Users;
  pulse?: boolean;
}) {
  return (
    <div
      className="absolute z-[5] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
      style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
    >
      <span className="relative grid h-11 w-11 place-items-center rounded-xl border border-border bg-surface text-muted">
        <Icon className="h-5 w-5" aria-hidden />
        {pulse && (
          <motion.span
            className="absolute inset-0 rounded-xl ring-2 ring-accent"
            animate={{ opacity: [0.15, 0.7, 0.15] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
          />
        )}
      </span>
      <span className="font-mono text-[0.7rem] text-muted">{label}</span>
    </div>
  );
}

function ServerCard({
  s,
  algo,
  c,
  maxTotal,
  onToggle,
}: {
  s: ServerState;
  algo: LbAlgo;
  c: LbContent['sim'];
  maxTotal: number;
  onToggle: () => void;
}) {
  const badge =
    algo === 'weighted'
      ? `${c.weight} ${s.weight}`
      : algo === 'least-response'
        ? `${s.latency} ${c.ms}`
        : algo === 'least-conn'
          ? `${s.active} ${c.active}`
          : null;

  return (
    <motion.div
      animate={{ scale: s.active > 0 && s.healthy ? 1.03 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={cn(
        'absolute z-[5] w-40 -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-surface p-3 transition-colors',
        s.healthy ? 'border-border' : 'border-rose-500/50 opacity-60',
      )}
      style={{ left: `${PTS[s.id].x}%`, top: `${PTS[s.id].y}%` }}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-fg">
          <Server className="h-4 w-4 text-muted" aria-hidden />
          {s.id}
        </span>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-1"
          aria-label={`toggle server ${s.id}`}
        >
          <span
            className={cn(
              'h-2.5 w-2.5 rounded-full',
              s.healthy ? 'bg-emerald-500' : 'bg-rose-500',
            )}
          />
          {!s.healthy && (
            <span className="font-mono text-[0.6rem] font-semibold text-rose-500">
              {c.down}
            </span>
          )}
        </button>
      </div>

      {badge && (
        <span className="mt-1.5 inline-block rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.65rem] text-fg/80">
          {badge}
        </span>
      )}

      {/* active connections bar */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full bg-accent"
          animate={{ width: `${Math.min(100, (s.active / 6) * 100)}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between font-mono text-[0.65rem] text-muted">
        <span>
          {s.active} {c.active}
        </span>
        <span className="text-fg/70">
          {s.total} {c.total}
        </span>
      </div>
      {/* total share bar */}
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full bg-accent/40"
          animate={{ width: `${(s.total / maxTotal) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}

function ReqDot({ f, onDone }: { f: Fly; onDone: () => void }) {
  const times = f.points.map((_, i) => i / (f.points.length - 1));
  return (
    <motion.div
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
      initial={{ left: `${f.points[0].x}%`, top: `${f.points[0].y}%`, opacity: 0 }}
      animate={{
        left: f.points.map((p) => `${p.x}%`),
        top: f.points.map((p) => `${p.y}%`),
        opacity: [1, 1, 1],
      }}
      transition={{ duration: 1.0, times, ease: 'easeInOut' }}
      onAnimationComplete={onDone}
    >
      <span className="relative flex items-center">
        <span
          className="h-3 w-3 rounded-full"
          style={{ background: f.color, boxShadow: `0 0 10px ${f.color}` }}
        />
        <span className="ml-1 whitespace-nowrap rounded border border-border bg-bg/90 px-1 py-0.5 font-mono text-[0.6rem] text-fg">
          {f.label}
        </span>
      </span>
    </motion.div>
  );
}
