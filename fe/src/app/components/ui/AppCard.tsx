"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import Card from "@/app/components/ui/Card";
import type { App } from "@/app/lib/types/app.types";

import { useDeleteApp } from "@/app/lib/hooks/app/useDeleteApp";
import { useQueryClient } from "@tanstack/react-query";
import Button from "./Button";

interface AppCardProps {
  app: App;
}

function formatUpdatedAt(value: string) {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return value;
  }
}

export default function AppCard({ app }: AppCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: deleteApp } = useDeleteApp();

  return (
    <Card className="group flex h-full flex-col transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-3xl">📱</div>

          <h3 className="mt-3 truncate text-lg font-semibold text-zinc-900 dark:text-white">
            {app.name}
          </h3>

          {app.description && (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
              {app.description}
            </p>
          )}
        </div>

        <span className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium capitalize text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
          {app.status || "active"}
        </span>
      </div>

      <div className="mt-5 space-y-2 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-zinc-500 dark:text-zinc-400">Package</span>
          <span className="truncate font-medium text-zinc-950 dark:text-zinc-50 text-right max-w-[70%]">
            {app.packageName}
          </span>
        </div>

        <div className="flex justify-between gap-2">
          <span className="text-zinc-500 dark:text-zinc-400">Template</span>
          <span className="truncate font-medium text-zinc-950 dark:text-zinc-50 text-right max-w-[70%]">
            {app.templateName || "None"}
          </span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Updated {formatUpdatedAt(app.updatedAt)}
        </span>
        <Button
          type="button"
          disabled={isDeleting}
          onClick={() => {
            const ok = window.confirm(`Delete app "${app.name}"?`);
            if (!ok) return;

            setIsDeleting(true);
            deleteApp(app.id, {
              onSuccess: async () => {
                await queryClient.refetchQueries({ queryKey: ["apps"] });
                setIsDeleting(false);
              },
              onError: () => {
                setIsDeleting(false);
                window.alert("Failed to delete app.");
              },
            });
          }}
          className="inline-flex items-center gap-1 text-sm font-medium text-red-600 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={`Delete app ${app.name}`}
        >
          <Trash2 size={16} />
          {isDeleting ? "Deleting…" : "Delete"}
        </Button>

        <div className="flex gap-3 items-center">
          <Link
            href={`/dashboard/apps/${app.id}/edit`}
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Edit
          </Link>

          <Link
            href={`/dashboard/apps/${app.id}`}
            className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Open →
          </Link>
        </div>
      </div>
    </Card>
  );
}
