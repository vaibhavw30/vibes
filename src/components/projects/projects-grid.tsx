"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { DomainTag, Project, TypeTag } from "@/content/schema";
import { DOMAIN_TAGS, TYPE_TAGS } from "@/content/schema";
import { ProjectCard } from "@/components/project-card";
import { cn } from "@/lib/utils";

/*
 * Filterable projects grid (Phase 3). Two independent filters — the ONE type tag
 * (color-coded) and a domain tag — combined with AND. Selection is client state,
 * not a URL param: the grid is one screen, filtering is ephemeral, and keeping it
 * local avoids a Suspense/searchParams dance for no real gain. Reflow animates via
 * layout + a light fade; under reduced motion it collapses to an instant swap.
 */

type TypeFilter = TypeTag | "All";
type DomainFilter = DomainTag | "All";

const chipBase =
  "rounded-full border px-3 py-1 font-mono text-[0.7rem] uppercase tracking-wider transition-colors";

const typeActive: Record<TypeTag, string> = {
  Internship: "border-tag-internship/50 bg-tag-internship/12 text-tag-internship",
  Founding: "border-tag-founding/50 bg-tag-founding/12 text-tag-founding",
  Research: "border-tag-research/50 bg-tag-research/12 text-tag-research",
  Personal: "border-tag-personal/50 bg-tag-personal/12 text-tag-personal",
  Hackathon: "border-tag-hackathon/50 bg-tag-hackathon/12 text-tag-hackathon",
};

const chipIdle =
  "border-border text-text-lo hover:border-border-strong hover:text-text-mid";

function TypeChip({
  tag,
  active,
  onClick,
}: {
  tag: TypeFilter;
  active: boolean;
  onClick: () => void;
}) {
  const activeClass =
    tag === "All"
      ? "border-accent/50 bg-accent-muted text-text-hi"
      : typeActive[tag];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(chipBase, active ? activeClass : chipIdle)}
    >
      {tag}
    </button>
  );
}

function DomainChip({
  tag,
  active,
  onClick,
}: {
  tag: DomainFilter;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        chipBase,
        active ? "border-border-strong bg-bg-2 text-text-hi" : chipIdle,
      )}
    >
      {tag}
    </button>
  );
}

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const reduce = useReducedMotion();
  const [type, setType] = useState<TypeFilter>("All");
  const [domain, setDomain] = useState<DomainFilter>("All");

  // Only offer filters that exist in the current inventory.
  const typesPresent = useMemo(
    () => TYPE_TAGS.filter((t) => projects.some((p) => p.typeTag === t)),
    [projects],
  );
  const domainsPresent = useMemo(
    () => DOMAIN_TAGS.filter((d) => projects.some((p) => p.domainTags.includes(d))),
    [projects],
  );

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (type === "All" || p.typeTag === type) &&
          (domain === "All" || p.domainTags.includes(domain)),
      ),
    [projects, type, domain],
  );

  const reset = () => {
    setType("All");
    setDomain("All");
  };

  return (
    <div className="mt-14">
      <div className="flex flex-col gap-5 border-b border-border pb-8">
        <FilterRow label="Type">
          <TypeChip tag="All" active={type === "All"} onClick={() => setType("All")} />
          {typesPresent.map((t) => (
            <TypeChip key={t} tag={t} active={type === t} onClick={() => setType(t)} />
          ))}
        </FilterRow>

        <FilterRow label="Domain">
          <DomainChip
            tag="All"
            active={domain === "All"}
            onClick={() => setDomain("All")}
          />
          {domainsPresent.map((d) => (
            <DomainChip
              key={d}
              tag={d}
              active={domain === d}
              onClick={() => setDomain(d)}
            />
          ))}
        </FilterRow>
      </div>

      <p className="mt-6 font-mono text-mono text-text-lo">
        {filtered.length} {filtered.length === 1 ? "project" : "projects"}
        {(type !== "All" || domain !== "All") && (
          <>
            {" · "}
            <button
              type="button"
              onClick={reset}
              className="text-text-mid underline-offset-4 transition-colors hover:text-accent hover:underline"
            >
              clear filters
            </button>
          </>
        )}
      </p>

      {filtered.length === 0 ? (
        <div className="frost mt-10 rounded-xl border border-dashed border-border bg-bg-1/70 px-6 py-16 text-center">
          <p className="text-body text-text-mid">
            No projects match that combination yet.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-3 font-mono text-mono uppercase tracking-wider text-accent underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <motion.div
          layout={!reduce}
          className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((project) => (
              <motion.div
                key={project.slug}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                transition={{ duration: reduce ? 0 : 0.24, ease: "easeOut" }}
                className="h-full"
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-16 shrink-0 font-mono text-mono uppercase tracking-widest text-text-lo/70">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
