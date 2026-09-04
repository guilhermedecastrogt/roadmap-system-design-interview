'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, Cpu, Play, Server } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { Packet, SceneNode, SceneRails, type Pt } from '../cdn/scene';
import { ApiHeading, ApiNote, ApiPanel, Segmented } from '../api-track/ApiKit';
import { STREAM_SHAPE, grpcContent, type StreamModeId } from './content';

const ACCENT = 'rgb(var(--accent))';
const EMERALD = 'rgb(16 185 129)';

const PTS: Record<'caller' | 'callee', Pt> = {
  caller: { x: 12, y: 50 },
  callee: { x: 88, y: 50 },
};

type Shot = { dir: 'up' | 'down'; delay: number };

/** When each message leaves, per mode — the shape of the conversation. */
const SCHEDULE: Record<StreamModeId, Shot[]> = {
  unary: [
    { dir: 'up', delay: 0 },
    { dir: 'down', delay: 0.95 },
  ],
  serverStream: [
    { dir: 'up', delay: 0 },
    { dir: 'down', delay: 0.95 },
    { dir: 'down', delay: 1.35 },
    { dir: 'down', delay: 1.75 },
    { dir: 'down', delay: 2.15 },
  ],
  clientStream: [
    { dir: 'up', delay: 0 },
    { dir: 'up', delay: 0.4 },
    { dir: 'up', delay: 0.8 },
    { dir: 'up', delay: 1.2 },
    { dir: 'down', delay: 2.1 },
  ],
  bidi: [
    { dir: 'up', delay: 0 },
    { dir: 'down', delay: 0.5 },
    { dir: 'up', delay: 0.95 },
    { dir: 'down', delay: 1.45 },
    { dir: 'up', delay: 1.9 },
    { dir: 'down', delay: 2.4 },
  ],
};

/**
 * The four call types, played out on one connection. Seeing client streaming
 * and bidirectional side by side is the quickest way to understand what HTTP/2
 * multiplexing actually buys.
 */
export function GrpcStreamingModes({ locale }: { locale: Locale }) {
  const t = grpcContent[locale].streaming;
  const [modeId, setModeId] = useState<StreamModeId>('unary');
  const [play, setPlay] = useState(0);

  const mode = t.modes.find((m) => m.id === modeId)!;
  const shots = SCHEDULE[modeId];
  const shape = STREAM_SHAPE[modeId];

  return (
    <div className="not-prose">
      <ApiHeading title={t.title} subtitle={t.subtitle} />

      <ApiPanel>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Segmented
            value={modeId}
            options={t.modes.map((m) => ({ id: m.id, label: m.label }))}
            onChange={(next: StreamModeId) => {
              setModeId(next);
              setPlay((n) => n + 1);
            }}
          />
          <button
            type="button"
            onClick={() => setPlay((n) => n + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30"
          >
            <Play className="h-4 w-4" aria-hidden />
            {t.playLabel}
          </button>
        </div>

        <code className="mb-3 block overflow-x-auto rounded-lg border border-border bg-surface px-3 py-2 font-mono text-[0.72rem] text-accent">
          {mode.signature}
        </code>

        <div className="relative h-32 rounded-xl border border-border bg-surface px-2 sm:h-36">
          <SceneRails edges={[{ a: PTS.caller, b: PTS.callee, active: true }]} />
          <SceneNode pt={PTS.caller} icon={Cpu} label={grpcContent[locale].shared.caller} active />
          <SceneNode pt={PTS.callee} icon={Server} label={grpcContent[locale].shared.callee} active />
          {shots.map((shot, i) => (
            <Packet
              key={`${modeId}-${play}-${i}`}
              points={
                shot.dir === 'up' ? [PTS.caller, PTS.callee] : [PTS.callee, PTS.caller]
              }
              color={shot.dir === 'up' ? ACCENT : EMERALD}
              duration={0.8}
              delay={shot.delay}
            />
          ))}
        </div>

        {/* message counters */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-2 py-1 font-mono text-[0.68rem] font-semibold text-accent">
            <ArrowUpRight className="h-3 w-3" aria-hidden />
            {shape.up === 1 ? '1' : `${shape.up}+`} · {t.upLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2 py-1 font-mono text-[0.68rem] font-semibold text-emerald-500">
            <ArrowDownLeft className="h-3 w-3" aria-hidden />
            {shape.down === 1 ? '1' : `${shape.down}+`} · {t.downLabel}
          </span>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {t.modes.map((m) => (
            <motion.button
              key={m.id}
              type="button"
              onClick={() => {
                setModeId(m.id);
                setPlay((n) => n + 1);
              }}
              animate={{ opacity: m.id === modeId ? 1 : 0.6 }}
              className={cn(
                'rounded-xl border p-3 text-left transition-colors',
                m.id === modeId ? 'border-accent bg-accent/[0.06]' : 'border-border hover:border-accent/40',
              )}
            >
              <span
                className={cn(
                  'block text-[0.8rem] font-semibold',
                  m.id === modeId ? 'text-accent' : 'text-fg',
                )}
              >
                {m.label}
              </span>
              <span className="mt-1 block text-[0.7rem] leading-snug text-muted">{m.what}</span>
              <span className="mt-1.5 block text-[0.66rem] leading-snug text-fg/70">
                {m.example}
              </span>
            </motion.button>
          ))}
        </div>
      </ApiPanel>

      <ApiNote>{t.note}</ApiNote>
    </div>
  );
}
