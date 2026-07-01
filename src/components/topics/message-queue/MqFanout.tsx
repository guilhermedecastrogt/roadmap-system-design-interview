'use client';

import { useState } from 'react';
import { type LucideIcon, BarChart3, Bell, Layers, PlugZap, Search, Send } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { CompareTwo } from '../_shared/CompareTwo';
import { SceneRails, SceneNode, Packet, type Pt } from '../cdn/scene';
import { messageQueueContent } from './content';

const ACCENT = 'rgb(var(--accent))';
const EMERALD = 'rgb(16 185 129)';
const RED = 'rgb(239 68 68)';

const PTS: Record<string, Pt> = {
  producer: { x: 9, y: 50 },
  queue: { x: 40, y: 50 },
  notify: { x: 84, y: 16 },
  analytics: { x: 84, y: 50 },
  search: { x: 84, y: 84 },
};

const consumerIcon: Record<string, LucideIcon> = {
  notify: Bell,
  analytics: BarChart3,
  search: Search,
};

type Stage = 'idle' | 'toQueue' | 'fanout';
type Result = 'ok' | 'down';

export function MqFanout({ locale }: { locale: Locale }) {
  const c = messageQueueContent[locale].fanout;
  const [stage, setStage] = useState<Stage>('idle');
  const [runKey, setRunKey] = useState(0);
  const [results, setResults] = useState<Record<string, Result | null>>({});
  const [analyticsDown, setAnalyticsDown] = useState(false);

  const running = stage !== 'idle';

  function publish() {
    if (running) return;
    setResults({});
    setStage('toQueue');
    setRunKey((k) => k + 1);
  }

  function onQueueReached() {
    setStage('fanout');
  }

  function onConsumerReached(id: string) {
    const res: Result = id === 'analytics' && analyticsDown ? 'down' : 'ok';
    setResults((r) => {
      const next = { ...r, [id]: res };
      if (Object.keys(next).length === c.consumers.length) {
        setTimeout(() => setStage('idle'), 400);
      }
      return next;
    });
  }

  function reset() {
    setStage('idle');
    setResults({});
  }

  return (
    <div className="not-prose">
      <h3 className="font-display text-xl font-semibold text-fg">{c.title}</h3>
      <p className="mt-1 max-w-3xl text-sm text-muted">{c.subtitle}</p>

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        {/* controls */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setAnalyticsDown((d) => !d)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
              analyticsDown
                ? 'border-red-500/60 bg-red-500/10 text-red-500'
                : 'border-border text-muted hover:text-fg',
            )}
          >
            <PlugZap className="h-4 w-4" aria-hidden />
            {analyticsDown ? c.restore : c.knockDown}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={publish}
              disabled={running}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30 disabled:opacity-70"
            >
              <Send className="h-4 w-4" aria-hidden />
              {running ? c.publishing : c.publish}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              {c.reset}
            </button>
          </div>
        </div>

        {/* diagram */}
        <div className="overflow-x-auto">
          <div className="relative h-[16rem] min-w-[560px]">
            <SceneRails
              edges={[
                { a: PTS.producer, b: PTS.queue, active: running },
                { a: PTS.queue, b: PTS.notify, active: stage === 'fanout' },
                { a: PTS.queue, b: PTS.analytics, active: stage === 'fanout' && !analyticsDown },
                { a: PTS.queue, b: PTS.search, active: stage === 'fanout' },
              ]}
            />

            <SceneNode pt={PTS.producer} icon={Send} label={c.producer} active={running} />
            <SceneNode pt={PTS.queue} icon={Layers} label={c.queue} active={stage === 'fanout'} />

            {c.consumers.map((cons) => {
              const res = results[cons.id];
              const isDown = cons.id === 'analytics' && analyticsDown;
              const badge = res === 'down' ? c.downBadge : res === 'ok' ? c.okBadge : isDown ? c.downBadge : undefined;
              const badgeColor = badge === c.okBadge ? EMERALD : RED;
              return (
                <SceneNode
                  key={cons.id}
                  pt={PTS[cons.id]}
                  icon={consumerIcon[cons.id]}
                  label={cons.label}
                  active={res === 'ok'}
                  badge={badge}
                  badgeColor={badgeColor}
                />
              );
            })}

            {/* producer → queue */}
            {stage === 'toQueue' && (
              <Packet
                key={`q-${runKey}`}
                points={[PTS.producer, PTS.queue]}
                color={ACCENT}
                duration={0.7}
                onDone={onQueueReached}
              />
            )}

            {/* queue → each consumer, in parallel */}
            {stage === 'fanout' &&
              c.consumers.map((cons) => {
                const isDown = cons.id === 'analytics' && analyticsDown;
                return (
                  <Packet
                    key={`c-${cons.id}-${runKey}`}
                    points={[PTS.queue, PTS[cons.id]]}
                    color={isDown ? RED : EMERALD}
                    duration={cons.id === 'analytics' ? 1.2 : 0.85}
                    onDone={() => onConsumerReached(cons.id)}
                  />
                );
              })}
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted">{c.isolationNote}</p>
      </div>

      <div className="mt-8">
        <CompareTwo data={c.compare} />
      </div>
    </div>
  );
}
