'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Database, Globe, ImageUp, Cloud, Smartphone } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { SceneRails, Packet, type Pt } from '../cdn/scene';
import { twContent } from './content';
import { TwHeading, TwStage, TwButton, TwNode, STORE_META } from './TwKit';

const PTS: Record<string, Pt> = {
  client: { x: 8, y: 30 },
  media: { x: 34, y: 30 },
  s3: { x: 62, y: 30 },
  mongo: { x: 62, y: 80 },
  cdn: { x: 82, y: 55 },
  reader: { x: 95, y: 80 },
};

const ACCENT = 'rgb(var(--accent))';
const AMBER = 'rgb(245 158 11)';
const EMERALD = 'rgb(16 185 129)';

const LEGS: { points: Pt[]; color: string; dur: number }[] = [
  { points: [PTS.client, PTS.media], color: ACCENT, dur: 0.7 }, // upload
  { points: [PTS.media, PTS.s3], color: STORE_META.s3.color, dur: 0.8 }, // store
  { points: [PTS.s3, PTS.mongo], color: STORE_META.mongodb.color, dur: 0.9 }, // link key
  { points: [PTS.s3, PTS.cdn, PTS.reader], color: STORE_META.s3.color, dur: 1.2 }, // serve
];

const ACTIVE_NODES: string[][] = [
  ['client', 'media'],
  ['media', 's3'],
  ['s3', 'mongo'],
  ['s3', 'cdn', 'reader'],
];

export function TwMediaFlow({ locale }: { locale: Locale }) {
  const c = twContent[locale].media;
  const [step, setStep] = useState(-1);
  const running = step >= 0 && step < LEGS.length;
  const done = step === LEGS.length;

  function upload() {
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
  const isActive = (id: string) => activeNodes.includes(id);

  return (
    <div className="not-prose">
      <TwHeading title={c.title} subtitle={c.subtitle} />

      <TwStage>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-500/15">
              <ImageUp className="h-4 w-4 text-sky-500" aria-hidden />
            </span>
            <span className="truncate text-sm text-fg/80">beach-launch.mp4 · 42 MB</span>
          </div>
          <TwButton onClick={upload} disabled={running}>
            <ImageUp className="h-4 w-4" aria-hidden />
            {running ? c.uploading : c.upload}
          </TwButton>
          <TwButton onClick={reset} variant="ghost">
            {c.reset}
          </TwButton>
        </div>

        <div className="overflow-x-auto">
          <div className="relative h-[17rem] min-w-[620px]">
            <SceneRails
              edges={[
                { a: PTS.client, b: PTS.media, active: isActive('media') },
                { a: PTS.media, b: PTS.s3, active: isActive('s3') },
                { a: PTS.s3, b: PTS.mongo, active: isActive('mongo') },
                { a: PTS.s3, b: PTS.cdn, active: isActive('cdn') },
                { a: PTS.cdn, b: PTS.reader, active: isActive('reader') },
              ]}
            />

            <TwNode x={PTS.client.x} y={PTS.client.y} icon={Smartphone} label={c.nodes.client} active={isActive('client')} />
            <TwNode x={PTS.media.x} y={PTS.media.y} icon={ImageUp} label={c.nodes.media} active={isActive('media')} />
            <TwNode
              x={PTS.s3.x}
              y={PTS.s3.y}
              icon={STORE_META.s3.icon}
              label={c.nodes.s3}
              color={STORE_META.s3.color}
              active={isActive('s3')}
              badge={step >= 3 ? c.firstBadge : undefined}
              badgeColor={AMBER}
            />
            <TwNode x={PTS.mongo.x} y={PTS.mongo.y} icon={Database} label={c.nodes.mongo} color={STORE_META.mongodb.color} active={isActive('mongo')} />
            <TwNode
              x={PTS.cdn.x}
              y={PTS.cdn.y}
              icon={Cloud}
              label={c.nodes.cdn}
              active={isActive('cdn')}
              badge={done ? c.edgeBadge : undefined}
              badgeColor={EMERALD}
              width="w-24"
            />
            <TwNode x={PTS.reader.x} y={PTS.reader.y} icon={Globe} label={c.nodes.reader} active={isActive('reader')} width="w-24" />

            {running && (
              <Packet key={step} points={LEGS[step].points} color={LEGS[step].color} duration={LEGS[step].dur} onDone={onLegDone} />
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

        <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {c.steps.map((s, i) => {
            const stepDone = done || i < step;
            const stepActive = running && i === step;
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
