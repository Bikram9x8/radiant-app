"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

function ViewerBody({
  isFullscreen,
  setIsFullscreen,
  numPages,
  pageNumber,
  setPageNumber,
  pageWidth,
  setPageWidth,
  pdfUrl,
  onDocumentLoadSuccess,
}: any) {
  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-black flex flex-col"
          : "glass rounded-2xl flex flex-col"
      }
      style={{ height: isFullscreen ? "100vh" : "85vh" }}
    >
      <div
        className={`shrink-0 flex items-center justify-between gap-2 flex-wrap px-3 py-2 ${
          isFullscreen ? "bg-black" : "bg-white/90 dark:bg-zinc-900/90 rounded-t-2xl border-b border-white/10"
        }`}
      >
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="text-sm px-3 py-1.5 rounded-lg bg-purple-600 text-white font-semibold"
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>

        {numPages > 0 && (
          <div className="flex items-center gap-2 text-sm text-zinc-900 dark:text-white">
            <button
              onClick={() => setPageNumber((p: number) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className="px-2 py-1 rounded bg-zinc-700 text-white disabled:opacity-40"
            >
              Prev
            </button>
            <span className="flex items-center gap-1">
              Page{" "}
              <input
                type="number"
                min={1}
                max={numPages}
                value={pageNumber}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1 && val <= numPages) {
                    setPageNumber(val);
                  }
                }}
                className="w-12 text-center rounded bg-zinc-700 text-white px-1 py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />{" "}
              of {numPages}
            </span>
            <button
              onClick={() => setPageNumber((p: number) => Math.min(numPages, p + 1))}
              disabled={pageNumber >= numPages}
              className="px-2 py-1 rounded bg-zinc-700 text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <div
        className="flex-1 min-h-0 overflow-auto flex justify-center bg-zinc-900 rounded-b-2xl"
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

export default function PlainTestViewer({ pdfUrl }: { pdfUrl: string }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(600);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const props = {
    isFullscreen,
    setIsFullscreen,
    numPages,
    pageNumber,
    setPageNumber,
    pageWidth,
    setPageWidth,
    pdfUrl,
    onDocumentLoadSuccess,
  };

  if (isFullscreen && typeof document !== "undefined") {
    return createPortal(<ViewerBody {...props} />, document.body);
  }

  return <ViewerBody {...props} />;
}