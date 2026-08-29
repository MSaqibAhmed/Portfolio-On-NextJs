"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { capabilities } from "@/data/whatIDo";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ACCENT = "#00ff9d";
const services = capabilities.slice(0, 3);

/**
 * Monochrome technical diagrams — one per service. They stay invisible until
 * the cursor reveals them through a mask, so the resting composition stays
 * editorial and clean.
 */
function Diagram({ kind }) {
  const s = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1,
    vectorEffect: "non-scaling-stroke",
  };
  const label = {
    fill: "currentColor",
    fontSize: 7,
    letterSpacing: 1.2,
    opacity: 0.75,
    fontFamily: "var(--font-roboto), sans-serif",
  };

  if (kind === 0) {
    // Interface: chrome, hero block, content grid, component tree.
    return (
      <svg viewBox="0 0 420 240" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <rect x="30" y="24" width="240" height="150" rx="2" {...s} opacity="0.55" />
        <line x1="30" y1="44" x2="270" y2="44" {...s} opacity="0.45" />
        <circle cx="40" cy="34" r="2.5" {...s} opacity="0.6" />
        <circle cx="50" cy="34" r="2.5" {...s} opacity="0.6" />
        <rect x="44" y="60" width="96" height="42" {...s} opacity="0.7" />
        <rect x="44" y="112" width="66" height="7" {...s} opacity="0.5" />
        <rect x="44" y="126" width="48" height="7" {...s} opacity="0.4" />
        <rect x="154" y="60" width="100" height="30" {...s} opacity="0.5" />
        <rect x="154" y="98" width="100" height="30" {...s} opacity="0.4" />
        <text x="30" y="192" {...label}>COMPONENT TREE</text>
        <line x1="300" y1="40" x2="300" y2="170" {...s} opacity="0.35" />
        <line x1="300" y1="66" x2="330" y2="66" {...s} opacity="0.35" />
        <line x1="300" y1="104" x2="330" y2="104" {...s} opacity="0.35" />
        <line x1="300" y1="142" x2="330" y2="142" {...s} opacity="0.35" />
        <rect x="330" y="58" width="56" height="16" {...s} opacity="0.55" />
        <rect x="330" y="96" width="56" height="16" {...s} opacity="0.45" />
        <rect x="330" y="134" width="56" height="16" {...s} opacity="0.35" />
        <circle cx="300" cy="66" r="2.5" fill={ACCENT} stroke="none" />
      </svg>
    );
  }

  if (kind === 1) {
    // Frontend -> API -> Database, with a signal on the path.
    return (
      <svg viewBox="0 0 420 240" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <rect x="140" y="18" width="140" height="40" rx="2" {...s} opacity="0.7" />
        <text x="152" y="42" {...label}>FRONTEND</text>
        <line x1="210" y1="58" x2="210" y2="94" {...s} opacity="0.5" />
        <path d="M205 88 l5 6 l5 -6" {...s} opacity="0.5" />
        <rect x="165" y="94" width="90" height="36" rx="2" {...s} opacity="0.7" />
        <text x="180" y="116" {...label}>API</text>
        <line x1="210" y1="130" x2="210" y2="166" {...s} opacity="0.5" />
        <path d="M205 160 l5 6 l5 -6" {...s} opacity="0.5" />
        <ellipse cx="210" cy="176" rx="52" ry="10" {...s} opacity="0.7" />
        <path d="M158 176 v28 a52 10 0 0 0 104 0 v-28" {...s} opacity="0.7" />
        <text x="182" y="196" {...label}>DB</text>
        <line x1="60" y1="38" x2="140" y2="38" {...s} opacity="0.3" />
        <line x1="280" y1="38" x2="368" y2="38" {...s} opacity="0.3" />
        <text x="30" y="118" {...label}>STATE</text>
        <text x="330" y="118" {...label}>AUTH</text>
        <circle cx="210" cy="76" r="3" fill={ACCENT} stroke="none" />
      </svg>
    );
  }

  // Requests fanning into a service, then persistence.
  return (
    <svg viewBox="0 0 420 240" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <text x="26" y="52" {...label}>GET</text>
      <text x="26" y="120" {...label}>POST</text>
      <text x="26" y="188" {...label}>PATCH</text>
      <line x1="70" y1="46" x2="150" y2="104" {...s} opacity="0.4" />
      <line x1="70" y1="114" x2="150" y2="118" {...s} opacity="0.4" />
      <line x1="70" y1="182" x2="150" y2="132" {...s} opacity="0.4" />
      <rect x="150" y="88" width="110" height="60" rx="2" {...s} opacity="0.75" />
      <text x="166" y="114" {...label}>EXPRESS</text>
      <text x="166" y="136" {...label}>ROUTER</text>
      <line x1="176" y1="88" x2="176" y2="66" {...s} opacity="0.4" />
      <rect x="146" y="44" width="62" height="22" {...s} opacity="0.5" />
      <text x="154" y="59" {...label}>AUTH</text>
      <line x1="260" y1="118" x2="308" y2="118" {...s} opacity="0.45" />
      <ellipse cx="352" cy="100" rx="44" ry="9" {...s} opacity="0.7" />
      <path d="M308 100 v36 a44 9 0 0 0 88 0 v-36" {...s} opacity="0.7" />
      <text x="332" y="124" {...label}>DATA</text>
      <circle cx="205" cy="118" r="3" fill={ACCENT} stroke="none" />
    </svg>
  );
}

