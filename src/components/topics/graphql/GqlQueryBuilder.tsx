'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import {
  ApiHeading,
  ApiNote,
  ApiPanel,
  CodeSurface,
  ResetButton,
  RunButton,
  sleep,
} from '../api-track/ApiKit';
import { FIELDS, graphqlContent, type FieldId } from './content';

const DEFAULT_SELECTION: FieldId[] = ['id', 'text', 'likeCount', 'name', 'avatarUrl'];

/**
 * The query builder: tick the fields a timeline card renders and watch the
 * query and the response take that exact shape. Ticking `bio` — a field no card
 * shows — is the fastest way to feel what overfetching costs.
 */
export function GqlQueryBuilder({ locale }: { locale: Locale }) {
  const c = graphqlContent[locale];
  const t = c.builder;

  const [selected, setSelected] = useState<FieldId[]>(DEFAULT_SELECTION);
  const [ran, setRan] = useState(false);
  const [running, setRunning] = useState(false);

  const tweetFields = FIELDS.filter((f) => f.group === 'tweet' && selected.includes(f.id));
  const authorFields = FIELDS.filter((f) => f.group === 'author' && selected.includes(f.id));

  const query = useMemo(() => {
    if (selected.length === 0) return '';
    const lines = ['query Timeline {', '  timeline(first: 10) {'];
    for (const f of tweetFields) lines.push(`    ${f.name}`);
    if (authorFields.length > 0) {
      lines.push('    author {');
      for (const f of authorFields) lines.push(`      ${f.name}`);
      lines.push('    }');
    }
    lines.push('  }', '}');
    return lines.join('\n');
  }, [selected, tweetFields, authorFields]);

  const response = useMemo(() => {
    if (selected.length === 0) return '';
    const inner: string[] = [];
    for (const f of tweetFields) inner.push(`        "${f.name}": ${f.value}`);
    if (authorFields.length > 0) {
      inner.push(
        `        "author": {\n${authorFields
          .map((f) => `          "${f.name}": ${f.value}`)
          .join(',\n')}\n        }`,
      );
    }
    return [
      '{',
      '  "data": {',
      '    "timeline": [',
      '      {',
      inner.join(',\n'),
      '      }',
      '      // …9 more',
      '    ]',
      '  }',
      '}',
    ].join('\n');
  }, [selected, tweetFields, authorFields]);

  function toggle(id: FieldId) {
    setRan(false);
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function run() {
    if (running || selected.length === 0) return;
    setRunning(true);
    setRan(false);
    await sleep(520);
    setRan(true);
    setRunning(false);
  }

  return (
    <div className="not-prose">
      <ApiHeading title={t.title} subtitle={t.subtitle} />

      <ApiPanel>
        <div className="grid gap-3 lg:grid-cols-[15rem_1fr]">
          {/* field picker */}
          <div className="space-y-3">
            {(['tweet', 'author'] as const).map((group) => (
              <div key={group} className="rounded-xl border border-border bg-surface p-3">
                <p className="mb-2 font-mono text-[0.62rem] uppercase tracking-wide text-muted">
                  {group === 'tweet' ? t.tweetGroup : t.authorGroup}
                </p>
                <ul className="space-y-1">
                  {FIELDS.filter((f) => f.group === group).map((f) => {
                    const on = selected.includes(f.id);
                    return (
                      <li key={f.id}>
                        <button
                          type="button"
                          onClick={() => toggle(f.id)}
                          className={cn(
                            'flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors',
                            on ? 'bg-accent/10' : 'hover:bg-surface-2',
                          )}
                        >
                          <span
                            className={cn(
                              'mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded border transition-colors',
                              on ? 'border-accent bg-accent' : 'border-border',
                            )}
                            aria-hidden
                          >
                            {on && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="h-1.5 w-1.5 rounded-[1px] bg-accent-fg"
                              />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span
                              className={cn(
                                'block font-mono text-[0.72rem]',
                                on ? 'font-semibold text-accent' : 'text-fg/80',
                              )}
                            >
                              {f.name}
                            </span>
                            <span className="block text-[0.62rem] leading-tight text-muted">
                              {t.fieldNotes[f.id]}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* query & response */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[0.65rem] text-muted">
                {t.selectedLabel}: <span className="font-bold text-fg">{selected.length}</span>
              </span>
              <AnimatePresence>
                {ran && (
                  <motion.span
                    key={response.length}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-md bg-accent/10 px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold text-accent"
                  >
                    {t.bytesLabel}: {response.length} B
                  </motion.span>
                )}
              </AnimatePresence>
              <div className="ml-auto flex items-center gap-2">
                <RunButton
                  label={c.shared.run}
                  runningLabel={c.shared.running}
                  running={running}
                  onClick={run}
                  icon={Play}
                />
                <ResetButton
                  label={c.shared.reset}
                  onClick={() => {
                    setSelected(DEFAULT_SELECTION);
                    setRan(false);
                  }}
                />
              </div>
            </div>

            <CodeSurface
              title={t.queryTitle}
              tone="violet"
              body={query || t.emptyQuery}
            />
            <CodeSurface
              title={t.responseTitle}
              tone={ran ? 'emerald' : 'muted'}
              dim={!ran}
              body={ran ? response : t.waiting}
            />
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-muted">{t.hint}</p>
      </ApiPanel>

      <ApiNote>{t.note}</ApiNote>
    </div>
  );
}
