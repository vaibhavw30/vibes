import Link from "next/link";
import { ArrowRight } from "lucide-react";

/*
 * Shared section header — mono eyebrow, serif title, optional inline CTA.
 * Keeps the home "scenes" on a consistent rhythm without numbered eyebrows
 * (avoided unless content is genuinely sequential — see the anti-template rule).
 */

export function SectionHeading({
  eyebrow,
  title,
  cta,
}: {
  eyebrow: string;
  title: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-mono uppercase tracking-widest text-text-lo">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-h2 font-serif text-text-hi">{title}</h2>
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="group inline-flex items-center gap-1.5 text-small text-text-mid transition-colors hover:text-accent"
        >
          {cta.label}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
}