/**
 * Splits a label into per-word / per-character spans for staggered motion.
 * The split markup is aria-hidden and the real string is exposed via the
 * heading's aria-label — otherwise assistive tech reads the words run
 * together ("FrontendDevelopment"), since the gaps are margins, not spaces.
 */
function SplitTitle({ text }) {
  return (
    <span aria-hidden>
      {text.split(" ").map((word, w) => (
        <span key={`${word}-${w}`} className="mr-[0.22em] inline-block whitespace-nowrap">
          {[...word].map((ch, c) => (
            <span key={`${ch}-${c}`} className="inline-block overflow-hidden align-bottom">
              <span data-char className="inline-block">
                {ch}
              </span>
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

export default function WhatIDo() {
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const metaRef = useRef(null);
  const revealRef = useRef(null);
  const indexRef = useRef(null);
  const firstRunRef = useRef(true);
  const reduceRef = useRef(false);

  const service = services[active];

  const go = useCallback((dir) => {
    setActive((prev) => (prev + dir + services.length) % services.length);
  }, []);

  /* Entrance ---------------------------------------------------- */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const ctx = gsap.context(() => {
      reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const q = gsap.utils.selector(root);

      if (reduceRef.current) {
        gsap.set(q("[data-fade]"), { opacity: 1, y: 0 });
        gsap.set(q("[data-char]"), { yPercent: 0, opacity: 1 });
        gsap.set(q("[data-line]"), { scaleX: 1 });
        return;
      }

      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root, start: "top 70%", once: true },
        })
        .fromTo(q("[data-eyebrow]"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, 0)
        .fromTo(q("[data-heading]"), { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.85 }, 0.06)
        .fromTo(q("[data-intro]"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7 }, 0.2)
        .fromTo(q("[data-line]"), { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "expo.out" }, 0.3)
        .fromTo(q("[data-num]"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.4)
        // Giant title reveals through a clip, character by character.
        .fromTo(
          q("[data-char]"),
          { yPercent: 110 },
          { yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.014 },
          0.46
        )
        .fromTo(q("[data-meta]"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, 0.72)
        .fromTo(q("[data-nav]"), { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.8);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  /* Service morph ------------------------------------------------ */
  useLayoutEffect(() => {
    // The entrance timeline already handles the first paint.
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return undefined;
    }
    const title = titleRef.current;
    const meta = metaRef.current;
    if (!title) return undefined;

    const ctx = gsap.context(() => {
      const chars = title.querySelectorAll("[data-char]");
      if (reduceRef.current) {
        gsap.set(chars, { yPercent: 0, opacity: 1 });
        gsap.set(meta, { opacity: 1 });
        return;
      }
      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .fromTo(
          chars,
          { yPercent: 115 },
          { yPercent: 0, duration: 0.85, stagger: 0.016 },
          0
        )
        .fromTo(
          meta,
          { opacity: 0, y: 14, clipPath: "inset(0% 0% 100% 0%)" },
          { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 0.6 },
          0.1
        )
        .fromTo(
          indexRef.current,
          { yPercent: 60, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.5 },
          0
        );
    }, titleRef);

    return () => ctx.revert();
  }, [active]);

  /* Cursor reveal + magnetism ------------------------------------ */
  useEffect(() => {
    const stage = revealRef.current?.parentElement;
    const reveal = revealRef.current;
    const title = titleRef.current;
    if (!stage || !reveal || !title) return undefined;

    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine || reduceRef.current) return undefined;

    const setMx = gsap.quickSetter(reveal, "--mx", "px");
    const setMy = gsap.quickSetter(reveal, "--my", "px");
    const tx = gsap.quickTo(title, "x", { duration: 0.8, ease: "power3.out" });
    const ty = gsap.quickTo(title, "y", { duration: 0.8, ease: "power3.out" });

    const move = (e) => {
      const r = stage.getBoundingClientRect();
      setMx(e.clientX - r.left);
      setMy(e.clientY - r.top);
      tx(gsap.utils.clamp(-8, 8, (e.clientX - (r.left + r.width / 2)) * 0.012));
      ty(gsap.utils.clamp(-6, 6, (e.clientY - (r.top + r.height / 2)) * 0.012));
    };
    const enter = () => gsap.to(reveal, { opacity: 1, duration: 0.5, ease: "power2.out" });
    const leave = () => {
      gsap.to(reveal, { opacity: 0, duration: 0.45, ease: "power2.out" });
      tx(0);
      ty(0);
    };

    stage.addEventListener("mousemove", move);
    stage.addEventListener("mouseenter", enter);
    stage.addEventListener("mouseleave", leave);
    return () => {
      stage.removeEventListener("mousemove", move);
      stage.removeEventListener("mouseenter", enter);
      stage.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <section id="what-i-do" ref={rootRef} className="container-px py-20 sm:py-28">
      <p data-eyebrow data-fade className="section-eyebrow text-ink-soft">
        03 / Capabilities
      </p>
      <h2
        data-heading
        data-fade
        className="mt-4 font-sans text-[clamp(1.75rem,9vw,3.75rem)] font-extrabold tracking-tight"
      >
        What I Do
      </h2>
      <p data-intro data-fade className="mt-4 max-w-md text-base text-ink-soft sm:text-lg">
        I build modern web applications from interface to backend.
      </p>

      <div data-line className="mt-12 h-px w-full origin-left bg-line" />

      {/* Stage — the cursor-revealed composition */}
      <div className="relative mt-12 overflow-hidden py-6 sm:py-10">
        {/* Hidden diagram, unmasked only around the cursor */}
        <div
          ref={revealRef}
          aria-hidden
          className="wid-reveal pointer-events-none absolute inset-0 text-ink opacity-0"
        >
          <Diagram kind={active} />
        </div>

        <div className="relative">
          <div className="flex items-baseline gap-5">
            <span
              ref={indexRef}
              data-num
              data-fade
              className="font-display text-sm tracking-[0.2em] text-ink-soft"
            >
              {service.index}
            </span>
            <span data-nav data-fade className="text-[0.65rem] tracking-[0.2em] text-ink-soft">
              {service.index} / {String(services.length).padStart(2, "0")}
            </span>
          </div>

          <h3
            ref={titleRef}
            aria-label={service.title}
            className="mt-4 max-w-[16ch] font-display text-[clamp(2rem,8.5vw,6rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em]"
          >
            <SplitTitle key={active} text={service.title} />
          </h3>

          <div ref={metaRef} data-meta data-fade className="mt-8 max-w-xl">
            <p className="text-[0.65rem] uppercase tracking-[0.16em] text-ink-soft">
              {service.stack}
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
              {service.description}
            </p>
          </div>
        </div>
      </div>

      {/* Service navigation */}
      <div
        data-nav
        data-fade
        className="mt-8 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-6"
      >
        <ul className="flex items-center gap-5">
          {services.map((s, i) => (
            <li key={s.index}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-current={i === active}
                aria-label={`Show ${s.title}`}
                className="group flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
              >
                <span
                  aria-hidden
                  className="block h-[5px] w-[5px] rounded-full transition-transform duration-300"
                  style={{
                    backgroundColor: i === active ? ACCENT : "var(--line)",
                    transform: i === active ? "scale(1.4)" : "scale(1)",
                  }}
                />
                <span className={i === active ? "text-ink" : "text-ink-soft"}>{s.index}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous capability"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors duration-300 hover:border-ink focus-visible:ring-2 focus-visible:ring-ink/40"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next capability"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors duration-300 hover:border-ink focus-visible:ring-2 focus-visible:ring-ink/40"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
