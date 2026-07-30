"use client";

export default function PlainTestViewer({ pdfUrl }: { pdfUrl: string }) {
  return (
    <div className="glass rounded-2xl p-2">
      <iframe
        src={pdfUrl}
        className="w-full rounded-xl"
        style={{ height: "80vh", border: "none" }}
        title="Test PDF"
      />
    </div>
  );
}
