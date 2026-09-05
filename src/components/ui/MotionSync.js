"use client";

import { useEffect } from "react";
import { isCoarsePointer, onIntroReady, scheduleRefresh } from "@/lib/motion";

/**
 * Keeps every ScrollTrigger's start/end honest.
 *
 * Anything that changes the document's height invalidates the numbers each
 * trigger measured at build time: webfonts swapping in, images decoding, the
 * intro overlay releasing the scroll lock, the window being dragged onto a
 * second monitor, a phone's browser chrome collapsing. A ResizeObserver on
 * <body> catches all of them without a single width comparison — which is
 * exactly why an unusually large display used to fall through the gaps.
 *
 * `scheduleRefresh` coalesces the lot into one rAF, and refuses to measure at
 * all while the viewport reports no size, so none of these callers can hand
 * ScrollTrigger a layout it cannot make sense of.
 */
export default function MotionSync() {
  useEffect(() => {
    const stopIntro = onIntroReady(scheduleRefresh);

    // On a phone the address bar collapses and re-expands as you scroll, and
    // that is a *height* change to the layout viewport — which reaches this
    // observer as a body resize several times during an ordinary swipe. Each
    // one used to cost a full ScrollTrigger.refresh() mid-scroll, which is
    // both the jank and the "the animation fired at the wrong place" that
    // only ever showed up on touch devices. Width changes (rotation, a
    // resized window, a foldable opening) are real layout changes and still
    // refresh; a height-only change on a touch screen is ignored.
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    let lastDocH = document.body.offsetHeight;
    const onBodyResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const docH = document.body.offsetHeight;
      // Only the viewport's height moved: the document is the same height it
      // was, and it is the same width. That is the address bar, and nothing
      // else. Content actually growing (an image decoding, a webfont
      // swapping) changes the DOCUMENT height and still refreshes, which is
      // the case this observer exists for.
      const barOnly = w === lastW && docH === lastDocH && h !== lastH;
      lastW = w;
      lastH = h;
      lastDocH = docH;
      if (barOnly && isCoarsePointer()) return;
      scheduleRefresh();
    };

    const ro = new ResizeObserver(onBodyResize);
    ro.observe(document.body);

    if (document.fonts?.ready) document.fonts.ready.then(scheduleRefresh);
    window.addEventListener("load", scheduleRefresh);

    // A tab that loads in the background has no usable viewport to measure
    // and no running ticker; both arrive at once, the moment it is shown.
    // `pageshow` covers the same thing for a bfcache restore, where the page
    // comes back without a fresh load event.
    const onVisible = () => {
      if (document.visibilityState === "visible") scheduleRefresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", scheduleRefresh);

    return () => {
      stopIntro();
      ro.disconnect();
      window.removeEventListener("load", scheduleRefresh);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", scheduleRefresh);
    };
  }, []);

  return null;
}
