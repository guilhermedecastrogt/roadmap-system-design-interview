'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Fingerprint,
  Globe2,
  Package,
  RotateCcw,
  Server,
  Tags,
  Timer,
  UploadCloud,
  User,
  Zap,
} from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { dataStorageContent, type UploadChoice } from './content';
import { DsHeading, FILE_ICONS, FILE_TEXT } from './DsKit';

const HOP_MS = 800;
const FETCH_MS = 700;

type Phase = 'idle' | 'toApp' | 'toBucket' | 'stamping' | 'done';
type FetchResult = 'origin' | 'miss' | 'hit';
type RegionState = { fetching: boolean; result?: FetchResult; ms?: number };

/** Simulated download latency (ms) from the bucket's home region (US). */
const ORIGIN_MS: Record<string, number> = { us: 48, eu: 165, br: 195 };
const HIT_MS: Record<string, number> = { us: 22, eu: 24, br: 26 };

function fakeObjectId() {
  const hex = () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  return `${hex()}-${hex()}-${hex()}-${hex()}`;
}

/**
 * Upload lab: pick a media file, watch it travel user → app server → bucket,
 * see the stored object get its blob + metadata + object ID — then flip the
 * CDN on and download from three regions to feel origin vs edge latency.
 */
export function DsUploadLab({ locale }: { locale: Locale }) {
  const t = dataStorageContent[locale].upload;

  const [choiceId, setChoiceId] = useState(t.choices[0].id);
  const [phase, setPhase] = useState<Phase>('idle');
  const [objectId, setObjectId] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [cdnOn, setCdnOn] = useState(false);
  const [regions, setRegions] = useState<Record<string, RegionState>>({});
  const cachedRef = useRef<Set<string>>(new Set());
  const runRef = useRef(0);

  const choice: UploadChoice = t.choices.find((c) => c.id === choiceId) ?? t.choices[0];
  const uploading = phase !== 'idle' && phase !== 'done';

  function resetAll() {
    runRef.current += 1;
    setPhase('idle');
    setObjectId('');
    setCreatedAt('');
    setCdnOn(false);
    setRegions({});
    cachedRef.current = new Set();
  }

  function pickFile(id: string) {
    if (uploading) return;
    setChoiceId(id);
    if (phase === 'done') resetAll();
  }

  function upload() {
    if (uploading || phase === 'done') return;
    const run = ++runRef.current;
    setPhase('toApp');
    setTimeout(() => {
      if (runRef.current !== run) return;
      setPhase('toBucket');
      setTimeout(() => {
        if (runRef.current !== run) return;
        setPhase('stamping');
        setTimeout(() => {
          if (runRef.current !== run) return;
          setObjectId(fakeObjectId());
          setCreatedAt(new Date().toISOString().slice(0, 16).replace('T', ' '));
          setPhase('done');
        }, HOP_MS);
      }, HOP_MS);
    }, HOP_MS);
  }

  function toggleCdn() {
    setCdnOn((v) => !v);
    setRegions({});
    cachedRef.current = new Set();
  }

  function download(regionId: string) {
    if (phase !== 'done' || regions[regionId]?.fetching) return;
    const run = runRef.current;
    setRegions((prev) => ({ ...prev, [regionId]: { fetching: true } }));
    setTimeout(() => {
      if (runRef.current !== run) return;
      let result: FetchResult;
      let ms: number;
      if (!cdnOn) {
        result = 'origin';
        ms = ORIGIN_MS[regionId];
      } else if (cachedRef.current.has(regionId)) {
        result = 'hit';
        ms = HIT_MS[regionId];
      } else {
        result = 'miss';
        ms = ORIGIN_MS[regionId] + 15;
        cachedRef.current.add(regionId);
      }
      setRegions((prev) => ({ ...prev, [regionId]: { fetching: false, result, ms } }));
    }, FETCH_MS);
  }

  const stepText =
    phase === 'toApp'
      ? t.steps.toApp
      : phase === 'toBucket'
        ? t.steps.toBucket
        : phase === 'stamping'
          ? t.steps.stamping
          : phase === 'done'
            ? t.steps.done
            : null;

  const ChoiceIcon = FILE_ICONS[choice.kind];

  return (
    <div className="not-prose">
      <DsHeading title={t.title} subtitle={t.subtitle} />

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        {/* file picker + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[0.7rem] uppercase tracking-wide text-muted">
              {t.pickLabel}
            </span>
            {t.choices.map((c) => {
              const Icon = FILE_ICONS[c.kind];
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pickFile(c.id)}
                  disabled={uploading}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition-colors disabled:opacity-60',
                    c.id === choiceId
                      ? 'border-accent bg-accent/10 text-fg'
                      : 'border-border bg-surface text-muted hover:border-accent/40 hover:text-fg',
                  )}
                >
                  <Icon className={cn('h-3.5 w-3.5', FILE_TEXT[c.kind])} aria-hidden />
                  {c.name}
                  <span className="text-[0.6rem] text-muted">{c.size}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={upload}
              disabled={uploading || phase === 'done'}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md disabled:opacity-50"
            >
              <UploadCloud className="h-4 w-4" aria-hidden />
              {t.uploadBtn}
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-fg"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              {t.reset}
            </button>
          </div>
        </div>

        {/* upload pipeline */}
        <div className="mt-5 grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-1 sm:gap-2">
          <PipelineNode icon={User} label={t.nodes.user} active={phase === 'toApp'} />
          <Lane active={phase === 'toApp'} dotClass={FILE_TEXT[choice.kind]} />
          <PipelineNode icon={Server} label={t.nodes.app} active={phase === 'toBucket'} />
          <Lane active={phase === 'toBucket'} dotClass={FILE_TEXT[choice.kind]} />
          <PipelineNode
            icon={Package}
            label={t.nodes.bucket}
            active={phase === 'stamping' || phase === 'done'}
            pulse={phase === 'stamping'}
          />
        </div>

        {/* step status */}
        <div className="mt-3 min-h-[1.5rem] text-center">
          <AnimatePresence mode="wait">
            {stepText && (
              <motion.p
                key={phase}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'text-xs font-medium',
                  phase === 'done' ? 'text-emerald-500' : 'text-muted',
                )}
              >
                {stepText}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* stored object card */}
        <AnimatePresence>
          {phase === 'done' && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 rounded-xl border border-emerald-500/40 bg-emerald-500/[0.05] p-4"
            >
              <p className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-wide text-emerald-500">
                <Package className="h-3.5 w-3.5" aria-hidden />
                {t.objectCard.title}
              </p>
              <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg border border-violet-500/30 bg-surface p-2.5">
                  <p className="font-mono text-[0.6rem] uppercase tracking-wide text-violet-500">
                    {t.objectCard.dataLabel}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-fg/85">
                    <ChoiceIcon className={cn('h-3.5 w-3.5', FILE_TEXT[choice.kind])} aria-hidden />
                    {choice.name} · {choice.size}
                  </p>
                </div>
                <div className="rounded-lg border border-sky-500/30 bg-surface p-2.5">
                  <p className="flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-wide text-sky-500">
                    <Tags className="h-3 w-3" aria-hidden />
                    {t.objectCard.metadataLabel}
                  </p>
                  <dl className="mt-1 space-y-0.5 font-mono text-[0.65rem] text-fg/80">
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted">content-type</dt>
                      <dd>{choice.contentType}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted">{t.objectCard.createdLabel}</dt>
                      <dd>{createdAt}</dd>
                    </div>
                  </dl>
                </div>
                <div className="rounded-lg border border-emerald-500/30 bg-surface p-2.5">
                  <p className="flex items-center gap-1 font-mono text-[0.6rem] uppercase tracking-wide text-emerald-500">
                    <Fingerprint className="h-3 w-3" aria-hidden />
                    {t.objectCard.idLabel}
                  </p>
                  <p className="mt-1 break-all font-mono text-[0.65rem] text-fg/80">{objectId}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CDN toggle + regions */}
        <div className="mt-5 rounded-xl border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-fg">
              <Globe2 className="h-4 w-4 text-muted" aria-hidden />
              {t.regionsTitle}
            </p>
            <button
              type="button"
              onClick={toggleCdn}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                cdnOn
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border bg-surface-2 text-muted hover:text-fg',
              )}
              aria-pressed={cdnOn}
            >
              <Zap className={cn('h-3.5 w-3.5', cdnOn && 'fill-current')} aria-hidden />
              {t.cdnToggle}
              <span
                className={cn(
                  'relative h-4 w-7 rounded-full transition-colors',
                  cdnOn ? 'bg-accent' : 'bg-border',
                )}
                aria-hidden
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all',
                    cdnOn ? 'left-3.5' : 'left-0.5',
                  )}
                />
              </span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={String(cdnOn)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                'mt-3 rounded-lg border p-2.5 text-xs leading-relaxed text-fg/85',
                cdnOn
                  ? 'border-accent/30 bg-accent/[0.06]'
                  : 'border-amber-500/30 bg-amber-500/[0.06]',
              )}
            >
              {cdnOn ? t.cdnOnNote : t.cdnOffNote}
            </motion.p>
          </AnimatePresence>

          {phase !== 'done' && (
            <p className="mt-3 text-center text-xs text-muted">{t.waitingNote}</p>
          )}

          <div className="mt-3 space-y-2">
            {t.regions.map((region) => {
              const state = regions[region.id];
              return (
                <div
                  key={region.id}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-2/40 px-3 py-2"
                >
                  <span className="text-xs font-medium text-fg">{region.label}</span>

                  {/* travel lane */}
                  <div className="relative mx-1 hidden h-0.5 min-w-16 flex-1 rounded-full bg-border sm:block">
                    <AnimatePresence>
                      {state?.fetching && (
                        <motion.span
                          initial={{ left: '0%', opacity: 0 }}
                          animate={{ left: '92%', opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: FETCH_MS / 1000, ease: 'easeInOut' }}
                          className="absolute -top-1 h-2.5 w-2.5 rounded-full bg-accent shadow shadow-accent/40"
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    <AnimatePresence mode="wait">
                      {state?.result && !state.fetching && (
                        <motion.span
                          key={`${state.result}-${state.ms}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-1.5"
                        >
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 font-mono text-[0.6rem] font-bold',
                              state.result === 'hit' && 'bg-emerald-500/15 text-emerald-500',
                              state.result === 'miss' && 'bg-amber-500/15 text-amber-500',
                              state.result === 'origin' && 'bg-rose-500/15 text-rose-500',
                            )}
                          >
                            {state.result === 'hit'
                              ? t.hitBadge
                              : state.result === 'miss'
                                ? t.missBadge
                                : t.originBadge}
                          </span>
                          <span className="inline-flex items-center gap-1 font-mono text-[0.65rem] font-semibold text-fg">
                            <Timer className="h-3 w-3 text-muted" aria-hidden />~{state.ms} ms
                          </span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <button
                      type="button"
                      onClick={() => download(region.id)}
                      disabled={phase !== 'done' || state?.fetching}
                      className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-fg transition-colors hover:border-accent/40 disabled:opacity-50"
                    >
                      {t.downloadBtn}
                    </button>
                  </div>

                  {/* result explanation */}
                  {state?.result && !state.fetching && (
                    <p className="w-full text-[0.65rem] leading-relaxed text-muted">
                      {t.results[state.result]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-3 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted">
          {t.note}
        </p>
      </div>
    </div>
  );
}

function PipelineNode({
  icon: Icon,
  label,
  active,
  pulse,
}: {
  icon: typeof User;
  label: string;
  active: boolean;
  pulse?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.div
        animate={pulse ? { scale: [1, 1.12, 1] } : { scale: 1 }}
        transition={pulse ? { repeat: Infinity, duration: 0.7 } : undefined}
        className={cn(
          'grid h-12 w-12 place-items-center rounded-xl border bg-surface transition-colors sm:h-14 sm:w-14',
          active ? 'border-accent text-accent' : 'border-border text-muted',
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </motion.div>
      <span className="text-[0.65rem] font-medium text-muted sm:text-xs">{label}</span>
    </div>
  );
}

function Lane({ active, dotClass }: { active: boolean; dotClass: string }) {
  return (
    <div className="relative h-8">
      <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full border-t-2 border-dashed border-border" />
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ left: '0%', opacity: 0 }}
            animate={{ left: '90%', opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: HOP_MS / 1000, ease: 'easeInOut' }}
            className={cn('absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-current shadow', dotClass)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
