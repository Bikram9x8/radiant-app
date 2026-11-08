import Providers from "./providers";
import type { Metadata } from "next";
import { Inter, Geist_Mono, Noto_Sans_Devanagari, Noto_Sans_Gurmukhi } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
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
      className={`${inter.variable} ${geistMono.variable} ${notoDevanagari.variable} ${notoGurmukhi.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative bg-white text-[#14142b]">
        <Providers modal={modal}>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}