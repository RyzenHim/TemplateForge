"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";
import AppCard from "@/app/components/ui/AppCard";
import SearchBar from "@/app/components/ui/SearchBar";

import { useApps } from "@/app/lib/hooks/app/useApps";
import type { App } from "@/app/lib/types/app.types";
import { useRouter } from "next/navigation";

type AppFilter = "all" | App["status"];

const appFilters: { label: string; value: AppFilter }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Purchased", value: "purchased" },
  { label: "Published", value: "published" },
];

export default function AppsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<AppFilter>("all");

  const { data: apps = [], isLoading, isError } = useApps();

  const filteredApps = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    return apps.filter((app) => {
      const matchesStatus =
        activeFilter === "all" || app.status === activeFilter;

      if (!matchesStatus) return false;

      if (!normalizedQuery) return true;

      const haystacks = [app.name, app.description, app.packageName]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return haystacks.some((value) => value.includes(normalizedQuery));
    });
  }, [activeFilter, apps, searchTerm]);

  if (isLoading) {
    return <Loader text="Loading your apps..." />;
  }

  if (isError) {
    return (
      <div className="p-8">
        <p className="text-red-500">Failed to load your applications.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold">My Apps</h1>

            <p className="mt-2 text-zinc-500">Manage all your applications.</p>
          </div>

          <Button
            className="flex items-center gap-2"
            onClick={() => router.push("/dashboard/apps/create")}
          >
            <Plus size={18} />
            Create App
          </Button>
        </div>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search apps..."
        />

        <div className="flex flex-wrap items-center gap-2">
          {appFilters.map((filter) => {
            const count =
              filter.value === "all"
                ? apps.length
                : apps.filter((app) => app.status === filter.value).length;
            const isActive = activeFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-indigo-500 bg-indigo-500 text-white shadow-sm shadow-indigo-500/30"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-500/60 dark:hover:text-indigo-300"
                }`}
              >
                {filter.label}
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {apps.length === 0 ? (
          <Card>
            <div className="py-20 text-center">
              <h2 className="text-2xl font-semibold">No Apps Found</h2>

              <p className="mt-3 text-zinc-500">
                Create your first application.
              </p>

              <Button
                className="mt-6"
                onClick={() => router.push("/dashboard/apps/create")}
              >
                Create App
              </Button>
            </div>
          </Card>
        ) : filteredApps.length === 0 ? (
          <Card>
            <div className="py-20 text-center">
              <h2 className="text-2xl font-semibold">No matching apps</h2>

              <p className="mt-3 text-zinc-500">
                {activeFilter === "all"
                  ? "Try a different search term."
                  : `No ${activeFilter} apps match your search.`}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
