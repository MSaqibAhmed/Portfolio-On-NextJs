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
      // Seconds the content takes to catch up with the real scroll position.
      // This is the single biggest lever on perceived scroll speed: 1.5 feels
      // laggy, ~0.8–1 reads as smooth but responsive. Raise it for a heavier
      // feel, lower it for a snappier one.
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
