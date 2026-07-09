import Link from "next/link";

export default function TemplateCard() {
  return (
    <div className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-3xl">🎨</div>
          <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-white">
            Template Name
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            A clean, modern template layout ready to customize.
          </p>
        </div>

        <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
          New
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Updated just now
        </div>

        <Link
          href="/dashboard/templates"
          className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Preview →
        </Link>
      </div>
    </div>
  );
}
