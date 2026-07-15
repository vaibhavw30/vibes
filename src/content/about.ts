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
  "I'm Vaibhav. I build things because I keep noticing problems I can't quite let go of.";

/** The through-line, pulled out as a serif aside. Do not turn it into a slogan. */
export const aboutThroughLine =
  "Almost everything I've built started as something I noticed and couldn't leave alone.";

/** Long-form narrative, paragraph by paragraph. All facts confirmed. */
export const aboutBody = [
  "I've been building things since I was a kid. The only real difference now is that the things compile. Most of what I've made started the same way: I noticed something that bugged me, and building the fix turned out to be more interesting than complaining about it.",
  "At Georgia Tech I study computer science with a math minor, graduating in 2028. My work splits about three ways: software engineering, machine learning research, and quant finance. I like that they keep running into each other. So far that's meant founding-team engineering at a sports-odds startup, a software internship building natural-language data tooling, and research steering truth directions inside language models. Next, I'm joining Georgia Tech's $2.7M student-managed fund as a quant and the EPIC lab as a prosthesis researcher.",
  "Away from a screen, most of it comes back to food. I started cooking with whole ingredients, which made me want to grow a few of them, which turned into an actual garden. The garden got me into beekeeping. The bees got me standing at a farmers' market explaining to strangers why pollinators are worth caring about. I didn't see that chain coming when it started.",
  "I'm drawn to games that keep score but hide a lot of judgment underneath. I debated competitively and got as high as #19 in the country. I play poker, and once made the top 30 in my quant club's tournament. I'm parked around 1300 in chess and unreasonably stubborn about moving up. There's also basketball, too much fantasy football, and piano for when I want to think about nothing.",
  "I split my time between the Bay Area and Atlanta, and I'm always up for comparing notes on any of the above.",
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
    blurb: "Trying to turn the gym into a habit that sticks. I log it to stay honest.",
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
