"use client";
import type { Platform } from "@/app/lib/types/addons/addons.types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";

import {
  AddonsFormProps,
  CreateAddonsRequest,
} from "@/app/lib/types/addons/addons.types";
import { useCreateAddon } from "@/app/lib/hooks/addons/useCreateAddon";
import { useUpdateAddon } from "@/app/lib/hooks/addons/useUpdateAddon";
import { useAddon } from "@/app/lib/hooks/addons/useAddon";
import { showApiError, showApiSuccess } from "@/app/lib/utils";
import Button from "../ui/Button";

export default function AddonsForm({ mode, addonId }: AddonsFormProps) {
  const router = useRouter();
  const createAddonMutation = useCreateAddon();
  const updateAddonMutation = useUpdateAddon();
  const { data: addonData } = useAddon(addonId);

  useEffect(() => {
    console.log("addonData", addonData);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAddonsRequest>({
    defaultValues: {
      name: "",
      platform: "",
      description: "",
      category: "",
      icon: "",
    },
  });

  // Fetch addon data when editing
  useEffect(() => {
    if (mode !== "edit" || !addonId || !addonData) return;

    reset({
      name: addonData.name || "",
      platform: (addonData.platform as Platform | "") || "",
      description: addonData.description || "",
      category: addonData.category || "",
      icon: addonData.icon || "",
    });
  }, [mode, addonId, addonData, reset]);

  const mutationError = createAddonMutation.error || updateAddonMutation.error;
  const isPending =
    createAddonMutation.isPending || updateAddonMutation.isPending;

  const onSubmit = async (data: CreateAddonsRequest) => {
    try {
      if (mode === "create") {
        await createAddonMutation.mutateAsync(data);
        // useCreateAddon handles redirect to /dashboard/addons
      } else {
        const response = await updateAddonMutation.mutateAsync({
          id: addonId!,
          data,
        });
        // Cache invalidation in useUpdateAddon completes before this runs
        showApiSuccess(response.message);
        router.push(`/dashboard/addons/${addonId}`);
      }
    } catch (error) {
      showApiError(error);
    }
  };

  const backHref =
    mode === "edit" && addonId
      ? `/dashboard/addons/${addonId}`
      : "/dashboard/addons";

  const eyebrow = mode === "edit" ? "Edit add-on" : "Add-on editor";
  const submitLabel = mode === "edit" ? "Save changes" : "Create Add-on";

  return (
    <div className="min-h-screen w-full bg-zinc-50 pb-28 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-5 pl-6 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(backHref)}
              className="rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-purple-600 dark:text-purple-400">
                {eyebrow}
              </p>
              <h1 className="truncate text-xl font-bold text-zinc-950 dark:text-white">
                {mode === "create"
                  ? "Create Add-on"
                  : addonData?.name || "Edit details"}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="p-6">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-1.5 text-xs text-zinc-500">
              <Link href="/dashboard/addons" className="hover:underline">
                Add-ons
              </Link>
              <ChevronRight size={12} />
              <span className="font-medium text-zinc-900 dark:text-white">
                {mode === "create" ? "Create" : addonData?.name || "Edit"}
              </span>
            </div>

            {/* Error Banner */}
            {mutationError && (
              <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-600">
                  {mutationError instanceof Error
                    ? mutationError.message
                    : "An unexpected error occurred. Please try again."}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Name <span className="text-red-500">*</span>
                </label>

                <input
                  {...register("name", {
                    required: "Name is required",
                  })}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  placeholder="Firebase Authentication"
                />

                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Platform */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Platform <span className="text-red-500">*</span>
                </label>

                <select
                  {...register("platform", {
                    required: "Platform is required",
                  })}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                >
                  <option value="" disabled>
                    Select Platform
                  </option>
                  <option value="Android">Android</option>
                  <option value="iOS">iOS</option>
                  <option value="Android & iOS">Android & iOS</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Description
                </label>

                <textarea
                  {...register("description")}
                  rows={4}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white min-h-24 resize-y"
                  placeholder="Describe what this add-on does..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Category <span className="text-red-500">*</span>
                </label>

                <input
                  {...register("category", {
                    required: "Category is required",
                  })}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  placeholder="Authentication"
                />

                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Icon */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Icon URL
                </label>

                <input
                  {...register("icon")}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  placeholder="https://..."
                />

                {addonData?.icon && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={addonData.icon}
                      alt="Current icon preview"
                      className="h-10 w-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span className="text-xs text-zinc-500">
                      Current icon preview
                    </span>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => router.push(backHref)}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending && <Loader2 size={16} className="animate-spin" />}
                  {submitLabel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
