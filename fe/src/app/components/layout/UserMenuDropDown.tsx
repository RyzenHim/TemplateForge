"use client";

import { useState } from "react";
import UserMenuContent from "./UserMenuContent";
import { useProfile } from "@/app/lib/hooks/auth/useProfile";

export default function UserMenuDropDown() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data, isLoading, isError } = useProfile();
  return (
    <div className="relative mb-4">
      <button
        className="flex w-full items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-left text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-750 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span className="truncate">{data?.firstName || "Himanshu"}</span>
        <span aria-hidden className="text-xs">
          {isMenuOpen ? "▲" : "▼"}
        </span>
      </button>

      {isMenuOpen && <UserMenuContent />}
    </div>
  );
}
