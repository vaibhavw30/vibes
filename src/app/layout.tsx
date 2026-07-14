import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { fontVariables } from "@/lib/fonts";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vaibhavwudaru.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vaibhav Wudaru",
    template: "%s · Vaibhav Wudaru",
  },
  description:
    "Georgia Tech CS student building from noticed problems — software, machine learning, and quant.",
  openGraph: {
    type: "website",
    siteName: "Vaibhav Wudaru",
    url: siteUrl,
    title: "Vaibhav Wudaru",
    description:
      "Georgia Tech CS student building from noticed problems — software, machine learning, and quant.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaibhav Wudaru",
    description:
      "Georgia Tech CS student building from noticed problems — software, machine learning, and quant.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full`}>
      <body className="min-h-full antialiased">
        {/*
         * The painting — a fixed, faded, site-wide background (the "Daydream sky"
         * theme). Sits above the body's sky-gradient base and below all content;
         * frosted panels blur it behind cards. Opacity is the single tuning knob.
         * Calmed to 0.20 (was 0.45): because it's `fixed`+`bg-cover`, scrolled
         * content always sits over the painting's busy horizon band — at 0.45 the
         * park detail fought text everywhere, worst on the prose pages (about/now/
         * project detail) which have no frosted backing. The hero keeps its own
         * vivid 0.55 layer for the "wow", so this only calms the content backdrop;
         * home's frost cards still read fine. Tunable — 0.28ish for more presence.
         * ASSET: save the Higgsfield oil painting to `public/hero-park.jpg`; until
         * then the body sky-gradient shows through as a graceful fallback.
         */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-park.jpg')", opacity: 0.2 }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-bg-2 focus:px-4 focus:py-2 focus:text-text-hi"
        >
          Skip to content
        </a>
        <SmoothScroll>
          <SiteNav />
          <div id="main" className="flex min-h-dvh flex-col">
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </SmoothScroll>
        <Analytics />
      </body>
    </html>
  );
}
