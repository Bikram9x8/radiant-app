export default function ContactPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="glass max-w-lg w-full p-8 rounded-2xl">
        <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-white">
          Contact <span className="text-purple-600 dark:text-purple-400">Us</span>
        </h1>
        <p className="text-zinc-600 dark:text-zinc-300 mb-8">
          Have a question or need help? Reach out to us anytime.
        </p>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Email</p>
            
              href="mailto:radiantedu1@gmail.com"
              className="text-lg text-zinc-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400"
            >
              radiantedu1@gmail.com
            </a>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Phone</p>
            <p className="text-lg text-zinc-900 dark:text-white">
              +91 98762 15836
            </p>
            <p className="text-lg text-zinc-900 dark:text-white">
              +91 99882 42737
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}