import type { Metadata, Viewport } from "next";
import { fraunces, interTight, jetbrainsMono } from "@/lib/fonts";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aweinbox.example";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Awe Inbox",
    template: "%s — Awe Inbox",
  },
  description:
    "Once a day, one planetary event chosen for its grandeur, not its threat. Drawn from NASA EONET and MODIS imagery.",
  applicationName: "Awe Inbox",
  authors: [{ name: "Awe Inbox" }],
  keywords: [
    "natural events",
    "NASA EONET",
    "satellite imagery",
    "awe",
    "Earth observation",
  ],
  openGraph: {
    title: "Awe Inbox",
    description:
      "Once a day, one planetary event chosen for its grandeur, not its threat.",
    type: "website",
    siteName: "Awe Inbox",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Awe Inbox",
    description:
      "Once a day, one planetary event chosen for its grandeur, not its threat.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://gibs.earthdata.nasa.gov" />
        <link rel="preconnect" href="https://eonet.gsfc.nasa.gov" />
        <link rel="dns-prefetch" href="https://gibs.earthdata.nasa.gov" />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
