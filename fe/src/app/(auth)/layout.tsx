import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-indigo-600">TemplateForge</h1>

          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Build • Customize • Launch
          </p>
        </div>
        <span>Back to </span>
        <Link href={"/"}>Home</Link>
        {children}
      </div>
    </main>
  );
}
