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
        <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-[#150d24] dark:via-[#0d1420] dark:to-[#0d1f16]">
          <div className="absolute -top-32 -right-20 w-[30rem] h-[30rem] rounded-full bg-purple-400/25 dark:bg-purple-500/25 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-[26rem] h-[26rem] rounded-full bg-emerald-400/20 dark:bg-emerald-400/20 blur-3xl" />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
