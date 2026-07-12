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
