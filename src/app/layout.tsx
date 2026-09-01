import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import { RouteTransition } from "@/modules";
import { site } from "@/lib/site";
import { publicEnv } from "@/lib/env";
import "@/styles/globals.css";

/**
 * Fonts are self-hosted by `next/font`: the woff2 files are downloaded at build
 * time and served from our own origin. Nothing is fetched from Google at
 * runtime, which is what keeps SECURITY.md §8 (no third-party client requests)
 * true and leaves room for a strict CSP with no font-src exception.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: `${site.name} — AI agents for sales, service & ops`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    title: `${site.name} — AI agents for sales, service & ops`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  // Paper is the only background the site has; there is no dark variant.
  themeColor: "#f6f5f1",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/*
         * Above every route, not inside one: the fold has to still be on screen
         * while the outgoing page unmounts and the incoming one renders. Mounted
         * in a route's own tree it would be torn down mid-transition.
         */}
        <RouteTransition>{children}</RouteTransition>
      </body>
    </html>
  );
}
