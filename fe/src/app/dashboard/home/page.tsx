import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen min-w-full bg-zinc-950 px-6 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="relative mb-10 rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-8 shadow-sm">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.35),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_55%)]" />

          <h1 className="text-4xl font-bold tracking-tight text-white">
            Welcome to TemplateForge 👋
          </h1>

          <p className="mt-2 max-w-2xl text-zinc-400">
            Start by managing your applications or explore ready-made templates.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/dashboard/apps" className="group">
            <div className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/60 hover:bg-zinc-900/70 hover:shadow-lg">
              <div className="mb-5 text-5xl transition-transform duration-200 group-hover:scale-105">
                📱
              </div>

              <h2 className="text-2xl font-semibold text-white">My Apps</h2>

              <p className="mt-3 text-sm text-zinc-400">
                Create, edit and manage all your applications from one place.
              </p>

              <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-blue-400">
                Open Apps <span aria-hidden>→</span>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/templates" className="group">
            <div className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/60 hover:bg-zinc-900/70 hover:shadow-lg">
              <div className="mb-5 text-5xl transition-transform duration-200 group-hover:scale-105">
                🎨
              </div>

              <h2 className="text-2xl font-semibold text-white">Templates</h2>

              <p className="mt-3 text-sm text-zinc-400">
                Browse professionally designed templates and start building
                faster.
              </p>

              <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-violet-400">
                Browse Templates <span aria-hidden>→</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
