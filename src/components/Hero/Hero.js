"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { onIntroReady, prefersReducedMotion } from "@/lib/motion";

const ACCENT = "#00ff9d";

// Both headlines share one scale so the composition stays proportional.
// 11.5vw keeps the widest word ("FULL-STACK") inside the viewport at every
// width with a comfortable margin on phones; the rem floor/ceiling stop it
// collapsing or exploding at extremes.
const HEADLINE = "text-[clamp(1.5rem,11.5vw,9rem)]";

export default function Hero() {
  const heroRef = useRef(null);
  const fullStackRef = useRef(null);
  const developerRef = useRef(null);
  const portraitRef = useRef(null);
  const metaRef = useRef(null);
  const accentRef = useRef(null);
  const diamondRef = useRef(null);
  const scrollRef = useRef(null);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return undefined;
    if (prefersReducedMotion()) return undefined;

    const parts = [
      metaRef.current,
      fullStackRef.current,
      portraitRef.current,
      developerRef.current,
      accentRef.current,
      diamondRef.current,
      scrollRef.current,
    ].filter(Boolean);

    // Hidden before paint, revealed by the timeline below. The timeline is
    // built only once the intro panel starts wiping off — previously it ran
    // at mount, which meant the entire hero entrance played out and finished
    // behind an opaque black overlay. Nobody ever saw it.
    gsap.set(parts, { opacity: 0 });

    let ctx = null;

    const build = () => {
      ctx = gsap.context(() => {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .fromTo(
            fullStackRef.current,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9 }
          )
          .fromTo(
            portraitRef.current,
            { y: 25, scale: 0.96, opacity: 0 },
            { y: 0, scale: 1, opacity: 1, duration: 0.8 },
            "-=0.55"
          )
          .fromTo(
            developerRef.current,
            { y: 55, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9 },
            "-=0.6"
          )
          .fromTo(
            metaRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.7 },
            "-=0.55"
          )
          .fromTo(
            [accentRef.current, diamondRef.current],
            { opacity: 0, scale: 0.6 },
            { opacity: 1, scale: 1, duration: 0.5, stagger: 0.08 },
            "-=0.45"
          )
          .fromTo(
            scrollRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.5 },
            "-=0.25"
          );
      }, hero);
    };

    const cancelIntro = onIntroReady(build);

    return () => {
      cancelIntro();
      ctx?.revert();
      // revert() puts back the pre-timeline inline styles, which here are the
      // hidden state above — clear them so a remount can never leave the hero
      // blank.
      gsap.set(parts, { clearProps: "opacity,transform" });
    };
  }, []);

  return (
    <section
      ref={heroRef}
      id="home"
      data-surface-dark
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-black text-[#f3f7ef]"
    >
      {/* TOP METADATA — in normal flow, so it can never collide with the
          headline the way absolute percentage positioning did. */}
      <div
        ref={metaRef}
        className="container-px flex items-start justify-between gap-4 pt-[clamp(5rem,9vh,6.5rem)] text-[clamp(10px,0.75vw,11px)] font-medium uppercase tracking-[0.17em] text-white/55"
      >
        <span>/ MERN Stack</span>
        <span className="text-right">/ Based in Pakistan</span>
      </div>

      {/* MAIN COMPOSITION — a centered flex column. Overlap comes from
          em-based negative margins, which scale with the headline size
          instead of drifting at different viewport heights. */}
      <div className="flex flex-1 flex-col items-center justify-center py-4">
        {/* The visible headline is split around the portrait, so the two
            display words can't be one element. The page's single H1 carries
            the whole phrase for assistive tech and search engines; the
            display words are decorative duplicates of it. */}
        <h1 className="sr-only">
          Muhammad Saqib Ahmed — Full-Stack Developer
        </h1>

        <div
          aria-hidden="true"
          ref={fullStackRef}
          className={`${HEADLINE} relative z-10 select-none whitespace-nowrap text-center font-display font-black uppercase leading-[0.78] tracking-[-0.055em]`}
        >
          Full-Stack
        </div>

        <div
          ref={portraitRef}
          data-hero-photo
          className="relative z-10 -mt-[0.06em] aspect-[4/5] w-[min(58vw,300px)]"
        >
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src="/images/hero.png"
              alt="Saqib Ahmed — Full-Stack Developer"
              fill
              priority
              sizes="min(58vw, 300px)"
              className="object-cover object-center grayscale"
            />
            {/* Scrim: fades the photo into the black backdrop so the
                DEVELOPER headline crossing it stays legible. Without it the
                bright shirt drops the text to ~1:1 contrast. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black via-black/85 to-transparent"
            />
          </div>

          {/* Accent dot and diamond — offset as a share of the portrait's own
              width, so they track the image at every size. Both offsets stay
              inside the viewport even at the portrait's widest (58vw), which
              is why neither needs a breakpoint to hide it any more. */}
          <span
            ref={accentRef}
            className="absolute left-[-16%] top-[8%] block h-2 w-2 rounded-full"
            style={{ backgroundColor: ACCENT }}
          />

          <span
            ref={diamondRef}
            aria-hidden="true"
            className="absolute right-[-14%] top-1/2 block h-[15px] w-[15px] -translate-y-1/2 rotate-45 border border-white/15"
          />
        </div>

        {/* Sits in front of the portrait, overlapping the scrimmed lower
            edge so the word stays whole and readable. */}
        <div
          aria-hidden="true"
          ref={developerRef}
          className={`${HEADLINE} relative z-20 -mt-[0.3em] select-none whitespace-nowrap text-center font-display font-black uppercase leading-[0.78] tracking-[-0.055em]`}
        >
          Developer
        </div>

        <div
          ref={scrollRef}
          className="mt-[clamp(2rem,4vh,2.5rem)] flex flex-col items-center gap-3"
        >
          <span className="whitespace-nowrap text-[clamp(10px,0.75vw,11px)] font-medium uppercase tracking-[0.18em] text-white/55">
            Scroll to explore ↓
          </span>
          <span className="h-[clamp(1.75rem,3vh,2.25rem)] w-px animate-scroll-line bg-white/25" />
        </div>
      </div>

      {/* BOTTOM BAR — flex row that wraps instead of overlapping. */}
      <div className="container-px flex flex-wrap items-center justify-between gap-x-4 gap-y-1 pb-[clamp(1.75rem,4vh,2.25rem)] text-[clamp(10px,0.75vw,11px)] font-medium uppercase tracking-[0.16em] text-white/50">
        <span>© 2026 Saqib Ahmed</span>
        <span className="text-right">/ Available for opportunities</span>
      </div>
    </section>
  );
}
