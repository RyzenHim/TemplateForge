import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-12 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-2xl">
            ⚡
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            TemplateForge
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Build • Customize • Launch
          </p>
        </div>

        <div className="mb-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <span className="mr-1">Back to</span>
          <Link
            href="/"
            className="font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Home
          </Link>
        </div>

        {children}
      </div>
    </main>
  );
}
