'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Send, Smartphone, Server, MessageSquare } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { SceneRails, Packet, type Pt } from '../cdn/scene';
import { twContent } from './content';
import { TwHeading, TwStage, TwButton, TwNode, STORE_META } from './TwKit';

const PTS: Record<string, Pt> = {
  client: { x: 7, y: 30 },
  gateway: { x: 28, y: 30 },
  tweet: { x: 50, y: 30 },
  mongo: { x: 78, y: 18 },
  kafka: { x: 50, y: 78 },
  fanout: { x: 74, y: 62 },
  redis: { x: 93, y: 50 },
  search: { x: 74, y: 92 },
};

const ACCENT = 'rgb(var(--accent))';

/** Per-step packet path + colour. Index matches content.steps order. */
const LEGS: { points: Pt[]; color: string; dur: number }[] = [
  { points: [PTS.client, PTS.gateway], color: ACCENT, dur: 0.7 }, // gateway
  { points: [PTS.gateway, PTS.tweet, PTS.mongo], color: STORE_META.mongodb.color, dur: 1.1 }, // store
  { points: [PTS.mongo, PTS.tweet, PTS.kafka], color: STORE_META.kafka.color, dur: 1.1 }, // event
  { points: [PTS.kafka, PTS.fanout], color: STORE_META.kafka.color, dur: 0.8 }, // fanout
  { points: [PTS.fanout, PTS.redis], color: STORE_META.redis.color, dur: 0.8 }, // cache
  { points: [PTS.kafka, PTS.search], color: STORE_META.elasticsearch.color, dur: 0.9 }, // index
];

const ACTIVE_NODES: string[][] = [
  ['client', 'gateway'],
  ['tweet', 'mongo'],
  ['tweet', 'kafka'],
  ['kafka', 'fanout'],
  ['fanout', 'redis'],
  ['kafka', 'search'],
];

export function TwWritePath({ locale }: { locale: Locale }) {
  const c = twContent[locale].write;
  const [step, setStep] = useState(-1); // -1 idle, 0..5 running, 6 done
  const running = step >= 0 && step < LEGS.length;
  const done = step === LEGS.length;

  function post() {
    if (running) return;
    setStep(0);
  }
  function reset() {
    setStep(-1);
  }
  function onLegDone() {
    setStep((s) => s + 1);
  }

  const activeNodes = running ? ACTIVE_NODES[step] : [];
  const isActive = (id: string) => activeNodes.includes(id) || (done && true);

  return (
    <div className="not-prose">
      <TwHeading title={c.title} subtitle={c.subtitle} />

      <TwStage>
        {/* composer + controls */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
            <MessageSquare className="h-4 w-4 shrink-0 text-accent" aria-hidden />
            <span className="truncate text-sm text-fg/80">{c.composerPlaceholder}</span>
          </div>
          <TwButton onClick={post} disabled={running}>
            <Send className="h-4 w-4" aria-hidden />
            {running ? c.posting : c.post}
          </TwButton>
          <TwButton onClick={reset} variant="ghost">
            {c.reset}
          </TwButton>
        </div>

        {/* scene */}
        <div className="overflow-x-auto">
          <div className="relative h-[19rem] min-w-[620px]">
            <SceneRails
              edges={[
                { a: PTS.client, b: PTS.gateway, active: isActive('gateway') },
                { a: PTS.gateway, b: PTS.tweet, active: isActive('tweet') },
                { a: PTS.tweet, b: PTS.mongo, active: isActive('mongo') },
                { a: PTS.tweet, b: PTS.kafka, active: isActive('kafka') },
                { a: PTS.kafka, b: PTS.fanout, active: isActive('fanout') },
                { a: PTS.fanout, b: PTS.redis, active: isActive('redis') },
                { a: PTS.kafka, b: PTS.search, active: isActive('search') },
              ]}
            />

            <TwNode x={PTS.client.x} y={PTS.client.y} icon={Smartphone} label={c.nodes.client} active={isActive('client')} />
            <TwNode x={PTS.gateway.x} y={PTS.gateway.y} icon={Server} label={c.nodes.gateway} active={isActive('gateway')} />
            <TwNode x={PTS.tweet.x} y={PTS.tweet.y} icon={Send} label={c.nodes.tweet} active={isActive('tweet')} />
            <TwNode x={PTS.mongo.x} y={PTS.mongo.y} icon={STORE_META.mongodb.icon} label={c.nodes.mongo} color={STORE_META.mongodb.color} active={isActive('mongo')} />
            <TwNode x={PTS.kafka.x} y={PTS.kafka.y} icon={STORE_META.kafka.icon} label={c.nodes.kafka} color={STORE_META.kafka.color} active={isActive('kafka')} />
            <TwNode x={PTS.fanout.x} y={PTS.fanout.y} icon={STORE_META.redis.icon} label={c.nodes.fanout} active={isActive('fanout')} />
            <TwNode x={PTS.redis.x} y={PTS.redis.y} icon={STORE_META.redis.icon} label={c.nodes.redis} color={STORE_META.redis.color} active={isActive('redis')} />
            <TwNode x={PTS.search.x} y={PTS.search.y} icon={STORE_META.elasticsearch.icon} label={c.nodes.search} color={STORE_META.elasticsearch.color} active={isActive('search')} />

            {running && (
              <Packet
                key={step}
                points={LEGS[step].points}
                color={LEGS[step].color}
                duration={LEGS[step].dur}
                onDone={onLegDone}
              />
            )}

            <AnimatePresence>
              {done && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute left-1/2 top-2 z-30 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-md"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  {c.doneLabel}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* step list */}
        <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {c.steps.map((s, i) => {
            const stepDone = done || i < step;
            const stepActive = running && i === step;
            const async = i >= 3; // fanout, cache, index run off the write path
            return (
              <li
                key={s.id}
                className={cn(
                  'rounded-xl border p-3 transition-colors',
                  stepActive
                    ? 'border-accent bg-accent/[0.06]'
                    : stepDone
                      ? 'border-emerald-500/40 bg-emerald-500/[0.05]'
                      : 'border-border',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-fg">
                    <span
                      className={cn(
                        'grid h-4 w-4 place-items-center rounded-full text-[0.6rem] font-bold',
                        stepDone ? 'bg-emerald-500 text-white' : stepActive ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-muted',
                      )}
                    >
                      {stepDone ? '✓' : i + 1}
                    </span>
                    {s.label}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide',
                      async ? 'bg-violet-500/15 text-violet-500' : 'bg-accent/15 text-accent',
                    )}
                  >
                    {async ? c.asyncBadge : c.syncBadge}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{s.detail}</p>
              </li>
            );
          })}
        </ol>

        <p className="mt-4 text-xs leading-relaxed text-muted">{c.note}</p>
      </TwStage>
    </div>
  );
}
