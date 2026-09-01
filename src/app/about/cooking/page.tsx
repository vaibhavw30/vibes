import type { Metadata } from "next";
import { ComingLive, InterestSubpage } from "@/components/about/interest-subpage";

export const metadata: Metadata = {
  title: "Cooking",
  description: "Cooking with whole ingredients, and the garden and beehives it turned into.",
};

export default function CookingPage() {
  return (
    <InterestSubpage
      eyebrow="About · Kitchen"
      title="Made from whole ingredients."
      intro="Cooking with whole ingredients started the chain: a garden, then beehives, then a farmers' market stall. This is the food part."
    >
      <ComingLive note="A gallery of things I've actually made goes here: my own photos, not styled. It fills in as I cook." />
    </InterestSubpage>
  );
}
