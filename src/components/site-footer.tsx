import Link from "next/link";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { hasLinkedin, navLinks, social } from "@/content/site";

/*
 * Footer. Conversion is GitHub + LinkedIn only — no resume, no contact form,
 * no email requirement (hard constraint).
 */

const iconLink =
  "text-text-mid transition-colors hover:text-text-hi focus-visible:text-text-hi";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-14 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-sm">
          <Link
            href="/"
            className="font-serif text-h3 text-text-hi transition-colors hover:text-accent"
          >
            Vaibhav Wudaru
          </Link>
          <p className="mt-2 text-small text-text-lo">
            Building from noticed problems — software, machine learning, and
            quant. Between the Bay Area and Atlanta.
          </p>
        </div>

        <div className="flex flex-col gap-5 sm:items-end">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-small text-text-mid">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-text-hi"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            <a
              href={social.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className={iconLink}
            >
              <GitHubIcon className="size-5" />
            </a>
            {hasLinkedin && (
              <a
                href={social.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className={iconLink}
              >
                <LinkedInIcon className="size-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
