/*
 * Per-project data-viz strip (Home - Polished). Each featured card carries a
 * small, bespoke visualization that gestures at what the project actually is —
 * not decoration for its own sake. Only the four featured slugs have a viz;
 * everything else returns null, so the /projects grid cards stay unchanged.
 *
 *   boxit           → redacted grid of blurred boxes + "private repo" lock
 *   tariff-modelling→ two sector lines diverging at an "Apr 2" event marker
 *   equitable       → a small food-bank network graph
 *   benchwarmer     → a rising backtest equity curve with an end marker
 *
 * The line vizzes trace themselves in once via `.viz-draw` (globals.css), which
 * collapses to a static drawn state under reduced motion. Purely presentational:
 * aria-hidden, no interactivity, safe to render server-side.
 */

/** Slugs that carry a bespoke viz — lets the card pin its layout correctly. */
export const VIZ_SLUGS = new Set([
  "boxit",
  "tariff-modelling",
  "equitable",
  "benchwarmer",
]);

const BOX =
  "relative mt-auto h-[70px] overflow-hidden rounded-[9px]";

function VizLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute left-[9px] top-[7px] z-[2] rounded-[3px] bg-white/60 px-[5px] py-px font-mono text-[0.55rem] uppercase tracking-[0.08em] text-text-lo">
      {children}
    </span>
  );
}

