export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="glass rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-white">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 mb-8">Last updated: July 2026</p>

        <div className="flex flex-col gap-6 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
          <section>
            <h2 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2">1. Information We Collect</h2>
            <p>
              When you create a student account, we collect your name, email, phone number, and any profile
              details you choose to add (college, degree, skills, bio, resume, links). When you create a company
              account, we collect your company name, email, and any profile details you provide.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2">2. How We Use Your Information</h2>
            <p>
              We use your information to operate the Platform: to authenticate your account, display your profile
              to companies when you apply to an opportunity, process test and application submissions, and
              communicate with you about your account.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2">3. Who Can See Your Information</h2>
            <p>
              When you apply to an internship or job opportunity, your profile information and resume are shared
              with the company that posted it. Companies cannot see your information unless you apply, or as
              otherwise required for the Platform to function.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2">4. Data Storage</h2>
            <p>
              Your data is stored securely and is only accessible to authorized administrators for the purpose of
              operating and moderating the Platform.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2">5. Your Choices</h2>
            <p>
              You can update or correct your profile information at any time from your account settings. To
              request deletion of your account and associated data, please contact us.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2">6. Cookies</h2>
            <p>
              We use essential cookies to keep you logged in and to maintain your session. We do not use
              third-party advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will post any changes on this page.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2">8. Contact</h2>
            <p>
              For privacy-related questions or data deletion requests, please reach out via our{" "}
              <a href="/contact" className="text-purple-600 dark:text-purple-400 hover:underline">
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
