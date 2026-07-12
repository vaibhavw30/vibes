"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/*
 * The signature moment (Phase 4) — "Liquidity."
 *
 * A market-depth chart rendered as living particle liquidity: bids accumulate to
 * the left of a drifting mid-price, asks to the right, forming the classic valley
 * that rises into two walls of depth. Green (--data-pos) is bid, violet (--accent)
 * is ask — the only two colors, both straight off the palette, no red. The book
 * breathes as orders arrive; the cursor parts the liquidity like a hand through
 * water. It's abstract on purpose — evocative of a book, never a chart you'd read.
 *
 * It is the ONE loud thing, so everything about it stays disciplined:
 *  - Canvas 2D, pre-rendered glow sprites, source-over (hue preserved, no white
 *    blow-out) — holds 60fps on desktop and mobile, ~0 bundle weight.
 *  - Lazy-loaded behind hero text (imported ssr:false) so it never gates LCP.
 *  - IntersectionObserver + visibilitychange pause the loop when unseen.
 *  - prefers-reduced-motion renders a single static frame, no rAF, no listeners.
 *  - pointer-events:none — the field never blocks selecting the hero text.
 */

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").trim();
  if (m.length !== 6) return null;
  const n = Number.parseInt(m, 16);
  if (Number.isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function makeGlow([r, g, b]: [number, number, number]): HTMLCanvasElement {
  const S = 32;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const g2 = c.getContext("2d")!;
  const grad = g2.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grad.addColorStop(0, `rgba(${r},${g},${b},0.85)`);
  grad.addColorStop(0.4, `rgba(${r},${g},${b},0.32)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  g2.fillStyle = grad;
  g2.fillRect(0, 0, S, S);
  return c;
}

type Particle = {
  hx: number; // home x, 0..1 across width
  r: number; // vertical fill ratio, 0 (baseline) .. 1 (top of its column)
  size: number;
  tw: number; // jitter phase
  spd: number; // jitter speed multiplier
};

// A few slow-moving gaussian bumps = walls of liquidity arriving and thinning.
type Bump = { pos: number; amp: number; w: number; speed: number; phase: number };

export function LiquidityField() {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const css = getComputedStyle(document.documentElement);
    const bidRgb = hexToRgb(css.getPropertyValue("--data-pos")) ?? [95, 207, 158];
    const askRgb = hexToRgb(css.getPropertyValue("--accent")) ?? [200, 182, 255];
    const bidSprite = makeGlow(bidRgb);
    const askSprite = makeGlow(askRgb);

    let width = 0;
    let height = 0;
    let baseline = 0;
    let maxH = 0;
    let particles: Particle[] = [];
    let bumps: Bump[] = [];
    let lastNow = 0; // latest loop timestamp, so resize() can repaint while paused

    // Deterministic-ish pseudo-random (Math.random is fine here; not resumed).
    const rand = () => Math.random();

    function build() {
      const isMobile = width < 640;
      maxH = height * (isMobile ? 0.44 : 0.52);
      baseline = height * 0.9;

      const count = isMobile ? 340 : Math.min(1000, Math.round(width * 0.72));
      particles = Array.from({ length: count }, () => {
        // Bias toward the edges so the two depth walls read denser than the valley.
        const side = rand() < 0.5 ? -1 : 1;
        const u = Math.pow(rand(), 0.7);
        const hx = 0.5 + side * u * 0.5;
        return {
          hx,
          r: Math.pow(rand(), 0.82),
          size: 7 + rand() * 12,
          tw: rand() * Math.PI * 2,
          spd: 0.6 + rand() * 0.9,
        };
      });

      bumps = Array.from({ length: 5 }, (_, i) => ({
        pos: 0.12 + (i / 4) * 0.76 + (rand() - 0.5) * 0.06,
        amp: maxH * (0.16 + rand() * 0.16),
        w: width * (0.05 + rand() * 0.05),
        speed: 0.00018 + rand() * 0.0003,
        phase: rand() * Math.PI * 2,
      }));
    }

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      // Setting canvas.width cleared the buffer; repaint at once so a resize while
      // the loop is paused (offscreen / hidden) never leaves the field blank.
      draw(lastNow);
    }

    function midXAt(t: number) {
      return width * 0.5 + Math.sin(t * 0.00018) * width * 0.035;
    }

    function heightAt(px: number, t: number, midX: number) {
      const halfW = width * 0.5;
      const u = Math.min(1, Math.abs(px - midX) / halfW);
      let h = maxH * Math.pow(u, 1.28);
      for (const b of bumps) {
        const bx = b.pos * width;
        const d = px - bx;
        const g = Math.exp(-(d * d) / (2 * b.w * b.w));
        h += g * b.amp * (0.55 + 0.45 * Math.sin(t * b.speed + b.phase));
      }
      return h * (0.82 + 0.18 * Math.sin(t * 0.0006));
    }

    // Pointer state (window-level; canvas is pointer-events:none).
    let pointerX = -9999;
    let pointerY = -9999;
    let pointerActive = false;
    const R = 130; // parting radius
    const PUSH = 46; // parting strength

    function onMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > width || y > height) {
        pointerActive = false;
        return;
      }
      pointerX = x;
      pointerY = y;
      pointerActive = true;
    }
    function onLeave() {
      pointerActive = false;
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, width, height);
      const midX = midXAt(t);

      for (const p of particles) {
        const px = p.hx * width;
        const colH = heightAt(px, t, midX);
        let x = px + Math.sin(t * 0.001 * p.spd + p.tw) * 3;
        let y = baseline - p.r * colH + Math.cos(t * 0.0011 * p.spd + p.tw) * 2;

        if (pointerActive) {
          const dx = x - pointerX;
          const dy = y - pointerY;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < R * R) {
            const dist = Math.sqrt(dist2) || 1;
            const f = (R - dist) / R;
            const push = f * f * PUSH;
            x += (dx / dist) * push;
            y += (dy / dist) * push;
          }
        }

        const sprite = px < midX ? bidSprite : askSprite;
        const s = p.size * (0.55 + p.r * 0.85);
        // Deeper in the book (low r) reads a touch stronger; edges twinkle.
        const twinkle = 0.72 + 0.28 * Math.sin(t * 0.0016 * p.spd + p.tw);
        ctx!.globalAlpha = (0.1 + (1 - p.r) * 0.34) * twinkle;
        ctx!.drawImage(sprite, x - s / 2, y - s / 2, s, s);
      }

      // Faint mid-price seam.
      ctx!.globalAlpha = 0.14;
      const seam = ctx!.createLinearGradient(0, baseline - maxH, 0, baseline);
      seam.addColorStop(0, `rgba(${askRgb[0]},${askRgb[1]},${askRgb[2]},0)`);
      seam.addColorStop(1, `rgba(236,236,236,0.5)`);
      ctx!.strokeStyle = seam;
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(midX, baseline - maxH * 0.72);
      ctx!.lineTo(midX, baseline);
      ctx!.stroke();

      ctx!.globalAlpha = 1;
    }

    // --- Reduced motion: one static frame, no loop, no listeners. ---
    if (reduce) {
      resize();
      draw(6200); // a settled, representative moment
      canvas.style.opacity = "1";
      const onResizeStatic = () => {
        resize();
        draw(6200);
      };
      window.addEventListener("resize", onResizeStatic);
      return () => window.removeEventListener("resize", onResizeStatic);
    }

    // --- Animated path ---
    let raf = 0;
    let running = false;

    function loop(now: number) {
      lastNow = now;
      draw(now);
      raf = requestAnimationFrame(loop);
    }
    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    resize();
    // Paint one frame synchronously so the field is never blank before the first
    // rAF tick (slow first frame, or a briefly-hidden document), then fade it in.
    draw(0);
    canvas.style.opacity = "1";
    start(); // IO only pauses when the hero scrolls away

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !document.hidden) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (canvas!.getBoundingClientRect().bottom > 0) start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 0, transition: "opacity 1200ms ease-out" }}
    />
  );
}
