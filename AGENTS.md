<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Design source of truth

Before touching styling, layout, components, motion, or content, read
**`docs/DESIGN_HANDOFF.md`** — the exhaustive audit of the whole system (tokens,
components, interactions, page specs, content model, constraints). The current
visual direction is the light **"Daydream sky"** theme: see §20.6 (direction),
§20.7 (real-painting background integration + open tuning items), Appendix G
(`src/app/globals.css` is the reskin entry point), and Appendix F (per-component
touch-points). `STYLE.md` documents the ORIGINAL dark system — superseded on color
by §20.6, but its principles (calm canvas/alive objects, anti-template guardrails,
animate transform/opacity only) still hold. Product spec: `docs/PRD.md`. This is a
reskin — do not change IA, copy, content model, or interaction structure.
