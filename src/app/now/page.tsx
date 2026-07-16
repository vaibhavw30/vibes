import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import {
  SpotifyCard,
  ChessCard,
  TrainingCard,
} from "@/components/now/live-cards";
import { getNowPlaying } from "@/lib/spotify";
import { getChessProfile } from "@/lib/chess";
import { getActivityWeek } from "@/lib/activity";

export const metadata: Metadata = {
  title: "Now",
  description: "What Vaibhav is building, reading, and thinking about right now.",
};

/*
 * The "now page" (nownownow.com convention): a living, low-maintenance snapshot of
 * what I'm on right now. A themed live strip (Spotify + Chess + Staying active,
 * one roomy card each) sits above a short hand-written focus section. Server
 * component — every feed fails gracefully to an honest snapshot, so the page is
 * never broken/empty.
 *
 * TODO(vaibhav): the focus section is drafted from confirmed facts with blanks
 * marked below — edit the words and fill the TODOs before this ships.
 */
export default async function NowPage() {
  const [np, chess, week] = await Promise.all([
    getNowPlaying(),
    getChessProfile(5),
    getActivityWeek(),
  ]);
  const isSnapshot = !np.live || !chess.live || !week.live;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-28 pt-32">
      <header>
        <p className="font-mono text-mono uppercase tracking-widest text-text-lo">
          Now · updated July 2026
        </p>
        <h1 className="mt-4 text-h1 font-serif text-text-hi">
          What I&rsquo;m on right now.
        </h1>
        <p className="measure mt-5 text-body leading-relaxed text-text-mid">
          A living snapshot in the{" "}
          <a
            href="https://nownownow.com/about"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline-offset-4 hover:underline"
          >
            now-page
          </a>{" "}
          tradition — current focus, hand-written and low-maintenance, with a
          little live data underneath.
        </p>
      </header>

      {/* Live strip — one themed card per source */}
      <Reveal>
        <div className="mt-14 flex flex-col gap-3">
          <SpotifyCard np={np} />
          <ChessCard chess={chess} />
          <TrainingCard week={week} />

          {isSnapshot && (
            <p className="mt-2 font-mono text-[0.68rem] uppercase tracking-wider text-text-lo/70">
              Showing a recent snapshot — live feed catches up shortly.
            </p>
          )}
        </div>
      </Reveal>

      {/* Current focus — hand-written */}
      <Reveal>
        <section className="mt-16">
          <h2 className="font-mono text-mono uppercase tracking-widest text-text-lo">
            Current focus
          </h2>
          <dl className="measure mt-6 space-y-6">
            <FocusRow label="Building">
              This site (vaibhavwudaru.com), in the open — the thing you&rsquo;re
              reading.
            </FocusRow>
            <FocusRow label="Next">
              Heading into research at Georgia Tech&rsquo;s EPIC lab and a quant
              seat at GTSF.{" "}
              <Todo>confirm timing and how you want each phrased.</Todo>
            </FocusRow>
            <FocusRow label="Right now">
              Interning at DataMorph for the summer. My run as founding engineer
              at OddsAreOn wrapped up in May.
            </FocusRow>
            <FocusRow label="Off-screen">
              Chess (stuck around 1300 and stubborn about it), cooking out of the
              garden, and piano.{" "}
              <Todo>trim to what&rsquo;s actually true this month.</Todo>
            </FocusRow>
          </dl>
        </section>
      </Reveal>
    </main>
  );
}

function FocusRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-1 sm:grid-cols-[7rem_1fr]">
      <dt className="pt-0.5 font-mono text-mono uppercase tracking-wider text-text-lo">
        {label}
      </dt>
      <dd className="text-body leading-relaxed text-text-mid">{children}</dd>
    </div>
  );
}

/** Visible draft marker — a clearly-flagged blank for Vaibhav to fill, never a
 *  fabricated fact. Intentionally conspicuous so it can't ship unnoticed. */
function Todo({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded border border-dashed px-1.5 py-0.5 font-mono text-[0.7rem] uppercase tracking-wider"
      style={{ color: "#8a6410", borderColor: "#8a641055" }}
    >
      TODO(vaibhav): {children}
    </span>
  );
}
