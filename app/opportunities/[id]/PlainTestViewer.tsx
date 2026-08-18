"use client";

import { useState } from "react";

export default function PlainTestViewer({ pdfUrl }: { pdfUrl: string }) {
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
      <div
        className="w-full rounded-xl overflow-hidden"
        style={{ height: isFullscreen ? "calc(100vh - 50px)" : "80vh" }}
      >
        <iframe
          src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`}
          className="w-full"
          style={{
            height: "calc(100% + 56px)",
            marginTop: "-56px",
            border: "none",
          }}
          title="Test PDF"
        />
      </div>
    </div>
  );
}