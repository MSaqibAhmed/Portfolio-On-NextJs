"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ------------------------------------------------------------------ */
/* Environment — capabilities, never widths                            */
/* ------------------------------------------------------------------ */

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Whether hover-driven motion (magnetism, lifts, the portrait hand-off) makes
 * sense here. This asks about the *pointer*, not the screen: a 13" laptop and
 * a 34" ultrawide are the same device class, and a phone stays a phone in
 * landscape. Width comparisons got both of those wrong.
 */
export const canHover = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ------------------------------------------------------------------ */
/* Reveal geometry                                                     */
/* ------------------------------------------------------------------ */

/**
 * One start position for every scroll reveal on the site: fire once the
 * element is a fixed 72px inside the viewport.
 *
 * The old `top 80%` was a share of the *viewport*, which is 150px of overlap
 * on a laptop but 290px on a large monitor. On a big screen that meant a
 * short section had already finished its entrance while it was still down at
 * the bottom edge — by the time you actually looked at it, it was static.
 * That is the "it doesn't animate on big screens" bug. A fixed overlap
 * behaves identically at every viewport height.
 */
export const REVEAL_START = "top bottom-=72px";

/* ------------------------------------------------------------------ */
/* Intro hand-off                                                      */
/* ------------------------------------------------------------------ */

// The second half of the same bug: every entrance animation used to start at
// mount, which is while the intro overlay still covers the whole screen. The
// timelines ran and completed behind a black panel, and the visitor arrived
// on a page that was already settled. Nothing entrance-related may build
// until this signal fires.

let introReady = false;
const introWaiters = new Set();
let introFailsafe = 0;

export function isIntroReady() {
  return introReady;
}

export function markIntroReady() {
  if (introReady) return;
  introReady = true;
  window.clearTimeout(introFailsafe);
  introWaiters.forEach((fn) => fn());
  introWaiters.clear();
}

/**
 * Runs `fn` when the intro is out of the way — immediately if it already is.
 * Returns an unsubscribe, so a component that unmounts first never fires.
 */
export function onIntroReady(fn) {
  if (introReady) {
    fn();
    return () => {};
  }
  introWaiters.add(fn);
  // The intro must never be able to withhold the page's animations, however
  // it fails (backgrounded tab, an image that never resolves, a thrown error
  // inside the loader).
  if (!introFailsafe && typeof window !== "undefined") {
    introFailsafe = window.setTimeout(markIntroReady, 7000);
  }
  return () => introWaiters.delete(fn);
}

/* ------------------------------------------------------------------ */
/* Measurement                                                         */
/* ------------------------------------------------------------------ */

let refreshFrame = 0;

/**
 * Coalesced ScrollTrigger.refresh(). Refresh is a full re-measure of every
 * trigger on the page, so the callers below — a ResizeObserver, font loading,
 * image decoding — must not each pay for their own.
 */
export function scheduleRefresh() {
  if (refreshFrame) return;
  refreshFrame = requestAnimationFrame(() => {
    refreshFrame = 0;
    ScrollTrigger.refresh();
  });
}

// How far into the viewport an element must be before it counts as "on
// screen" — the same 72px REVEAL_START uses, so the failsafe below can never
// disagree with the trigger it is backing up.
const REVEAL_OVERLAP = 72;

export function isOnScreen(el) {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight - REVEAL_OVERLAP && r.bottom > 0;
}

/**
 * Content must never be left hidden by an animation that never ran.
 *
 * Checks once, shortly after the intro: if `root` is far enough into the
 * viewport that its trigger should already have fired and it still hasn't,
 * something upstream mis-measured — show it rather than leaving a blank
 * section. Returns a cancel function.
 */
export function revealFailsafe(root, play, delay = 2500) {
  const id = window.setTimeout(() => {
    if (isOnScreen(root)) play();
  }, delay);
  return () => window.clearTimeout(id);
}
