import { Hero } from "@/components/home/hero";
import { LastWatched } from "@/components/home/last-watched";
import { SelectedWork } from "@/components/home/selected-work";
import { ExperienceStrip } from "@/components/home/experience-strip";
import { BeyondCode } from "@/components/home/beyond-code";

/*
 * Home — the scrolling narrative (Phase 2). Static content only; the signature
 * interactive moment (Phase 4) and live-data breadcrumbs (Phase 6) slot in later
 * without restructuring this composition. Nav + footer come from the root layout.
 */
export default function HomePage() {
  return (
    <main>
      <Hero breadcrumb={<LastWatched />} />
      <SelectedWork />
      <ExperienceStrip />
      <BeyondCode />
    </main>
  );
}
