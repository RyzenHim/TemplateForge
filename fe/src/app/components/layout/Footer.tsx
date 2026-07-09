import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-zinc-600 dark:text-zinc-400 md:flex-row">
        <p>© 2026 TemplateForge. All rights reserved.</p>

        <div className="flex items-center gap-6">
          <Link href="/about" className="hover:text-indigo-600">
            About
          </Link>

          <Link href="/pricing" className="hover:text-indigo-600">
            Pricing
          </Link>

          <Link href="/contact" className="hover:text-indigo-600">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
