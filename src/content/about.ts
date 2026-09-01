/*
 * About-page copy + interests (Phase 5).
 *
 * DRAFT VOICE — everything in `aboutLead`, `aboutBody`, `aboutThroughLine`, and the
 * interest blurbs is a first-person draft written in Vaibhav's register from
 * CONFIRMED facts only (site-preferences skill + resume). It lives here, in one
 * place, so he can edit his own voice without touching layout. No invented
 * motivations, metrics, or details. Humanizer discipline applied: sentence case,
 * varied rhythm, opinions, active voice, no significance inflation, no rule-of-three
 * padding, em dashes kept sparse.
 *
 * Interest split (full subpage vs inline tile) follows the plan: a page only where
 * there's live data or a real gallery to fill it (movies → Letterboxd, chess →
 * Chess.com, cooking → photo gallery). Everything else is an honest tile, not a thin
 * padded page. `href: null` = inline-only.
 */

/** Lead sentence under the About title. */
export const aboutLead =
  "I'm Vaibhav. I build things because I keep noticing problems I want to fix.";

/** The through-line, pulled out as a serif aside. Do not turn it into a slogan. */
export const aboutThroughLine =
  "Almost everything here started as a problem I ran into myself.";

/** Long-form narrative, paragraph by paragraph. All facts confirmed. */
export const aboutBody = [
  "I've been building things since I was a kid and never really stopped. These days that mostly means software.",
  "At Georgia Tech I study computer science with a math minor, graduating in 2028. My work splits between software engineering, machine learning research, and quant finance, and I like that they keep running into each other. So far that's meant founding-team engineering at a sports-odds startup, a software internship building natural-language data tooling, and research on steering truth directions inside language models. Next I'm joining Georgia Tech's $2.7M student-managed fund as a quant and the EPIC lab as a prosthesis researcher.",
  "Away from a screen, most of it comes back to food. I started cooking with whole ingredients, wanted to grow some of them, and ended up with a garden. That led to beekeeping, and the bees led to a farmers' market stall where I talk to strangers about pollinators.",
  "I debated competitively and got as high as #19 in the country. I play poker and once made the top 30 in my quant club's tournament. I'm around 1300 in chess and stubborn about moving up. There's also basketball, too much fantasy football, and piano.",
  "I split my time between the Bay Area and Atlanta.",
] as const;

export type Interest = {
  slug: string;
  label: string;
  /** One-line, his voice, confirmed facts only. */
  blurb: string;
  /** Full subpage path, or null for an inline (non-linking) tile. */
  href: string | null;
  /** Whether the linked page is backed by a live-data module (wired in Phase 6). */
  live?: boolean;
};

export const interests: Interest[] = [
  {
    slug: "movies",
    label: "Film",
    blurb: "I log everything I watch on Letterboxd. It's the closest thing I keep to a diary.",
    href: "/about/movies",
    live: true,
  },
  {
    slug: "chess",
    label: "Chess",
    blurb: "Parked around 1300 and stubborn about it.",
    href: "/about/chess",
    live: true,
  },
  {
    slug: "cooking",
    label: "Kitchen → garden",
    blurb: "Whole ingredients, mostly. It's how the garden and the bees started.",
    href: "/about/cooking",
  },
  {
    slug: "debate",
    label: "Debate",
    blurb: "Got as high as #19 in the country, and #3 at Berkeley.",
    href: null,
  },
  {
    slug: "poker",
    label: "Poker",
    blurb: "Top 30 in my quant club's tournament.",
    href: null,
  },
  {
    slug: "training",
    label: "Staying active",
    blurb: "Trying to make the gym a habit. I log it to stay honest.",
    href: "/about/training",
    live: true,
  },
  {
    slug: "basketball",
    label: "Basketball",
    blurb: "Pickup whenever I can find a run.",
    href: null,
  },
  {
    slug: "fantasy",
    label: "Fantasy football",
    blurb: "I take it more seriously than the standings justify.",
    href: null,
  },
  {
    slug: "piano",
    label: "Piano",
    blurb: "For when I want to think about nothing.",
    href: null,
  },
];
