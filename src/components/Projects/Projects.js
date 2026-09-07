"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";
import {
  isCoarsePointer,
  onMotionReady,
  prefersReducedMotion,
  scheduleRefresh,
} from "@/lib/motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// How much scroll the sequence gets, in viewport heights: a screen and a half
// for the curtain, then most of a screen per project for the rail. This is the
// one dial to turn if the section ever feels long or rushed.
const RUNWAY = 1.6 + 0.7 * projects.length;

/**
 * The work, staged.
 *
 * One scrubbed timeline in four beats:
 *
 *   1. HAVE A LOOK fades up — one oversized word, laid out across the middle
 *      of the screen and cut in half by the two black panels that cover it.
 *   2. The panels part, top going up and bottom going down. Each half of the
 *      word drifts back against its own panel, so the two halves separate
 *      more slowly than the curtain does and stay readable into the opening.
 *   3. White underneath. The stage rises from below the fold, bringing the
 *      PROJECTS wordmark with it.
 *   4. The rail of project cards runs across the screen, over the wordmark.
 *
 * The panel is held on screen by CSS `position: sticky`, NOT by
 * ScrollTrigger's pin. Two reasons, and the first is decisive:
 *
 *   - #page-content carries a transform (the radial menu scales the page as
 *     it opens, and GSAP leaves the identity matrix behind afterwards). A
 *     transformed ancestor becomes the containing block for `position: fixed`
 *     descendants, so ScrollTrigger's default pin lands at the top of the
 *     DOCUMENT rather than the viewport. Its `pinType: "transform"` fallback
 *     works around that by re-translating the section on every scroll event —
 *     and scrolling is composited BEFORE those events run, so the section is
 *     visibly carried up the screen and snapped back, once per frame.
 *   - Sticky is handled by the browser on the compositor. There is nothing to
 *     lag behind the scroll, no pin-spacer to measure, and it is immune to
 *     the transform above.
 *
 * The timeline is then only ever scrubbing; it never has to hold anything in
 * place. Everything it touches is transform-only — no `top`, no `margin`,
 * nothing that costs a layout on a scrubbed frame.
 *
 * The section renders as `data-stage="off"`: a plain black title block above
 * a white grid of cards, nothing stuck and nothing displaced. That is what
 * the server sends, and what stays on screen for anyone the animation cannot
 * serve — no JS, reduced motion, or a tab that is not being painted at all.
 */
