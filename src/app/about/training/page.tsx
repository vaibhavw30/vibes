import type { Metadata } from "next";
import { InterestSubpage } from "@/components/about/interest-subpage";
import { StayingActivePanel } from "@/components/about/staying-active-panel";
import { getStravaWeek } from "@/lib/strava";

export const metadata: Metadata = {
  title: "Staying active",
  description: "This week's training, logged on Strava.",
};

export default async function TrainingPage() {
  const week = await getStravaWeek();
  return (
    <InterestSubpage
      eyebrow="About · Staying active"
      title="Trying to make it a habit."
      intro="I'm bad at the gym in the way most people are bad at the gym: fine when I go, terrible at going. Logging it keeps me honest, so here's the week — sessions and time, straight from Strava."
    >
      <StayingActivePanel {...week} />
    </InterestSubpage>
  );
}
