'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Server, Smartphone } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { SceneRails, Packet, type Pt } from '../cdn/scene';
import { twContent } from './content';
import { TwHeading, TwStage, TwButton, TwNode, STORE_META } from './TwKit';

const PTS: Record<string, Pt> = {
  client: { x: 9, y: 50 },
  gateway: { x: 35, y: 50 },
  search: { x: 62, y: 50 },
  es: { x: 89, y: 50 },
};

const ACCENT = 'rgb(var(--accent))';

type Phase = 'idle' | 'toEs' | 'back' | 'done';

export function TwSearchFlow({ locale }: { locale: Locale }) {
  const c = twContent[locale].search;
  const [query, setQuery] = useState(c.suggestions[0]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [runKey, setRunKey] = useState(0);

  const running = phase === 'toEs' || phase === 'back';

  function run() {
    if (running || !query.trim()) return;
    setPhase('toEs');
    setRunKey((k) => k + 1);
  }
  function reset() {
    setPhase('idle');
  }

  const isActive = (id: string) => {
    if (phase === 'idle') return false;
    if (id === 'client') return true;
    if (id === 'gateway' || id === 'search') return true;
    if (id === 'es') return true;
    return false;
  };

  return (
    <div className="not-prose">
      <TwHeading title={c.title} subtitle={c.subtitle} />

      <TwStage>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-yellow-500" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && run()}
              placeholder={c.placeholder}
              className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted"
            />
          </div>
          <TwButton onClick={run} disabled={running}>
            <Search className="h-4 w-4" aria-hidden />
            {running ? c.searching : c.searchBtn}
          </TwButton>
          <TwButton onClick={reset} variant="ghost">
            {c.reset}
          </TwButton>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {c.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                query === s ? 'border-accent bg-accent text-accent-fg' : 'border-border text-muted hover:text-fg',
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <div className="relative h-[10rem] min-w-[520px]">
            <SceneRails
              edges={[
                { a: PTS.client, b: PTS.gateway, active: running },
                { a: PTS.gateway, b: PTS.search, active: running },
                { a: PTS.search, b: PTS.es, active: running },
              ]}
            />
            <TwNode x={PTS.client.x} y={PTS.client.y} icon={Smartphone} label={c.nodes.client} active={isActive('client')} />
            <TwNode x={PTS.gateway.x} y={PTS.gateway.y} icon={Server} label={c.nodes.gateway} active={isActive('gateway')} />
            <TwNode x={PTS.search.x} y={PTS.search.y} icon={Search} label={c.nodes.search} active={isActive('search')} />
            <TwNode
              x={PTS.es.x}
              y={PTS.es.y}
              icon={STORE_META.elasticsearch.icon}
              label={c.nodes.es}
              color={STORE_META.elasticsearch.color}
              active={isActive('es')}
              width="w-28"
            />

            {phase === 'toEs' && (
              <Packet
                key={`f-${runKey}`}
                points={[PTS.client, PTS.gateway, PTS.search, PTS.es]}
                color={ACCENT}
                duration={1.3}
                onDone={() => setPhase('back')}
              />
            )}
            {phase === 'back' && (
              <Packet
                key={`b-${runKey}`}
                points={[PTS.es, PTS.search, PTS.gateway, PTS.client]}
                color={STORE_META.elasticsearch.color}
                duration={1.3}
                onDone={() => setPhase('done')}
              />
            )}
          </div>
        </div>

        {/* results */}
        <AnimatePresence>
          {phase === 'done' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <p className="mb-2 font-mono text-[0.68rem] uppercase tracking-widest text-muted">{c.resultsLabel}</p>
              <div className="space-y-2">
                {c.results.map((r, i) => (
                  <motion.div
                    key={r.handle}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
                  >
                    <span className="font-mono text-xs font-semibold text-accent">{r.handle}</span>
                    <span className="flex-1 truncate text-sm text-fg/85">{r.text}</span>
                    <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 font-mono text-[0.62rem] font-bold text-yellow-600 dark:text-yellow-400">
                      {r.score}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-4 text-xs leading-relaxed text-muted">{c.note}</p>
      </TwStage>
    </div>
  );
}
