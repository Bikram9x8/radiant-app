import Providers from "./providers";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Footer from "@/components/Footer";

// Fonts are self-hosted from app/fonts (woff2, committed), so builds never download from Google
// Fonts. The files are the official google/fonts sources (OFL), subset with fonttools to the same
// character ranges Google serves: Latin + Latin Extended (which includes ₹) for the Latin fonts,
// and the Devanagari / Gurmukhi ranges for Noto. Variable fonts keep their axes.
//
// Teal + Coral type: Figtree for text, Big Shoulders Display for uppercase headings,
// Instrument Serif italic for accent words. Tailwind: font-sans / font-display / font-serif (globals.css).
const figtree = localFont({
  src: [{ path: "./fonts/figtree-latin-var.woff2", weight: "300 900", style: "normal" }],
  variable: "--font-figtree",
  display: "swap",
});

// "Big Shoulders" is the variable family with an optical-size axis (Google merged "Big Shoulders
// Display" into it). Browsers use the Display cut automatically at heading sizes
// (font-optical-sizing: auto), which is the design's look. No metric-matched fallback (as before):
// use a condensed system font while it loads.
const bigShoulders = localFont({
  src: [{ path: "./fonts/big-shoulders-latin-var.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-big-shoulders",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Arial Narrow", "Roboto Condensed", "sans-serif"],
});

// Only the italic is used (every serif accent is italic 400)
const instrumentSerif = localFont({
  src: [{ path: "./fonts/instrument-serif-latin-italic.woff2", weight: "400", style: "italic" }],
  variable: "--font-instrument-serif",
  display: "swap",
});

const geistMono = localFont({
  src: [{ path: "./fonts/geist-mono-latin-var.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-geist-mono",
  display: "swap",
});

// Hindi and Punjabi for MCQ question text (the font-question class). Not preloaded, and with the
// script's unicode-range a browser only downloads them when Devanagari/Gurmukhi text is on screen.
// (next/font options must be literal values, so the ranges are written inline.)

const notoDevanagari = localFont({
  src: [
    { path: "./fonts/noto-sans-devanagari-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/noto-sans-devanagari-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/noto-sans-devanagari-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-devanagari",
  display: "swap",
  preload: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0900-097F, U+1CD0-1CF4, U+1CF7-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B0A",
    },
  ],
});

const notoGurmukhi = localFont({
  src: [
    { path: "./fonts/noto-sans-gurmukhi-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/noto-sans-gurmukhi-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/noto-sans-gurmukhi-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-gurmukhi",
  display: "swap",
  preload: false,
  declarations: [
    {
      prop: "unicode-range",
      value: "U+0951-0952, U+0964-0965, U+0A01-0A76, U+200C-200D, U+20B9, U+25CC, U+262C, U+A830-A839",
    },
  ],
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