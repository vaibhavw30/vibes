import { experience } from "@/content/experience";
import type { Experience } from "@/content/schema";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, RevealItem, RevealStagger } from "@/components/reveal";

/*
 * Experience timeline (Home - Polished). Real roles down a single gradient rail,
 * each anchored by a frosted initials avatar tinted by role type (neutral intern,
 * gold founding, green research) — incoming roles get the filled-accent treatment
 * and an "Incoming" pill. Initials and tint are DERIVED from the existing content
 * (no schema change); copy stays Vaibhav's confirmed one-liners; timeframes render
 * only when set (TODO placeholders stay hidden, never guessed).
 */

/** DataMorph → DM, GTSF (…) → GT, EPIC Lab → EP, Trustworthy Robotics → TR. */
function initials(org: string): string {
  const head = org.split(/[\s(]/)[0];
  if (/^[A-Z]{2,}$/.test(head)) return head.slice(0, 2);
  const words = org
    .replace(/[^A-Za-z ]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/\s+/)
    .filter(Boolean);
  const a = words[0]?.[0] ?? "";
  const b = words[1]?.[0] ?? words[0]?.[1] ?? "";
  return (a + b).toUpperCase();
}

type Avatar = { border: string; background: string; color: string };

function avatarStyle(role: Experience): Avatar {
  if (role.status === "incoming")
    return {
      border: "1px solid rgba(42,103,166,.5)",
      background: "rgba(42,103,166,.1)",
      color: "#2a67a6",
    };
  switch (role.typeTag) {
    case "Founding":
      return {
        border: "1px solid rgba(138,100,16,.4)",
        background: "rgba(255,255,255,.72)",
        color: "#8a6410",
      };
    case "Research":
      return {
        border: "1px solid rgba(31,122,102,.4)",
        background: "rgba(255,255,255,.72)",
        color: "#1f7a66",
      };
    default:
      return {
        border: "1px solid rgba(27,39,53,.16)",
        background: "rgba(255,255,255,.72)",
        color: "#41505f",
      };
  }
}

function TimelineRow({ role }: { role: Experience }) {
  const showTimeframe = role.timeframe && !role.timeframe.startsWith("TODO");
  const av = avatarStyle(role);
  return (
    <div className="relative grid grid-cols-[48px_1fr] items-start gap-x-[22px] py-[18px]">
      <div
        aria-hidden="true"
        className="relative z-[1] flex h-[46px] w-[46px] items-center justify-center rounded-full font-mono text-[0.8rem] font-medium tracking-[0.04em] [backdrop-filter:blur(8px)]"
        style={av}
      >
        {initials(role.org)}
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h3 className="font-serif text-h3 text-text-hi">{role.org}</h3>
          {role.status === "incoming" && (
            <span className="inline-flex items-center rounded-full border border-accent/35 bg-accent-muted px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-accent">
              Incoming
            </span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-small font-medium text-text-mid">{role.role}</p>
          {showTimeframe && (
            <p className="font-mono text-mono uppercase tracking-wider text-text-lo">
              {role.timeframe}
            </p>
          )}
        </div>
        <p className="measure mt-2 text-small leading-relaxed text-text-mid">
          {role.oneLine}
        </p>
      </div>
    </div>
  );
}

export function ExperienceStrip() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-32">
      <Reveal>
        <SectionHeading eyebrow="Experience" title="Where I've been putting the work." />
      </Reveal>
      <div className="relative mt-12">
        {/* The rail: centered on the 46px avatars (left 23px), fading downward. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-4 left-[23px] top-4 w-0.5"
          style={{
            background:
              "linear-gradient(180deg, rgba(42,103,166,.28), rgba(42,103,166,.08))",
          }}
        />
        <RevealStagger>
          {experience.map((role) => (
            <RevealItem key={role.org}>
              <TimelineRow role={role} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
