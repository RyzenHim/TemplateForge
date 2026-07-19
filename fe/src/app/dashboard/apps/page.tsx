"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";
import AppCard from "@/app/components/ui/AppCard";

import { useApps } from "@/app/lib/hooks/app/useApps";
import CreateAppModal from "./modals/CreateAppModal";

export default function AppsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: apps = [], isLoading, isError } = useApps();

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

      <div className="space-y-8 p-8">
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
              className="w-full rounded-lg border py-3 pl-11 pr-4"
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
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
