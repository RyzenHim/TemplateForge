"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import UserMenuDropDown from "./UserMenuDropDown";
import { ArrowLeft } from "lucide-react";
import {
  app_sideBar_options,
  general_sideBar_options,
  templates_sideBar_options,
} from "@/app/lib/navigation/navigations";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  let menuOptions = general_sideBar_options;

  // if (pathname.startsWith("/dashboard/apps/")) {
  //   menuOptions = app_sideBar_options;
  // }

  // if (pathname.startsWith("/dashboard/templates/")) {
  //   menuOptions = templates_sideBar_options;
  // }
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex h-screen w-72 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 text-white shadow-xl">
      <div className="flex flex-col gap-3 p-4">
        {pathname.startsWith("/dashboard/home") ? null : (
          <>
            <button
              onClick={() => router.back()}
              className="flex w-full items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <button
              onClick={() => router.push("/dashboard/home")}
              className="flex w-full items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-100 transition hover:border-zinc-600 hover:bg-zinc-800"
            >
              <ArrowLeft size={16} />
              Home
            </button>
          </>
        )}
      </div>

      <div className="border-y border-zinc-800 px-6 py-6">
        <button
          onClick={() => router.push("/dashboard/home")}
          className="text-left text-2xl font-extrabold tracking-tight text-white transition hover:text-indigo-300"
        >
          TemplateForge
        </button>
      </div>

      <div className="border-b border-zinc-800 px-6 py-5">
        <UserMenuDropDown />
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="space-y-2">
          {menuOptions?.map((menuOption) => {
            const active = pathname === menuOption.href;

            return (
              <li key={menuOption.href}>
                <Link
                  href={menuOption.href}
                  className={`flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-500 text-white shadow shadow-indigo-500/20"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  {menuOption.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-zinc-800 px-6 py-4 text-xs text-zinc-500">
        TemplateForge v1.0
      </div>
    </aside>
  );
}
