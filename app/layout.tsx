import Providers from "./providers";
import type { Metadata } from "next";
import {
  Figtree,
  Big_Shoulders,
  Instrument_Serif,
  Geist_Mono,
  Noto_Sans_Devanagari,
  Noto_Sans_Gurmukhi,
} from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

// Teal + Coral type: Figtree for text, Big Shoulders Display for uppercase headings,
// Instrument Serif italic for accent words. Tailwind: font-sans / font-display / font-serif (globals.css).
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

// Google Fonts merged "Big Shoulders Display" into "Big Shoulders" (a variable font with an
// optical-size axis). With the opsz axis loaded, browsers use the Display cut automatically at
// heading sizes (font-optical-sizing: auto), which is the design's look.
// next/font has no size data for the merged family yet, so no metric-matched fallback can be
// generated: use a condensed system font while it loads instead.
const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Arial Narrow", "Roboto Condensed", "sans-serif"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Hindi and Punjabi for MCQ question text (the font-question class). Not preloaded: thanks to the
// subsets' unicode-range, a browser only downloads them when Devanagari/Gurmukhi text is on screen.
const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: false,
});

const notoGurmukhi = Noto_Sans_Gurmukhi({
  variable: "--font-gurmukhi",
  subsets: ["gurmukhi"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Radiant Educations",
  description: "Connecting students with opportunities from verified companies.",
  // Icons come from Next's file conventions: app/favicon.ico, app/icon.svg, app/apple-icon.png
  // and app/manifest.ts (all made from the logo mark in components/brand/brand-svg.ts).
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${bigShoulders.variable} ${instrumentSerif.variable} ${geistMono.variable} ${notoDevanagari.variable} ${notoGurmukhi.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative bg-paper text-ink">
        <Providers modal={modal}>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}