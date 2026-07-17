import type { Metadata } from "next";
import { projects } from "@/content/projects";
import { ProjectsGrid } from "@/components/projects/projects-grid";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "A filterable grid of things Vaibhav built from problems he noticed, with the why behind each.",
};

export default function ProjectsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-28 pt-32">
      <header className="max-w-3xl">
        <p className="font-mono text-mono uppercase tracking-widest text-text-lo">
          Projects
        </p>
        <h1 className="mt-4 text-h1 font-serif text-text-hi">
          Things I built from problems I noticed.
        </h1>
        <p className="measure mt-5 text-body text-text-mid">
          Most of these started the same way: something bugged me enough to build
          the fix. Filter by what kind of work it was, or by the domain it lives in.
        </p>
      </header>

      <ProjectsGrid projects={projects} />
    </main>
  );
}
