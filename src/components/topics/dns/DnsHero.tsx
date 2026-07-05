'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpenText, ChevronRight } from 'lucide-react';
import { type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { dnsContent } from './content';

const FRAMES = 22;
const FRAME_MS = 45;

/**
 * "The internet's phonebook" — pick a domain and watch it decode into an IP
 * with a scramble effect, like tumblers of a lock falling into place.
 */
export function DnsHero({ locale }: { locale: Locale }) {
  const c = dnsContent[locale].hero;

  const [active, setActive] = useState(0);
  const [nonce, setNonce] = useState(0); // re-clicking the active chip replays
  const [display, setDisplay] = useState(c.domains[0].ip);
  const [settled, setSettled] = useState(false);

  const target = c.domains[active].ip;

  useEffect(() => {
    setSettled(false);
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      const locked = Math.floor((frame / FRAMES) * target.length);
      setDisplay(
        target
          .split('')
          .map((ch, i) => {
            if (i < locked || ch === '.' || ch === 'x') return ch;
            return String(Math.floor(Math.random() * 10));
          })
          .join(''),
      );
      if (frame >= FRAMES) {
        clearInterval(id);
        setDisplay(target);
        setSettled(true);
      }
    }, FRAME_MS);
    return () => clearInterval(id);
  }, [target, nonce]);

  function pick(i: number) {
    if (i === active) setNonce((n) => n + 1);
    else setActive(i);
  }

  return (
    <section className="not-prose">
      <header className="mb-5">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">{c.kicker}</p>
        <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight text-fg">
          {c.title}
        </h3>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">{c.subtitle}</p>
      </header>

      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-8">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-accent/10 blur-[90px]"
        />

        {/* Domain chips */}
        <div className="relative mb-7 flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-widest text-muted">
            <BookOpenText className="h-3.5 w-3.5" aria-hidden />
            {c.tryLabel}
          </span>
          {c.domains.map((d, i) => (
            <button
              key={d.host}
              type="button"
              onClick={() => pick(i)}
              className={cn(
                'rounded-full border px-3 py-1.5 font-mono text-xs transition-all duration-300',
                i === active
                  ? 'border-accent bg-accent/10 text-accent shadow-sm shadow-accent/20'
                  : 'border-border text-muted hover:border-accent/40 hover:text-fg',
              )}
            >
              {d.host}
            </button>
          ))}
        </div>

        {/* Translation stage */}
        <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={c.domains[active].host}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl border border-border bg-bg px-4 py-3 font-mono text-base font-semibold text-fg sm:text-lg"
            >
              {c.domains[active].host}
            </motion.span>
          </AnimatePresence>

          {/* Pulsing chevrons */}
          <span className="flex rotate-90 text-accent sm:rotate-0" aria-hidden>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.18 }}
              >
                <ChevronRight className="h-5 w-5" />
              </motion.span>
            ))}
          </span>

          <span
            className={cn(
              'relative rounded-xl border px-4 py-3 font-mono text-base font-semibold tabular-nums transition-colors duration-500 sm:text-lg',
              settled
                ? 'border-accent/50 bg-accent/10 text-accent'
                : 'border-border bg-bg text-muted',
            )}
          >
            {display}
            {settled && (
              <motion.span
                aria-hidden
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.9 }}
                className="absolute inset-0 rounded-xl ring-2 ring-accent"
              />
            )}
            <AnimatePresence>
              {settled && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-2.5 left-3 rounded-full border border-accent/40 bg-surface px-2 py-px font-sans text-[0.6rem] font-semibold uppercase tracking-wide text-accent"
                >
                  {c.recordTag}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </div>

        <p className="relative mt-6 text-center text-xs text-muted">{c.note}</p>
      </div>
    </section>
  );
}
