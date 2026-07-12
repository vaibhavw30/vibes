import type { Metadata } from "next";
import { ComingLive, InterestSubpage } from "@/components/about/interest-subpage";

export const metadata: Metadata = {
  title: "Chess",
  description: "Rating and recent games, pulled from Chess.com.",
};

export default function ChessPage() {
  return (
    <InterestSubpage
      eyebrow="About · Chess"
      title="Parked around 1300."
      intro="I've been stuck near 1300 for a while and I'm stubborn about it. I keep playing anyway, mostly because losing a game I should have won is a very effective way to keep me up at night."
    >
      <ComingLive note="My live rating and a few recent games land here, straight from the Chess.com API — including the losses, which feels only fair." />
    </InterestSubpage>
  );
}
