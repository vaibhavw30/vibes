import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock, Play } from "lucide-react";
import { projects, getProject } from "@/content/projects";
import type { Project } from "@/content/schema";
import { GitHubIcon } from "@/components/icons";
import { DomainPill, TypePill } from "@/components/tag-pill";
import { Reveal } from "@/components/reveal";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.oneLiner,
  };
}

/** Hide any field still holding a TODO placeholder — never guess, never leak. */
function clean(value: string | null): string | null {
  if (!value || value.startsWith("TODO")) return null;
  return value;
}

const statusLabel: Record<Project["status"], string> = {
  shipped: "Shipped",
  "in-progress": "In progress",
  "coming-soon": "Coming soon",
};

function StatusBadge({ status }: { status: Project["status"] }) {
  const dot =
    status === "shipped"
      ? "bg-data-pos"
      : status === "in-progress"
        ? "bg-accent"
        : "bg-text-lo";
  return (
    <span className="inline-flex items-center gap-2 font-mono text-mono uppercase tracking-wider text-text-lo">
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {statusLabel[status]}
    </span>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const comingSoon = project.status === "coming-soon";
  const role = clean(project.role);
  const timeframe = clean(project.timeframe);
  const team = clean(project.team);
  const meta = [role, timeframe, team].filter(Boolean) as string[];

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-28 pt-32">
      <Link
        href="/projects"
        className="group inline-flex items-center gap-1.5 font-mono text-mono uppercase tracking-wider text-text-lo transition-colors hover:text-text-hi"
      >
        <ArrowLeft
          className="size-3.5 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          aria-hidden="true"
        />
        All projects
      </Link>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <TypePill tag={project.typeTag} />
            <StatusBadge status={project.status} />
          </div>

          <h1 className="mt-5 text-h1 font-serif text-text-hi">{project.title}</h1>

          <p className="measure mt-4 text-body leading-relaxed text-text-mid">
            {project.oneLiner}
          </p>

          {meta.length > 0 && (
            <p className="mt-5 font-mono text-mono text-text-lo">
              {meta.join("  ·  ")}
            </p>
          )}

          {(clean(project.repoUrl) || (comingSoon && project.demoUrl)) && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {clean(project.repoUrl) && (
                <a
                  href={project.repoUrl!}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-small text-text-mid transition-colors hover:border-border-strong hover:text-text-hi"
                >
                  <GitHubIcon className="size-4" />
                  Source
                </a>
              )}
              {comingSoon && project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent-muted px-4 py-1.5 text-small text-text-hi transition-colors hover:border-accent/70"
                >
                  Visit boxit.best
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    aria-hidden="true"
                  />
                </a>
              )}
            </div>
          )}
      </header>

      {/* Demo / tease slot */}
      <Reveal>
        <div className="mt-14">
          {comingSoon ? (
            <ComingSoonTease demoUrl={project.demoUrl} />
          ) : (
            <DemoPlaceholder />
          )}
        </div>
      </Reveal>

      {/* The why — the whole point of the page */}
      <Reveal>
        <section className="mt-16">
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-mono uppercase tracking-widest text-text-lo">
              Why I built it
            </h2>
            {project.whyStatus === "draft" && (
              <span
                title="Drafted from the repo — pending Vaibhav's review"
                className="font-mono text-[0.62rem] uppercase tracking-wider text-text-lo/70"
              >
                draft
              </span>
            )}
          </div>
          <p className="measure mt-4 font-serif text-h3 italic leading-relaxed text-text-mid">
            {project.whyFull}
          </p>
        </section>
      </Reveal>

      {project.metrics.length > 0 && (
        <Reveal>
          <section className="mt-16">
            <h2 className="font-mono text-mono uppercase tracking-widest text-text-lo">
              Results
            </h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {project.metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border border-border bg-bg-1 px-5 py-4"
                >
                  <dt className="font-mono text-mono uppercase tracking-wider text-text-lo">
                    {m.label}
                  </dt>
                  <dd className="mt-2 font-serif text-h3 text-data-pos">
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </Reveal>
      )}

      {project.stack.length > 0 && (
        <Reveal>
          <section className="mt-16">
            <h2 className="font-mono text-mono uppercase tracking-widest text-text-lo">
              Stack
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-border bg-bg-1 px-3 py-1 font-mono text-[0.72rem] text-text-mid"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </section>
        </Reveal>
      )}

      <Reveal>
        <section className="mt-16 border-t border-border pt-8">
          <div className="flex flex-wrap items-center gap-2">
            {project.domainTags.map((tag) => (
              <DomainPill key={tag} tag={tag} />
            ))}
          </div>
          <Link
            href="/projects"
            className="group mt-8 inline-flex items-center gap-1.5 text-small text-text-mid transition-colors hover:text-accent"
          >
            <ArrowLeft
              className="size-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              aria-hidden="true"
            />
            Back to all projects
          </Link>
        </section>
      </Reveal>
    </main>
  );
}

/* Placeholder for a demo walkthrough — no videos recorded yet (Phase 6). */
function DemoPlaceholder() {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg-1 text-center">
      <Play className="size-7 text-text-lo" aria-hidden="true" />
      <p className="mt-3 font-mono text-mono uppercase tracking-wider text-text-lo">
        Demo walkthrough coming soon
      </p>
    </div>
  );
}

/*
 * BoxIt's redacted tease. It is a private product in beta — the repo stays hidden
 * (repoUrl is null and never rendered) and nothing here exposes internals; the only
 * outward door is boxit.best.
 */
function ComingSoonTease({ demoUrl }: { demoUrl: string | null }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-bg-1">
      {/* redacted-lines backdrop — purely decorative, no real content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-3 px-8 opacity-[0.06]"
      >
        {[92, 78, 85, 64, 88, 72].map((w, i) => (
          <span
            key={i}
            className="block h-3 rounded-full bg-text-hi"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>

      <div className="relative flex aspect-video w-full flex-col items-center justify-center px-6 text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-full border border-border-strong bg-bg-2">
          <Lock className="size-5 text-text-mid" aria-hidden="true" />
        </span>
        <p className="mt-4 font-mono text-mono uppercase tracking-widest text-text-lo">
          In private beta
        </p>
        <p className="measure mt-2 text-small text-text-mid">
          The build is under wraps for now. The live product lives at boxit.best.
        </p>
        {demoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noreferrer"
            className="group mt-5 inline-flex items-center gap-1.5 text-small text-accent transition-colors hover:text-text-hi"
          >
            boxit.best
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              aria-hidden="true"
            />
          </a>
        )}
      </div>
    </div>
  );
}
