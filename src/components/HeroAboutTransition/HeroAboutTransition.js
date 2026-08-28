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

// Scroll-linked hand-off between the Hero portrait and the About portrait:
// a single traveling element (front = hero.png, back = about.png) tracks
// between the two images' LIVE rects on every scrub tick. Live reads (rather
// than a precomputed start/end delta) are required because SmoothScroll
// (ScrollSmoother) adds its own lag on top of raw scroll, so an element's
// visual position isn't a fixed function of scrollY alone.
// Desktop (>=1024px) and motion-safe only — see the matchMedia gate below.
// Rendered outside #smooth-wrapper/#smooth-content (see page.js) so its
// `position: fixed` isn't broken by ScrollSmoother's transform.
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

        function update(progress) {
          const heroRect = heroEl.getBoundingClientRect();
          const aboutRect = aboutEl.getBoundingClientRect();

          gsap.set(overlay, {
            top: gsap.utils.interpolate(heroRect.top, aboutRect.top, progress),
            left: gsap.utils.interpolate(heroRect.left, aboutRect.left, progress),
            width: gsap.utils.interpolate(heroRect.width, aboutRect.width, progress),
            height: gsap.utils.interpolate(heroRect.height, aboutRect.height, progress),
          });
          gsap.set(card, { rotateY: mapRange(progress, 0.3, 0.7, 0, 180) });

          const overlayIn = mapRange(progress, 0, 0.08, 0, 1);
          const overlayOut = 1 - mapRange(progress, 0.92, 1, 0, 1);

          gsap.set(overlay, { autoAlpha: Math.min(overlayIn, overlayOut) });
          gsap.set(heroEl, { autoAlpha: 1 - overlayIn });
          gsap.set(aboutEl, { autoAlpha: mapRange(progress, 0.92, 1, 0, 1) });
        }

        update(0);

        const trigger = ScrollTrigger.create({
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
          onUpdate: (self) => update(self.progress),
        });
        ScrollTrigger.refresh();

        function handleResize() {
          ScrollTrigger.refresh();
          update(trigger.progress);
        }
        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
          trigger.kill();
          gsap.set([heroEl, aboutEl], { clearProps: "opacity,visibility" });
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
