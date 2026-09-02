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
 */
export default function MotionSync() {
  useEffect(() => {
    const stopIntro = onIntroReady(scheduleRefresh);

    const ro = new ResizeObserver(scheduleRefresh);
    ro.observe(document.body);

    if (document.fonts?.ready) document.fonts.ready.then(scheduleRefresh);
    window.addEventListener("load", scheduleRefresh);

    return () => {
      stopIntro();
      ro.disconnect();
      window.removeEventListener("load", scheduleRefresh);
    };
  }, []);

  return null;
}
