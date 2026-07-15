export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
      <div className="max-w-3xl text-center">
        <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
          🚀 Build Faster. Ship Smarter.
        </span>

        <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white md:text-6xl">
          TemplateForge
        </h1>

        <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          A modern platform to discover, customize, and launch beautiful
          developer templates for portfolios, dashboards, SaaS products,
          e-commerce, and more.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* <button className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700">
            Explore Templates
          </button>

          <button className="rounded-lg border border-zinc-300 px-6 py-3 font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900">
            Learn More
          </button> */}
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              Modern Templates
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Production-ready React, Next.js, and full-stack templates.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              Fully Customizable
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Easily modify layouts, themes, components, and branding.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              Developer First
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Built with TypeScript, Next.js, Tailwind CSS, and modern tooling.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
