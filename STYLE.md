# STYLE.md — Design System

The visual and motion system for the site. Paired with PRD.md. Where the PRD says _what_, this says _how it looks and moves_.

**Governing principle: calm canvas, alive objects.** Editorial restraint in layout; energy concentrated in a few interactive objects. When in doubt, make the layout quieter and the one signature louder.

---

## 0. Anti-template guardrails (read first)

Current AI-generated design clusters around three tells. We are adjacent to one of them (dark + accent), so we avoid the templated version deliberately:

- **Don't** use pure `#000` with a single bright neon/acid accent as the whole identity. That's the tell.
- **Do** use a refined multi-step near-black palette (below) so the darkness has depth, and let **typography + the signature moment** carry identity rather than a lone accent color.
- **Don't** default to numbered eyebrows (01/02/03) unless the content is genuinely sequential.
- **Don't** over-animate. Extra motion is itself an AI-generated tell. Moderate, deliberate, orchestrated beats scattered effects.
- Spend boldness in **one** place (the signature moment). Keep everything around it disciplined.

---

## 1. Color

Dark, moody, high-contrast — but layered, not flat black. Palette is a ramp of near-blacks and warm-neutral grays with a single restrained accent and a secondary "quant" tint used sparingly.

```
/* Surfaces — near-black with depth, not pure #000 */
--bg-0:        #0a0b0d;   /* page base */
--bg-1:        #101216;   /* raised surface / cards */
--bg-2:        #16191f;   /* higher surface / hovered cards */
--bg-3:        #1e222a;   /* borders-as-fills, inset panels */

/* Text */
--text-hi:     #ececec;   /* primary headings/body high */
--text-mid:    #a8adb5;   /* secondary */
--text-lo:     #6b7079;   /* muted / captions / metadata */

/* Borders — hairline, low-contrast */
--border:      #1f242c;
--border-strong:#2a313b;

/* Accent — ONE. Restrained. Warm-clay-adjacent avoided (Claude tell). */
/* Prefer a considered off-tone over neon. Candidates (CC picks ONE, locks it): */
--accent:      #c8b6ff;   /* soft violet — editorial, not neon  (default) */
/* alternates to try: #7dd3c0 muted teal · #e8b04b warm amber · #9fb4ff periwinkle */

/* Secondary tint — for data/quant accents ONLY, very sparing */
--data-pos:    #5fcf9e;   /* up / positive, used like a market tick */
--data-neg:    #d9736b;   /* down / negative */
```

Rules:

- One accent. If a second color appears, it's a **data tick** (pos/neg) and only in quant/live-data contexts.
- Text must pass AA on `--bg-0`. Verify `--text-lo` especially.
- No gradients as decoration. A single subtle radial glow behind the hero signature is allowed if it serves depth, not as a mesh-gradient background.
- **[CC-DECIDES]** the final accent hex from the candidates — pick what feels least templated in context, justify the choice in a build note.

---

## 2. Typography

Editorial personality lives in the display face. Two preferred pairings; keep flexible, default to A.

**Pairing A (default): Fraunces + Inter**

- Display: **Fraunces** (variable, optical sizing on). Warm high-contrast serif with character. Use for hero + section headlines. Large sizes; let optical sizing add drama.
- Body/UI: **Inter**. Everything else.

**Pairing D (alternate): Playfair Display + Inter**

- Display: **Playfair Display** — more dramatic, fashion-editorial. Use if more drama is wanted.
- Body/UI: **Inter**.

**Utility / data face:** a mono for metrics, tags, live-data readouts, and the "terminal" flourishes — **IBM Plex Mono** or **Geist Mono**. Used sparingly for numbers and labels, reinforcing the quant edge without going full terminal.

Type scale (fluid, `clamp()`):

```
--fs-hero:   clamp(2.75rem, 7vw, 6rem);    /* serif, tight leading, -0.02em */
--fs-h1:     clamp(2rem, 4vw, 3.25rem);
--fs-h2:     clamp(1.5rem, 2.5vw, 2.25rem);
--fs-h3:     1.25rem;
--fs-body:   1.0625rem;    /* ~17px, line-height 1.6 */
--fs-small:  0.875rem;
--fs-mono:   0.8125rem;    /* tags, metrics, labels */
```

Rules:

- Two weights of the serif max (e.g. 400 + 600). Don't ladder every weight.
- Headlines: tight leading (1.0–1.1), slight negative letter-spacing.
- Body: generous leading (1.6), never full-width — cap measure ~68ch.
- Sentence case everywhere. No ALL CAPS except tiny mono labels if truly needed.

