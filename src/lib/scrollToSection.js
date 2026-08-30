import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollToPlugin);
}

/**
 * The one way anything in the app moves to a section.
 *
 * Driven by GSAP's ScrollToPlugin rather than `scrollIntoView({behavior:
 * "smooth"})`: ScrollTrigger forces `scroll-behavior: auto` on <html> (so its
 * own scroll math never lags behind a CSS-animated scroll), and that leaves
 * the native smooth scrollIntoView unable to animate at all. GSAP drives the
 * scroll position directly, so it isn't affected by that CSS property.
 *
 * Deliberately does NOT write the hash into the URL. This is a single-page
 * site, so a `#section` in the address bar only creates problems: on reload
 * the browser jumps to that anchor before the intro has finished, fighting
 * the loader and landing the visitor mid-page instead of on the hero.
 */
export default function scrollToSection(hash) {
  if (typeof window === "undefined" || !hash || !hash.startsWith("#")) return;

  const target = document.querySelector(hash);
  if (!target) return;

  const destination = target.getBoundingClientRect().top + window.scrollY;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  gsap.to(window, {
    duration: reduce ? 0 : 0.9,
    scrollTo: { y: destination },
    ease: "power2.inOut",
  });
}
