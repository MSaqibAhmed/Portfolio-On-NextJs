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
/* Measurability — the gate every ScrollTrigger must pass               */
/* ------------------------------------------------------------------ */

/**
 * Whether the viewport currently reports a real size.
 *
 * This is the single most important guard on the page. ScrollTrigger turns
 * `top bottom-=72px` into an absolute scroll position by measuring the
 * viewport; if it measures while the viewport reports zero height, every
 * `start` it computes comes out NEGATIVE, which means every trigger on the
 * page counts as already passed at scroll 0 and they all fire at once,
 * behind the intro, while the visitor is still looking at the hero. With
 * `once: true` those triggers are then killed, so nothing re-arms them —
 * one bad measurement permanently burns every entrance animation on the
 * site.
 *
 * A zero-height viewport is a normal transient during a *cold* page load — a
 * tab that has not been composited yet, a restored or backgrounded tab, an
 * embedded or prerendered view. On a repeat visit everything is in cache and
 * layout resolves in a single paint, so the measurement lands on a valid
 * viewport and the bug never shows. That is exactly why this only ever
 * appeared on first-time visitors.
 */
export function isMeasurable() {
  if (typeof window === "undefined") return false;
  const el = document.documentElement;
  return window.innerHeight > 0 && el.clientHeight > 0 && el.clientWidth > 0;
}

const measurableWaiters = new Set();
let measurablePoll = 0;
let measurableBound = false;

function stopMeasurableWatch() {
  if (measurablePoll) {
    window.clearInterval(measurablePoll);
    measurablePoll = 0;
  }
  if (measurableBound) {
    window.removeEventListener("resize", flushMeasurable);
    window.removeEventListener("pageshow", flushMeasurable);
    document.removeEventListener("visibilitychange", flushMeasurable);
    measurableBound = false;
  }
}

function flushMeasurable() {
  if (!isMeasurable()) return;
  stopMeasurableWatch();
  const waiters = [...measurableWaiters];
  measurableWaiters.clear();
  waiters.forEach((fn) => fn());
}

/**
 * Runs `fn` once the viewport can actually be measured — immediately if it
 * already can. Returns an unsubscribe.
 *
 * Polled on a plain interval rather than rAF: a hidden or heavily throttled
 * tab stops rAF completely, and that is precisely the state this is waiting
 * to come out of.
 */
export function whenMeasurable(fn) {
  if (typeof window === "undefined") return () => {};
  if (isMeasurable()) {
    fn();
    return () => {};
  }
  measurableWaiters.add(fn);
  if (!measurableBound) {
    measurableBound = true;
    window.addEventListener("resize", flushMeasurable);
    window.addEventListener("pageshow", flushMeasurable);
    document.addEventListener("visibilitychange", flushMeasurable);
    measurablePoll = window.setInterval(flushMeasurable, 250);
  }
  return () => {
    measurableWaiters.delete(fn);
    if (!measurableWaiters.size) stopMeasurableWatch();
  };
}

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
let introDeadline = 0;

const INTRO_FAILSAFE_MS = 7000;

export function isIntroReady() {
  return introReady;
}

export function markIntroReady() {
  if (introReady) return;
  introReady = true;
  window.clearTimeout(introFailsafe);
  introFailsafe = 0;
  introWaiters.forEach((fn) => fn());
  introWaiters.clear();
}

/**
 * Pushes the intro failsafe out to `ms` from now.
 *
 * The failsafe exists so a broken intro can never withhold the page, but a
 * fixed deadline is also short enough that a genuinely slow first load could
 * trip it *while the intro is still playing* — releasing every entrance
 * animation to run, unseen, behind the panel. The loader calls this once it
 * knows its real timeline length, so the deadline always sits safely past the
 * end of the sequence it is backing up.
 */
export function extendIntroFailsafe(ms) {
  if (introReady || typeof window === "undefined") return;
  const deadline = Date.now() + ms;
  if (deadline <= introDeadline) return;
  introDeadline = deadline;
  window.clearTimeout(introFailsafe);
  introFailsafe = window.setTimeout(markIntroReady, ms);
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
    extendIntroFailsafe(INTRO_FAILSAFE_MS);
  }
  return () => introWaiters.delete(fn);
}

