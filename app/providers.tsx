"use client";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";
import PageTransition from "@/components/PageTransition";

export default function Providers({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal?: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ToastProvider>
        <Navbar />
        <PageTransition>{children}</PageTransition>
        {modal}
      </ToastProvider>
    </SessionProvider>
  );
}