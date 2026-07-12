import type { Metadata } from "next";
import { PageStub } from "@/components/page-stub";

export const metadata: Metadata = {
  title: "Now",
  description: "What Vaibhav is building, reading, and thinking about right now.",
};

export default function NowPage() {
  return (
    <PageStub
      eyebrow="Now"
      title="What I'm on right now."
      note="A living snapshot (the 'now page' convention) — current focus, hand-written and low-maintenance, with a little live data (chess, now-playing). Built in Phase 6."
    />
  );
}
