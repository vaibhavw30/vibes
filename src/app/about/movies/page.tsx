import type { Metadata } from "next";
import { InterestSubpage } from "@/components/about/interest-subpage";
import { MoviesGrid } from "@/components/about/movies-grid";
import { getRecentFilms } from "@/lib/letterboxd";

export const metadata: Metadata = {
  title: "Movies",
  description: "Everything I watch, logged on Letterboxd.",
};

export default async function MoviesPage() {
  const { films, live } = await getRecentFilms(12);
  return (
    <InterestSubpage
      eyebrow="About · Film"
      title="Everything I watch."
      intro="I log every film on Letterboxd. It's the closest thing I keep to a diary, and I'm not above rating something five stars for reasons I can't defend."
    >
      <MoviesGrid films={films} live={live} />
    </InterestSubpage>
  );
}
