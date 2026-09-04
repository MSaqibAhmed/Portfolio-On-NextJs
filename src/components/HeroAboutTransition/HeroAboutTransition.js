"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  canHover,
  onMotionReady,
  prefersReducedMotion,
  scheduleRefresh,
} from "@/lib/motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Maps `value` from [inMin, inMax] to [outMin, outMax], clamped.
function mapRange(value, inMin, inMax, outMin, outMax) {
  const t = gsap.utils.clamp(0, 1, (value - inMin) / (inMax - inMin));
  return outMin + (outMax - outMin) * t;
}

// Shaping curves for the hand-off. `power1.inOut` on the travel keeps the
// motion tied to the scroll while softening both ends; the spin gets a
// gentler curve still so the card turn reads as the slowest part.
const easeTravel = gsap.parseEase("power1.inOut");
const easeSpin = gsap.parseEase("power2.inOut");

/**
 * The element's box in document space, measured from layout rather than from
 * `getBoundingClientRect()`.
 *
 * The rect reports the box AFTER transforms, and the About portrait spends
 * the whole approach offset by its own scroll reveal (`x: -34`). Aiming at
 * that put the travelling card 34px to the left of where the real photo
 * actually comes to rest, so the hand-off finished with a sideways snap
 * instead of a landing. offsetLeft/offsetTop/offsetWidth/offsetHeight are
 * layout values, untouched by any transform, so they describe the resting
 * place no matter what is mid-animation when the measurement is taken.
 */
function layoutBox(el) {
  let left = 0;
  let top = 0;
  for (let node = el; node; node = node.offsetParent) {
    left += node.offsetLeft;
    top += node.offsetTop;
  }
  return { top, left, width: el.offsetWidth, height: el.offsetHeight };
}

