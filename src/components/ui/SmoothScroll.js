"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}

// Site-wide momentum scroll. Skipped entirely for prefers-reduced-motion, in
// which case the browser's normal (instant) scrolling is left untouched.
// #smooth-wrapper / #smooth-content are declared in page.js; anything that
// must stay pinned to the viewport (Navbar, HeroAboutTransition's overlay)
// is rendered outside that pair, since ScrollSmoother's transform on
// #smooth-content would otherwise break their `position: fixed` behavior.
export default function SmoothScroll() {
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return undefined;

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1,
      effects: false,
      normalizeScroll: true,
    });

    return () => {
      smoother.kill();
    };
  }, []);

  return null;
}
