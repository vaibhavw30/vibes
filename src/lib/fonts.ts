import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";

/*
 * Type system — STYLE.md Pairing A (default): Fraunces + Inter, with IBM Plex
 * Mono for metrics/tags/live-data readouts.
 *
 * ALTERNATE (documented, not wired): Pairing D swaps the display face to
 * Playfair Display for more fashion-editorial drama. To switch, import
 * `Playfair_Display` here, expose it on the same `--font-fraunces` variable
 * (or rename the theme var), and relock in STYLE.md. Kept a one-import change.
 */

// Display / headline face. Variable, optical sizing on for drama at large sizes.
// No `weight` pin so the full variable range + `opsz` axis load; STYLE.md's
// "two display weights max" is a usage rule, applied in the components.
export const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

// Body / UI face.
export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Utility / data face — metrics, tags, terminal flourishes. Used sparingly.
export const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const fontVariables = `${fraunces.variable} ${inter.variable} ${plexMono.variable}`;
