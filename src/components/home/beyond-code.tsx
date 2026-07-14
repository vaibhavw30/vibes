import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { InterestPanel } from "@/components/home/interest-panel";

/*
 * "Beyond code" — a single frosted carousel panel (see interest-panel.tsx) that
 * advances through the four facets of the person, one at a time, each with its
 * own color theme and line-art illustration. It replaces the earlier cloud
 * cards. Every value shown is a real, confirmed fact (details in interest-panel).
 * Real routes are preserved (/about/*).
 */
export function BeyondCode() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-32">
      <Reveal>
        <SectionHeading
          eyebrow="Beyond code"
          title="The rest of it."
          cta={{ href: "/about", label: "About me" }}
        />
      </Reveal>
      <InterestPanel />
    </section>
  );
}
