"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { achievements } from "@/data/achievements";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Accent rule + highlight sweep for a winning entry. Both sit at scale/opacity
 * zero at rest, directly over the existing `border-b`, so the static design is
 * unchanged until the item is revealed.
 */
function WinnerAccents() {
  return (
    <>
      <span
        data-accent
        aria-hidden
        className="pointer-events-none absolute bottom-[-1px] left-0 h-px w-full origin-left scale-x-0 bg-ink"
      />
      <span
        data-sweep
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 opacity-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(10,10,10,0.05), transparent)",
        }}
      />
    </>
  );
}

function LargeItem({ item }) {
  const isWinner = Boolean(item.badge);
  return (
    <div
      data-item
      data-winner={isWinner ? "true" : undefined}
      className="relative overflow-hidden border-b border-line py-10"
    >
      {isWinner ? <WinnerAccents /> : null}
      <span data-num className="text-xs text-ink-soft">
        {item.index}
      </span>
      <div className="mt-2 flex flex-wrap items-baseline gap-3 sm:gap-4">
        <h3 className="font-display text-4xl font-semibold uppercase leading-none sm:text-5xl">
          {item.title}
        </h3>
        <span className="font-display text-2xl font-medium text-ink-soft sm:text-3xl">
          {item.year}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {item.badge ? (
          <span
            data-badge
            className="rounded-full bg-ink px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-white"
          >
            {item.badge}
          </span>
        ) : null}
        <p className="text-sm text-ink-soft sm:text-base">{item.description}</p>
      </div>
    </div>
  );
}

function CompactItem({ item }) {
  return (
    <div
      data-item
      className="relative flex flex-col gap-3 overflow-hidden border-b border-line py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
    >
      <div className="flex items-baseline gap-3">
        <span data-num className="text-xs text-ink-soft">
          {item.index}
        </span>
        <h3 className="font-display text-2xl font-medium uppercase sm:text-3xl">
          {item.title}
        </h3>
        <span className="font-display text-xl font-medium text-ink-soft sm:text-2xl">
          {item.year}
        </span>
      </div>
      <p className="text-sm text-ink-soft sm:max-w-xs sm:text-right">
        {item.description}
      </p>
    </div>
  );
}

