"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

// Scroll-linked hand-off between the Hero portrait and the About portrait:
// a single traveling element (front = hero.png, back = about.png) moves
// between the two images. Boxes are measured once per ScrollTrigger refresh
// in DOCUMENT space and converted to viewport space each tick by subtracting
// the current scroll offset — so the per-tick work is pure transform and
// never touches layout.
// Desktop (>=1024px) and motion-safe only — see the matchMedia gate below.
// Rendered outside #page-content (see page.js), which is the element the
// radial menu scales when it opens — this overlay must stay unscaled and
// fixed to the real viewport throughout.
export default function HeroAboutTransition() {
  const overlayRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 1024px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isDesktop, reduceMotion } = context.conditions;
        if (!isDesktop || reduceMotion) return undefined;

        const heroEl = document.querySelector("[data-hero-photo]");
        const heroSection = document.getElementById("home");
        const aboutEl = document.querySelector("[data-about-photo]");
        const overlay = overlayRef.current;
        const card = cardRef.current;

        if (!heroEl || !aboutEl || !heroSection || !overlay || !card) {
          return undefined;
        }

        gsap.set(overlay, { position: "fixed", top: 0, left: 0 });

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

        function measure() {
          const off = scrollOffset();
          const h = heroEl.getBoundingClientRect();
          const a = aboutEl.getBoundingClientRect();
          heroBox = { top: h.top + off, left: h.left, width: h.width, height: h.height };
          aboutBox = { top: a.top + off, left: a.left, width: a.width, height: a.height };
          // The overlay keeps the hero's box as its intrinsic size; every
          // later size change is expressed as a scale.
          gsap.set(overlay, { width: heroBox.width, height: heroBox.height });
        }

        function update(progress) {
          if (!heroBox || !aboutBox) return;
          const { interpolate } = gsap.utils;
          const off = scrollOffset();

          // Eased rather than linear so the card sets off and settles gently
          // instead of tracking the wheel one-to-one. Both curves still return
          // 0 at 0 and 1 at 1, so the overlay still lands exactly on the About
          // portrait.
          const travel = easeTravel(progress);
          const spin = easeSpin(progress);

          const top = interpolate(heroBox.top, aboutBox.top, travel) - off;
          const left = interpolate(heroBox.left, aboutBox.left, travel);
          const w = interpolate(heroBox.width, aboutBox.width, travel);
          const h = interpolate(heroBox.height, aboutBox.height, travel);

          gsap.set(overlay, {
            x: left,
            y: top,
            scaleX: w / heroBox.width,
            scaleY: h / heroBox.height,
            transformOrigin: "top left",
            force3D: true,
          });
          // Spread over most of the scroll range (was 0.3–0.7) so the turn is
          // noticeably slower and easier to read.
          gsap.set(card, { rotateY: mapRange(spin, 0.16, 0.84, 0, 180) });

          const overlayIn = mapRange(progress, 0, 0.08, 0, 1);
          const overlayOut = 1 - mapRange(progress, 0.92, 1, 0, 1);

          gsap.set(overlay, { autoAlpha: Math.min(overlayIn, overlayOut) });
          gsap.set(heroEl, { autoAlpha: 1 - overlayIn });
          gsap.set(aboutEl, { autoAlpha: mapRange(progress, 0.92, 1, 0, 1) });
        }

        measure();
        update(0);

        const trigger = ScrollTrigger.create({
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          // Heavier smoothing: the overlay eases toward the scroll position
          // over ~1.4s instead of snapping to it, which is what reads as
          // "smooth" on a trackpad or a flicked phone scroll.
          scrub: 1.4,
          // Use the instance ScrollTrigger hands us: `onRefresh` fires
          // synchronously from inside create(), so referencing the outer
          // `trigger` const here throws a TDZ error and kills this effect.
          onRefresh: (self) => {
            measure();
            update(self.progress);
          },
          onUpdate: (self) => update(self.progress),
        });
        ScrollTrigger.refresh();

        return () => {
          trigger.kill();
          gsap.set([heroEl, aboutEl], { clearProps: "opacity,visibility" });
          gsap.set(overlay, { clearProps: "transform,width,height" });
        };
      }
    );

    return () => mm.revert();
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
