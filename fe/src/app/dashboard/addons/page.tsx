"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";

import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";
import SearchBar from "@/app/components/ui/SearchBar";

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
  const [isDeleting, setIsDeleting] = useState(false);

  const currentUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const canEdit = currentUserId && addon.owner === currentUserId;
  const canDelete = canEdit;

  const handleDelete = () => {
    const ok = window.confirm(`Delete add-on "${addon.name}"?`);
    if (!ok) return;

    setIsDeleting(true);
    onDelete(addon.id);
  };

  // Reset isDeleting if mutation resets
  if (isDeleting) {
    setTimeout(() => setIsDeleting(false), 2000);
  }

  return (
    <Card className="group flex h-full flex-col transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Icon / Thumbnail area */}
          {addon.icon ? (
            <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
              <img
                src={addon.icon}
                alt={`${addon.name} icon`}
                className="h-28 w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-28 items-center justify-center rounded-xl border border-zinc-200 bg-purple-50 text-4xl dark:border-zinc-800 dark:bg-purple-500/10">
              <span className="text-purple-500 dark:text-purple-300">
                {addon.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <h3 className="mt-4 truncate text-lg font-semibold text-zinc-900 dark:text-white">
            {addon.name}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
            {addon.description || "No description provided."}
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-medium capitalize text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300">
          {addon.platform}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {addon.category ? (
          <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
            {addon.category}
          </span>
        ) : null}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Updated{" "}
          {new Date(addon.updatedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>

        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/addons/${addon.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <Eye size={14} /> View
          </Link>

          {canEdit ? (
            <Link
              href={`/dashboard/addons/${addon.id}/edit`}
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <Pencil size={14} /> Edit
            </Link>
          ) : null}

          {canDelete ? (
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="inline-flex items-center gap-1 text-sm font-medium text-red-600 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:text-red-300"
              aria-label={`Delete add-on ${addon.name}`}
            >
              <Trash2 size={14} /> {isDeleting ? "Deleting…" : "Delete"}
            </button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export default function AddonPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: addons = [], isLoading, isError } = useAddons();
  const deleteAddonMutation = useDeleteAddon();

  const handleDelete = (id: string) => {
    deleteAddonMutation.mutate(id);
  };

  const filteredAddons = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    if (!normalizedQuery) return addons;

    return addons.filter((addon) => {
      const haystacks = [
        addon.name,
        addon.description,
        addon.category,
        addon.platform,
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return haystacks.some((value) => value.includes(normalizedQuery));
    });
  }, [addons, searchTerm]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Add-ons</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage reusable add-ons for your applications.
          </p>
        </div>

        <Link href="/dashboard/addons/create">
          <Button>Create Add-on</Button>
        </Link>
      </div>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Card className="flex min-h-[300px] items-center justify-center">
          <p className="text-red-500">Failed to load add-ons.</p>
        </Card>
      ) : addons.length === 0 ? (
        <Card className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold">No Add-ons Yet</h2>

            <p className="mt-2 text-sm text-gray-500">
              Create your first add-on to reuse features across your
              applications.
            </p>

            <Link href="/dashboard/addons/create">
              <Button className="mt-6">Create Add-on</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search add-ons..."
          />

          {filteredAddons.length === 0 ? (
            <Card className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <h2 className="text-lg font-semibold">No matching add-ons</h2>

                <p className="mt-2 text-sm text-gray-500">
                  Try a different search term.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredAddons.map((addon) => (
                <AddonCard
                  key={addon.id}
                  addon={addon}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
