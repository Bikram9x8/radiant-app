import Link from "next/link";

// Placeholder used by the /abroad pages until their content is built (Parts 3 to 6).
// Shows no numbers: only a heading and a short note.
export default function ComingSoonShell({
  crumb,
  title,
  accent,
  text,
}: {
  crumb?: { href: string; label: string };
  title: string;
  accent: string;
  text: string;
}) {
  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {crumb && (
        <Link href={crumb.href} className="text-sm font-bold text-teal-dark underline-offset-4 hover:underline">
          ← {crumb.label}
        </Link>
      )}
      <div className="card mt-4 p-6 sm:p-8">
        <h1 className="font-display text-[40px] leading-[0.95] font-extrabold uppercase text-ink sm:text-5xl">
          {title} <span className="font-serif font-normal normal-case italic text-teal">{accent}</span>
        </h1>
        <p className="mt-3 text-muted">{text}</p>
        <span className="mt-4 inline-flex rounded-full bg-tint-peach px-3 py-1 text-xs font-bold text-coral-text">
          Coming soon
        </span>
      </div>
    </div>
  );
}
