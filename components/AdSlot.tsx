// Space reserved for advertisements. Replace the inside later with real ad code.
// Fixed height reserves the space, so the page doesn't jump when an ad loads.

// No real ad exists yet, so no empty "Advertisement" placeholder is shown anywhere: every page renders
// its ad slot (and the wrapper around it) only when this is true. Set it to true once real ad code is
// in place below.
export const ADS_ENABLED = false;

export default function AdSlot({ label, className = "" }: { label: string; className?: string }) {
  if (!ADS_ENABLED) return null;
  return (
    <div
      className={`mx-auto flex w-full flex-col items-center justify-center rounded-[18px] border-[1.5px] border-dashed border-(--muted)/40 bg-white/60 text-center ${className}`}
    >
      <span className="text-[11px] font-extrabold tracking-wider text-(--muted) uppercase">Advertisement</span>
      <span className="text-sm font-semibold text-(--muted)">{label}</span>
    </div>
  );
}
