import type { Metadata } from "next";
import { ComingLive, InterestSubpage } from "@/components/about/interest-subpage";

export const metadata: Metadata = {
  title: "Movies",
  description: "Everything I watch, logged on Letterboxd.",
};

export default function MoviesPage() {
  return (
    <InterestSubpage
      eyebrow="About · Film"
      title="Everything I watch."
      intro="I log every film on Letterboxd. It's the closest thing I keep to a diary, and I'm not above rating something five stars for reasons I can't defend."
    >
      <ComingLive
        note="The poster grid pulls straight from my Letterboxd feed once it's wired up — recent watches, ratings, and the occasional note. Until then, this is the placeholder holding its spot."
        link={{ href: "https://letterboxd.com/vaibzz/", label: "@vaibzz on Letterboxd" }}
      />
    </InterestSubpage>
  );
}
