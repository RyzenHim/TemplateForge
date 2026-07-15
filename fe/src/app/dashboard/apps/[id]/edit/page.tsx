"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Card from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import Loader from "@/app/components/ui/Loader";

import { useApp } from "@/app/lib/hooks/useApp";
import { useUpdateApp } from "@/app/lib/hooks/useUpdateApp";
import { showApiError, showApiSuccess } from "@/app/lib/utils";

const schema = z.object({
  name: z.string().min(2, "App name must be at least 2 characters"),
  description: z.string().optional(),
  packageName: z
    .string()
    .regex(
      /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/,
      "Enter a valid package name",
    ),
});

type FormData = z.infer<typeof schema>;

export default function EditAppPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const { data: app, isLoading } = useApp(id);

  const { mutate, isPending } = useUpdateApp();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (app) {
      reset({
        name: app.name,
        description: app.description,
        packageName: app.packageName,
      });
    }
  }, [app, reset]);

  function onSubmit(data: FormData) {
    mutate(
      {
        id,
        data,
      },
      {
        onSuccess(response) {
          showApiSuccess(response.message);
          router.push("/dashboard/apps");
        },
        onError(error) {
          showApiError(error);
        },
      },
    );
  }

  if (isLoading) {
    return <Loader text="Loading app..." />;
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit App</h1>

        <p className="mt-2 text-zinc-500">Update your application details.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="App Name"
            id="name"
            {...register("name")}
            error={errors.name?.message}
          />

          <Input
            label="Description"
            id="description"
            {...register("description")}
            error={errors.description?.message}
          />

          <Input
            label="Package Name"
            id="packageName"
            {...register("packageName")}
            error={errors.packageName?.message}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" onClick={() => router.back()}>
              Cancel
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update App"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