---

## 3. Layout & spacing

- **Generous negative space** is the editorial signal. Don't fill every region.
- Max content width ~1100–1200px; wide hero can break to near-full-bleed.
- Baseline spacing scale (rem): `0.5 / 0.75 / 1 / 1.5 / 2 / 3 / 4 / 6 / 8`.
- Vertical rhythm between home "scenes" is large (6–8rem) so each reveal breathes.
- Asymmetry is welcome — editorial layouts aren't centered grids. Off-set headlines, ragged columns, deliberate imbalance.
- Cards: `--bg-1` fill, hairline `--border`, 12px radius. Hover raises to `--bg-2` with a subtle transform, not a heavy shadow.

---

## 4. Motion

**Stack:**

- **Motion (Framer Motion)** — 90% of motion: enter/exit, scroll reveals, hover/tap micro-interactions, layout animations. Use `useReducedMotion`.
- **Lenis** — smooth/inertia scroll globally. This is the "expensive feel." ~4KB.
- **GSAP + ScrollTrigger** — ONLY the one signature scroll sequence (if the signature is scroll-driven). Avoid paid plugins (SplitText/ScrollSmoother).

**Performance law:** animate only `transform` and `opacity` (GPU compositor). Never animate `width/height/top/left/margin` (layout thrash). This is non-negotiable.

**Motion vocabulary (keep consistent):**

- Scroll reveals: fade + 12–20px rise, `ease-out`, 400–600ms, staggered children ~60–80ms.
- Hover on cards: 150ms, subtle scale (1.01–1.02) or border/`--bg` shift. No bounce.
- Page transitions: quick opacity/slide (200–300ms).
- The word-cycling sub-line: mask or typewriter reveal; steady cadence; pauses on each word long enough to read.
- **Reduced motion:** every animation has a static end-state fallback. The signature moment renders a static frame. Nothing essential is gated on motion.

**Restraint:** if a section has motion just to have motion, cut it. Orchestrate a few moments well.

---

## 5. Components

- **Nav:** minimal, fixed-but-quiet (transparent → slight `--bg-0` blur on scroll). Home / Projects / About / Now + GitHub + LinkedIn icons. No resume link.
- **Project card:** cover/glyph, title (serif), one-line "why" (italic or muted), type tag (colored) + up to 3 domain tags (neutral mono), hover raise. "Coming soon" variant for BoxIt (lock/redaction treatment).
- **Tag pills:** type tag uses its type color at low opacity bg + readable fg; domain tags are neutral outline pills in mono. Small, tidy.
- **Live-data tile:** compact, mono readouts, a data-tick color for up/down where relevant (chess rating delta, now-playing). Graceful static fallback.
- **Experience row:** role / org / timeframe / one line. Sharp, professional, no decoration.
- **Buttons/links:** understated. Underline-on-hover or a quiet accent. One primary action per view at most.
- Base components from shadcn/ui, rethemed to the tokens above. Don't ship default shadcn look.

---

## 6. Signature moment styling

- Sits in/after the hero. Depth via one subtle radial glow behind it (allowed exception to no-gradient).
- Uses accent + data ticks only; stays within the palette.
- 60fps; `transform`/`opacity`; lazy-loaded; static fallback under reduced motion; mobile-safe.
- It's the ONE loud thing. Everything around it stays quiet.

---

## 7. Imagery

- Recipe photos (cooking): warm, real, his own — a deliberate contrast to the cool dark UI. Present them well (consistent aspect ratios, tasteful grid).
- Letterboxd posters: let the film art bring color; the UI stays neutral around them.
- Project covers: prefer real screenshots/diagrams over stock. If a project lacks an image, use a typographic/glyph cover in-palette rather than a generic stock photo.

---

## 8. Quality floor (build to it silently)

- Mobile responsive (360px up), no horizontal scroll.
- Visible keyboard focus (accent ring).
- Reduced motion honored everywhere.
- AA contrast on dark.
- Lighthouse perf ≥ 90 mobile; LCP is the hero text, not the WebGL.

---

## 9. What "done well" looks like

The site should feel like a design-literate quant made it: restrained, confident, fast, with two or three moments that make you go "oh, nice" — and copy (the project "why"s, the About voice) that reveals a specific person who builds from problems he noticed. If it reads as a dark template with a neon accent, it has failed; pull identity back into type and the signature.
