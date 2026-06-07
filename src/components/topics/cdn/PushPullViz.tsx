'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Server, Warehouse, Zap } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { cdnContent } from './content';
import { SceneRails, SceneNode, Packet, type Pt } from './scene';

type Mode = 'push' | 'pull';

const VIOLET = 'rgb(139 92 246)';
const AMBER = 'rgb(245 158 11)';
const EMERALD = 'rgb(16 185 129)';

export function PushPullViz({ locale }: { locale: Locale }) {
  const c = cdnContent[locale].pushpull;
  const [mode, setMode] = useState<Mode>('push');

  // push state
  const [pushing, setPushing] = useState(false);
  const [pushed, setPushed] = useState(false);
  // pull state
  const [pullKey, setPullKey] = useState(0);
  const [pullPoints, setPullPoints] = useState<Pt[] | null>(null);
  const [pullColor, setPullColor] = useState(AMBER);
  const [pullDur, setPullDur] = useState(2.2);
  const [pullStage, setPullStage] = useState(0); // 0 not cached, 1 cached
  const [running, setRunning] = useState(false);
  const [caption, setCaption] = useState('');

  function switchMode(m: Mode) {
    if (m === mode) return;
    setMode(m);
    setPushing(false);
    setPushed(false);
    setPullPoints(null);
    setPullStage(0);
    setRunning(false);
    setCaption('');
  }

  // PUSH
  const origin: Pt = { x: 12, y: 50 };
  const pushEdges: Pt[] = [
    { x: 74, y: 18 },
    { x: 74, y: 50 },
    { x: 74, y: 82 },
  ];
  function doPush() {
    if (pushing) return;
    setPushed(false);
    setCaption('');
    setPushing(true);
  }

  // PULL
  const pOrigin: Pt = { x: 10, y: 50 };
  const pEdge: Pt = { x: 50, y: 50 };
  const pUser: Pt = { x: 88, y: 50 };
  function doPull() {
    if (running) return;
    setRunning(true);
    if (pullStage === 0) {
      setPullPoints([pUser, pEdge, pOrigin, pEdge, pUser]);
      setPullColor(AMBER);
      setPullDur(2.2);
    } else {
      setPullPoints([pUser, pEdge, pUser]);
      setPullColor(EMERALD);
      setPullDur(1.0);
    }
    setPullKey((k) => k + 1);
  }
  function onPullDone() {
    setRunning(false);
    if (pullStage === 0) {
      setPullStage(1);
      setCaption(c.pullMiss);
    } else {
      setCaption(c.pullHit);
    }
  }

  return (
    <div className="not-prose">
      <h3 className="font-display text-xl font-semibold text-fg">{c.title}</h3>
      <p className="mt-1 text-sm text-muted">{c.subtitle}</p>

      <div className="mt-5 rounded-2xl border border-border bg-surface/40 p-5">
        {/* controls */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {(['push', 'pull'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  mode === m ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg',
                )}
              >
                {m === 'push' ? c.push : c.pull}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={mode === 'push' ? doPush : doPull}
            disabled={mode === 'push' ? pushing : running}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-accent-fg shadow-sm transition hover:shadow-md hover:shadow-accent/30 disabled:opacity-70"
          >
            <Zap className="h-4 w-4 fill-current" aria-hidden />
            {mode === 'push' ? c.pushBtn : pullStage === 0 ? c.pullBtn : c.pullAgainBtn}
          </button>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-muted">
          {mode === 'push' ? c.pushHint : c.pullHint}
        </p>

        {/* scene */}
        <div className="relative h-52">
          {mode === 'push' ? (
            <>
              {/* rails */}
              <SceneRails edges={pushEdges.map((e) => ({ a: origin, b: e, active: pushed }))} />
              <SceneNode pt={origin} icon={Warehouse} label={c.origin} active />
              {pushEdges.map((e, i) => (
                <SceneNode
                  key={i}
                  pt={e}
                  icon={Server}
                  label={c.edge}
                  active={pushed}
                  badge={pushed ? c.pushed : undefined}
                  badgeColor={EMERALD}
                />
              ))}
              {pushing &&
                pushEdges.map((e, i) => (
                  <Packet
                    key={`${i}-push`}
                    points={[origin, e]}
                    color={VIOLET}
                    duration={0.9}
                    delay={i * 0.22}
                    onDone={
                      i === pushEdges.length - 1
                        ? () => {
                            setPushing(false);
                            setPushed(true);
                            setCaption(c.pushCaption);
                          }
                        : undefined
                    }
                  />
                ))}
            </>
          ) : (
            <>
              <SceneRails
                edges={[
                  { a: pOrigin, b: pEdge, active: pullStage === 1 },
                  { a: pEdge, b: pUser, active: pullStage === 1 },
                ]}
              />
              <SceneNode pt={pOrigin} icon={Warehouse} label={c.origin} active />
              <SceneNode
                pt={pEdge}
                icon={Server}
                label={c.edge}
                active={pullStage === 1}
                badge={pullStage === 1 ? c.cached : undefined}
                badgeColor={EMERALD}
              />
              <SceneNode pt={pUser} icon={Globe} label={c.user} active />
              {pullPoints && (
                <Packet
                  key={pullKey}
                  points={pullPoints}
                  color={pullColor}
                  duration={pullDur}
                  onDone={onPullDone}
                />
              )}
            </>
          )}
        </div>

        {/* caption */}
        <div className="mt-3 min-h-[1.5rem]">
          <AnimatePresence mode="wait">
            {caption && (
              <motion.p
                key={caption}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-fg/80"
              >
                {caption}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
