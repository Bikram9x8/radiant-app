"use client";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";
import PageTransition from "@/components/PageTransition";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <Navbar />
        <PageTransition>{children}</PageTransition>
      </ToastProvider>
    </SessionProvider>
  );
}