"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FLIP_QUERY,
  onMotionReady,
  prefersReducedMotion,
  scheduleRefresh,
  watchMedia,
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

// How long the card takes to catch up to the scroll position, in seconds.
//
// ScrollTrigger scrubs with an `expo` ease and continuously re-targets, so the
// felt lag is well under the nominal duration — but the whole travel range is
// only one viewport height, which a flick covers in a couple of hundred
// milliseconds. Much above this and the card is still crossing the page a
// second after the visitor has stopped, drifting over the About copy instead
// of landing in it. This is the glide the effect was always meant to have:
// the card trails the wheel slightly and settles, rather than being dragged.
const SCRUB = 1.1;

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
// Gating is `lg` and up, on a fine pointer, with motion welcome, and only
// while both portraits are really laid out (see FLIP_QUERY).
//
// Below `lg` the two portraits are stacked rather than side by side, so the
// travelling card would cross the whole page and pass over the copy on its
// way down — the flip is a wide-layout effect and is switched off outright on
// phones and tablets. The gate is re-evaluated whenever the query flips, not
// just at mount, so dragging a desktop window down to a phone width tears the
// overlay down and hands both photos back to themselves (and dragging it back
// out rebuilds it).
//
// Rendered outside #page-content (see page.js), which is the element the
// radial menu scales when it opens — this overlay must stay unscaled and
// fixed to the real viewport throughout.
export default function HeroAboutTransition() {
  const overlayRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    let teardown = null;

    const enable = () => {
      if (teardown) return;
      teardown = attach();
    };

    const disable = () => {
      if (!teardown) return;
      teardown();
      teardown = null;
    };

    const stopWatching = watchMedia(FLIP_QUERY, (matches) =>
      matches ? enable() : disable()
    );

    return () => {
      stopWatching();
      disable();
    };

    function attach() {
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
      let settle = null;
      let settleTo = null;
      let lastSettle = 0;
      let scrubProxy = null;

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

        // The number the scrub actually smooths.
        //
        // `scrub` does NOT smooth `self.progress` — it smooths the trigger's
        // ANIMATION. ScrollTrigger builds `gsap.to(animation, {totalProgress,
        // ease: "expo", duration: scrub})` and eases that toward the scroll
        // position, while `self.progress` is assigned the raw, scroll-derived
        // value one line before `onUpdate(self)` is called. So a trigger that
        // carries `scrub` but no animation has nothing to smooth, and reading
        // `self.progress` in `onUpdate` gets you the unsmoothed number
        // regardless: the card tracked the wheel one-to-one, and the glide
        // this effect was written for never actually happened.
        //
        // This tween exists purely to be that animation. It carries one value
        // from 0 to 1 and does nothing else; ScrollTrigger eases the value
        // toward the scroll position, and the card is drawn from the eased
        // number on every frame it moves. `paused` because the scroll position
        // is its only clock.
        const scrubbed = { p: 0 };
        scrubProxy = gsap.to(scrubbed, {
          p: 1,
          ease: "none",
          duration: 1,
          paused: true,
          onUpdate: () => update(scrubbed.p),
        });

        trigger = ScrollTrigger.create({
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          animation: scrubProxy,
          scrub: SCRUB,
          // Drawing is driven by the proxy's own onUpdate above, so there is
          // deliberately no `onUpdate` here: reading `self.progress` would put
          // the raw scroll value back on screen and undo the smoothing.
          //
          // `onRefresh` still has to re-measure, and it re-draws at the
          // scrubbed value rather than the raw one for the same reason.
          onRefresh: () => {
            measure();
            update(scrubbed.p);
          },
        });

        // Jumps the card to one end of its range and takes the scrub with it,
        // so the ticker resumes from what the visitor can already see instead
        // of animating away from it. `progress(p, true)` suppresses the
        // proxy's own callback — the draw is done explicitly here, once.
        settleTo = (p) => {
          scrubProxy.progress(p, true);
          update(p);
        };

        // Settle the ends when the ticker is not running.
        //
        // Smoothing is the reason this exists. The scrub advances on rAF, and
        // a browser stops rAF outright in a backgrounded tab (and throttles it
        // hard on a phone that is low on power) — so the eased value is
        // exactly the thing that can be left stranded mid-flight. This effect
        // OWNS both real portraits' opacity, so a scrub frozen near 0 while
        // the visitor is already down at About leaves the About portrait
        // sitting at opacity 0: invisible, with nothing to un-hide it until
        // the ticker comes back and then spends the whole catch-up easing
        // toward it.
        //
        // Scroll events keep firing when rAF does not, so this reads the raw
        // scroll position — not the smoothed value — and settles to the
        // terminal state whenever the page is demonstrably past one end of the
        // range and the portrait that should be visible there is not. On a
        // healthy page it never fires: the scrub has always already put those
        // values where this would put them.
        settle = () => {
          if (!usable()) return;
          const now = Date.now();
          if (now - lastSettle < 200) return;
          lastSettle = now;

          const y = scrollOffset();
          const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
          const opacityOf = (el) => Number(gsap.getProperty(el, "opacity"));

          if (y >= heroBottom && opacityOf(aboutEl) < 0.99) settleTo(1);
          else if (y <= heroSection.offsetTop && opacityOf(heroEl) < 0.99) {
            settleTo(0);
          }
        };
        window.addEventListener("scroll", settle, { passive: true });
        document.addEventListener("visibilitychange", settle);
        window.addEventListener("pageshow", settle);

        // The two portraits change size whenever the layout reflows: a resized
        // window, a different column count, a late webfont. Watching the
        // elements themselves re-measures on exactly those events and on
        // nothing else, with no width thresholds involved.
        ro = new ResizeObserver(() => {
          measure();
          // Redraw where the card actually is, not where the scrollbar says
          // it should be — a reflow mid-glide must not snap it forward.
          update(scrubbed.p);
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
        if (settle) {
          window.removeEventListener("scroll", settle);
          document.removeEventListener("visibilitychange", settle);
          window.removeEventListener("pageshow", settle);
          settle = null;
        }
        ro?.disconnect();
        trigger?.kill();
        // Killed separately: ScrollTrigger.kill() does not take the animation
        // it was scrubbing with it, and a live tween holding a closure over
        // these elements would keep drawing into a torn-down effect.
        scrubProxy?.kill();
        scrubProxy = null;
        settleTo = null;
        // Both photos own themselves again the moment the effect stands down —
        // this is what makes leaving the `lg` breakpoint safe rather than
        // leaving the About portrait stuck at whatever alpha the last scroll
        // tick wrote.
        gsap.set([heroEl, aboutEl], { clearProps: "opacity,visibility" });
        gsap.set(overlay, {
          clearProps: "transform,width,height,opacity,visibility",
        });
      };
    }
  }, []);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="hero-about-transition-image pointer-events-none invisible fixed z-30 hidden overflow-hidden opacity-0 lg:block"
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
