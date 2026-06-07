/**
 * Decorative hero backdrop: a fine blueprint grid plus blurred aurora glows.
 * Purely presentational; sits behind the hero content (absolute, -z).
 */
export function BlueprintBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Blueprint grid */}
      <div className="bg-blueprint absolute inset-0" />

      {/* Aurora glows in the single accent hue */}
      <div
        className="aurora animate-glow-pulse left-[-10%] top-[-12%] h-[34rem] w-[34rem] opacity-50"
        style={{
          background:
            'radial-gradient(circle at center, rgb(var(--accent) / 0.5), transparent 60%)',
        }}
      />
      <div
        className="aurora animate-glow-pulse right-[-12%] top-[-6%] h-[30rem] w-[30rem] opacity-40 [animation-delay:1.5s]"
        style={{
          background:
            'radial-gradient(circle at center, rgb(45 212 191 / 0.45), transparent 62%)',
        }}
      />

      {/* Fade the whole thing into the page background at the bottom */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}
