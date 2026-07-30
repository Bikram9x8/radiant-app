"use client";

import { useEffect, useState, useRef } from "react";

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

    // TEMP: disabled for debugging
    // document.addEventListener("visibilitychange", handleVisibilityChange);
    // window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [opportunityId]);

  if (locked) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Test Locked</h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          This test was locked because you switched tabs or apps. Contact your institute to request access again.
        </p>
      </div>
    );
  }

  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-black p-2"
          : "glass rounded-2xl p-2"
      }
    >
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="mb-2 text-sm px-3 py-1.5 rounded-lg bg-purple-600 text-white font-semibold"
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