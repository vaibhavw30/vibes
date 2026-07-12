import { featuredProjects } from "@/content/projects";
import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, RevealItem, RevealStagger } from "@/components/reveal";

/*
 * Home "selected work" teaser — the featured projects, each with its one-line
 * "why". All four featured whys are confirmed (Vaibhav's own words), so no draft
 * flags surface here. Full grid + filtering is Phase 3.
 */

export function SelectedWork() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-32">
      <Reveal>
        <SectionHeading
          eyebrow="Selected work"
          title="Things I built because I noticed something."
          cta={{ href: "/projects", label: "All projects" }}
        />
      </Reveal>

      <RevealStagger className="mt-12 grid gap-5 sm:grid-cols-2">
        {featuredProjects.map((project) => (
          <RevealItem key={project.slug} className="h-full">
            <ProjectCard project={project} />
          </RevealItem>
        ))}
      </RevealStagger>
    </section>
  );
}
