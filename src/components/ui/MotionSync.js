"use client";

import { useEffect } from "react";
import { onIntroReady, scheduleRefresh } from "@/lib/motion";

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

    const ro = new ResizeObserver(scheduleRefresh);
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
