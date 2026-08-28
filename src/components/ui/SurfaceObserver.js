"use client";

import { useEffect } from "react";

// Flags <html data-surface="dark"> whenever a dark section covers the middle
// of the viewport, so the scrollbar can invert against it.
export default function SurfaceObserver() {
  useEffect(() => {
    const darkSections = document.querySelectorAll("[data-surface-dark]");
    if (!darkSections.length) return;

    const update = () => {
      const mid = window.innerHeight / 2;
      const onDark = Array.from(darkSections).some((el) => {
        const { top, bottom } = el.getBoundingClientRect();
        return top <= mid && bottom >= mid;
      });
      document.documentElement.dataset.surface = onDark ? "dark" : "light";
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      delete document.documentElement.dataset.surface;
    };
  }, []);

  return null;
}
