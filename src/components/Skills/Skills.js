"use client";

import { useLayoutEffect, useRef } from "react";
import { Database, Boxes, Code2, Terminal } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { coreStack, skillGroups } from "@/data/skills";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const coreIcons = {
  Database,
  Boxes,
  Code2,
  Terminal,
};

/**
 * The rule line for a group. Visually identical to the `border-t border-line`
 * it replaces — the transparent border preserves the exact 1px of layout box,
 * and the absolutely positioned span paints the same colour in the same
 * place — but unlike a border it can be scaled and can host the signal dot.
 */
function Rule() {
  return (
    <>
      <span
        data-rule
        className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-line"
      />
      <span
        data-signal
        aria-hidden
        className="pointer-events-none absolute top-0 h-[3px] w-[3px] -translate-y-[1px] rounded-full bg-ink opacity-0"
      />
    </>
  );
}

function TaggedPill({ tag, label }) {
  return (
    <span
      data-pill
      className="inline-flex items-center gap-2 rounded-full border border-line bg-white/60 px-4 py-2 text-sm"
    >
      {tag ? (
        <span data-pill-tag className="text-[0.65rem] font-semibold text-ink-soft">
          [{tag}]
        </span>
      ) : null}
      {label}
    </span>
  );
}

function SimplePill({ label, filled }) {
  return (
    <span
      data-pill
      className={`inline-flex items-center rounded-full border px-4 py-2 text-sm ${
        filled ? "border-ink bg-ink text-white" : "border-line bg-white/60 text-ink"
      }`}
    >
      {label}
    </span>
  );
}

