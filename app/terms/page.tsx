export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="glass rounded-[18px] p-8 prose-container">
        <h1 className="mb-3 font-display text-[40px] leading-[0.95] font-extrabold uppercase text-ink sm:text-5xl">Terms of <span className="font-serif font-normal normal-case italic text-teal">service</span></h1>
        <p className="text-sm text-muted mb-8">Last updated: July 2026</p>

        <div className="flex flex-col gap-6 text-ink-2 text-sm leading-relaxed">
          <section>
            <h2 className="mb-2 font-display text-[22px] leading-tight font-extrabold uppercase tracking-[0.01em] text-ink">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Radiant Educations ("the Platform"), you agree to be bound by these Terms of
              Service. If you do not agree, please do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-[22px] leading-tight font-extrabold uppercase tracking-[0.01em] text-ink">2. Who Can Use the Platform</h2>
            <p>
              Students may create an account to browse and take practice tests. Companies and organizations may
              register to post opportunities and tests, subject to admin approval before any content goes live.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-[22px] leading-tight font-extrabold uppercase tracking-[0.01em] text-ink">3. Account Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all
              activity under your account. You agree to provide accurate information when registering.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-[22px] leading-tight font-extrabold uppercase tracking-[0.01em] text-ink">4. Content Posted by Companies</h2>
            <p>
              Companies are solely responsible for the accuracy of tests, opportunities, and other content they
              submit. Radiant Educations reviews submissions before publication but does not guarantee the
              accuracy, completeness, or outcomes of any listed test or opportunity.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-[22px] leading-tight font-extrabold uppercase tracking-[0.01em] text-ink">5. Prohibited Conduct</h2>
            <p>
              You agree not to misuse the Platform, including but not limited to: submitting false information,
              attempting to access accounts that are not yours, posting misleading or fraudulent opportunities, or
              interfering with the Platform's normal operation.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-[22px] leading-tight font-extrabold uppercase tracking-[0.01em] text-ink">6. No Guarantee of Outcomes</h2>
            <p>
              Radiant Educations provides practice tests and opportunity listings for informational and educational
              purposes. We do not guarantee admission, employment, or any specific academic or career outcome.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-[22px] leading-tight font-extrabold uppercase tracking-[0.01em] text-ink">7. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Platform after changes are posted
              constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-[22px] leading-tight font-extrabold uppercase tracking-[0.01em] text-ink">8. Contact</h2>
            <p>
              Questions about these Terms can be sent via our{" "}
              <a href="/contact" className="text-teal-dark hover:underline">
                Contact page
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
