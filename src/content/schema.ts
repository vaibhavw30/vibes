/*
 * Project + Experience content model — PRD §5.4 and §5.2 (tag taxonomy).
 * Controlled vocabulary: do NOT expand casually.
 */

// Type tag — EXACTLY ONE per project. Visuals color-code off this (max 5 colors).
export const TYPE_TAGS = [
  "Internship",
  "Founding",
  "Research",
  "Personal",
  "Hackathon",
] as const;
export type TypeTag = (typeof TYPE_TAGS)[number];

// Domain tags — 1 to 3 per project. Neutral color. Cap at 3.
export const DOMAIN_TAGS = [
  "Quant",
  "ML/AI",
  "Systems/Backend",
  "Full-Stack",
  "Data",
  "Infra/Cloud",
  "Frontend",
  "Applied-Research",
] as const;
export type DomainTag = (typeof DOMAIN_TAGS)[number];

export type ProjectStatus = "shipped" | "in-progress" | "coming-soon";

export interface Metric {
  label: string;
  value: string;
}

export interface Project {
  slug: string;
  title: string;
  oneLiner: string;
  /** Brief "why" for the card — the problem noticed, not the tech. */
  whyShort: string;
  /** Full "why" story for the detail page. */
  whyFull: string;
  /**
   * Provenance of the "why". "confirmed" = Vaibhav's own words / verbatim
   * source-of-truth. "draft" = drafted from the README for his review — grounded
   * in documented facts, NEVER asserted motivation. The UI must visibly flag (or
   * gate) drafts so an unreviewed "why" never ships as if confirmed.
   */
  whyStatus: "confirmed" | "draft";
  typeTag: TypeTag;
  /** 1–3 domain tags. */
  domainTags: DomainTag[];
  role: string | null;
  timeframe: string | null;
  team: string | null;
  stack: string[];
  metrics: Metric[];
  /** null for private repos (e.g. BoxIt) — never expose. */
  repoUrl: string | null;
  demoUrl: string | null;
  /** null until real demos are recorded (YouTube launches with placeholders). */
  youtubeUrl: string | null;
  status: ProjectStatus;
  coverImage: string | null;
  gallery: string[];
  /** Surface on the home "selected work" teaser. */
  featured?: boolean;
}

// Experience = real roles (Model 1). Kept separate from self-driven Projects so
// internship / founding / research don't flatten into weekend builds.
export interface Experience {
  org: string;
  role: string;
  timeframe: string;
  typeTag: Extract<TypeTag, "Internship" | "Founding" | "Research">;
  oneLine: string;
  /**
   * Provenance of oneLine. "confirmed" = Vaibhav's own words. "draft" = a voiced
   * scaffold with the concrete claim as a [bracketed blank] — there is NO source
   * doc for roles, so nothing here asserts invented work. UI must flag drafts.
   */
  oneLineStatus: "confirmed" | "draft";
  status: "current" | "past" | "incoming";
}
