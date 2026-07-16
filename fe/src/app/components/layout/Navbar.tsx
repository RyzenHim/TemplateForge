"use client";

import Link from "next/link";
import Button from "../ui/Button";
import { usePathname } from "next/navigation";
export default function Navbar() {
  const pathName = usePathname();

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 border">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          TemplateForge
        </Link>
        {pathName.startsWith("/dashboard") ? null : (
          <>
            {" "}
            <div className="hidden items-center gap-8 md:flex">
              <Link
                href="/templates"
                className="text-zinc-700 hover:text-indigo-600 dark:text-zinc-300"
              >
                Templates
              </Link>

              <Link
                href="/about"
                className="text-zinc-700 hover:text-indigo-600 dark:text-zinc-300"
              >
                About
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>

              <Link href="/signup">
                <Button>Signup</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
