import type { Metadata } from "next";
import { InterestSubpage } from "@/components/about/interest-subpage";
import { ChessLive } from "@/components/about/chess-live";
import { getChessProfile } from "@/lib/chess";

export const metadata: Metadata = {
  title: "Chess",
  description: "Rating and recent games, pulled from Chess.com.",
};

export default async function ChessPage() {
  const profile = await getChessProfile(5);
  return (
    <InterestSubpage
      eyebrow="About · Chess"
      title="Parked around 1300."
      intro="I've been stuck near 1300 for a while and I'm stubborn about it. I keep playing anyway, mostly because losing a game I should have won is a very effective way to keep me up at night."
    >
      <ChessLive {...profile} />
    </InterestSubpage>
  );
}
