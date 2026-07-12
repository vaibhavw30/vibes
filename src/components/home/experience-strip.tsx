import { experience } from "@/content/experience";
import type { Experience } from "@/content/schema";
import { SectionHeading } from "@/components/section-heading";
import { Reveal, RevealItem, RevealStagger } from "@/components/reveal";
import { cn } from "@/lib/utils";

/*
 * Experience strip (Model 1) — real roles, kept sharp and professional and
 * distinct from the Projects grid. Copy is Vaibhav's confirmed one-liners; no
 * fabricated dates (TODO timeframes are simply omitted here rather than guessed).
 */

function StatusBadge({ status }: { status: Experience["status"] }) {
  if (status === "past") return null;
  const label = status === "incoming" ? "Incoming" : "Current";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider",
        status === "incoming"
          ? "border-accent/35 bg-accent-muted text-accent"
          : "border-data-pos/35 bg-data-pos/10 text-data-pos",
      )}
    >
      {label}
    </span>
  );
}

function Row({ role }: { role: Experience }) {
  const showTimeframe = role.timeframe && !role.timeframe.startsWith("TODO");
  return (
    <div className="border-t border-border py-6 first:border-t-0 sm:grid sm:grid-cols-[1fr_1.4fr] sm:gap-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h3 className="font-serif text-h3 text-text-hi">{role.org}</h3>
        <StatusBadge status={role.status} />
      </div>
      <div className="mt-2 sm:mt-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
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
      <RevealStagger className="mt-12">
        {experience.map((role) => (
          <RevealItem key={role.org}>
            <Row role={role} />
          </RevealItem>
        ))}
      </RevealStagger>
    </section>
  );
}
