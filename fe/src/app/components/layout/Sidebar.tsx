"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import UserMenuDropDown from "./UserMenuDropDown";
import { SidebarProps } from "@/app/lib/types/sideBarMenus.types";
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

  if (pathname.startsWith("/dashboard/apps/")) {
    menuOptions = app_sideBar_options;
  }

  if (pathname.startsWith("/dashboard/templates/")) {
    menuOptions = templates_sideBar_options;
  }
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-black">
      {pathname.startsWith("/dashboard/home") ? null : (
        <>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100 hover:text-black border"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            onClick={() => router.push("/dashboard/home")}
            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100 hover:text-black border"
          >
            <ArrowLeft size={18} />
            Home
          </button>
        </>
      )}

      <div className="border-b px-6 py-5">
        <button
          onClick={() => router.push("/dashboard/home")}
          className="text-2xl font-extrabold tracking-tight cursor-pointer"
        >
          TemplateForge
        </button>
      </div>

      <div className="border-b px-4 py-4">
        <UserMenuDropDown />
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {menuOptions?.map((menuOption) => {
            const active = pathname === menuOption.href;

            return (
              <li key={menuOption.href}>
                <Link
                  href={menuOption.href}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-all m-2 ${
                    active
                      ? "bg-black text-white"
                      : "text-white hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  {menuOption.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t px-6 py-4 text-xs text-gray-400">
        TemplateForge v1.0
      </div>
    </aside>
  );
}
