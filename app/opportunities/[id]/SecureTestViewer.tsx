"use client";

import { useEffect, useState, useRef } from "react";
import { fredoka, nunito } from "@/components/home/fonts";
import s from "@/components/school/school.module.css";

// Fullscreen covers the page, so the viewer carries its own tokens + fonts (s.page)
const tokens = `${fredoka.variable} ${nunito.variable} ${s.page}`;

export default function SecureTestViewer({
  opportunityId,
  pdfUrl,
}: {
  opportunityId: string;
  pdfUrl: string;
}) {
  const inlinePdfUrl = pdfUrl;
  const [locked, setLocked] = useState(false);
  const hasLocked = useRef(false);

  useEffect(() => {
    async function lockTest() {
      if (hasLocked.current) return;
      hasLocked.current = true;

      await fetch("/api/access-codes/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId }),
      });
      setLocked(true);
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        lockTest();
      }
    }

    function handleBlur() {
      lockTest();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [opportunityId]);

  if (locked) {
    return (
      <div className="rounded-[20px] border-2 border-red-200 bg-red-50 p-6 text-center sm:p-8">
        <h2 className={`${s.display} mb-2 text-xl font-bold text-red-700`}>Test Locked</h2>
        <p className={`${s.readingCopy} mx-auto`}>
          This test was locked because you switched tabs or apps. Contact your institute to request access again.
        </p>
      </div>
    );
  }

  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div
      className={`${tokens} p-2 ${isFullscreen ? `${s.pdfStageDark} fixed inset-0 z-50` : s.pdfFrame}`}
    >
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className={`${s.flat} mb-2 inline-flex min-h-11 items-center rounded-full bg-(--hp-purple) px-4 text-sm font-extrabold text-white`}
      >
        {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      </button>
      <iframe
        src={inlinePdfUrl}
        className="w-full rounded-xl"
        style={{ height: isFullscreen ? "calc(100vh - 50px)" : "80vh", border: "none" }}
        title="Test PDF"
      />
    </div>
  );
}