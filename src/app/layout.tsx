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

const FALLBACK_SITE_URL = "http://localhost:3000";

// Tolérant à une valeur mal formée dans l'environnement (ex. "url.com" sans
// protocole) : on préfixe `https://` si besoin, et on retombe sur localhost
// plutôt que de faire échouer le build (new URL() lève sinon ERR_INVALID_URL).
function resolveSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return new URL(FALLBACK_SITE_URL);

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(candidate);
  } catch {
    return new URL(FALLBACK_SITE_URL);
  }
}

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  title: {
    default: "Stuudio",
    template: "%s · Stuudio",
  },
  description:
    "Stuudio — outil de cadrage projet pour PMO : du 6-Pack aux arborescences PBS / WBS / OBS et à la gouvernance, partageables par rôles.",
  applicationName: "Stuudio",
  openGraph: {
    title: "Stuudio",
    description:
      "Du 6-Pack aux arborescences PBS / WBS / OBS et à la gouvernance.",
    type: "website",
    locale: "fr_FR",
    siteName: "Stuudio",
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
