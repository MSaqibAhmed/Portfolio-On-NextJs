"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// How long the intro will wait for the portrait to decode before starting.
// The split is the whole point of the sequence, so it must never run against
// an empty frame — but it must not stall on a slow connection either.
const IMAGE_WAIT_MS = 1200;

/**
 * Brand intro, played on every page load, identical on every device:
 *
 *   tiny square -> portal opens -> portrait resolves -> portal splits ->
 *   SAQIB AHMED -> travels into the real navbar wordmark -> hero wipes in.
 *
 * The wordmark is deliberately styled with the navbar's own weight and
 * tracking so the hand-off is the SAME element arriving, not a crossfade:
 * at the landing frame the travelling copy is pixel-matched to the navbar
 * wordmark's box, measured live from `getBoundingClientRect()` so it stays
 * correct at every breakpoint.
 */
export default function PortalLoader() {
  const [show, setShow] = useState(true);
  const rootRef = useRef(null);
  const portalRef = useRef(null);
  const frameRef = useRef(null);
  const topHalfRef = useRef(null);
  const bottomHalfRef = useRef(null);
  const imageRefs = useRef([]);
  const wordRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    // The intro always starts on the hero. Two things can break that: a stale
    // `#section` in the URL (the browser jumps to that anchor on load) and the
    // browser restoring the previous scroll position on refresh.
    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const html = document.documentElement;
    // An attribute + stylesheet rule rather than an inline style: inline
    // styles on <html> get rewritten by other libraries (ScrollTrigger keeps
    // `scroll-behavior` there), which silently dropped the lock.
    html.dataset.loading = "true";

    let done = false;
    let cancelled = false;
    const finish = () => {
      if (done) return;
      done = true;
      delete html.dataset.loading;
      setShow(false);
      // Everything below was laid out under a scroll lock; let ScrollTrigger
      // re-measure now that the real page height is available.
      ScrollTrigger.refresh();
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // The intro must never be able to trap the page. GSAP runs on rAF, which
    // browsers stop entirely in a backgrounded tab — so a visitor who opens
    // the site in a background tab would otherwise come back to a frozen
    // black panel. This releases the page regardless of the timeline's state.
    const failsafe = window.setTimeout(finish, IMAGE_WAIT_MS + 5000);

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.to(root, {
          opacity: 0,
          duration: 0.2,
          delay: 0.1,
          ease: "none",
          onComplete: finish,
        });
        return;
      }

      const portal = portalRef.current;
      const word = wordRef.current;
      const box = portal.getBoundingClientRect();
      // Start as a true square regardless of the portal's 4:5 aspect.
      const seed = 14;

      // Held until the portrait has actually decoded. Without this the portal
      // can open, split and clear before the image has painted — the "image
      // break" that carries the whole sequence just doesn't happen, and the
      // intro looks different on every load depending on cache and network.
      const tl = gsap.timeline({ onComplete: finish, paused: true });

      const imgs = imageRefs.current.filter(Boolean);
      const decoded = Promise.all(
        imgs.map((img) =>
          img.complete && img.naturalWidth
            ? Promise.resolve()
            : new Promise((res) => {
                img.addEventListener("load", res, { once: true });
                img.addEventListener("error", res, { once: true });
              })
        )
      );
      Promise.race([
        decoded,
        new Promise((res) => window.setTimeout(res, IMAGE_WAIT_MS)),
      ]).then(() => {
        if (!cancelled) tl.play();
      });

      gsap.set(portal, {
        scaleX: seed / box.width,
        scaleY: seed / box.height,
        transformOrigin: "50% 50%",
      });
      gsap.set(imageRefs.current, { opacity: 0, scale: 1.08 });
      gsap.set(word, { opacity: 0, y: 18 });

      /* 1 — the square announces itself ---------------------------- */
      tl.fromTo(
        frameRef.current,
        { opacity: 0, borderColor: "rgba(255,255,255,0.9)" },
        { opacity: 1, duration: 0.18, ease: "power2.out" }
      )

        /* 2 — it opens into the portal ----------------------------- */
        .to(portal, {
          scaleX: 1,
          scaleY: 1,
          duration: 0.5,
          ease: "expo.inOut",
        })
        .to(frameRef.current, { borderColor: "rgba(255,255,255,0.22)", duration: 0.35 }, "<0.15")

        /* 3 — the portrait resolves inside it ---------------------- */
        .to(
          imageRefs.current,
          { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" },
          "-=0.15"
        )

        /* 4 — the portal splits and clears the frame --------------- */
        .to(topHalfRef.current, { yPercent: -118, duration: 0.5, ease: "power3.inOut" }, "+=0.06")
        .to(bottomHalfRef.current, { yPercent: 118, duration: 0.5, ease: "power3.inOut" }, "<")
        .to(frameRef.current, { opacity: 0, duration: 0.28, ease: "power2.in" }, "<")

        /* 5 — the wordmark takes the stage ------------------------- */
        .to(word, { opacity: 1, y: 0, duration: 0.36, ease: "power3.out" }, "<0.2")
        .addLabel("travel", "+=0.08");

      /* 6 — the same element travels into the navbar --------------- */

      // Measured lazily, the first time the travel tween renders, so the
      // destination is whatever the navbar actually is at that moment — no
      // hardcoded coordinates, correct at every breakpoint and after a
      // resize. Cached so all three function-based values agree on one
      // reading (and so measuring can't be affected by its own output).
      let handoff = null;
      const measure = () => {
        if (handoff) return handoff;
        const dest = document.querySelector("[data-navbar-wordmark]");
        const from = word.getBoundingClientRect();
        const to = dest?.getBoundingClientRect();
        handoff =
          dest && from.width && to.width
            ? {
                dest,
                scale: to.width / from.width,
                dx: to.left + to.width / 2 - (from.left + from.width / 2),
                dy: to.top + to.height / 2 - (from.top + from.height / 2),
                // The navbar reads "Saqib Ahmed" at every breakpoint, so this
                // is normally true and the swap is instant — identical
                // characters at identical weight and tracking. Kept as a
                // guard: if the pill ever shows something else, fall back to
                // a brief fade rather than a visible text pop.
                seamless: dest.innerText.trim().toLowerCase() === "saqib ahmed",
              }
            : { dest: null, scale: 1, dx: 0, dy: 0, seamless: true };
        return handoff;
      };

      tl.to(
        word,
        {
          x: () => measure().dx,
          y: () => measure().dy,
          scale: () => measure().scale,
          duration: 0.66,
          ease: "power3.inOut",
          transformOrigin: "50% 50%",
          onStart: () => {
            // Hidden so the real wordmark can't double-print beneath the
            // copy travelling above it once the panel starts wiping away.
            const { dest } = measure();
            if (dest) gsap.set(dest, { autoAlpha: 0 });
          },
          onComplete: () => {
            const { dest, seamless } = measure();
            if (dest) gsap.set(dest, { clearProps: "opacity,visibility" });
            gsap.to(word, {
              autoAlpha: 0,
              duration: seamless ? 0 : 0.14,
              ease: "none",
            });
          },
        },
        "travel"
      );

      /* 7 — the navbar locks in and the panel wipes off the hero ---- */

      // Resolved to the element rather than left as a selector string:
      // gsap.context() scopes selector strings to `root` (the overlay), and
      // the navbar lives outside it, so a string here silently matches
      // nothing.
      const navPill = document.querySelector("nav[aria-label='Primary']");
      if (navPill) {
        tl.fromTo(
          navPill,
          { scale: 0.94, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.45,
            ease: "power3.out",
            clearProps: "transform,opacity",
            // Without this a fromTo renders its "from" state at build time,
            // leaving the navbar scaled to 0.94 while the travel tween
            // measures it — the wordmark would land a few pixels off target.
            immediateRender: false,
          },
          "travel+=0.3"
        );
      }

      tl.set(root, { pointerEvents: "none" }, "travel+=0.34")
        .to(
          root,
          { clipPath: "inset(0% 0% 100% 0%)", duration: 0.6, ease: "power4.inOut" },
          "travel+=0.34"
        );
    }, root);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      ctx.revert();
      delete html.dataset.loading;
    };
  }, []);

  if (!show) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-black"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      <div ref={portalRef} className="relative aspect-[4/5] w-[min(52vw,248px)]">
        <span ref={frameRef} aria-hidden className="absolute inset-0 border border-white/25" />

        {/* Two halves, each showing its own portion of the portrait, so the
            split is a pure transform on each — no clip-path re-paint. */}
        <span ref={topHalfRef} className="absolute inset-x-0 top-0 block h-1/2 overflow-hidden">
          <span className="absolute inset-x-0 top-0 block h-[200%]">
            <Image
              ref={(el) => {
                imageRefs.current[0] = el;
              }}
              src="/images/hero.png"
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 248px, 52vw"
              className="object-cover object-center grayscale"
            />
          </span>
        </span>

        <span ref={bottomHalfRef} className="absolute inset-x-0 bottom-0 block h-1/2 overflow-hidden">
          <span className="absolute inset-x-0 bottom-0 block h-[200%]">
            <Image
              ref={(el) => {
                imageRefs.current[1] = el;
              }}
              src="/images/hero.png"
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 248px, 52vw"
              className="object-cover object-center grayscale"
            />
          </span>
        </span>
      </div>

      {/* Matches the navbar wordmark's weight and tracking exactly, so the
          landing frame is a pixel match rather than a lookalike. */}
      <span
        ref={wordRef}
        className="absolute whitespace-nowrap font-display font-medium uppercase leading-none tracking-[0.3em] text-[#f3f7ef]"
        style={{ fontSize: "clamp(1.05rem, 5.4vw, 3.25rem)" }}
      >
        Saqib Ahmed
      </span>
    </div>
  );
}