export default function Achievements() {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    // The giant display type above this section is webfont-sized, so its
    // height settles after mount; without a refresh these triggers keep
    // start/end values measured against the wrong layout.
    const refresh = () => ScrollTrigger.refresh();
    const rafId = requestAnimationFrame(refresh);
    if (document.fonts?.ready) document.fonts.ready.then(refresh);

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const heading = q("[data-heading]");
      const lede = q("[data-lede]");
      const rule = q("[data-rule]");
      const items = q("[data-item]");

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduce) {
        // Content stays fully visible; no movement at all.
        gsap.set([heading, lede, ...items], { opacity: 1, x: 0, y: 0, skewX: 0, rotate: 0, scale: 1 });
        gsap.set(rule, { scaleX: 1 });
        gsap.set(q("[data-accent]"), { scaleX: 1 });
        gsap.set(q("[data-badge]"), { opacity: 1, scale: 1 });
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(
        { isDesktop: "(min-width: 768px)", isMobile: "(max-width: 767px)" },
        (context) => {
          const { isDesktop } = context.conditions;

          // Mobile gets shorter travel and no skew/rotation — at phone widths
          // those read as wobble rather than craft.
          const headX = isDesktop ? -80 : -32;
          const headSkew = isDesktop ? -6 : 0;
          const itemY = isDesktop ? 80 : 38;
          const itemRot = isDesktop ? 2 : 0;

          gsap
            .timeline({
              defaults: { ease: "power3.out" },
              scrollTrigger: { trigger: root, start: "top 78%", once: true },
            })
            .fromTo(
              heading,
              { x: headX, opacity: 0, skewX: headSkew },
              { x: 0, opacity: 1, skewX: 0, duration: 1.15 },
              0
            )
            .fromTo(lede, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8 }, 0.18)
            .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "expo.out" }, 0.28);

          // Each item reveals as it reaches the viewport, in sequence.
          gsap.set(items, { opacity: 0, y: itemY, rotate: itemRot, scale: 0.97 });

          const batch = ScrollTrigger.batch(items, {
            start: "top 88%",
            once: true,
            onEnter: (elements) => {
              gsap.to(elements, {
                opacity: 1,
                y: 0,
                rotate: 0,
                scale: 1,
                duration: 1.05,
                ease: "power3.out",
                stagger: 0.12,
              });

              elements.forEach((el, i) => {
                const at = i * 0.12;

                // Numbers tick up to their label (00 -> 01), no flourish.
                const num = el.querySelector("[data-num]");
                if (num) {
                  const target = parseInt(num.textContent, 10);
                  if (!Number.isNaN(target)) {
                    const proxy = { v: 0 };
                    gsap.to(proxy, {
                      v: target,
                      duration: 0.9,
                      delay: at,
                      ease: "power2.out",
                      onUpdate: () => {
                        num.textContent = String(Math.round(proxy.v)).padStart(2, "0");
                      },
                      onComplete: () => {
                        num.textContent = String(target).padStart(2, "0");
                      },
                    });
                  }
                }

                if (el.dataset.winner !== "true") return;

                // Winner emphasis: the rule draws in, the badge settles, and a
                // single quiet sweep passes across the row.
                const accent = el.querySelector("[data-accent]");
                const badge = el.querySelector("[data-badge]");
                const sweep = el.querySelector("[data-sweep]");

                if (accent) {
                  gsap.fromTo(
                    accent,
                    { scaleX: 0 },
                    { scaleX: 1, duration: 1.1, delay: at + 0.15, ease: "expo.out" }
                  );
                }
                if (badge) {
                  gsap.fromTo(
                    badge,
                    { scale: 0.8, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.6, delay: at + 0.3, ease: "power3.out" }
                  );
                }
                if (sweep) {
                  // Fade-out is part of the tween, not an onComplete: if that
                  // callback is ever missed (throttled tab) the gradient would
                  // be left sitting on the card.
                  gsap.fromTo(
                    sweep,
                    { xPercent: -120, opacity: 0 },
                    {
                      xPercent: 420,
                      duration: 1.4,
                      delay: at + 0.25,
                      ease: "power2.inOut",
                      keyframes: { opacity: [0, 1, 1, 0] },
                    }
                  );
                }
              });
            },
          });

          // Hover lift — pointer devices only, so touch never gets a stuck
          // hover state.
          const fine = window.matchMedia("(pointer: fine)").matches;
          const handlers = [];
          if (fine && isDesktop) {
            items.forEach((el) => {
              const accent = el.querySelector("[data-accent]");
              const enter = () => {
                gsap.to(el, { y: -5, scale: 1.01, duration: 0.4, ease: "power3.out" });
                if (accent) gsap.to(accent, { scaleX: 1, opacity: 1, duration: 0.4 });
              };
              const leave = () =>
                gsap.to(el, { y: 0, scale: 1, duration: 0.45, ease: "power3.out" });
              el.addEventListener("mouseenter", enter);
              el.addEventListener("mouseleave", leave);
              handlers.push([el, enter, leave]);
            });
          }

          return () => {
            batch.forEach((t) => t.kill());
            handlers.forEach(([el, enter, leave]) => {
              el.removeEventListener("mouseenter", enter);
              el.removeEventListener("mouseleave", leave);
            });
          };
        }
      );
    }, rootRef);

    return () => {
      cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="achievements"
      ref={rootRef}
      className="container-px py-20 sm:py-28"
    >
      <h2
        data-heading
        className="font-sans text-[clamp(1.75rem,9vw,3.75rem)] font-extrabold tracking-tight"
      >
        Achievements
      </h2>
      <p data-lede className="mt-4 text-base text-ink-soft sm:text-lg">
        Milestones and achievements from my journey in software development.
      </p>

      <div className="relative mt-10 border-t border-transparent">
        {/* Same 1px rule the border used to paint, but scalable for the draw-in */}
        <span
          data-rule
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-line"
        />
        {achievements.map((item) =>
          item.size === "large" ? (
            <LargeItem key={item.index} item={item} />
          ) : (
            <CompactItem key={item.index} item={item} />
          )
        )}
      </div>
    </section>
  );
}
