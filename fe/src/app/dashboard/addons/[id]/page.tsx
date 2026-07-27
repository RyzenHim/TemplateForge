"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Pencil,
  Puzzle,
  ShieldAlert,
  Smartphone,
  Tag,
  CalendarClock,
} from "lucide-react";

import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";

import { useAddon } from "@/app/lib/hooks/addons/useAddon";

export default function AddonDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: addon, isLoading, isError } = useAddon(id);

  if (isLoading) {
    return <Loader text="Loading addon details..." />;
  }

  if (isError || !addon) {
    return (
      <div className="mx-auto max-w-4xl p-8 text-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 dark:border-red-900/30 dark:bg-red-950/10">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-red-700 dark:text-red-400">
            Addon Not Found
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            The addon you are trying to view does not exist or you do not have
            permission to view it.
          </p>
          <Button
            className="mt-6"
            onClick={() => router.push("/dashboard/addons")}
          >
            Back to Add-ons
          </Button>
        </div>
      </div>
    );
  }

  const currentUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const canEdit = currentUserId && addon.owner === currentUserId;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 sm:p-8">
      {/* Back & Breadcrumb Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/addons")}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label="Back to addons"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Link href="/dashboard/addons" className="hover:underline">
                Add-ons
              </Link>
              <ChevronRight size={12} />
              <span className="font-medium text-zinc-900 dark:text-white">
                {addon.name}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Addon Details
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canEdit ? (
            <Link href={`/dashboard/addons/${addon.id}/edit`}>
              <Button className="flex items-center gap-2">
                <Pencil size={16} />
                Edit Addon
              </Button>
            </Link>
          ) : null}
        </div>
      </div>

      {/* Main Info Card */}
      <Card className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-4xl shadow-md border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700">
              {addon.icon ? (
                <img
                  src={addon.icon}
                  alt={addon.name}
                  className="h-full w-full object-cover rounded-2xl"
                />
              ) : (
                <Puzzle className="h-8 w-8 text-purple-500" />
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">
                  {addon.name}
                </h2>
                <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                  {addon.platform}
                </span>
              </div>
              {addon.description && (
                <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
                  {addon.description}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-200/60 bg-zinc-50/50 p-4 text-sm md:w-64 dark:border-zinc-800 dark:bg-zinc-900/30">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Category
              </p>
              <p className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">
                {addon.category}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Platform
              </p>
              <p className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">
                {addon.platform}
              </p>
            </div>
            <div className="col-span-2 border-t border-zinc-200/60 pt-2 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Last Modified
              </p>
              <p className="text-zinc-950 dark:text-zinc-50">
                {new Date(addon.updatedAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Description Card */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <div className="rounded-lg bg-purple-50 p-1.5 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
            <Puzzle size={18} />
          </div>
          <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
            Addon Information
          </h3>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Description
            </p>
            <p className="mt-1.5 text-sm text-zinc-700 dark:text-zinc-300">
              {addon.description || "No description provided."}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Category
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <Tag size={14} className="text-zinc-400" />
                <span className="rounded-md bg-purple-50 px-2.5 py-1 text-sm font-medium text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                  {addon.category}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Platform
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <Smartphone size={14} className="text-zinc-400" />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {addon.platform}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Created
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <CalendarClock size={14} className="text-zinc-400" />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {new Date(addon.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