export function ProjectViz({ slug }: { slug: string }) {
  switch (slug) {
    case "boxit":
      return (
        <div
          className={BOX}
          style={{
            opacity: 0.9,
            border: "1px solid rgba(90,73,184,.18)",
            background: "rgba(90,73,184,.06)",
          }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 opacity-60 [filter:blur(2.5px)]">
            <svg
              viewBox="0 0 260 70"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
            >
              <g fill="#5a49b8">
                <rect x="10" y="9" width="34" height="16" rx="3" fillOpacity=".28" />
                <rect x="52" y="9" width="34" height="16" rx="3" fillOpacity=".10" />
                <rect x="94" y="9" width="34" height="16" rx="3" fillOpacity=".32" />
                <rect x="136" y="9" width="34" height="16" rx="3" fillOpacity=".12" />
                <rect x="178" y="9" width="34" height="16" rx="3" fillOpacity=".22" />
                <rect x="220" y="9" width="30" height="16" rx="3" fillOpacity=".10" />
                <rect x="10" y="30" width="34" height="16" rx="3" fillOpacity=".12" />
                <rect x="52" y="30" width="34" height="16" rx="3" fillOpacity=".30" />
                <rect x="94" y="30" width="34" height="16" rx="3" fillOpacity=".14" />
                <rect x="136" y="30" width="34" height="16" rx="3" fillOpacity=".26" />
                <rect x="178" y="30" width="34" height="16" rx="3" fillOpacity=".12" />
                <rect x="220" y="30" width="30" height="16" rx="3" fillOpacity=".24" />
                <rect x="10" y="51" width="34" height="14" rx="3" fillOpacity=".24" />
                <rect x="52" y="51" width="34" height="14" rx="3" fillOpacity=".12" />
                <rect x="94" y="51" width="34" height="14" rx="3" fillOpacity=".28" />
                <rect x="136" y="51" width="34" height="14" rx="3" fillOpacity=".12" />
                <rect x="178" y="51" width="34" height="14" rx="3" fillOpacity=".20" />
                <rect x="220" y="51" width="30" height="14" rx="3" fillOpacity=".12" />
              </g>
            </svg>
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center gap-[7px]"
            style={{ color: "#5a49b8" }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em]">
              Redacted · Private repo
            </span>
          </div>
        </div>
      );

    case "tariff-modelling":
      return (
        <div
          className={BOX}
          style={{
            opacity: 0.82,
            border: "1px solid rgba(42,103,166,.14)",
            background: "rgba(42,103,166,.04)",
          }}
          aria-hidden="true"
        >
          <VizLabel>Sector divergence</VizLabel>
          <svg
            viewBox="0 0 260 70"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
          >
            <line
              x1="104"
              y1="6"
              x2="104"
              y2="64"
              stroke="#64717f"
              strokeWidth="1"
              strokeDasharray="3 4"
              opacity=".55"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M104,42 L150,34 L196,26 L242,16 L252,14 L252,68 L104,68 Z"
              fill="#e0a63c"
              fillOpacity=".08"
            />
            <path
              d="M104,42 L150,50 L196,55 L242,58 L252,59 L252,68 L104,68 Z"
              fill="#b06a6a"
              fillOpacity=".06"
            />
            <polyline
              className="viz-draw"
              points="12,44 52,43 104,42 150,34 196,26 242,16 252,14"
              fill="none"
              stroke="#c8891f"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              className="viz-draw"
              points="12,44 52,43 104,42 150,50 196,55 242,58 252,59"
              fill="none"
              stroke="#b06a6a"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span className="absolute bottom-[6px] left-[40%] z-[2] font-mono text-[0.5rem] uppercase tracking-[0.06em] text-text-lo">
            Apr 2
          </span>
        </div>
      );

    case "equitable":
      return (
        <div
          className={BOX}
          style={{
            opacity: 0.82,
            border: "1px solid rgba(31,122,102,.16)",
            background: "rgba(31,122,102,.04)",
          }}
          aria-hidden="true"
        >
          <VizLabel>Food-bank network</VizLabel>
          <svg
            viewBox="0 0 260 70"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
          >
            <g
              stroke="#1f7a66"
              strokeWidth="1.1"
              strokeOpacity=".5"
              fill="none"
              vectorEffect="non-scaling-stroke"
            >
              <line className="viz-draw" x1="58" y1="35" x2="24" y2="16" />
              <line className="viz-draw" x1="58" y1="35" x2="26" y2="55" />
              <line className="viz-draw" x1="58" y1="35" x2="106" y2="22" />
              <line className="viz-draw" x1="106" y1="22" x2="120" y2="52" />
              <line className="viz-draw" x1="106" y1="22" x2="168" y2="16" />
              <line className="viz-draw" x1="168" y1="16" x2="200" y2="18" />
              <line className="viz-draw" x1="168" y1="16" x2="216" y2="30" />
              <line className="viz-draw" x1="216" y1="30" x2="232" y2="56" />
              <line className="viz-draw" x1="120" y1="52" x2="150" y2="46" />
            </g>
            <g fill="#1f7a66">
              <circle cx="58" cy="35" r="3.6" fillOpacity=".9" />
              <circle cx="216" cy="30" r="3.2" fillOpacity=".85" />
              <circle cx="24" cy="16" r="2.4" fillOpacity=".7" />
              <circle cx="26" cy="55" r="2.4" fillOpacity=".7" />
              <circle cx="106" cy="22" r="2.7" fillOpacity=".8" />
              <circle cx="120" cy="52" r="2.4" fillOpacity=".7" />
              <circle cx="168" cy="16" r="2.7" fillOpacity=".8" />
              <circle cx="150" cy="46" r="2.2" fillOpacity=".65" />
              <circle cx="200" cy="18" r="2.3" fillOpacity=".7" />
              <circle cx="232" cy="56" r="2.3" fillOpacity=".7" />
            </g>
          </svg>
        </div>
      );

    case "benchwarmer":
      return (
        <div
          className={BOX}
          style={{
            opacity: 0.82,
            border: "1px solid rgba(42,103,166,.14)",
            background: "rgba(42,103,166,.04)",
          }}
          aria-hidden="true"
        >
          <VizLabel>Backtest · equity</VizLabel>
          <svg
            viewBox="0 0 260 70"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
          >
            <path
              d="M12,58 34,54 56,56 78,48 100,50 122,40 144,43 166,32 188,34 210,24 232,20 252,13 L252,68 L12,68 Z"
              fill="#2a67a6"
              fillOpacity=".07"
            />
            <polyline
              className="viz-draw"
              points="12,58 34,54 56,56 78,48 100,50 122,40 144,43 166,32 188,34 210,24 232,20 252,13"
              fill="none"
              stroke="#2a67a6"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span
            className="absolute right-[7px] top-[11px] h-[6px] w-[6px] rounded-full"
            style={{
              background: "#2a67a6",
              boxShadow: "0 0 0 3px rgba(42,103,166,.16)",
            }}
          />
        </div>
      );

    default:
      return null;
  }
}
