import { FileCode2, Circle } from 'lucide-react';

/**
 * Hero centerpiece: a faux source view of a topic's frontmatter, reinforcing
 * that the whole site is typed, validated content. Decorative — the floating
 * node pills hint at the building blocks the roadmap connects.
 */
export function SchemaCard({ caption }: { caption: string }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Floating building-block nodes */}
      <FloatNode className="-left-6 top-10 [animation-delay:0.2s]" label="DNS" />
      <FloatNode className="-right-4 top-4 [animation-delay:1.1s]" label="Cache" />
      <FloatNode
        className="-right-8 bottom-16 [animation-delay:2s]"
        label="API Gateway"
      />
      <FloatNode
        className="-left-7 bottom-8 [animation-delay:0.7s]"
        label="Load Balancer"
      />

      {/* Rotating gradient ring as a 1px border */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-black/30">
        <div className="conic-ring animate-spin-slow absolute -inset-1/2" aria-hidden />

        <div className="glass relative m-px rounded-[15px]">
          {/* Window chrome */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </span>
            <span className="ml-2 inline-flex items-center gap-1.5 font-mono text-xs text-muted">
              <FileCode2 className="h-3.5 w-3.5" aria-hidden />
              topics/load-balancer/en.md
            </span>
          </div>

          {/* Frontmatter "source" */}
          <pre className="overflow-x-auto px-5 py-4 font-mono text-[0.8rem] leading-6">
            <code>
              <Line k="title" v="Load Balancer" />
              <Line k="slug" v="load-balancer" accent />
              <Line k="category" v="blocos-fundamentais" accent />
              <Line k="difficulty" v="beginner" emerald />
              <Line k="status" v="published" emerald />
              <span className="text-muted">tags: </span>
              <span className="text-fg/70">[networking, availability]</span>
              {'\n'}
              <span className="text-border">{'# ───────────────'}</span>
              {'\n'}
              <span className="text-accent">## </span>
              <span className="text-fg/80">What it is</span>
              {'\n'}
              <span className="text-fg/45">A load balancer spreads traffic</span>
              {'\n'}
              <span className="text-fg/45">across many servers…</span>
            </code>
          </pre>

          {/* Caption */}
          <div className="flex items-center gap-2 border-t border-border px-5 py-3">
            <Circle className="h-2 w-2 animate-glow-pulse fill-accent text-accent" aria-hidden />
            <p className="text-xs text-muted">{caption}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Line({
  k,
  v,
  accent,
  emerald,
}: {
  k: string;
  v: string;
  accent?: boolean;
  emerald?: boolean;
}) {
  const valueClass = emerald
    ? 'text-emerald-500 dark:text-emerald-400'
    : accent
      ? 'text-accent'
      : 'text-fg';
  return (
    <>
      <span className="text-muted">{k}: </span>
      <span className={valueClass}>{v}</span>
      {'\n'}
    </>
  );
}

function FloatNode({ className, label }: { className: string; label: string }) {
  return (
    <span
      className={`animate-floaty absolute z-10 hidden items-center gap-1.5 rounded-full border border-border bg-surface/90 px-2.5 py-1 font-mono text-[0.7rem] text-fg shadow-lg backdrop-blur sm:inline-flex ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--accent))]" />
      {label}
    </span>
  );
}
