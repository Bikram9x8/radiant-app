import Providers from "./providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Radiant Educations",
  description: "Connecting students with opportunities from verified companies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative bg-white dark:bg-zinc-950">
        <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-white dark:bg-[#0a0612]">
          <div className="absolute -top-24 -left-16 w-[26rem] h-[26rem] rounded-full bg-purple-400/35 dark:bg-purple-400/50 blur-3xl" />
          <div className="absolute top-32 -right-24 w-[22rem] h-[22rem] rounded-full bg-cyan-400/30 dark:bg-cyan-300/40 blur-3xl" />
          <div className="absolute -bottom-20 left-12 w-[24rem] h-[24rem] rounded-full bg-pink-400/28 dark:bg-pink-400/40 blur-3xl" />
          <div className="absolute bottom-8 right-4 w-[16rem] h-[16rem] rounded-full bg-lime-400/22 dark:bg-lime-400/30 blur-3xl" />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
