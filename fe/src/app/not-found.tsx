"use client";

import Link from "next/link";
import Button from "@/app/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 px-6">
      <div className="max-w-xl text-center">
        <h1 className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-8xl font-extrabold text-transparent">
          404
        </h1>

        <h2 className="mt-6 text-3xl font-bold text-white">Page Not Found</h2>

        <p className="mt-4 text-zinc-400">
          Sorry, the page you're looking for doesn't exist or may have been
          moved.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link href="/dashboard/home">
            <Button>Go to Dashboard</Button>
          </Link>

          <Link href="/">
            <Button className="border border-zinc-700 bg-transparent text-white hover:bg-zinc-800">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