// Scroll-linked hand-off between the Hero portrait and the About portrait:
// a single traveling element (front = hero.png, back = about.png) moves
// between the two images. Boxes are measured once per ScrollTrigger refresh
// in DOCUMENT space and converted to viewport space each tick by subtracting
// the current scroll offset — so the per-tick work is pure transform and
// never touches layout.
//
// Gating is by capability and by what is actually on the page, never by
// window width: it runs wherever there is a fine pointer, motion is welcome,
// and both portraits are really laid out. A min-width gate used to decide
// this, which is how the whole effect could sit dormant on exactly the kind
// of display it was meant to be the highlight of.
//
// Rendered outside #page-content (see page.js), which is the element the
// radial menu scales when it opens — this overlay must stay unscaled and
// fixed to the real viewport throughout.
export default function HeroAboutTransition() {
  const overlayRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion() || !canHover()) return undefined;

    const heroEl = document.querySelector("[data-hero-photo]");
    const heroSection = document.getElementById("home");
    const aboutEl = document.querySelector("[data-about-photo]");
    const overlay = overlayRef.current;
    const card = cardRef.current;

    if (!heroEl || !aboutEl || !heroSection || !overlay || !card) {
      return undefined;
    }

    let trigger = null;
    let ro = null;

    const start = () => {
      // Everything that never changes is written once, so the per-tick work
      // is only the four numbers that actually move.
      gsap.set(overlay, {
        position: "fixed",
        top: 0,
        left: 0,
        transformOrigin: "top left",
        force3D: true,
      });

      // Both photos live in normal document flow, so their positions in
      // DOCUMENT space are constant — only their viewport position moves,
      // by exactly the page's scroll offset. Measuring once per refresh
      // (instead of reading two rects every tick) and driving the overlay
      // with transforms keeps this off the layout path entirely; reading
      // rects and writing top/left/width/height every frame would force a
      // synchronous reflow on every scroll tick.
      let heroBox = null;
      let aboutBox = null;

      const scrollOffset = () => window.scrollY;

      // Either portrait can be absent from the layout: display:none, a column
      // that collapsed, an image that failed. Measuring that and standing
      // down is what replaces the old width test — the effect asks whether it
      // has something to animate instead of guessing from the window.
      const usable = () =>
        heroBox && aboutBox && heroBox.width > 0 && aboutBox.width > 0;

      function measure() {
        heroBox = layoutBox(heroEl);
        aboutBox = layoutBox(aboutEl);
        if (!usable()) return;
        // The overlay keeps the hero's box as its intrinsic size; every
        // later size change is expressed as a scale.
        gsap.set(overlay, { width: heroBox.width, height: heroBox.height });
      }

      // Visibility is the expensive half of autoAlpha, so each fade is only
      // written when it has actually moved. Without this all three photos
      // took a style write on every scrolled frame for values that were
      // usually identical to the frame before.
      const alpha = { overlay: -1, hero: -1, about: -1 };
      const setAlpha = (key, el, value) => {
        if (Math.abs(alpha[key] - value) < 0.001) return;
        alpha[key] = value;
        gsap.set(el, { autoAlpha: value });
      };

      // The card finishes its journey before the hand-off starts: it arrives,
      // comes to rest exactly on the About portrait, and only then dissolves
      // into it. Cross-fading while it was still travelling is what made the
      // landing read as a bump — you were watching two copies of the same
      // photo, one moving and one not.
      const TRAVEL_END = 0.82;

      function update(progress) {
        if (!usable()) {
          // Stand down cleanly: the two real photos own themselves again.
          setAlpha("overlay", overlay, 0);
          setAlpha("hero", heroEl, 1);
          setAlpha("about", aboutEl, 1);
          return;
        }
        const { interpolate } = gsap.utils;
        const off = scrollOffset();

        // Eased rather than linear so the card sets off and settles gently
        // instead of tracking the wheel one-to-one. Both curves still return
        // 0 at 0 and 1 at 1, so the overlay still lands exactly on the About
        // portrait — just earlier in the scroll than the hand-off.
        const journey = gsap.utils.clamp(0, 1, progress / TRAVEL_END);
        const travel = easeTravel(journey);
        const spin = easeSpin(journey);

        const top = interpolate(heroBox.top, aboutBox.top, travel) - off;
        const left = interpolate(heroBox.left, aboutBox.left, travel);
        const w = interpolate(heroBox.width, aboutBox.width, travel);
        const h = interpolate(heroBox.height, aboutBox.height, travel);

        gsap.set(overlay, {
          x: left,
          y: top,
          scaleX: w / heroBox.width,
          scaleY: h / heroBox.height,
        });
        // Spread over almost the whole journey so the turn is its slowest,
        // most readable part, and is fully resolved by the time the card
        // settles.
        gsap.set(card, { rotateY: mapRange(spin, 0.06, 0.94, 0, 180) });

        const overlayIn = mapRange(progress, 0, 0.12, 0, 1);
        // Runs only after the card has stopped. From here both it and the
        // real photo are the same image, in the same place, scrolling
        // together — so the fade has nothing to give away, and it gets the
        // whole last fifth of the range to happen in.
        const handover = mapRange(progress, TRAVEL_END + 0.02, 1, 0, 1);

        setAlpha("overlay", overlay, Math.min(overlayIn, 1 - handover));
        setAlpha("hero", heroEl, 1 - overlayIn);
        setAlpha("about", aboutEl, handover);
      }

      measure();
      update(0);

      trigger = ScrollTrigger.create({
        trigger: heroSection,
        start: "top top",
        end: "bottom top",
        // Heavier smoothing: the overlay eases toward the scroll position
        // over ~2s rather than tracking it one-to-one. The card keeps gliding
        // for a beat after the wheel stops, so it settles into place instead
        // of arriving at it.
        scrub: 2,
        // Use the instance ScrollTrigger hands us: `onRefresh` fires
        // synchronously from inside create(), so referencing the outer
        // `trigger` binding here throws a TDZ error and kills this effect.
        onRefresh: (self) => {
          measure();
          update(self.progress);
        },
        onUpdate: (self) => update(self.progress),
      });

      // The two portraits change size whenever the layout reflows: a resized
      // window, a different column count, a late webfont. Watching the
      // elements themselves re-measures on exactly those events and on
      // nothing else, with no width thresholds involved.
      ro = new ResizeObserver(() => {
        measure();
        update(trigger ? trigger.progress : 0);
      });
      ro.observe(heroEl);
      ro.observe(aboutEl);

      // Coalesced with every other refresh on the page, and skipped entirely
      // while the viewport reports no size — measuring then is what produced
      // negative start positions for every trigger on the site.
      scheduleRefresh();
    };

    const cancelIntro = onMotionReady(start);

    return () => {
      cancelIntro();
      ro?.disconnect();
      trigger?.kill();
      gsap.set([heroEl, aboutEl], { clearProps: "opacity,visibility" });
      gsap.set(overlay, { clearProps: "transform,width,height" });
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="hero-about-transition-image pointer-events-none invisible fixed z-30 overflow-hidden opacity-0"
      style={{ perspective: "1600px", width: 300, height: 375 }}
    >
      <div
        ref={cardRef}
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <Image
            src="/images/hero.png"
            alt=""
            fill
            sizes="340px"
            className="object-cover object-center grayscale"
          />
        </div>
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <Image
            src="/images/about.png"
            alt=""
            fill
            sizes="340px"
            className="object-cover object-center grayscale"
          />
        </div>
      </div>
    </div>
  );
}
