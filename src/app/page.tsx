import { Hero } from "@/components/home/hero";
import { LastWatched } from "@/components/home/last-watched";
import { StayingActiveLine } from "@/components/live/staying-active-line";
import { SelectedWork } from "@/components/home/selected-work";
import { ExperienceStrip } from "@/components/home/experience-strip";
import { BeyondCode } from "@/components/home/beyond-code";
import { getStravaWeek } from "@/lib/strava";

/*
 * Home — the scrolling narrative (Phase 2). Static content only; the signature
 * interactive moment (Phase 4) and live-data breadcrumbs (Phase 6) slot in later
 * without restructuring this composition. Nav + footer come from the root layout.
 * Two live breadcrumbs stack in the hero: last film watched + this week's activity.
 */
export default async function HomePage() {
  const week = await getStravaWeek();
  return (
    <main>
      <Hero
        breadcrumb={
          <>
            <LastWatched />
            <div className="mt-2">
              <StayingActiveLine week={week} />
            </div>
          </>
        }
      />
      <SelectedWork />
      <ExperienceStrip />
      <BeyondCode />
    </main>
  );
}
