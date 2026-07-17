"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import Modal from "@/app/components/ui/Modal";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";

import { useAppDispatch, useAppSelector } from "@/app/lib/redux/hook/hooks";
import { setTemplateInfo } from "@/app/lib/redux/slices/createTemplateSlice";

const createTemplateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Template name must be at least 2 characters")
    .max(50, "Template name cannot exceed 50 characters"),

  description: z
    .string()
    .trim()
    .max(200, "Description cannot exceed 200 characters"),
});

type CreateTemplateFormData = z.infer<typeof createTemplateSchema>;

interface CreateTemplateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateTemplateModal({
  open,
  onClose,
}: CreateTemplateModalProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const templateInfo = useAppSelector(
    (state) => state.createTemplate.templateInfo,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTemplateFormData>({
    resolver: zodResolver(createTemplateSchema),
    mode: "onBlur",
    defaultValues: templateInfo,
  });

  function onSubmit(data: CreateTemplateFormData) {
    dispatch(setTemplateInfo(data));

    onClose();

    router.push("/dashboard/templates/create");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Template"
      description="Enter basic information to start creating your template."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          id="name"
          label="Template Name"
          placeholder="E-Commerce Template"
          {...register("name")}
          error={errors.name?.message}
        />

        <Input
          id="description"
          label="Description"
          placeholder="A reusable template for e-commerce applications"
          {...register("description")}
          error={errors.description?.message}
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
