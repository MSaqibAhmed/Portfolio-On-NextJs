"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { navMenu, NAV_ANGLES } from "@/data/navMenu";
import scrollToSection from "@/lib/scrollToSection";
import useActiveSection from "@/lib/useActiveSection";

const DEG = Math.PI / 180;

// Sections the radial menu points at, for scroll-spy.
const SECTION_IDS = navMenu.map((item) => item.href.slice(1));

/**
 * Target position for every item, in pixels relative to the composition
 * centre. The ring is the same on every breakpoint — only the radius
 * shrinks — so the orbital motion and the whole interaction survive down to
 * phone widths instead of degrading into a plain list.
 *
 * The mobile radius is bound by the widest label: an item at ±30° sits at
 * 0.866R horizontally, so 0.866R + half the label width has to stay inside
 * the viewport.
 */
function computeLayout() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isMobile = w < 768;

  const radius = isMobile
    ? Math.min(w * 0.36, h * 0.26, 160)
    : Math.min(w * 0.3, h * 0.34, 320);

  return {
    isMobile,
    radius,
    points: navMenu.map((_, i) => ({
      x: Math.cos(NAV_ANGLES[i] * DEG) * radius,
      y: Math.sin(NAV_ANGLES[i] * DEG) * radius,
    })),
  };
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const activeIndex = useActiveSection(SECTION_IDS);
  const [hovered, setHovered] = useState(-1);

  // DOM
  const pillRef = useRef(null);
  const brandWrapRef = useRef(null);
  const triggerRef = useRef(null);
  const dotRefs = useRef([]);
  const overlayRef = useRef(null);
  const plateRef = useRef(null);
  const ringWrapRef = useRef(null);
  const ringSpinRef = useRef(null);
  const coreRef = useRef(null);
  const indicatorRef = useRef(null);
  const previewRef = useRef(null);
  const slotRefs = useRef([]);
  const magnetRefs = useRef([]);

  // Animation state that must survive re-renders without causing them.
  const openRef = useRef(false);
  const layoutRef = useRef(null);
  // Live polar coordinate per item, so an interrupted open/close always
  // resumes from where it actually is instead of snapping.
  const polarRef = useRef([]);
  const magnetTweens = useRef([]);
  const pillMagnet = useRef(null);
  const reduceRef = useRef(false);
  const restoreFocusRef = useRef(null);
  // The live open/close timeline. Held so a new gesture can kill the old one
  // outright — killing only its tweens would leave the parent timeline's
  // onComplete to fire later and hide an overlay that has since reopened.
  const tlRef = useRef(null);
  const mountedRef = useRef(false);

  const setSlot = (el, i) => {
    slotRefs.current[i] = el;
  };
  const setMagnet = (el, i) => {
    magnetRefs.current[i] = el;
  };
  const setDot = (el, i) => {
    dotRefs.current[i] = el;
  };

  /* ------------------------------------------------------------------ */
  /* Layout                                                              */
  /* ------------------------------------------------------------------ */

  // Writes an item to the position implied by its polar coords.
  const renderPolar = useCallback((i) => {
    const slot = slotRefs.current[i];
    const p = polarRef.current[i];
    if (!slot || !p) return;
    gsap.set(slot, {
      x: Math.cos(p.a * DEG) * p.r,
      y: Math.sin(p.a * DEG) * p.r,
    });
  }, []);

  const applyLayout = useCallback(() => {
    const layout = computeLayout();
    layoutRef.current = layout;

    layout.points.forEach((pt, i) => {
      // Centre each slot on its orbit point through GSAP's own xPercent /
      // yPercent rather than a CSS translate — GSAP overwrites the whole
      // transform when it animates x/y, which would drop a CSS -50%.
      if (slotRefs.current[i]) {
        gsap.set(slotRefs.current[i], { xPercent: -50, yPercent: -50 });
      }
      const r = Math.hypot(pt.x, pt.y);
      const a = (Math.atan2(pt.y, pt.x) / DEG + 360) % 360;
      polarRef.current[i] = polarRef.current[i] || { r: 0, a };
      polarRef.current[i].target = { r, a };
      // While open, keep items pinned to the new layout on resize.
      if (openRef.current) {
        polarRef.current[i].r = r;
        polarRef.current[i].a = a;
        renderPolar(i);
      }
    });

    if (ringWrapRef.current) {
      const d = layout.radius * 2;
      gsap.set(ringWrapRef.current, {
        width: d,
        height: d,
        xPercent: -50,
        yPercent: -50,
      });
    }
    if (coreRef.current) {
      gsap.set(coreRef.current, { xPercent: -50, yPercent: -50 });
    }
    return layout;
  }, [renderPolar]);

  /* ------------------------------------------------------------------ */
  /* Scroll lock                                                         */
  /* ------------------------------------------------------------------ */

  const lockScroll = useCallback((lock) => {
    // Lock natively, compensating for the scrollbar so the page underneath
    // doesn't shift.
    const root = document.documentElement;
    if (lock) {
      const sbw = window.innerWidth - root.clientWidth;
      root.style.overflow = "hidden";
      if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;
    } else {
      root.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* Open / close                                                        */
  /* ------------------------------------------------------------------ */

  const playOpen = useCallback(() => {
    const layout = applyLayout();
    const reduce = reduceRef.current;
    const overlay = overlayRef.current;
    const page = document.querySelector("#page-content");
    lockScroll(true);

    tlRef.current?.kill();
    gsap.killTweensOf([
      plateRef.current,
      ringWrapRef.current,
      coreRef.current,
      page,
      brandWrapRef.current,
      ...dotRefs.current.filter(Boolean),
      ...slotRefs.current.filter(Boolean),
      ...magnetRefs.current.filter(Boolean),
    ]);

    gsap.set(overlay, { visibility: "visible", pointerEvents: "auto" });

    if (reduce) {
      gsap.set(plateRef.current, { opacity: 1 });
      gsap.set([ringWrapRef.current, coreRef.current], { opacity: 1, scale: 1 });
      gsap.set(brandWrapRef.current, { width: 0, opacity: 0 });
      layout.points.forEach((_, i) => {
        polarRef.current[i].r = polarRef.current[i].target.r;
        polarRef.current[i].a = polarRef.current[i].target.a;
        renderPolar(i);
        gsap.set(slotRefs.current[i], { opacity: 1, scale: 1, rotate: 0 });
      });
      gsap.set(dotRefs.current[1], { opacity: 0 });
      gsap.set(dotRefs.current[0], { x: 0, rotate: 45, width: 13 });
      gsap.set(dotRefs.current[2], { x: 0, rotate: -45, width: 13 });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tlRef.current = tl;

    // 1 — dots morph into an X
    tl.to(dotRefs.current[1], { opacity: 0, scale: 0, duration: 0.22 }, 0)
      .to(
        dotRefs.current[0],
        { x: 0, rotate: 45, width: 13, borderRadius: 2, duration: 0.42, ease: "power3.inOut" },
        0
      )
      .to(
        dotRefs.current[2],
        { x: 0, rotate: -45, width: 13, borderRadius: 2, duration: 0.42, ease: "power3.inOut" },
        0
      )
      // 2 — the wordmark spreads apart and is absorbed
      .to(
        brandWrapRef.current,
        { letterSpacing: "0.6em", opacity: 0, duration: 0.32 },
        0
      )
      .to(brandWrapRef.current, { width: 0, duration: 0.42 }, 0.14)
      // 3 — pill breathes
      .to(pillRef.current, { scale: 1.04, duration: 0.22 }, 0.1)
      .to(pillRef.current, { scale: 1, duration: 0.5 }, 0.32)
      // 5 — page recedes
      .to(
        page,
        { scale: 0.965, duration: 0.9, ease: "power2.out" },
        0.05
      )
      .to(plateRef.current, { opacity: 1, duration: 0.5 }, 0.05)
      // 4 / 6 — the orbit ring expands out of the pill
      .fromTo(
        ringWrapRef.current,
        { opacity: 0, scale: 0.2 },
        { opacity: 1, scale: 1, duration: 0.85, ease: "expo.out" },
        0.18
      )
      .fromTo(
        coreRef.current,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" },
        0.3
      );

    // 7 — items launch from the centre and travel along the orbit
    layout.points.forEach((_, i) => {
      const p = polarRef.current[i];
      const t = p.target;
      const slot = slotRefs.current[i];
      const at = 0.34 + i * 0.07;

      p.r = 0;
      p.a = t.a - 42;
      renderPolar(i);

      tl.to(
        p,
        {
          r: t.r,
          a: t.a,
          duration: 0.95,
          ease: "power4.out",
          onUpdate: () => renderPolar(i),
        },
        at
      ).fromTo(
        slot,
        { opacity: 0, scale: 0.42, rotate: -10 },
        { opacity: 1, scale: 1, rotate: 0, duration: 0.8, ease: "power3.out" },
        at
      );
    });

    tl.fromTo(
      indicatorRef.current,
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 0.4 },
      0.85
    );
  }, [applyLayout, lockScroll, renderPolar]);

  const playClose = useCallback(() => {
    const reduce = reduceRef.current;
    const overlay = overlayRef.current;
    const page = document.querySelector("#page-content");

    tlRef.current?.kill();
    gsap.killTweensOf([
      plateRef.current,
      ringWrapRef.current,
      coreRef.current,
      page,
      brandWrapRef.current,
      ...dotRefs.current.filter(Boolean),
      ...slotRefs.current.filter(Boolean),
      ...magnetRefs.current.filter(Boolean),
    ]);

    // Hand interaction back to the page immediately rather than waiting on
    // onComplete — if that callback is ever missed (interrupted tween,
    // backgrounded tab) a full-screen overlay would keep swallowing clicks
    // and scroll would stay locked. Only `visibility` waits for the anim.
    gsap.set(overlay, { pointerEvents: "none" });
    lockScroll(false);

    const finish = () => {
      // A reopen may have landed while this was running; never hide an
      // overlay that is open again.
      if (openRef.current) return;
      gsap.set(overlay, { visibility: "hidden" });
    };

    if (reduce) {
      gsap.set(page, { scale: 1 });
      gsap.set(brandWrapRef.current, { width: "auto", opacity: 1 });
      gsap.set(dotRefs.current.filter(Boolean), {
        rotate: 0,
        width: 3,
        opacity: 1,
        scale: 1,
      });
      gsap.set(dotRefs.current[0], { x: -5 });
      gsap.set(dotRefs.current[1], { x: 0 });
      gsap.set(dotRefs.current[2], { x: 5 });
      finish();
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.in" }, onComplete: finish });
    tlRef.current = tl;

    // 1–2 — items detach and orbit back into the centre
    const lastIndex = navMenu.length - 1;
    navMenu.forEach((_, i) => {
      const p = polarRef.current[i];
      if (!p) return;
      const at = (lastIndex - i) * 0.045;
      tl.to(
        p,
        {
          r: 0,
          a: p.target.a - 46,
          duration: 0.5,
          ease: "power2.in",
          onUpdate: () => renderPolar(i),
        },
        at
      ).to(
        slotRefs.current[i],
        { opacity: 0, scale: 0.35, rotate: -8, duration: 0.45 },
        at
      );
    });

    tl.to(indicatorRef.current, { opacity: 0, scale: 0, duration: 0.25 }, 0)
      // 3–4 — ring contracts into the point
      .to(
        ringWrapRef.current,
        { opacity: 0, scale: 0.15, duration: 0.5, ease: "power3.in" },
        0.2
      )
      .to(coreRef.current, { opacity: 0, scale: 0, duration: 0.3 }, 0.38)
      .to(plateRef.current, { opacity: 0, duration: 0.45 }, 0.3)
      // 8 — page returns
      .to(
        page,
        { scale: 1, duration: 0.7, ease: "power2.out" },
        0.25
      )
      // 5 — the X becomes three dots again
      .to(
        dotRefs.current[0],
        { x: -5, rotate: 0, width: 3, borderRadius: 999, duration: 0.4, ease: "power3.out" },
        0.45
      )
      .to(
        dotRefs.current[2],
        { x: 5, rotate: 0, width: 3, borderRadius: 999, duration: 0.4, ease: "power3.out" },
        0.45
      )
      .to(dotRefs.current[1], { opacity: 1, scale: 1, duration: 0.3 }, 0.55)
      // 6 — wordmark returns
      .to(
        brandWrapRef.current,
        { width: "auto", duration: 0.42, ease: "power3.out" },
        0.5
      )
      .to(
        brandWrapRef.current,
        { letterSpacing: "0.3em", opacity: 1, duration: 0.4 },
        0.58
      );
  }, [lockScroll, renderPolar]);

  const toggle = useCallback(() => {
    setHovered(-1);
    setOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setHovered(-1);
    setOpen(false);
  }, []);

  // Drives the animation off the React state, so state and motion can never
  // disagree no matter how fast the trigger is clicked.
  useEffect(() => {
    if (!layoutRef.current) applyLayout();
    openRef.current = open;

    // First run is just the initial closed state — don't play a close
    // animation (and don't leave its onComplete pending) on mount.
    if (!mountedRef.current) {
      mountedRef.current = true;
      if (!open) {
        gsap.set(overlayRef.current, { visibility: "hidden", pointerEvents: "none" });
        return;
      }
    }

    if (open) {
      document.documentElement.dataset.navOpen = "true";
      restoreFocusRef.current = document.activeElement;
      playOpen();
      const first = magnetRefs.current[0];
      const focusId = setTimeout(() => first?.focus?.(), reduceRef.current ? 0 : 500);
      return () => clearTimeout(focusId);
    }

    playClose();
    restoreFocusRef.current?.focus?.();
    // Deferred so the dark canvas survives the close animation — but on a
    // plain timer, not gsap.delayedCall: that rides the animation ticker,
    // and if the ticker is throttled (background tab) the flag would never
    // clear and the page would keep the menu's backdrop.
    const flagId = setTimeout(
      () => {
        if (!openRef.current) delete document.documentElement.dataset.navOpen;
      },
      reduceRef.current ? 0 : 900
    );
    return () => clearTimeout(flagId);
  }, [open, applyLayout, playOpen, playClose]);

  /* ------------------------------------------------------------------ */
  /* Setup: reduced motion, resize, scroll-spy, keyboard                 */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceRef.current = mq.matches;
    const onChange = (e) => {
      reduceRef.current = e.matches;
    };
    mq.addEventListener("change", onChange);

    applyLayout();
    gsap.set(overlayRef.current, { visibility: "hidden", pointerEvents: "none" });

    // Resting positions of the three dots (centre-anchored so morphing the
    // X arms can't reflow them).
    gsap.set(dotRefs.current.filter(Boolean), { xPercent: -50, yPercent: -50 });
    gsap.set(dotRefs.current[0], { x: -5 });
    gsap.set(dotRefs.current[2], { x: 5 });

    const onResize = () => applyLayout();
    window.addEventListener("resize", onResize);

    // Slow orbital drift on the outer ring.
    let spin;
    if (!reduceRef.current && ringSpinRef.current) {
      spin = gsap.to(ringSpinRef.current, {
        rotate: 360,
        duration: 90,
        repeat: -1,
        ease: "none",
      });
    }

    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("resize", onResize);
      spin?.kill();
    };
  }, [applyLayout]);

  // Escape to close + focus trap while open.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = [...magnetRefs.current.filter(Boolean), triggerRef.current];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  /* ------------------------------------------------------------------ */
  /* Magnetic pointer                                                    */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine || reduceRef.current) return undefined;

    magnetTweens.current = magnetRefs.current.map((el) =>
      el
        ? {
            x: gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }),
            y: gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" }),
          }
        : null
    );

    const pill = pillRef.current;
    pillMagnet.current = pill
      ? {
          x: gsap.quickTo(pill, "x", { duration: 0.6, ease: "power3.out" }),
          y: gsap.quickTo(pill, "y", { duration: 0.6, ease: "power3.out" }),
        }
      : null;

    const onMove = (e) => {
      const { clientX: mx, clientY: my } = e;

      // Pill: follows the cursor by at most ~4px.
      if (pill && pillMagnet.current) {
        const r = pill.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(mx - cx, my - cy);
        const pull = d < 160 ? 1 - d / 160 : 0;
        pillMagnet.current.x(gsap.utils.clamp(-4, 4, (mx - cx) * 0.05 * pull));
        pillMagnet.current.y(gsap.utils.clamp(-4, 4, (my - cy) * 0.05 * pull));
      }

      if (!openRef.current) return;

      magnetRefs.current.forEach((el, i) => {
        const tw = magnetTweens.current[i];
        if (!el || !tw) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(mx - cx, my - cy);
        const range = 150;
        if (d < range) {
          const pull = 1 - d / range;
          tw.x(gsap.utils.clamp(-14, 14, (mx - cx) * 0.2 * pull));
          tw.y(gsap.utils.clamp(-14, 14, (my - cy) * 0.2 * pull));
        } else {
          tw.x(0);
          tw.y(0);
        }
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      magnetTweens.current = [];
      pillMagnet.current = null;
    };
  }, []);

  // Indicator rides the ring to the active item.
  useEffect(() => {
    const el = indicatorRef.current;
    const layout = layoutRef.current;
    if (!el || !layout || activeIndex < 0) return;
    const pt = layout.points[activeIndex];
    if (!pt) return;
    gsap.to(el, {
      x: pt.x,
      y: pt.y,
      duration: reduceRef.current ? 0 : 0.7,
      ease: "power3.out",
    });
  }, [activeIndex, open]);

  // Preview reveal on hover.
  useEffect(() => {
    const el = previewRef.current;
    if (!el || reduceRef.current) return;
    if (hovered >= 0) {
      gsap.fromTo(
        el,
        { clipPath: "inset(45% 0% 45% 0%)", opacity: 0, scale: 1.06 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
        }
      );
    } else {
      gsap.to(el, { opacity: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [hovered]);

  // Teardown — kill only this component's tweens, never the page's.
  useEffect(
    () => () => {
      gsap.killTweensOf([
        pillRef.current,
        brandWrapRef.current,
        plateRef.current,
        ringWrapRef.current,
        ringSpinRef.current,
        coreRef.current,
        indicatorRef.current,
        previewRef.current,
        document.querySelector("#page-content"),
        ...dotRefs.current.filter(Boolean),
        ...slotRefs.current.filter(Boolean),
        ...magnetRefs.current.filter(Boolean),
        ...polarRef.current.filter(Boolean),
      ]);
      lockScroll(false);
      delete document.documentElement.dataset.navOpen;
    },
    [lockScroll]
  );

  /* ------------------------------------------------------------------ */
  /* Navigation                                                          */
  /* ------------------------------------------------------------------ */

  const goTo = useCallback(
    (e, href) => {
      e.preventDefault();
      close();
      // Plain timer, not gsap.delayedCall: that rides the animation ticker,
      // so a throttled tab could leave the jump pending forever.
      window.setTimeout(() => scrollToSection(href), reduceRef.current ? 0 : 420);
    },
    [close]
  );

  // Label shown in the pill on phones — falls back to the wordmark before
  // the spy has settled on a section.
  const activeLabel =
    activeIndex >= 0 && navMenu[activeIndex] ? navMenu[activeIndex].label : "Saqib Ahmed";

  const previewItem = hovered >= 0 ? navMenu[hovered] : null;

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center pt-4 sm:pt-5">
        <nav
          ref={pillRef}
          aria-label="Primary"
          className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/10 bg-dark px-5 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-[border-color,box-shadow] duration-300 hover:border-white/25 hover:shadow-[0_10px_38px_rgba(0,0,0,0.6)] sm:px-6 sm:py-3"
        >
          <span
            ref={brandWrapRef}
            className="overflow-hidden whitespace-nowrap font-display text-[0.65rem] font-medium uppercase tracking-[0.3em] text-white sm:text-xs"
          >
            {/* On phones the pill is the only wayfinding on screen, so it
                names the section you're in. Desktop keeps the wordmark. */}
            <span className="sm:hidden">{activeLabel}</span>
            <span className="hidden sm:inline">Saqib Ahmed</span>
          </span>
          <span aria-hidden className="h-4 w-px shrink-0 bg-white/15" />
          <button
            ref={triggerRef}
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="radial-nav"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            className="group relative flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none ring-offset-2 ring-offset-[#050505] focus-visible:ring-2 focus-visible:ring-white/70"
          >
            {/* Absolutely positioned so animating `width` into the X arms
                can't reflow them — flex items would drift apart and the
                strokes would never cross. */}
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                ref={(el) => setDot(el, i)}
                aria-hidden
                className="absolute left-1/2 top-1/2 block h-[3px] w-[3px] rounded-full bg-white/70 transition-colors duration-200 group-hover:bg-white"
              />
            ))}
          </button>
        </nav>
      </header>

      <div
        ref={overlayRef}
        id="radial-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className="nav-fg fixed inset-0 z-[60] overflow-hidden"
      >
        <div
          ref={plateRef}
          onClick={close}
          className="nav-plate absolute inset-0 opacity-0"
        />

        {/* Typographic preview — no invented content, just the destination. */}
        <div
          ref={previewRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center opacity-0"
        >
          <span className="select-none whitespace-nowrap font-display text-[clamp(2.5rem,15vw,11rem)] font-black uppercase leading-[0.8] tracking-[-0.05em] opacity-[0.07]">
            {previewItem?.label ?? ""}
          </span>
          <span className="mt-4 text-[10px] uppercase tracking-[0.3em] opacity-25">
            {previewItem?.meta ?? ""}
          </span>
        </div>

        <div className="absolute left-1/2 top-1/2 h-0 w-0">
          {/* Orbit rings */}
          <div
            ref={ringWrapRef}
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 opacity-0"
          >
            <div ref={ringSpinRef} className="h-full w-full">
              <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
                {/* currentColor so the rings invert with the surface the
                    menu opens over, instead of being locked to white. */}
                <circle
                  cx="50"
                  cy="50"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.3"
                  strokeWidth="0.18"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="50"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.38"
                  strokeWidth="0.18"
                  strokeDasharray="0.6 3.4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="33"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.18"
                  strokeWidth="0.16"
                />
                {/* Bodies riding the orbits — ink, not colour */}
                <circle cx="50" cy="0" r="0.6" fill="currentColor" fillOpacity="0.7" />
                <circle cx="83" cy="50" r="0.5" fill="currentColor" fillOpacity="0.6" />
                <circle cx="50" cy="83" r="0.45" fill="currentColor" fillOpacity="0.45" />
              </svg>
            </div>
          </div>

          {/* Core — the engine at the origin */}
          <div
            ref={coreRef}
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 hidden opacity-0 md:block"
          >
            <span className="nav-hairline block h-[46px] w-[46px] rounded-full border" />
            <span className="nav-core-dot absolute left-1/2 top-1/2 block h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
          </div>

          {/* Active indicator riding the orbit */}
          <span
            ref={indicatorRef}
            aria-hidden
            className="nav-core-dot pointer-events-none absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px] block h-[6px] w-[6px] rounded-full opacity-0"
          />

          {/* Items */}
          <ul className="list-none">
            {navMenu.map((item, i) => {
              const isActive = activeIndex === i;
              const isQuiet = hovered >= 0 && hovered !== i;
              return (
                <li
                  key={item.href}
                  ref={(el) => setSlot(el, i)}
                  className="absolute left-1/2 top-1/2 opacity-0"
                >
                  <a
                    ref={(el) => setMagnet(el, i)}
                    href={item.href}
                    onClick={(e) => goTo(e, item.href)}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(-1)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(-1)}
                    className={`group flex min-h-[52px] min-w-[9rem] flex-col items-center justify-center gap-1 rounded-2xl px-4 py-3 text-center outline-none transition-opacity duration-300 focus-visible:ring-2 focus-visible:ring-current ${
                      isQuiet ? "opacity-35" : "opacity-100"
                    }`}
                  >
                    <span className="text-[9px] uppercase tracking-[0.28em] opacity-40">
                      {item.index}
                    </span>

                    <span
                      className={`whitespace-nowrap font-display text-[clamp(0.8rem,3.2vw,1.6rem)] uppercase leading-none tracking-[-0.01em] transition-all duration-300 group-hover:tracking-[0.03em] group-hover:opacity-100 ${
                        isActive ? "font-black opacity-100" : "font-medium opacity-75"
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Active marker: a hairline in the current surface's ink
                        rather than a coloured dot. */}
                    <span
                      aria-hidden
                      className="block h-px w-5 origin-center bg-current transition-transform duration-300"
                      style={{ transform: `scaleX(${isActive ? 1 : 0})` }}
                    />

                    <span className="text-[9px] uppercase tracking-[0.22em] opacity-0 transition-opacity duration-300 group-hover:opacity-45 group-focus-visible:opacity-45">
                      {item.meta}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
