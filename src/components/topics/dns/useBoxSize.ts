'use client';

import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Measures a container so SVG connector layers can be drawn in pixel space
 * while nodes are positioned with fractional coordinates. Used by the DNS
 * mind map and the lookup journey diagram.
 */
export function useBoxSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, size };
}
