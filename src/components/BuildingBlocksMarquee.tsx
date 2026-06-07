import { Hexagon } from 'lucide-react';

/**
 * A slow, infinite marquee of the building-block names. Decorative — gives the
 * homepage motion and previews the breadth of topics. Content is duplicated so
 * the loop is seamless; respects prefers-reduced-motion via the global rule.
 */
export function BuildingBlocksMarquee({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  const track = [...items, ...items];

  return (
    <div className="relative flex items-center gap-4 overflow-hidden border-y border-border bg-surface/40 py-3.5">
      <span className="z-10 shrink-0 bg-bg/0 pl-4 font-mono text-xs uppercase tracking-widest text-muted sm:pl-6">
        {label}
      </span>

      <div className="relative flex-1 overflow-hidden">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-bg to-transparent" />

        <ul className="animate-marquee flex w-max items-center gap-2.5">
          {track.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-fg/80"
            >
              <Hexagon className="h-3 w-3 text-accent" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
