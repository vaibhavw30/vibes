import { cn } from "@/lib/utils";
import type { DomainTag, TypeTag } from "@/content/schema";

/*
 * Tag pills (STYLE.md tag taxonomy). Visuals color-code off the ONE type tag;
 * domain tags stay neutral. Mono, uppercase, small — labels, not buttons.
 */

const typeStyle: Record<TypeTag, string> = {
  Internship: "text-tag-internship border-tag-internship/35 bg-tag-internship/10",
  Founding: "text-tag-founding border-tag-founding/35 bg-tag-founding/10",
  Research: "text-tag-research border-tag-research/35 bg-tag-research/10",
  Personal: "text-tag-personal border-tag-personal/35 bg-tag-personal/10",
  Hackathon: "text-tag-hackathon border-tag-hackathon/35 bg-tag-hackathon/10",
};

const pillBase =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-wider";

export function TypePill({ tag, className }: { tag: TypeTag; className?: string }) {
  return <span className={cn(pillBase, typeStyle[tag], className)}>{tag}</span>;
}

export function DomainPill({ tag, className }: { tag: DomainTag; className?: string }) {
  return (
    <span
      className={cn(
        pillBase,
        "border-border bg-bg-2/60 text-text-lo",
        className,
      )}
    >
      {tag}
    </span>
  );
}
