/**
 * The one way anything in the app moves to a section, so the URL hash always
 * stays in sync without triggering the browser's own (unsmoothed) jump.
 */
export default function scrollToSection(hash) {
  if (typeof window === "undefined" || !hash || !hash.startsWith("#")) return;

  const target = document.querySelector(hash);
  if (!target) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({
    behavior: reduce ? "auto" : "smooth",
    block: "start",
  });

  // Keep the URL in step without triggering the browser's own jump.
  if (window.history?.replaceState) {
    window.history.replaceState(null, "", hash);
  }
}
