"use client";
import type { Platform } from "@/app/lib/types/addons/addons.types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  AddonsFormProps,
  CreateAddonsRequest,
} from "@/app/lib/types/addons/addons.types";
import { useCreateAddon } from "@/app/lib/hooks/addons/useCreateAddon";
import { useUpdateAddon } from "@/app/lib/hooks/addons/useUpdateAddon";
import { useAddon } from "@/app/lib/hooks/addons/useAddon";
import Button from "../ui/Button";

export default function AddonsForm({ mode, addonId }: AddonsFormProps) {
  const createAddonMutation = useCreateAddon();
  const updateAddonMutation = useUpdateAddon();
  const { data: addonData } = useAddon(addonId);

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
      } else {
        await updateAddonMutation.mutateAsync({
          id: addonId!,
          data,
        });
      }
    } catch {
      // Error is captured by mutation state, no need to handle here
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-lg border bg-background p-6">
      <h1 className="mb-6 text-2xl font-bold">
        {mode === "create" ? "Create Add-on" : "Edit Add-on"}
      </h1>

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
          <label className="mb-2 block text-sm font-medium">Name</label>

          <input
            {...register("name", {
              required: "Name is required",
            })}
            className="w-full rounded-md border px-3 py-2"
            placeholder="Firebase Authentication"
          />

          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        {/* platform */}
        <div>
          <label className="mb-2 block text-sm font-medium">Platform</label>

          <select
            {...register("platform", {
              required: "Platform is required",
            })}
            className="w-full rounded-md border px-3 py-2"
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
          <label className="mb-2 block text-sm font-medium">Description</label>

          <textarea
            {...register("description")}
            rows={4}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-medium">Category</label>

          <input
            {...register("category", {
              required: "Category is required",
            })}
            className="w-full rounded-md border px-3 py-2"
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
          <label className="mb-2 block text-sm font-medium">Icon URL</label>

          <input
            {...register("icon")}
            className="w-full rounded-md border px-3 py-2"
            placeholder="https://..."
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || isPending}
            className="rounded-md bg-primary px-5 py-2 text-primary-foreground"
          >
            {isPending
              ? "Saving..."
              : mode === "create"
                ? "Create Add-on"
                : "Update Add-on"}
          </Button>
        </div>
      </form>
    </div>
  );
}
