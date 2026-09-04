'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Boxes, MapPin, Repeat } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ApiHeading, ApiNote, ApiPanel, FactRow, toneBg, toneBorder, toneText, type Tone } from './ApiKit';
import {
  trackContent,
  type MapBranch,
  type TrackContent,
  type TrackNodeId,
  type TrackStyleId,
} from './trackContent';

type MapLabels = TrackContent['map'];

const BRANCH_TONE: Record<TrackStyleId, Tone> = {
  rest: 'sky',
  webhooks: 'amber',
  graphql: 'violet',
  grpc: 'emerald',
};

/** Percent positions of the stems under the hub, one per branch. */
const STEM_X = [12.5, 37.5, 62.5, 87.5];

/**
 * The cross-topic map that opens every lesson in the track: the API contract at
 * the top, the three communication styles hanging off it. The lesson's own
 * style is highlighted, the other two stay visible but muted — so the reader
 * always sees where the page sits inside the whole picture.
 */
export function ApiCommunicationMap({
  locale,
  current,
}: {
  locale: Locale;
  current: TrackNodeId;
}) {
  const c = trackContent[locale].map;
  const initial: TrackStyleId = current === 'overview' ? 'rest' : current;
  const [selected, setSelected] = useState<TrackStyleId>(initial);
  const [replay, setReplay] = useState(0);

  function pick(id: TrackStyleId) {
    setSelected(id);
    setReplay((n) => n + 1);
  }

  return (
    <div className="not-prose">
      <ApiHeading title={c.title} subtitle={c.subtitle} />

      <ApiPanel>
        {/* hub */}
        <div className="flex justify-center">
          <div
            className={cn(
              'relative flex items-center gap-2.5 rounded-2xl border-2 bg-surface px-4 py-3 shadow-sm',
              current === 'overview' ? 'border-accent' : 'border-border',
            )}
          >
            <Boxes className="h-5 w-5 text-accent" aria-hidden />
            <div className="text-left">
              <div className="font-display text-sm font-bold text-fg">{c.hubLabel}</div>
              <div className="font-mono text-[0.62rem] text-muted">{c.hubSub}</div>
            </div>
            {current === 'overview' && (
              <span className="absolute -top-2.5 right-2 rounded-full bg-accent px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-accent-fg">
                {c.youAreHere}
              </span>
            )}
          </div>
        </div>

        {/* connectors (wide screens, where the branches sit in one row) */}
        <div className="relative hidden h-11 lg:block" aria-hidden>
          <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-border" />
          <div className="absolute left-[12.5%] right-[12.5%] top-5 h-px bg-border" />
          {STEM_X.map((x, i) => {
            const id = c.branches[i].id;
            const on = selected === id;
            return (
              <div
                key={x}
                className={cn(
                  'absolute top-5 h-6 w-px transition-colors',
                  on ? 'bg-accent' : 'bg-border',
                )}
                style={{ left: `${x}%` }}
              />
            );
          })}
        </div>
        <div className="mx-auto my-3 h-5 w-px bg-border lg:hidden" aria-hidden />

        {/* branches */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {c.branches.map((b) => (
            <BranchCard
              key={b.id}
              branch={b}
              selected={selected === b.id}
              isCurrent={current === b.id}
              replay={replay}
              labels={c}
              locale={locale}
              onSelect={() => pick(b.id)}
            />
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-muted">{c.tapHint}</p>
      </ApiPanel>

      <ApiNote>{c.note}</ApiNote>
    </div>
  );
}

function BranchCard({
  branch,
  selected,
  isCurrent,
  replay,
  labels,
  locale,
  onSelect,
}: {
  branch: MapBranch;
  selected: boolean;
  isCurrent: boolean;
  replay: number;
  labels: MapLabels;
  locale: Locale;
  onSelect: () => void;
}) {
  const tone = BRANCH_TONE[branch.id];
  const slug = trackContent[locale].steps.find((s) => s.id === branch.id)!.slug;

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border bg-surface p-3.5 transition-all',
        selected
          ? cn(toneBorder[tone], 'shadow-md')
          : 'border-border opacity-70 hover:opacity-100',
      )}
    >
      <button type="button" onClick={onSelect} className="text-left">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('font-display text-sm font-bold', selected ? toneText[tone] : 'text-fg')}>
            {branch.label}
          </span>
          {isCurrent && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-accent">
              <MapPin className="h-2.5 w-2.5" aria-hidden />
              {labels.youAreHere}
            </span>
          )}
        </div>
        <p className="mt-1 text-[0.72rem] leading-snug text-muted">{branch.question}</p>

        <MiniFlow branch={branch} tone={tone} active={selected} replay={replay} />

        <p className="mt-2 text-[0.78rem] leading-snug text-fg/85">{branch.oneLiner}</p>
      </button>

      {selected && (
        <motion.dl
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 space-y-2 overflow-hidden"
        >
          <FactRow label={labels.initiatorLabel} value={branch.initiator} />
          <FactRow label={labels.payloadLabel} value={branch.payload} />
          <FactRow label={labels.wireLabel} value={branch.wire} />
        </motion.dl>
      )}

      <div className="mt-3 flex-1" />
      {!isCurrent && (
        <Link
          href={`/topics/${slug}`}
          className={cn(
            'inline-flex items-center gap-1 text-[0.72rem] font-semibold transition-colors',
            selected ? toneText[tone] : 'text-muted hover:text-fg',
          )}
        >
          {labels.openLesson}
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      )}
    </div>
  );
}

/** Three nodes and a dot that travels the way this style actually moves. */
function MiniFlow({
  branch,
  tone,
  active,
  replay,
}: {
  branch: MapBranch;
  tone: Tone;
  active: boolean;
  replay: number;
}) {
  const push = branch.motion === 'push';
  return (
    <div className="mt-2.5 rounded-lg border border-border bg-surface-2/50 px-2 py-2">
      <div className="relative h-1.5">
        <div className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-border" />
        {active && (
          <motion.span
            key={`${branch.id}-${replay}`}
            className={cn('absolute top-1/2 h-2 w-2 rounded-full', toneText[tone])}
            style={{ background: 'currentColor' }}
            initial={{ left: push ? '96%' : '2%', y: '-50%', opacity: 0 }}
            animate={{
              left: push ? ['96%', '50%', '2%'] : ['2%', '50%', '96%'],
              opacity: [0, 1, 1, 0],
            }}
            transition={{ duration: 1.7, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.5 }}
          />
        )}
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-1 font-mono text-[0.58rem] text-muted">
        {branch.nodes.map((n, i) => (
          <span
            key={n}
            className={cn(
              'truncate',
              i === 1 && cn('rounded px-1 py-0.5', active ? toneBg[tone] : 'bg-surface-2', active && toneText[tone]),
            )}
          >
            {n}
          </span>
        ))}
      </div>
      {push && (
        <div className="mt-1 flex items-center justify-center gap-1 text-[0.55rem] text-muted">
          <Repeat className="h-2.5 w-2.5" aria-hidden />
        </div>
      )}
    </div>
  );
}
