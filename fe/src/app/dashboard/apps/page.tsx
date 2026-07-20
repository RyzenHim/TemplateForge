"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";
import AppCard from "@/app/components/ui/AppCard";

import { useApps } from "@/app/lib/hooks/app/useApps";
import CreateAppModal from "./modals/CreateAppModal";

export default function AppsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: apps = [], isLoading, isError } = useApps();

  const filteredApps = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    if (!normalizedQuery) return apps;

    return apps.filter((app) => {
      const haystacks = [app.name, app.description, app.packageName]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return haystacks.some((value) => value.includes(normalizedQuery));
    });
  }, [apps, searchTerm]);

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
      <CreateAppModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold">My Apps</h1>

            <p className="mt-2 text-zinc-500">Manage all your applications.</p>
          </div>

          <Button
            className="flex items-center gap-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={18} />
            Create App
          </Button>
        </div>

        <Card>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 py-3 pl-11 pr-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              placeholder="Search apps..."
            />
          </div>
        </Card>

        {apps.length === 0 ? (
          <Card>
            <div className="py-20 text-center">
              <h2 className="text-2xl font-semibold">No Apps Found</h2>

              <p className="mt-3 text-zinc-500">
                Create your first application.
              </p>

              <Button
                className="mt-6"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create App
              </Button>
            </div>
          </Card>
        ) : filteredApps.length === 0 ? (
          <Card>
            <div className="py-20 text-center">
              <h2 className="text-2xl font-semibold">No matching apps</h2>

              <p className="mt-3 text-zinc-500">Try a different search term.</p>
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
