import type { Metadata } from "next";
import { InterestSubpage } from "@/components/about/interest-subpage";
import { StayingActivePanel } from "@/components/about/staying-active-panel";
import { getActivityWeek } from "@/lib/activity";

export const metadata: Metadata = {
  title: "Staying active",
  description: "This week's training, logged on Fitbit.",
};

export default async function TrainingPage() {
  const week = await getActivityWeek();
  return (
    <InterestSubpage
      eyebrow="About · Staying active"
      title="Trying to make it a habit."
      intro="I'm fine at the gym once I'm there and bad at going. Logging it keeps me honest. Here's the week, straight from Fitbit."
    >
      <StayingActivePanel {...week} />
    </InterestSubpage>
  );
}
