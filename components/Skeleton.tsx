export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-zinc-300/50 dark:bg-zinc-700/40 rounded-xl ${className}`}
    />
  );
}
