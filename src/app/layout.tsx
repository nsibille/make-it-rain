import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Mono (labels, codes, méta). Sans = Helvetica Neue = system stack, rien à charger.
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Cadrage Studio",
    template: "%s · Cadrage Studio",
  },
  description:
    "Outil de cadrage projet pour PMO : du 6-Pack aux arborescences PBS / WBS / OBS et à la gouvernance, partageables par rôles.",
  applicationName: "Cadrage Studio",
  openGraph: {
    title: "Cadrage Studio",
    description:
      "Du 6-Pack aux arborescences PBS / WBS / OBS et à la gouvernance.",
    type: "website",
    locale: "fr_FR",
    siteName: "Cadrage Studio",
  },
  robots: { index: false, follow: false },
};

export const viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${jetBrainsMono.variable} h-full`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
