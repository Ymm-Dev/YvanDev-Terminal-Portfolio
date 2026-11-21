import type { Metadata, Viewport } from "next";
import { Fira_Code, Inter } from "next/font/google";
import { profile } from "@/data/profile";
import { site } from "@/data/site";
import {
  THEME_BACKGROUNDS,
  THEME_NAMES,
  THEME_STORAGE_KEY,
} from "@/lib/theme";
import "./globals.css";

const fira = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fira",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: THEME_BACKGROUNDS.midnight,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: profile.contact.links[0]?.href }],
  keywords: [
    "Yvan Maribbay",
    "developer portfolio",
    "full-stack developer",
    "C#",
    "TypeScript",
    "React",
    "Next.js",
  ],
  openGraph: {
    type: "website",
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: site.name,
    images: [{ url: "/yvan/logo.png", width: 2000, height: 2000, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: ["/yvan/logo.png"],
  },
  robots: { index: true, follow: true },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  description: profile.summary,
  email: `mailto:${profile.contact.email}`,
  url: site.url,
  sameAs: profile.contact.links.map((link) => link.href),
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: profile.education[0]?.institution,
  },
  knowsAbout: profile.skills.flatMap((group) => group.items),
};

// Runs before the shell renders so a saved theme never flashes Midnight first.
const themeScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var v=window.localStorage.getItem(k);var names=${JSON.stringify(THEME_NAMES)};var colors=${JSON.stringify(THEME_BACKGROUNDS)};if(v&&names.indexOf(v)>-1&&v!=="midnight"){document.documentElement.dataset.theme=v}if(v&&colors[v]){var m=document.querySelector('meta[name="theme-color"]');if(m){m.setAttribute("content",colors[v])}}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fira.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="font-mono">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <a
          href="#terminal-input"
          className="screen-only sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:border focus:border-green focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:text-ink"
        >
          Skip to terminal input
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
