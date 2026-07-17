import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Mono (labels, codes, méta). Sans = Helvetica Neue = system stack, rien à charger.
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cadrage Studio",
  description:
    "Outil de cadrage projet pour PMO : du 6-Pack aux arborescences PBS / WBS / OBS et à la gouvernance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${jetBrainsMono.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
