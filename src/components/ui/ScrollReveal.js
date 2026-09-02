"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  REVEAL_START,
  onIntroReady,
  prefersReducedMotion,
  revealFailsafe,
} from "@/lib/motion";

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
 * Two rules keep it correct at every screen size:
 *   - the tween is not built until the intro overlay is gone, so a reveal can
 *     never play out behind a black panel;
 *   - the trigger point is a fixed pixel overlap (see REVEAL_START), not a
 *     percentage of the viewport, so a large monitor doesn't fire everything
 *     early.
 *
 * Content is never left hidden — reduced-motion users get the final state
 * immediately, there's an on-screen failsafe, and every tween ends at
 * opacity 1 / offset 0.
 */
export default function ScrollReveal({
  as: Tag = "div",
  children,
  stagger = 0.08,
  y = 26,
  x = 0,
  clip = false,
  start = REVEAL_START,
  duration = 0.9,
  ease = "power3.out",
  ...rest
}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const targets = gsap.utils
      .toArray("[data-reveal]", root)
      .filter((el) => el.closest("[data-reveal-root]") === root);
    if (!targets.length) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(targets, { opacity: 1, x: 0, y: 0, clipPath: "none" });
      return undefined;
    }

    // The hidden state is written here, before paint, so nothing flashes.
    // The tween that undoes it is built later, once the intro releases.
    const from = { opacity: 0, y, x };
    if (clip) {
      from.clipPath = y < 0 ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)";
    }
    gsap.set(targets, from);

    let ctx = null;
    let cancelFailsafe = () => {};

    const build = () => {
      ctx = gsap.context(() => {
        const to = {
          opacity: 1,
          y: 0,
          x: 0,
          duration,
          ease,
          stagger,
          overwrite: "auto",
          scrollTrigger: {
            trigger: root,
            start,
            once: true,
            // Start/end are re-derived on every refresh, so a late webfont or
            // a resized window can't leave this tween measuring a layout that
            // no longer exists.
            invalidateOnRefresh: true,
          },
        };
        if (clip) to.clipPath = "inset(0% 0% 0% 0%)";

        const tween = gsap.to(targets, to);

        cancelFailsafe = revealFailsafe(root, () => {
          if (tween.progress() === 0) tween.progress(1);
        });
      }, ref);
    };

    const cancelIntro = onIntroReady(build);

    return () => {
      cancelIntro();
      cancelFailsafe();
      ctx?.revert();
      // revert() restores the inline styles that were in place before the
      // tween — which here is the hidden "from" state set above. Clearing it
      // means a remount (strict mode, fast refresh) can never leave the page
      // blank.
      gsap.set(targets, { clearProps: "opacity,transform,clipPath" });
    };
  }, [stagger, y, x, clip, start, duration, ease]);

  return (
    <Tag ref={ref} data-reveal-root {...rest}>
      {children}
    </Tag>
  );
}
