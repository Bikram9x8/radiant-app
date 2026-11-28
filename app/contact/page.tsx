import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact us | Radiant Educations",
  description: "How to reach Radiant Educations with a question, a correction or a suggestion.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="glass max-w-lg w-full rounded-[18px] p-6 sm:p-8">
        <h1 className="mb-3 font-display text-[40px] leading-[0.95] font-extrabold uppercase text-ink sm:text-5xl">
          Contact <span className="font-serif font-normal normal-case italic text-teal">us</span>
        </h1>
        <p className="text-muted mb-8">
          Have a question or need help? Reach out to us anytime.
        </p>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted">Email</p>
            <a 
              href="mailto:radiantedu1@gmail.com"
              className="text-lg text-ink hover:text-teal-dark"
            >
              radiantedu1@gmail.com
            </a>
          </div>

          <div>
            <p className="text-sm font-medium text-muted">Phone</p>
            <p className="text-lg text-ink">
              +91 98762 15836
            </p>
            <p className="text-lg text-ink">
              +91 99882 42737
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}