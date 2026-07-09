export default function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
        About TemplateForge
      </h1>

      <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        TemplateForge is a platform that helps developers quickly create,
        customize, and manage modern web application templates. Whether you're
        building a portfolio, dashboard, e-commerce application, or admin panel,
        TemplateForge provides a solid starting point to speed up your
        development process.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="text-xl font-semibold">🚀 Fast Development</h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Start projects quickly with professionally designed templates.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="text-xl font-semibold">🎨 Easy Customization</h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Modify layouts, themes, and components to match your needs.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="text-xl font-semibold">⚡ Modern Stack</h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Built with Next.js, TypeScript, Tailwind CSS, and modern best
            practices.
          </p>
        </div>
      </div>
    </section>
  );
}
