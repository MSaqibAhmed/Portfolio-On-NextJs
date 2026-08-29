"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { processSteps } from "@/data/howIWork";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ACCENT = "#00ff9d";

// Where each fragment starts (scattered) and where it settles once the
// system is organised. One object, two states — the tween between them is
// what makes "chaos -> structure" read.
const FRAGMENTS = [
  { label: "IDEA", from: { x: 18, y: 26 }, to: { x: 40, y: 30 } },
  { label: "USERS", from: { x: 320, y: 18 }, to: { x: 250, y: 30 } },
  { label: "REQUIREMENTS", from: { x: 6, y: 206 }, to: { x: 40, y: 196 } },
  { label: "PROBLEM", from: { x: 316, y: 214 }, to: { x: 250, y: 196 } },
];

export default function HowIWork() {
  const rootRef = useRef(null);
  const pinRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    // Everything above this section (hero portrait, webfont-sized display
    // type, the split heading in What I Do) settles *after* mount. Without a
    // refresh the pin keeps the start/end it measured on the first frame and
    // the scrub never advances.
    const refresh = () => ScrollTrigger.refresh();
    const rafId = requestAnimationFrame(refresh);
    if (document.fonts?.ready) document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);

    const ctx = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const q = gsap.utils.selector(root);

      const frags = q("[data-frag]");
      const grid = q("[data-grid]");
      const frame = q("[data-frame]");
      const blocks = q("[data-block]");
      const api = q("[data-api]");
      const db = q("[data-db]");
      const links = q("[data-link]");
      const noise = q("[data-noise]");
      const live = q("[data-live]");
      const signal = q("[data-signal]");
      const stages = q("[data-stage]");
      const fill = root.querySelector("[data-fill]");
      const knob = root.querySelector("[data-knob]");
      const n = processSteps.length;

      /* Intro ---------------------------------------------------- */
      if (!reduce) {
        gsap
          .timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: root, start: "top 75%", once: true },
          })
          .fromTo(q("[data-heading]"), { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.9 })
          .fromTo(q("[data-lede]"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8 }, 0.12);
      }

      // Dashes so links can be "drawn" without a plugin.
      links.forEach((l) => {
        const len = l.getTotalLength ? l.getTotalLength() : 200;
        gsap.set(l, { strokeDasharray: len, strokeDashoffset: len });
      });

      /* Resting (stage 01) state --------------------------------- */
      const seed = () => {
        frags.forEach((f, i) => gsap.set(f, { x: FRAGMENTS[i].from.x, y: FRAGMENTS[i].from.y, opacity: 0.85 }));
        gsap.set(grid, { opacity: 0 });
        gsap.set(frame, { opacity: 0, scale: 0.94, transformOrigin: "center" });
        gsap.set(blocks, { opacity: 0, scaleY: 0, transformOrigin: "center top" });
        gsap.set([api, db], { opacity: 0, scale: 0.8, transformOrigin: "center" });
        gsap.set(noise, { opacity: 0 });
        gsap.set(live, { opacity: 0, y: 6 });
        gsap.set(signal, { opacity: 0 });
      };

      if (reduce) {
        // Show the finished system and every stage's text, statically.
        frags.forEach((f, i) => gsap.set(f, { x: FRAGMENTS[i].to.x, y: FRAGMENTS[i].to.y, opacity: 0.5 }));
        gsap.set([grid, frame, ...blocks, api, db, live], { opacity: 1, scale: 1, scaleY: 1 });
        gsap.set(links, { strokeDashoffset: 0 });
        gsap.set(stages, { opacity: 1, position: "static" });
        gsap.set(q("[data-heading], [data-lede]"), { opacity: 1, y: 0 });
        gsap.set(fill, { scaleX: 1 });
        root.querySelector("[data-stage-wrap]")?.classList.add("hiw-static");
        return;
      }

      seed();
      gsap.set(stages, { opacity: 0, yPercent: 40, clipPath: "inset(0% 0% 100% 0%)" });
      gsap.set(stages[0], { opacity: 1, yPercent: 0, clipPath: "inset(0% 0% 0% 0%)" });

      const isMobile = window.innerWidth < 768;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: () => `+=${(n - 1) * window.innerHeight * (isMobile ? 0.7 : 0.85)}`,
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });

      // Stage text: clip + vertical travel, never a plain crossfade.
      for (let i = 1; i < n; i += 1) {
        tl.to(
          stages[i - 1],
          { opacity: 0, yPercent: -40, clipPath: "inset(100% 0% 0% 0%)", duration: 1, ease: "power2.inOut" },
          i - 1
        ).fromTo(
          stages[i],
          { opacity: 0, yPercent: 40, clipPath: "inset(0% 0% 100% 0%)" },
          { opacity: 1, yPercent: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power2.inOut" },
          i - 1
        );
      }

      /* 01 -> 02  UNDERSTAND -> PLAN : chaos becomes structure ---- */
      frags.forEach((f, i) => {
        tl.to(f, { x: FRAGMENTS[i].to.x, y: FRAGMENTS[i].to.y, duration: 1, ease: "power3.inOut" }, 0);
      });
      tl.to(grid, { opacity: 1, duration: 0.8, ease: "power2.out" }, 0.25)
        .to(frame, { opacity: 1, scale: 1, duration: 0.9, ease: "power3.out" }, 0.3)
        .to(links.slice(0, 2), { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, 0.4);

      /* 02 -> 03  PLAN -> BUILD : the product assembles ----------- */
      tl.to(
        blocks,
        { opacity: 1, scaleY: 1, duration: 0.55, ease: "power3.out", stagger: 0.12 },
        1.05
      )
        .to([api, db], { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out", stagger: 0.1 }, 1.2)
        .to(links.slice(2), { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, 1.3)
        .to(noise, { opacity: 0.55, duration: 0.5 }, 1.35)
        // the signal runs the length of the system
        .to(signal, { opacity: 1, duration: 0.25 }, 1.3)
        .fromTo(signal, { y: -46 }, { y: 60, duration: 1.4, ease: "power1.inOut" }, 1.35);

      /* 03 -> 04  BUILD -> REFINE : rough becomes clean ----------- */
      tl.to(noise, { opacity: 0, duration: 0.6, ease: "power2.out" }, 2.05)
        .to(frags, { opacity: 0.28, duration: 0.7, ease: "power2.out" }, 2.05)
        .to(blocks, { x: 0, attr: { rx: 1 }, duration: 0.7, ease: "power3.inOut", stagger: 0.06 }, 2.15)
        .to(frame, { scale: 0.985, duration: 0.8, ease: "power3.inOut" }, 2.2);

      /* 04 -> 05  REFINE -> SHIP : it locks and goes live --------- */
      tl.to(frame, { scale: 1, duration: 0.7, ease: "power3.out" }, 3.05)
        .to(signal, { y: 96, opacity: 0, duration: 0.8, ease: "power2.in" }, 3.05)
        .to(live, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 3.3);

      /* Progress rail — part of the system, not a separate bar ---- */
      tl.fromTo(fill, { scaleX: 1 / n }, { scaleX: 1, duration: n - 1, ease: "none" }, 0).fromTo(
        knob,
        { left: `${100 / n}%` },
        { left: "100%", duration: n - 1, ease: "none" },
        0
      );
    }, rootRef);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  return (
    <section id="how-i-work" ref={rootRef}>
      <div className="container-px pt-20 sm:pt-28">
        <h2
          data-heading
          className="font-sans text-[clamp(1.75rem,9vw,3.75rem)] font-extrabold tracking-tight"
        >
          How I Work
        </h2>
        <p data-lede className="mt-4 max-w-md text-base text-ink-soft sm:text-lg">
          I turn ideas into complete digital products through a simple,
          structured development process.
        </p>
      </div>

      <div ref={pinRef}>
        <div className="container-px flex min-h-screen items-center py-10">
          <div className="grid w-full grid-cols-1 items-center gap-10 md:grid-cols-[1fr_1.15fr] md:gap-16">
            {/* Stage copy */}
            <div data-stage-wrap className="relative order-2 h-[15rem] md:order-1 md:h-[17rem]">
              {processSteps.map((step) => (
                <div
                  data-stage
                  key={step.index}
                  className="absolute inset-0 flex flex-col justify-center"
                >
                  <span className="font-display text-[clamp(3rem,8vw,6rem)] font-extrabold leading-none tracking-tight">
                    {step.index}
                  </span>
                  <h3 className="mt-4 font-display text-[clamp(1.5rem,4vw,2.5rem)] font-medium uppercase leading-none">
                    {step.title}
                  </h3>
                  <p className="mt-5 max-w-sm text-base leading-relaxed text-ink-soft">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            {/* The system */}
            <div className="order-1 md:order-2">
              <svg
                viewBox="0 0 380 260"
                className="h-auto w-full text-ink"
                aria-hidden
              >
                {/* planning grid */}
                <g data-grid opacity="0">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={`v${i}`}
                      x1={70 + i * 60}
                      y1="40"
                      x2={70 + i * 60}
                      y2="220"
                      stroke="currentColor"
                      strokeWidth="1"
                      opacity="0.12"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                  {[0, 1, 2, 3].map((i) => (
                    <line
                      key={`h${i}`}
                      x1="70"
                      y1={60 + i * 50}
                      x2="310"
                      y2={60 + i * 50}
                      stroke="currentColor"
                      strokeWidth="1"
                      opacity="0.12"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </g>

                {/* scattered fragments */}
                {FRAGMENTS.map((f) => (
                  <g data-frag key={f.label}>
                    <rect
                      width="86"
                      height="20"
                      rx="1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      opacity="0.4"
                      vectorEffect="non-scaling-stroke"
                    />
                    <text
                      x="7"
                      y="14"
                      fill="currentColor"
                      fontSize="7"
                      letterSpacing="1.1"
                      opacity="0.75"
                    >
                      {f.label}
                    </text>
                  </g>
                ))}

                {/* product frame */}
                <g data-frame opacity="0">
                  <rect
                    x="120"
                    y="62"
                    width="140"
                    height="96"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.8"
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    x1="120"
                    y1="78"
                    x2="260"
                    y2="78"
                    stroke="currentColor"
                    strokeWidth="1"
                    opacity="0.45"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>

                {/* UI blocks inside the frame */}
                <rect data-block x="132" y="88" width="56" height="24" rx="0" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" vectorEffect="non-scaling-stroke" />
                <rect data-block x="132" y="118" width="36" height="10" rx="0" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" vectorEffect="non-scaling-stroke" />
                <rect data-block x="198" y="88" width="50" height="40" rx="0" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" vectorEffect="non-scaling-stroke" />

                {/* misalignment that gets cleaned up at REFINE */}
                <g data-noise opacity="0">
                  <line x1="134" y1="140" x2="176" y2="143" stroke="currentColor" strokeWidth="1" opacity="0.5" vectorEffect="non-scaling-stroke" />
                  <line x1="198" y1="141" x2="230" y2="137" stroke="currentColor" strokeWidth="1" opacity="0.5" vectorEffect="non-scaling-stroke" />
                </g>

                {/* service + storage */}
                <g data-api opacity="0">
                  <rect x="152" y="178" width="76" height="24" rx="1" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" vectorEffect="non-scaling-stroke" />
                  <text x="168" y="194" fill="currentColor" fontSize="7" letterSpacing="1.2" opacity="0.8">API</text>
                </g>
                <g data-db opacity="0">
                  <ellipse cx="190" cy="222" rx="34" ry="7" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" vectorEffect="non-scaling-stroke" />
                  <path d="M156 222 v14 a34 7 0 0 0 68 0 v-14" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" vectorEffect="non-scaling-stroke" />
                </g>

                {/* data paths */}
                <line data-link x1="190" y1="40" x2="190" y2="62" stroke="currentColor" strokeWidth="1" opacity="0.4" vectorEffect="non-scaling-stroke" />
                <line data-link x1="126" y1="40" x2="126" y2="62" stroke="currentColor" strokeWidth="1" opacity="0.25" vectorEffect="non-scaling-stroke" />
                <line data-link x1="190" y1="158" x2="190" y2="178" stroke="currentColor" strokeWidth="1" opacity="0.45" vectorEffect="non-scaling-stroke" />
                <line data-link x1="190" y1="202" x2="190" y2="215" stroke="currentColor" strokeWidth="1" opacity="0.45" vectorEffect="non-scaling-stroke" />

                {/* the signal */}
                <circle data-signal cx="190" cy="120" r="3.2" fill={ACCENT} opacity="0" />

                {/* shipped state */}
                <g data-live opacity="0">
                  <rect x="268" y="62" width="46" height="16" rx="8" fill="none" stroke={ACCENT} strokeWidth="1" opacity="0.9" vectorEffect="non-scaling-stroke" />
                  <circle cx="278" cy="70" r="2.4" fill={ACCENT} />
                  <text x="285" y="73" fill="currentColor" fontSize="6.5" letterSpacing="1.4" opacity="0.85">LIVE</text>
                </g>
              </svg>

              {/* progress rail */}
              <div className="relative mt-8 h-px w-full bg-line">
                <span data-fill className="absolute inset-y-0 left-0 block w-full origin-left bg-ink" />
                <span
                  data-knob
                  className="absolute top-1/2 block h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: ACCENT }}
                />
              </div>
              <div className="mt-3 flex justify-between text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft">
                <span>{processSteps[0].index}</span>
                <span>{processSteps[processSteps.length - 1].index}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