export default function Projects() {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const contentRef = useRef(null);
  const trackRef = useRef(null);
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const topWordRef = useRef(null);
  const bottomWordRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const content = contentRef.current;
    const track = trackRef.current;
    const top = topRef.current;
    const bottom = bottomRef.current;
    const topWord = topWordRef.current;
    const bottomWord = bottomWordRef.current;
    if (!section || !track || !viewport) return undefined;

    if (prefersReducedMotion()) return undefined;

    // The sticky panel has to be exactly one viewport tall, and the track
    // under it exactly that plus the runway. `100svh` (the CSS fallback) is
    // the SMALLEST the viewport ever gets, so it is short by the height of an
    // address bar the moment a phone collapses one.
    let stageW = 0;
    let stageH = 0;

    const sizeStage = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // A phone's address bar collapses and re-expands as you scroll, and that
      // is a viewport HEIGHT change arriving mid-swipe. Following it would
      // resize both the panel and the track under it, which reaches
      // MotionSync's body observer as a document resize and costs a full
      // ScrollTrigger refresh — during the scroll, which is exactly when it is
      // most visible. So on a touch screen the panel is sized to the TALLEST
      // viewport seen at this width: never shorter than the screen, and never
      // re-measured because of browser chrome. A rotation changes the width,
      // which starts the measurement over.
      const next = w === stageW && isCoarsePointer() ? Math.max(stageH, h) : h;
      if (w === stageW && next === stageH) return;

      stageW = w;
      stageH = next;
      section.style.setProperty("--pstage-h", `${next}px`);
      section.style.setProperty(
        "--pstage-run",
        `${Math.round(next * RUNWAY)}px`
      );
    };

    sizeStage();
    ScrollTrigger.addEventListener("refreshInit", sizeStage);

    let ctx = null;
    let probe = 0;

    const build = () => {
      // Switched on BEFORE the timeline is built: the sticky panel, the card
      // widths and the whole track height come from the `data-stage="on"`
      // rules, so ScrollTrigger has to measure the layout it is actually going
      // to animate, not the static grid.
      section.dataset.stage = "on";

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            // The section IS the track: the sequence starts when its top
            // reaches the top of the viewport and ends when its bottom
            // reaches the bottom — which is the exact moment the sticky panel
            // inside it stops sticking. No pin, so nothing to spacer, jump or
            // re-measure.
            start: "top top",
            end: "bottom bottom",
            // What makes it glide: the timeline eases TOWARDS the scroll
            // position rather than being nailed to it, so wheel notches and
            // trackpad jitter are absorbed and the panels keep moving for a
            // beat after the scroll stops. 2s is the reference's own setting,
            // and it is only safe here because nothing is being held in place
            // by JS any more — a scrub this long over a ScrollTrigger pin is
            // what made the panel lag behind the scroll.
            scrub: 2,
            invalidateOnRefresh: true,
          },
        });

        tl
          /* 1 — the word arrives, already split by the two panels ------ */
          // Held back from 0 on purpose: the section only just finished
          // covering the screen, and the word rising immediately reads as
          // part of the arrival rather than as its own beat. The delay buys a
          // moment of nothing but black first.
          .fromTo(
            [topWord, bottomWord],
            { opacity: 0 },
            { opacity: 1, duration: 0.9 },
            0.7
          )

          /* 2 — the curtain parts ------------------------------------- */
          .addLabel("part")
          .to(top, { yPercent: -100, duration: 2 }, "part")
          .to(bottom, { yPercent: 100, duration: 2 }, "part")
          // Half the panel's travel, in the opposite direction: the word
          // hangs back at the opening edge instead of being whipped off with
          // the panel it sits in.
          .to(topWord, { yPercent: 25, duration: 2 }, "part")
          .to(bottomWord, { yPercent: -25, duration: 2 }, "part")

          /* 3 — the stage rises into the gap -------------------------- */
          .fromTo(
            content,
            { yPercent: 100 },
            { yPercent: 0, duration: 2 },
            "part+=0.7"
          )

          /* 4 — the work runs across ---------------------------------- */
          // Measured, not guessed: the rail starts one viewport to the right
          // of the frame and ends with its trailing edge flush to the right
          // of it, so every card crosses the screen whatever the card count
          // or the breakpoint. `invalidateOnRefresh` above re-runs both
          // functions after a resize.
          .fromTo(
            track,
            { x: () => viewport.offsetWidth },
            {
              x: () => -(track.scrollWidth - viewport.offsetWidth),
              duration: 5,
            },
            ">-0.35"
          );
      }, section);

      // Switching the stage on turned the section from an auto-height grid
      // into a track several screens tall: the document just grew, and every
      // trigger below it is measuring against the old height until this lands.
      scheduleRefresh();

    };

    // Built on the first frame the browser actually paints, never before.
    //
    // This is the one section on the page whose "not yet animated" state is
    // two opaque panels covering the work, so it must not be switched on in a
    // tab that is not rendering — a backgrounded tab would come back to a
    // black screen where the projects should be. A queued rAF is exactly that
    // test, and it costs nothing: a tab that never paints simply keeps the
    // static grid, which is the correct thing to be looking at, and the
    // callback still fires the moment it is brought to the front.
    //
    // Deliberately NOT `gsap.ticker.frame`: GSAP's ticker sleeps whenever
    // there is nothing left to animate, so a frame count that has stopped
    // moving says nothing about whether the browser is still rendering.
    // There is deliberately no timeout alongside this. A browser that is not
    // painting cannot run the animation either, so building anyway would put
    // the curtain up over the work and leave it there — the exact failure the
    // static grid exists to prevent. Waiting costs nothing: the rAF is still
    // queued, and fires the instant the tab is looked at.
    const cancelIntro = onMotionReady(() => {
      probe = requestAnimationFrame(() => {
        probe = 0;
        build();
      });
    });

    return () => {
      cancelIntro();
      if (probe) cancelAnimationFrame(probe);
      ScrollTrigger.removeEventListener("refreshInit", sizeStage);
      ctx?.revert();
      section.dataset.stage = "off";
      section.style.removeProperty("--pstage-h");
      section.style.removeProperty("--pstage-run");
      // revert() restores the inline styles from before the timeline, which
      // for the fromTo tweens above is their hidden/displaced "from" state.
      // Clearing it means a remount (strict mode, fast refresh) can never
      // leave the stage parked off screen.
      gsap.set([content, track, top, bottom, topWord, bottomWord], {
        clearProps: "opacity,transform",
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      data-stage="off"
      className="pstage relative bg-black"
    >
      {/* The panel the browser holds on screen. Everything below is positioned
          against it, and it is the only thing that clips — the section itself
          must stay `overflow: visible` or the sticky has nothing to stick in. */}
      <div className="pstage-sticky">
        {/* TOP HALF — black, and the upper half of the word. */}
        <div
          ref={topRef}
          data-curtain="top"
          data-surface-dark
          className="pstage-curtain"
        >
          <div ref={topWordRef} className="pstage-word-box">
            <span className="pstage-word text-4xl font-bold uppercase leading-none tracking-[0.12em] text-white sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[9rem]">
              Have a Look
            </span>
          </div>
        </div>

        {/* THE STAGE — white, revealed as the panels part. */}
        <div ref={viewportRef} className="pstage-viewport">
          <div ref={contentRef} className="pstage-content">
            <h2 className="pstage-title font-display font-medium uppercase leading-none tracking-tight text-ink text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[11rem]">
              Projects
            </h2>

            <div ref={trackRef} className="pstage-track">
              {/* Gutters as real flex items rather than padding: the rail's
                  end position is read off `scrollWidth`, and a flex
                  container's trailing padding is not reliably part of that
                  measurement. */}
              <span aria-hidden className="pstage-rail" />
              {projects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
              <span aria-hidden className="pstage-rail" />
            </div>
          </div>
        </div>

        {/* BOTTOM HALF — the same word, aligned to the same line, so the two
            panels together read as one. Hidden from assistive tech: it is the
            second half of a word that has already been announced. */}
        <div
          ref={bottomRef}
          data-curtain="bottom"
          data-surface-dark
          aria-hidden="true"
          className="pstage-curtain"
        >
          <div ref={bottomWordRef} className="pstage-word-box">
            <span className="pstage-word text-4xl font-bold uppercase leading-none tracking-[0.12em] text-white sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[9rem]">
              Have a Look
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
