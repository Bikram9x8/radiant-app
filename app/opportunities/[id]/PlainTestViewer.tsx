"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// One page slot. The page is only drawn when it is near the screen.
function PageSlot({
  pageNumber,
  width,
  height,
  rootRef,
  register,
}: {
  pageNumber: number;
  width: number;
  height: number;
  rootRef: React.RefObject<HTMLDivElement | null>;
  register: (el: HTMLDivElement | null) => void;
}) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const [near, setNear] = useState(pageNumber <= 2);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => setNear(entries[0].isIntersecting),
      { root: rootRef.current, rootMargin: "1500px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootRef]);

  return (
    <div
      ref={(el) => {
        elRef.current = el;
        register(el);
      }}
      className="mb-3 bg-white"
      style={{ width, minHeight: height }}
    >
      {near && <Page pageNumber={pageNumber} width={width} />}
    </div>
  );
}

function ViewerBody({
  isFullscreen,
  setIsFullscreen,
  numPages,
  aspect,
  pageNumber,
  setPageNumber,
  pageWidth,
  setPageWidth,
  pdfUrl,
  onDocumentLoadSuccess,
}: any) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const typingRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState(String(pageNumber));

  // Keep the page box in step with scrolling (unless the person is typing in it)
  useEffect(() => {
    if (!typingRef.current) setDraft(String(pageNumber));
  }, [pageNumber]);

  function jumpTo(n: number, smooth: boolean) {
    const c = scrollRef.current;
    const s = slotRefs.current[n - 1];
    if (!c || !s) return;
    c.scrollTo({ top: s.offsetTop - 8, behavior: smooth ? "smooth" : "auto" });
  }

  // After the PDF loads (or after switching fullscreen), return to the page we were on
  useEffect(() => {
    if (ready && pageNumber > 1) {
      requestAnimationFrame(() => jumpTo(pageNumber, false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Work out which page is on screen while scrolling
  function handleScroll() {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const c = scrollRef.current;
      if (!c) return;
      const line = c.scrollTop + c.clientHeight * 0.35;
      let cur = 1;
      for (let i = 0; i < slotRefs.current.length; i++) {
        const s = slotRefs.current[i];
        if (!s) continue;
        if (s.offsetTop <= line) cur = i + 1;
        else break;
      }
      if (cur !== pageNumber) setPageNumber(cur);
    });
  }

  function goToDraft() {
    const val = parseInt(draft, 10);
    if (isNaN(val)) {
      setDraft(String(pageNumber));
      return;
    }
    const clamped = Math.min(Math.max(1, val), numPages);
    setPageNumber(clamped);
    setDraft(String(clamped));
    jumpTo(clamped, true);
  }

  const slotHeight = Math.round(pageWidth * aspect);

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
            <span className="flex items-center gap-1">
              Page{" "}
              <input
                type="text"
                inputMode="numeric"
                value={draft}
                onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    goToDraft();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                onFocus={(e) => {
                  typingRef.current = true;
                  e.target.select();
                }}
                onBlur={() => {
                  typingRef.current = false;
                  setDraft(String(pageNumber));
                }}
                aria-label="Go to page number"
                className="w-14 text-center rounded bg-zinc-700 text-white px-1 py-0.5"
              />{" "}
              of {numPages}
            </span>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={goToDraft}
              className="px-2.5 py-1 rounded bg-purple-600 text-white font-semibold"
            >
              Go
            </button>
          </div>
        )}
      </div>

      <div
        className="relative flex-1 min-h-0 overflow-auto flex justify-center bg-zinc-900 rounded-b-2xl pt-2"
        onScroll={handleScroll}
        ref={(el) => {
          scrollRef.current = el;
          if (el && el.clientWidth > 0) {
            const target = Math.min(el.clientWidth - 16, 800);
            if (Math.abs(target - pageWidth) > 10) setPageWidth(target);
          }
        }}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={(pdf: any) => {
            onDocumentLoadSuccess(pdf);
            setReady(true);
          }}
          loading={<p className="text-white p-4">Loading PDF...</p>}
          error={
            <p className="text-red-400 p-4">
              Failed to load PDF. Please try again.
            </p>
          }
        >
          {Array.from({ length: numPages }, (_, i) => (
            <PageSlot
              key={i}
              pageNumber={i + 1}
              width={pageWidth}
              height={slotHeight}
              rootRef={scrollRef}
              register={(el) => {
                slotRefs.current[i] = el;
              }}
            />
          ))}
        </Document>
      </div>
    </div>
  );
}

export default function PlainTestViewer({ pdfUrl }: { pdfUrl: string }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [aspect, setAspect] = useState(1.414);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(600);

  function onDocumentLoadSuccess(pdf: any) {
    setNumPages(pdf.numPages);
    pdf
      .getPage(1)
      .then((p: any) => {
        const v = p.getViewport({ scale: 1 });
        if (v.width > 0) setAspect(v.height / v.width);
      })
      .catch(() => {});
  }

  const props = {
    isFullscreen,
    setIsFullscreen,
    numPages,
    aspect,
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