/**
 * The one gate every entrance animation on the site is built behind: the
 * intro must be clearing AND the viewport must be measurable.
 *
 * Waiting on the intro alone was enough on a warm load and wrong on a cold
 * one — see `isMeasurable()` for what a premature measurement costs.
 */
export function onMotionReady(fn) {
  let cancelMeasurable = () => {};
  const cancelIntro = onIntroReady(() => {
    cancelMeasurable = whenMeasurable(fn);
  });
  return () => {
    cancelIntro();
    cancelMeasurable();
  };
}

/* ------------------------------------------------------------------ */
/* Measurement                                                         */
/* ------------------------------------------------------------------ */

let refreshFrame = 0;

/**
 * Coalesced ScrollTrigger.refresh(). Refresh is a full re-measure of every
 * trigger on the page, so the callers below — a ResizeObserver, font loading,
 * image decoding — must not each pay for their own.
 *
 * Refusing to refresh while the viewport is unmeasurable is what stops a
 * transient zero-height layout from rewriting every trigger's start to a
 * negative number; the refresh is simply deferred until there is a real
 * viewport to measure against.
 */
export function scheduleRefresh() {
  if (typeof window === "undefined") return;
  if (!isMeasurable()) {
    whenMeasurable(scheduleRefresh);
    return;
  }
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
  if (!el || !el.isConnected) return false;
  const h = window.innerHeight || document.documentElement.clientHeight || 0;
  // No viewport to compare against yet: nothing is on screen, and nothing
  // may be rescued on the strength of a measurement that cannot be trusted.
  if (!h) return false;
  const r = el.getBoundingClientRect();
  return r.top < h - REVEAL_OVERLAP && r.bottom > 0;
}

/* ------------------------------------------------------------------ */
/* Reveal watchdog — content is never left hidden                      */
/* ------------------------------------------------------------------ */

/**
 * Animations are an enhancement; the page underneath them has to stand on its
 * own. Every reveal on this site works by writing a hidden state first and
 * animating out of it, so anything that stops GSAP between those two halves —
 * a frozen rAF ticker in a backgrounded tab, a trigger that mis-measured and
 * was killed, a tween that never reaches its targets — would otherwise leave
 * real content sitting at opacity 0 indefinitely.
 *
 * This watchdog closes that gap permanently. Anything hidden for a reveal is
 * registered here, and from `delay` onwards, whenever a registered element is
 * actually on screen and still invisible, its animation is played. If the
 * group has not moved AT ALL a few seconds later, the ticker is demonstrably
 * not running, and the inline state is cleared outright — dropping every
 * target back to its natural stylesheet appearance: fully visible.
 *
 * None of this changes how a healthy page looks. A group whose opacities are
 * still changing is left strictly alone, however long its stagger runs, so
 * the only thing that can ever trip the reset is motion that has genuinely
 * stopped.
 */
const watched = new Set();
let watchFrame = 0;
let watchPoll = 0;
let watchBound = false;
let cleanSweeps = 0;

// How long a group may sit completely motionless, with something in it still
// invisible, before its inline state is cleared. Longer than the longest
// reveal on the site (Skills: ≈3s including its 36-pill stagger), and backed
// by the movement check below, so a healthy animation is never cut short.
const HARD_RESET_MS = 3000;

// Consecutive quiet interval sweeps after which polling stops. Scroll, resize
// and visibility changes keep sweeping; the interval only exists for the case
// where rAF is frozen, and it re-arms the moment anything is found stuck.
const QUIET_SWEEPS = 8;

function isHidden(el) {
  return el.isConnected && Number(gsap.getProperty(el, "opacity")) < 0.01;
}

