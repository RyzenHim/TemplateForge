"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";

import { useApp } from "@/app/lib/hooks/app/useApp";

export default function AppDetailsPage() {
  const params = useParams();

  const id = params.id as string;

  const { data: app, isLoading, isError } = useApp(id);

  if (isLoading) {
    return <Loader text="Loading app..." />;
  }

  if (isError || !app) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold text-red-500">App not found</h2>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{app.name}</h1>

        <Link href={`/dashboard/apps/${app.id}/edit`}>
          <Button>Edit App</Button>
        </Link>
      </div>

      <Card>
        <div className="space-y-5">
          <div>
            <p className="text-sm text-zinc-500">Description</p>
            <p>{app.description || "No description"}</p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">Package Name</p>
            <p>{app.packageName}</p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">Status</p>
            <p className="capitalize">{app.status}</p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">Created</p>
            <p>{new Date(app.createdAt).toLocaleString()}</p>
          </div>

          <div>
            <p className="text-sm text-zinc-500">Updated</p>
            <p>{new Date(app.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
