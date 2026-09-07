"use client";

import { useLayoutEffect } from "react";

/**
 * Puts a freshly navigated page at the top.
 *
 * The router already does this, but the page it is leaving owns a pinned
 * ScrollTrigger several screens tall. That spacer is torn down on unmount,
 * the document shrinks by thousands of pixels, and the browser re-clamps the
 * scroll position — after the router has scrolled to the top. The visitor
 * arrives halfway down a page they have never seen.
 *
 * A hash in the URL is somebody deliberately asking for a position, so it is
 * left alone.
 */
export default function ScrollTop() {
  useLayoutEffect(() => {
    if (window.location.hash) return undefined;

    window.scrollTo(0, 0);
    const frame = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(frame);
  }, []);

  return null;
}
