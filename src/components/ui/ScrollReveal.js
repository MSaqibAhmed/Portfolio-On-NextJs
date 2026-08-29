"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Renders as whatever element you pass via `as` and reveals its
 * `[data-reveal]` descendants when it scrolls into view.
 *
 * It's a client component that takes server-rendered `children`, so sections
 * using it stay server components — only this wrapper ships JS.
 *
 * Nestable: each instance claims only the targets whose nearest reveal root
 * is itself, so an inner group (e.g. project cards falling from above) can
 * use its own direction and timing without the outer section stealing them.
 *
 * Content is never left hidden — reduced-motion users get the final state
 * immediately and every tween ends at opacity 1 / offset 0.
 */
export default function ScrollReveal({
  as: Tag = "div",
  children,
  stagger = 0.08,
  y = 26,
  x = 0,
  clip = false,
  start = "top 80%",
  duration = 0.9,
  ease = "power3.out",
  ...rest
}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const ctx = gsap.context(() => {
      const targets = gsap.utils
        .toArray("[data-reveal]", root)
        .filter((el) => el.closest("[data-reveal-root]") === root);
      if (!targets.length) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set(targets, { opacity: 1, x: 0, y: 0, clipPath: "none" });
        return;
      }

      const from = { opacity: 0, y, x };
      const to = {
        opacity: 1,
        y: 0,
        x: 0,
        duration,
        ease,
        stagger,
        scrollTrigger: { trigger: root, start, once: true },
      };

      if (clip) {
        from.clipPath = y < 0 ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)";
        to.clipPath = "inset(0% 0% 0% 0%)";
      }

      gsap.fromTo(targets, from, to);
    }, ref);

    return () => ctx.revert();
  }, [stagger, y, x, clip, start, duration, ease]);

  return (
    <Tag ref={ref} data-reveal-root {...rest}>
      {children}
    </Tag>
  );
}
