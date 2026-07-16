"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "motion/react";

/*
 * The signature interactive moment (Home - Polished): a paper airplane that springs
 * after the cursor — on-concept for "the things I imagined as a kid" / flight /
 * daydreaming. It arrives with a fly-in from the left, trails the cursor a beat
 * behind on a spring, banks its nose along its velocity, bobs gently, and drifts in
 * a faint hover when the cursor is still. It follows the cursor across the WHOLE
 * home page (position:fixed + a window-level listener), not just the hero; it also
 * rides a subtle parallax on the hero painting, but only while the cursor is over
 * it. z-[9] keeps it behind the hero headline (z-10) yet above every scrolled
 * section, and under the nav (z-40). pointer-events:none + aria-hidden — purely
 * decorative, never blocks anything. Under prefers-reduced-motion it renders one
 * static resting frame (no rAF, no listeners). Physics ported from the Claude mock.
 */
export function PaperPlane({
  containerRef,
  bgRef,
}: {
  containerRef: RefObject<HTMLElement | null>;
  bgRef: RefObject<HTMLElement | null>;
}) {
  const reduce = useReducedMotion();
  const planeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const plane = planeRef.current;
    const bgAtMount = bgRef.current;
    if (!plane) return;

    // Reduced motion: a single static resting frame, no loop, no listeners.
    if (reduce) {
      plane.style.opacity = "0.9";
      plane.style.transform = "translate(70vw, 40vh) rotate(-8deg)";
      return;
    }

    // Fixed positioning → everything is in viewport coordinates.
    let tx = window.innerWidth * 0.62;
    let ty = window.innerHeight * 0.42;
    let x = -80;
    let y = window.innerHeight * 0.5;
    let vx = 0;
    let vy = 0;
    let angle = 0;
    let arrived = false;
    let idle = 0;
    const t0 = performance.now();
    let raf = 0;

    // Follow the cursor across the whole page (window-level, viewport coords).
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      idle = 0;
      // The hero painting rides a gentle parallax — but only while the cursor is
      // actually over it on screen, so scrolled sections don't jerk the image.
      const hero = containerRef.current;
      const bg = bgRef.current;
      if (hero && bg) {
        const r = hero.getBoundingClientRect();
        if (e.clientY >= r.top && e.clientY <= r.bottom) {
          const dx = (e.clientX - r.left) / r.width - 0.5;
          const dy = (e.clientY - r.top) / r.height - 0.5;
          bg.style.transform = `scale(1.06) translate(${dx * -14}px, ${dy * -10}px)`;
        }
      }
    };
    window.addEventListener("pointermove", onMove);

    const step = (now: number) => {
      const t = (now - t0) / 1000;
      if (!arrived && t > 0.05) plane.style.opacity = "1";
      idle += 0.016;
      // Idle life-sign only — a faint hover centered on the cursor. Kept small so
      // a parked cursor (reading a scrolled section) never reads as the plane
      // "wandering off"; while the cursor moves, idle≈0 so drift≈0 and it hugs.
      const driftX = arrived ? Math.sin(idle * 0.5) * 9 : 0;
      const driftY = arrived ? Math.sin(idle * 0.9) * 6 : 0;
      const gx = tx + driftX;
      const gy = ty + driftY;
      // spring toward target, trailing a beat behind
      const k = 0.045;
      const damp = 0.86;
      vx = (vx + (gx - x) * k) * damp;
      vy = (vy + (gy - y) * k) * damp;
      x += vx;
      y += vy;
      if (!arrived && Math.abs(x - tx) < 40) arrived = true;
      const speed = Math.hypot(vx, vy);
      if (speed > 0.15) angle = (Math.atan2(vy, vx) * 180) / Math.PI;
      const bob = Math.sin(t * 2.4) * 2.5;
      // +45° because the SVG plane art points up-right
      plane.style.transform = `translate(${(x - 26).toFixed(1)}px, ${(
        y - 26 + bob
      ).toFixed(1)}px) rotate(${(angle + 45).toFixed(1)}deg)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      if (bgAtMount) bgAtMount.style.transform = "scale(1.06)";
    };
  }, [reduce, containerRef, bgRef]);

  return (
    <div
      ref={planeRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9] h-[52px] w-[52px] opacity-0 [will-change:transform]"
      style={{ filter: "drop-shadow(0 8px 10px rgba(27,39,53,.22))" }}
    >
      <svg viewBox="0 0 48 48" width="52" height="52" fill="none">
        <path
          d="M45 5 4 22l16 5 3 15 6-11 10 6z"
          fill="rgba(255,255,255,.94)"
          stroke="#2a67a6"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M45 5 20 27l3 15"
          fill="rgba(42,103,166,.14)"
          stroke="#2a67a6"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
