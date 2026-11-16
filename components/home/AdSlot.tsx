// Empty box reserved for advertisements. Replace the inside later with real ad code.
// Fixed height reserves the space, so the page doesn't jump when an ad loads.
export default function AdSlot({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`mx-auto flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-(--hp-muted)/40 bg-white/60 text-center ${className}`}
    >
      <span className="text-[11px] font-extrabold tracking-wider text-(--hp-muted) uppercase">Advertisement</span>
      <span className="text-sm font-semibold text-(--hp-muted)">{label}</span>
    </div>
  );
}
