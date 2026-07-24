"use client";

import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAddons } from "@/app/lib/hooks/addons/useAddons";
import { useDeleteAddon } from "@/app/lib/hooks/addons/useDeleteAddon";
import type { Addon } from "@/app/lib/types/addons/addons.types";

function AddonCard({
  addon,
  onDelete,
}: {
  addon: Addon;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border bg-background p-5 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {addon.icon ? (
            <img
              src={addon.icon}
              alt={addon.name}
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
              {addon.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-semibold">{addon.name}</h3>
            <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {addon.platform}
            </span>
          </div>
        </div>
      </div>

      {addon.description && (
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {addon.description}
        </p>
      )}

      <div className="mb-4">
        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
          {addon.category}
        </span>
      </div>

      <div className="flex items-center gap-2 border-t pt-3">
        <Link
          href={`/dashboard/addons/${addon.id}/edit`}
          className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Link>
        <button
          onClick={() => onDelete(addon.id)}
          className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}

export default function AddonPage() {
  const { data: addons, isLoading, isError } = useAddons();
  const deleteAddonMutation = useDeleteAddon();

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this add-on?")) {
      deleteAddonMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Add-ons</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage reusable add-ons for your applications.
          </p>
        </div>

        <Link
          href="/dashboard/addons/create"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Add-on
        </Link>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-muted-foreground">Loading add-ons...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-red-500">
            Failed to load add-ons. Please try again.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && (!addons || addons.length === 0) && (
        <div className="flex min-h-[500px] flex-col items-center justify-center rounded-xl border border-dashed">
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-semibold">No add-ons available</h2>

            <p className="max-w-md text-sm text-muted-foreground">
              You haven't created any add-ons yet. Create your first add-on to
              reuse features across your applications.
            </p>

            <Link
              href="/dashboard/addons/create"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create Your First Add-on
            </Link>
          </div>
        </div>
      )}

      {/* Add-ons Grid */}
      {addons && addons.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {addons.map((addon) => (
            <AddonCard key={addon.id} addon={addon} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