// A cheap fingerprint of how far a group has got. If two readings taken
// HARD_RESET_MS apart are identical, nothing in the group moved in between —
// which is the difference between "mid-stagger" and "the ticker is dead".
function progressSignature(targets) {
  let total = 0;
  for (const el of targets) {
    total += Number(gsap.getProperty(el, "opacity")) || 0;
  }
  return Math.round(total * 1000);
}

function sweep() {
  watchFrame = 0;
  let sawStuck = false;

  watched.forEach((entry) => {
    if (!entry.root.isConnected) {
      watched.delete(entry);
      return;
    }
    if (Date.now() < entry.at || !isOnScreen(entry.root)) return;

    const stuck = entry.targets.filter((el) => isOnScreen(el) && isHidden(el));
    if (!stuck.length) {
      entry.pending = 0;
      return;
    }

    sawStuck = true;
    if (!entry.pending) {
      // First attempt: let the real animation do the work, so the visitor
      // still gets the intended motion wherever it is recoverable.
      entry.pending = Date.now();
      entry.sig = progressSignature(entry.targets);
      entry.play();
      return;
    }
    if (Date.now() - entry.pending <= HARD_RESET_MS) return;

    const sig = progressSignature(entry.targets);
    if (sig !== entry.sig) {
      // Still moving — this is the tail of a long stagger, not a failure.
      // Give it another window and keep out of its way.
      entry.pending = Date.now();
      entry.sig = sig;
      return;
    }
    // Nothing moved for a full window. Clear the whole group, not just the
    // targets at opacity 0: a tween frozen part-way leaves its elements
    // half-faded and half-clipped, which is no more acceptable than one left
    // fully invisible.
    gsap.set(
      entry.targets.filter((el) => el.isConnected),
      { clearProps: "opacity,transform,clipPath,visibility" }
    );
    entry.pending = 0;
  });

  if (!watched.size) {
    stopWatch();
    return;
  }
  cleanSweeps = sawStuck ? 0 : cleanSweeps + 1;
  if (watchPoll && cleanSweeps >= QUIET_SWEEPS) {
    window.clearInterval(watchPoll);
    watchPoll = 0;
  }
}

function startPoll() {
  if (watchPoll || !watched.size) return;
  cleanSweeps = 0;
  // A plain interval, not rAF: the whole point is to keep working when the
  // animation ticker is not.
  watchPoll = window.setInterval(sweep, 1000);
}

function requestSweep() {
  startPoll();
  if (watchFrame) return;
  watchFrame = requestAnimationFrame(sweep);
}

function startWatch() {
  if (watchBound) {
    startPoll();
    return;
  }
  watchBound = true;
  window.addEventListener("scroll", requestSweep, { passive: true });
  window.addEventListener("resize", requestSweep);
  window.addEventListener("pageshow", requestSweep);
  document.addEventListener("visibilitychange", requestSweep);
  startPoll();
}

function stopWatch() {
  if (watchPoll) {
    window.clearInterval(watchPoll);
    watchPoll = 0;
  }
  if (!watchBound) return;
  watchBound = false;
  window.removeEventListener("scroll", requestSweep);
  window.removeEventListener("resize", requestSweep);
  window.removeEventListener("pageshow", requestSweep);
  document.removeEventListener("visibilitychange", requestSweep);
}

/**
 * Registers a reveal with the watchdog above.
 *
 *   root     the section that has to be on screen for any of this to matter
 *   targets  the elements that were hidden and must end up visible
 *   play     replays the intended animation; must be safe to call more than
 *            once (every caller either guards on `progress() === 0` or
 *            filters down to the elements that are still hidden)
 *
 * Returns a cancel function.
 */
export function revealFailsafe(root, targets, play, delay = 2500) {
  if (typeof window === "undefined" || !root) return () => {};
  const list = gsap.utils.toArray(targets).filter(Boolean);
  if (!list.length) return () => {};

  const entry = {
    root,
    targets: list,
    play,
    at: Date.now() + delay,
    pending: 0,
    sig: 0,
  };
  watched.add(entry);
  startWatch();

  return () => {
    watched.delete(entry);
    if (!watched.size) stopWatch();
  };
}
