"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PlainTestViewer({ pdfUrl }: { pdfUrl: string }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(600);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-black p-2 flex flex-col"
          : "glass rounded-2xl p-2"
      }
    >
      <div className={`flex items-center justify-between mb-2 flex-wrap gap-2 sticky top-0 z-10 py-1 ${isFullscreen ? "bg-black" : "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-xl px-2"}`}>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="text-sm px-3 py-1.5 rounded-lg bg-purple-600 text-white font-semibold"
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>

        {numPages > 0 && (
          <div className="flex items-center gap-2 text-white text-sm">
            <button
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className="px-2 py-1 rounded bg-zinc-700 disabled:opacity-40"
            >
              Prev
            </button>
            <span>
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
              disabled={pageNumber >= numPages}
              className="px-2 py-1 rounded bg-zinc-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <div
        className={`w-full rounded-xl overflow-auto flex justify-center bg-zinc-900 ${isFullscreen ? "flex-1" : ""}`}
        style={{ maxHeight: isFullscreen ? undefined : "85vh" }}
        ref={(el) => {
          if (el && el.clientWidth > 0) {
            const target = Math.min(el.clientWidth - 16, 800);
            if (Math.abs(target - pageWidth) > 10) setPageWidth(target);
          }
        }}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<p className="text-white p-4">Loading PDF...</p>}
          error={
            <p className="text-red-400 p-4">
              Failed to load PDF. Please try again.
            </p>
          }
        >
          <Page pageNumber={pageNumber} width={pageWidth} />
        </Document>
      </div>
    </div>
  );
}
