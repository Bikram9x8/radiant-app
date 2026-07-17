import Providers from "./providers";
import ParticleBackground from "@/components/ParticleBackground";
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
        <div className="animate-huecycle fixed inset-0 -z-20 overflow-hidden pointer-events-none">
          <div className="animate-drift1 absolute -top-40 -right-20 w-[34rem] h-[34rem] rounded-full bg-purple-400/55 dark:bg-purple-600/35 blur-2xl" />
          <div className="animate-drift2 absolute top-1/3 -left-32 w-[28rem] h-[28rem] rounded-full bg-blue-400/50 dark:bg-blue-600/30 blur-2xl" />
          <div className="animate-drift3 absolute bottom-0 right-1/4 w-[30rem] h-[30rem] rounded-full bg-pink-400/50 dark:bg-pink-600/30 blur-2xl" />
          <div className="animate-drift1 absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-purple-300/45 dark:bg-purple-500/25 blur-2xl" style={{ animationDelay: "-8s" }} />
        </div>
        <ParticleBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
