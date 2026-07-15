"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";

import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";

import { useApps } from "@/app/lib/hooks/useApps";

export default function AppsPage() {
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
    <div className="space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">My Apps</h1>

          <p className="mt-2 text-zinc-500">Manage all your applications.</p>
        </div>

        <Link href="/dashboard/apps/create">
          <Button className="flex items-center gap-2">
            <Plus size={18} />
            Create App
          </Button>
        </Link>
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

            <p className="mt-3 text-zinc-500">Create your first application.</p>

            <Link href="/dashboard/apps/create" className="mt-6 inline-block">
              <Button>Create App</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {apps.map((app) => (
            <Card key={app.id}>
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold">{app.name}</h2>

                  <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                    {app.description || "No description"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-zinc-500">Package Name</p>

                  <p className="font-medium">{app.packageName}</p>
                </div>

                <div className="flex justify-between">
                  <Link href={`/dashboard/apps/${app.id}`}>
                    <Button>View</Button>
                  </Link>

                  <Link href={`/dashboard/apps/${app.id}/edit`}>
                    <Button>Edit</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
