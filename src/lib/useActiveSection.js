"use client";

import { useEffect, useState } from "react";

/**
 * Index of the section currently under the reading line.
 *
 * Measured from live rects on a rAF-throttled scroll listener rather than an
 * IntersectionObserver, which stuck on the first section whenever a pinned
 * ScrollTrigger held the same intersection state for a long scroll range.
 * Reading rects each frame always reflects what the visitor can actually see.
 */
export default function useActiveSection(ids) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!ids?.length) return undefined;

    let frame = 0;

    const measure = () => {
      frame = 0;
      // The "reading line" sits a third down the viewport: whichever section
      // crosses it last is the one being read.
      const line = window.innerHeight * 0.34;
      let current = 0;

      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        const { top, bottom } = el.getBoundingClientRect();
        if (top <= line && bottom > line) current = i;
        else if (top <= line) current = i;
      });

      setActive((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return active;
}