export default function Skills() {
  const rootRef = useRef(null);

  const [frontend, backend] = skillGroups;
  const [database, development] = skillGroups.slice(2, 4);
  const [tools, additional] = skillGroups.slice(4, 6);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const ctx = gsap.context(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const fine = window.matchMedia("(pointer: fine)").matches;
      const canMagnet = fine && !reduce && window.innerWidth >= 1024;

      const q = gsap.utils.selector(root);
      const heading = q("[data-heading]");
      const sub = q("[data-sub]");
      const rules = q("[data-rule]");
      const labels = q("[data-label]");
      const pills = q("[data-pill]");
      const groups = q("[data-group]");

      /* ---------------------------------------------------------- */
      /* Entrance                                                    */
      /* ---------------------------------------------------------- */

      if (reduce) {
        // Content must never be left hidden behind an animation.
        gsap.set([heading, sub, labels, pills], { opacity: 1, y: 0, scale: 1 });
        gsap.set(rules, { scaleX: 1 });
        gsap.from([heading, sub, labels, pills], {
          opacity: 0,
          duration: 0.4,
          stagger: 0.01,
          scrollTrigger: { trigger: root, start: "top 75%", once: true },
        });
      } else {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root, start: "top 72%", once: true },
        });

        // No blur filter here: `fromTo` renders its "from" state immediately,
        // so a blurred heading would sit on a composited layer from page load
        // until the trigger fires — paid for on every scrolled frame.
        tl.fromTo(
          heading,
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 0.9 },
          0
        )
          .fromTo(
            sub,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.8 },
            0.1
          )
          .fromTo(
            rules,
            { scaleX: 0 },
            { scaleX: 1, duration: 1.1, ease: "expo.out", stagger: 0.08 },
            0.2
          )
          .fromTo(
            labels,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.07 },
            0.3
          )
          // Groups activate in sequence: core, then the paired rows.
          .fromTo(
            pills,
            { opacity: 0, y: 15, scale: 0.97 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              ease: "power4.out",
              stagger: { each: 0.05, from: "start" },
            },
            0.42
          )
          // Clear the filter so it can't cost a compositor layer afterwards.
          .set(heading, { clearProps: "filter" });
      }

      /* ---------------------------------------------------------- */
      /* Very subtle scroll parallax                                 */
      /* ---------------------------------------------------------- */

      // One scrubbed timeline for the whole section rather than a separate
      // ScrollTrigger per group — seven triggers all watching the same range
      // meant seven scroll callbacks and seven tween updates per frame.
      if (!reduce) {
        const par = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
        par.to(heading, { y: -14, ease: "none" }, 0);
        groups.forEach((group, i) => {
          par.to(group, { y: i % 2 === 0 ? 8 : -8, ease: "none" }, 0);
        });
      }

      /* ---------------------------------------------------------- */
      /* Category focus + divider signal                             */
      /* ---------------------------------------------------------- */

      const sections = q("[data-section]");

      sections.forEach((section) => {
        const label = section.querySelector("[data-label]");
        if (!label) return;
        const others = sections.filter((s) => s !== section);
        const signal = section.querySelector("[data-signal]");
        const rule = section.querySelector("[data-rule]");

        const focus = () => {
          if (reduce) return;
          gsap.to(others, { opacity: 0.62, duration: 0.4, ease: "power2.out" });
          if (signal && rule) {
            gsap.fromTo(
              signal,
              { x: 0, opacity: 0 },
              {
                x: rule.offsetWidth,
                opacity: 1,
                duration: 1.1,
                ease: "power2.inOut",
                onComplete: () => gsap.to(signal, { opacity: 0, duration: 0.25 }),
              }
            );
          }
        };

        const blur = () => {
          if (reduce) return;
          gsap.to(others, { opacity: 1, duration: 0.45, ease: "power2.out" });
        };

        label.addEventListener("mouseenter", focus);
        label.addEventListener("mouseleave", blur);
      });

      /* ---------------------------------------------------------- */
      /* Pill hover + magnetism                                      */
      /* ---------------------------------------------------------- */

      const coreRow = root.querySelector("[data-core-row]");
      const corePills = coreRow ? [...coreRow.querySelectorAll("[data-pill]")] : [];

      pills.forEach((pill) => {
        if (reduce) return;

        const icon = pill.querySelector("svg");
        const isCore = corePills.includes(pill);
        const setX = canMagnet ? gsap.quickTo(pill, "x", { duration: 0.6, ease: "power3.out" }) : null;
        const setY = canMagnet ? gsap.quickTo(pill, "y", { duration: 0.6, ease: "power3.out" }) : null;

        const onEnter = () => {
          gsap.to(pill, {
            scale: isCore ? 1.03 : 1.02,
            duration: 0.3,
            ease: "power3.out",
          });
          if (icon) {
            gsap.to(icon, {
              x: 2,
              rotate: isCore ? 4 : 0,
              duration: 0.35,
              ease: "power3.out",
            });
          }
          // Signature moment: the Core row answers as one connected system —
          // neighbours yield a couple of pixels away from the hovered pill.
          if (isCore) {
            const idx = corePills.indexOf(pill);
            corePills.forEach((other, i) => {
              if (other === pill) return;
              gsap.to(other, {
                x: (i - idx) * 2,
                duration: 0.45,
                ease: "power3.out",
              });
            });
          }
        };

        const onLeave = () => {
          gsap.to(pill, { scale: 1, duration: 0.35, ease: "power3.out" });
          if (icon) gsap.to(icon, { x: 0, rotate: 0, duration: 0.4, ease: "power3.out" });
          if (isCore) {
            corePills.forEach((other) => {
              if (other === pill) gsap.to(other, { x: 0, duration: 0.45, ease: "power3.out" });
              else gsap.to(other, { x: 0, duration: 0.5, ease: "power3.out" });
            });
          }
          if (setX && !isCore) {
            setX(0);
            setY(0);
          }
        };

        const onMove = (e) => {
          if (!setX || isCore) return;
          const r = pill.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          setX(gsap.utils.clamp(-6, 6, dx * 0.3));
          setY(gsap.utils.clamp(-6, 6, dy * 0.3));
        };

        pill.addEventListener("mouseenter", onEnter);
        pill.addEventListener("mouseleave", onLeave);
        if (canMagnet) pill.addEventListener("mousemove", onMove);
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="skills"
      ref={rootRef}
      className="container-px py-20 sm:py-28"
    >
      <h2
        data-heading
        className="font-sans text-[clamp(1.75rem,9vw,3.75rem)] font-extrabold tracking-tight"
      >
        Tech Stack
      </h2>
      <p
        data-sub
        className="mt-4 text-sm uppercase tracking-[0.14em] text-ink-soft"
      >
        Tools &amp; technologies I use to build digital experiences
      </p>

      <div className="relative mt-10 border-t border-transparent">
        <Rule />
      </div>

      <div data-section className="relative py-8">
        <div data-group>
          <div className="mb-5 flex items-center gap-3">
            <p data-label className="section-eyebrow cursor-default text-ink-soft">
              01 / Core Stack
            </p>
            <span className="rounded-full bg-ink px-2.5 py-0.5 text-[0.65rem] font-semibold text-white">
              MERN
            </span>
          </div>
          <div data-core-row className="flex flex-wrap gap-3">
            {coreStack.map((item) => {
              const Icon = coreIcons[item.icon];
              return (
                <span
                  key={item.label}
                  data-pill
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div
        data-section
        className="relative grid grid-cols-1 gap-8 border-t border-transparent py-8 md:grid-cols-2 md:gap-16"
      >
        <Rule />
        {[frontend, backend].map((group) => (
          <div data-group key={group.title}>
            <p data-label className="section-eyebrow mb-4 cursor-default text-ink-soft">
              {group.index} / {group.title}
            </p>
            <div className="flex flex-wrap gap-3">
              {group.items.map((item) => (
                <TaggedPill key={item.label} tag={item.tag} label={item.label} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        data-section
        className="relative grid grid-cols-1 gap-8 border-t border-transparent py-8 md:grid-cols-2 md:gap-16"
      >
        <Rule />
        {[database, development].map((group) => (
          <div data-group key={group.title}>
            <p data-label className="section-eyebrow mb-4 cursor-default text-ink-soft">
              {group.index}/ {group.title}
            </p>
            <div className="flex flex-wrap gap-3">
              {group.items.map((item) => (
                <SimplePill key={item.label} label={item.label} filled={item.filled} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        data-section
        className="relative grid grid-cols-1 gap-8 border-t border-transparent py-8 md:grid-cols-2 md:gap-16"
      >
        <Rule />
        {[tools, additional].map((group) => (
          <div data-group key={group.title}>
            <p data-label className="section-eyebrow mb-4 cursor-default text-ink-soft">
              {group.index}/ {group.title}
            </p>
            <div className="flex flex-wrap gap-3">
              {group.items.map((item) => (
                <SimplePill key={item.label} label={item.label} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
