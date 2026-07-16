"use client";

import type { FC } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Interest } from "@/content/about";

/*
 * /about "Beyond the work" — the interests as pieces on a faint 4×4 board.
 * Left alone it plays itself (a piece slides to an open square every ~2s); hover
 * or keyboard-focus stalls the whole board so you can read and click. A tile on a
 * DARK square reads bolder + more opaque; on a LIGHT square it's airier, and it
 * restyles as pieces land on new squares. Content is unchanged — every blurb is
 * real (src/content/about.ts). The board is a pointer/sm+ enhancement; touch and
 * reduced motion get a static, scannable grid.
 *
 * Motion is Motion's `layout` FLIP: changing a tile's grid cell animates the slide
 * with transform only (performance law). Tiles keep a fixed DOM order — only their
 * visual position moves — so tab/screen-reader order stays stable.
 */

const COLS = 4;
const ROWS = 4;

// Deterministic starting squares, one per interest (cell index = r*COLS + c). A
// stride of 5 is coprime with the 16-cell board, so successive pieces land on
// distinct, well-spread squares with a balanced light/dark mix. No RNG → server
// and client hydrate to the same board; pieces then drift via makeMove. Clamped to
// the board's capacity so a growing interests list can never hand a tile an
// undefined (NaN) grid cell — the bug that collapsed the whole board when a 9th
// interest outgrew a hardcoded 8-square list.
function initialPositions(n: number): number[] {
  const total = COLS * ROWS;
  return Array.from({ length: Math.min(n, total) }, (_, i) => (i * 5) % total);
}

const cellRC = (i: number) => ({ r: Math.floor(i / COLS), c: i % COLS });
const parity = (i: number) => {
  const { r, c } = cellRC(i);
  return (r + c) % 2; // 1 = dark
};

const Tile: FC<{ interest: Interest; dark: boolean }> = ({ interest, dark }) => {
  const base =
    "frost group flex h-full flex-col justify-between rounded-xl border p-3.5 transition-[background-color,border-color,color,transform] duration-500 ease-out";
  const skin = dark ? "bg-bg-2 border-border-strong" : "bg-bg-1 border-border";
  const labelCls = dark ? "text-text-mid font-medium" : "text-text-lo font-normal";
  const blurbCls = dark ? "text-text-mid font-medium" : "text-text-mid/85";

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span
          className={`font-mono text-mono uppercase tracking-wider ${labelCls}`}
        >
          {interest.label}
        </span>
        {interest.href && (
          <ArrowUpRight
            className="size-4 shrink-0 text-text-lo transition-colors group-hover:text-accent"
            aria-hidden="true"
          />
        )}
      </div>
      <p className={`mt-3 text-small leading-snug ${blurbCls}`}>
        {interest.blurb}
      </p>
    </>
  );

  if (interest.href) {
    return (
      <Link
        href={interest.href}
        className={`${base} ${skin} hover:-translate-y-0.5 hover:border-border-strong hover:bg-bg-2 motion-reduce:hover:translate-y-0`}
      >
        {body}
      </Link>
    );
  }
  return <div className={`${base} ${skin}`}>{body}</div>;
};

/** One board move: slide a piece to a random open square (rook step, or ~20% a
 *  knight's L). Returns a new positions array, or the same one if no legal move. */
function makeMove(pos: number[]): number[] {
  const occupied = new Set(pos);
  const empties = Array.from({ length: COLS * ROWS }, (_, i) => i).filter(
    (i) => !occupied.has(i),
  );
  for (let tries = 0; tries < 8; tries++) {
    const target = empties[Math.floor(Math.random() * empties.length)];
    const { r: tr, c: tc } = cellRC(target);
    const movers = pos
      .map((cell, idx) => ({ idx, cell }))
      .filter(({ cell }) => {
        const { r, c } = cellRC(cell);
        const dr = Math.abs(r - tr);
        const dc = Math.abs(c - tc);
        const rook = dr + dc === 1;
        const knight = (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
        return rook || knight;
      });
    if (!movers.length) continue;
    const knights = movers.filter(({ cell }) => {
      const { r, c } = cellRC(cell);
      return Math.abs(r - tr) + Math.abs(c - tc) > 1;
    });
    const rooks = movers.filter((m) => !knights.includes(m));
    const pool =
      knights.length && Math.random() < 0.2
        ? knights
        : rooks.length
          ? rooks
          : movers;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const next = pos.slice();
    next[pick.idx] = target;
    return next;
  }
  return pos;
}

export function InterestBoard({ interests }: { interests: Interest[] }) {
  const reduce = useReducedMotion() ?? false;
  const [positions, setPositions] = useState<number[]>(() =>
    initialPositions(interests.length),
  );
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused) return;
    const id = setInterval(() => setPositions((p) => makeMove(p)), 2000);
    return () => clearInterval(id);
  }, [reduce, paused]);

  return (
    <>
      {/* Board — a frosted board surface floating over the sky (same language as
          the timeline / carousel panels), with a faint checker and the pieces on
          top. pointer / sm+ enhancement. */}
      <div
        role="group"
        aria-label="Interests"
        className="mx-auto hidden w-full max-w-[720px] sm:block"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
        }}
      >
        <div className="frost rounded-2xl border border-border/70 p-3 sm:p-4">
          <div className="relative aspect-square w-full">
            {/* checker layer */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 grid grid-cols-4 grid-rows-4 overflow-hidden rounded-lg"
            >
              {Array.from({ length: COLS * ROWS }, (_, i) => (
                <div
                  key={i}
                  style={{
                    background: parity(i) ? "rgba(27,39,53,0.055)" : "transparent",
                  }}
                />
              ))}
            </div>
            {/* tile layer */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-2.5">
              {interests.map((interest, idx) => {
                // Guard against a positions/interests length drift — never let a
                // tile fall through to an undefined (NaN) grid cell.
                const cell = positions[idx] ?? idx % (COLS * ROWS);
                const { r, c } = cellRC(cell);
                return (
                  <motion.div
                    key={interest.slug}
                    layout
                    transition={{
                      layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                    }}
                    style={{ gridColumnStart: c + 1, gridRowStart: r + 1 }}
                  >
                    <Tile interest={interest} dark={parity(cell) === 1} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile — static 2-col grid, no board/motion. */}
      <div className="grid grid-cols-2 gap-4 sm:hidden">
        {interests.map((interest) => (
          <Tile key={interest.slug} interest={interest} dark={false} />
        ))}
      </div>
    </>
  );
}
