import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { NowPlayingLine } from "@/components/now/now-playing";
import { getNowPlaying } from "@/lib/spotify";
import { getChessProfile } from "@/lib/chess";

export const metadata: Metadata = {
  title: "Now",
  description: "What Vaibhav is building, reading, and thinking about right now.",
};

const RESULT_WORD = { W: "won", L: "lost", D: "drew" } as const;

/*
 * The "now page" (nownownow.com convention): a living, low-maintenance snapshot of
 * what I'm on right now. A small live strip (Spotify listening + Chess) sits above
 * a short hand-written focus section. Server component — both feeds fail gracefully
 * to an honest snapshot, so the page is never broken/empty.
 *
 * TODO(vaibhav): the focus section is drafted from confirmed facts with blanks
 * marked below — edit the words and fill the TODOs before this ships.
 */
export default async function NowPage() {
  const [np, chess] = await Promise.all([getNowPlaying(), getChessProfile(1)]);
  const lastGame = chess.recentGames[0];
  const isSnapshot = !np.live || !chess.live;

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

      {/* Live strip */}
      <Reveal>
        <div className="frost mt-14 rounded-2xl border border-border px-6 py-6">
          <div className="flex flex-col gap-4">
            <NowPlayingLine np={np} />

            {chess.ratings.blitz.current != null && (
              <p className="font-mono text-mono uppercase tracking-widest text-text-lo">
                <span className="text-text-lo/80">Chess · </span>
                <a
                  href="https://www.chess.com/member/nemoblob"
                  target="_blank"
                  rel="noreferrer"
                  className="text-text-mid underline-offset-4 transition-colors hover:text-accent"
                >
                  {chess.ratings.blitz.current} blitz
                  {lastGame && (
                    <span className="text-text-lo">
                      {" "}
                      — {RESULT_WORD[lastGame.result]} the last one vs{" "}
                      {lastGame.opponent}
                    </span>
                  )}
                </a>
              </p>
            )}
          </div>

          {isSnapshot && (
            <p className="mt-5 border-t border-border pt-4 font-mono text-[0.68rem] uppercase tracking-wider text-text-lo/70">
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
              <Todo>
                what you&rsquo;re actually spending this stretch on — an
                internship, a project, a class? I won&rsquo;t guess; fill this in.
              </Todo>
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
