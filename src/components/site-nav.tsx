"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import { hasLinkedin, navLinks, social } from "@/content/site";

/*
 * Minimal top nav. Transparent over the hero; on scroll it settles onto a
 * blurred --bg-0 with a hairline border. The scroll state toggles a boolean and
 * CSS transitions the backdrop — no per-frame layout work. Home is the wordmark.
 * Conversion is GitHub + LinkedIn only; there is no resume link anywhere.
 */

const iconLink =
  "text-text-mid transition-colors hover:text-text-hi focus-visible:text-text-hi";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        scrolled
          ? "border-b border-border bg-bg-0/70 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap font-serif text-base tracking-tight text-text-hi transition-colors hover:text-accent sm:text-lg"
        >
          Vaibhav Wudaru
        </Link>

        <div className="flex items-center gap-4 sm:gap-7">
          <ul className="flex items-center gap-4 text-small text-text-mid sm:gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-text-hi focus-visible:text-text-hi"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href={social.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className={iconLink}
            >
              <GitHubIcon className="size-[1.15rem]" />
            </a>
            {hasLinkedin && (
              <a
                href={social.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className={iconLink}
              >
                <LinkedInIcon className="size-[1.15rem]" />
              </a>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
