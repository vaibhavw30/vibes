import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";
import type { Project } from "@/content/schema";
import { DomainPill, TypePill } from "@/components/tag-pill";

/*
 * Reusable project card (home teaser + Phase 3 grid). Serif title, italic/muted
 * "why", colored type pill + neutral domain pills. Hover raises the surface via
 * transform + border/bg shift only. BoxIt (coming-soon, private repo) shows a
 * lock affordance instead of the outward arrow — the card still routes to its
 * detail page, which handles the redacted tease.
 */

export function ProjectCard({ project }: { project: Project }) {
  const comingSoon = project.status === "coming-soon";
  const isDraft = project.whyStatus === "draft";

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex h-full flex-col rounded-xl border border-border bg-bg-1 p-6 transition duration-200 ease-out hover:-translate-y-1 hover:border-border-strong hover:bg-bg-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className="flex items-center justify-between gap-3">
        <TypePill tag={project.typeTag} />
        {comingSoon ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-wider text-text-lo">
            <Lock className="size-3" aria-hidden="true" />
            Coming soon
          </span>
        ) : (
          <ArrowUpRight
            className="size-4 text-text-lo transition-colors group-hover:text-accent"
            aria-hidden="true"
          />
        )}
      </div>

      <h3 className="mt-4 font-serif text-h3 text-text-hi">{project.title}</h3>

      <p className="mt-2 font-serif text-small italic leading-relaxed text-text-mid line-clamp-4">
        {project.whyShort}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-5">
        {project.domainTags.map((tag) => (
          <DomainPill key={tag} tag={tag} />
        ))}
        {isDraft && (
          <span
            title="Why is drafted from the repo — pending Vaibhav's review"
            className="ml-auto font-mono text-[0.62rem] uppercase tracking-wider text-text-lo/70"
          >
            draft
          </span>
        )}
      </div>
    </Link>
  );
}
