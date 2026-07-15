"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Card from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";

import { useCreateApp } from "@/app/lib/hooks/useCreateApp";
import { showApiError, showApiSuccess } from "@/app/lib/utils";

const createAppSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "App name must be at least 2 characters")
    .max(50, "App name cannot exceed 50 characters"),

  description: z
    .string()
    .trim()
    .max(200, "Description cannot exceed 200 characters")
    .optional(),

  packageName: z
    .string()
    .trim()
    .min(3, "Package name is required")
    .regex(
      /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/,
      "Enter a valid Android package name",
    ),
});

type CreateAppFormData = z.infer<typeof createAppSchema>;

export default function CreateAppPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAppFormData>({
    resolver: zodResolver(createAppSchema),
    mode: "onBlur",
  });

  const { mutate, isPending } = useCreateApp();

  function onSubmit(data: CreateAppFormData) {
    mutate(data, {
      onSuccess(response) {
        showApiSuccess(response.message);
        router.push("/dashboard/apps");
      },

      onError(error) {
        showApiError(error);
      },
    });
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Create App
        </h1>

        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Create a new application and start customizing it with templates.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            id="name"
            label="App Name"
            placeholder="Shopping App"
            {...register("name")}
            error={errors.name?.message}
          />

          <Input
            id="description"
            label="Description"
            placeholder="A modern e-commerce application"
            {...register("description")}
            error={errors.description?.message}
          />

          <Input
            id="packageName"
            label="Package Name"
            placeholder="com.templateforge.shopping"
            {...register("packageName")}
            error={errors.packageName?.message}
          />

          <div className="flex justify-end gap-4 pt-2">
            <Button
              type="button"
              className="border border-zinc-300 bg-transparent text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
              onClick={() => router.back()}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create App"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
