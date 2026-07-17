"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Modal from "@/app/components/ui/Modal";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";

import { useAppDispatch, useAppSelector } from "@/app/lib/redux/hook/hooks";
import { setAppInfo } from "@/app/lib/redux/slices/createAppSlice";

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

interface CreateAppModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateAppModal({ open, onClose }: CreateAppModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const appInfo = useAppSelector((state) => state.createApp.appInfo);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAppFormData>({
    resolver: zodResolver(createAppSchema),
    mode: "onBlur",
    defaultValues: appInfo,
  });

  function onSubmit(data: CreateAppFormData) {
    dispatch(
      setAppInfo({
        ...appInfo,
        ...data,
      }),
    );

    onClose();

    router.push("/dashboard/apps/create");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Application"
      description="Enter basic information to start creating your application."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Modal>
  );
}
