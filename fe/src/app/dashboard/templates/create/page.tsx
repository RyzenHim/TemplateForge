"use client";

import { useForm } from "react-hook-form";

import Card from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";

import { useAppSelector } from "@/app/lib/redux/hook/hooks";

interface CreateTemplateFormData {
  name: string;
  description: string;
}

export default function CreateTemplatePage() {
  const { templateInfo } = useAppSelector((state) => state.createTemplate);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTemplateFormData>({
    defaultValues: templateInfo,
  });

  function onSubmit(data: CreateTemplateFormData) {
    console.log(data);

    // TODO:
    // 1. Collect remaining editor data
    // 2. Call create template API
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Template</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure a reusable template for your future applications.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="space-y-5 p-6">
          <h2 className="text-lg font-semibold">Basic Information</h2>

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
            placeholder="Reusable template for shopping applications"
            {...register("description")}
            error={errors.description?.message}
          />
        </Card>

        {/* Branding Section */}

        <Card className="p-6">
          <h2 className="text-lg font-semibold">Branding</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Branding configuration will be added here.
          </p>
        </Card>

        {/* Splash Screen */}

        <Card className="p-6">
          <h2 className="text-lg font-semibold">Splash Screen</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Splash screen configuration will be added here.
          </p>
        </Card>

        {/* Permissions */}

        <Card className="p-6">
          <h2 className="text-lg font-semibold">Permissions</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Permissions configuration will be added here.
          </p>
        </Card>

        {/* Settings */}

        <Card className="p-6">
          <h2 className="text-lg font-semibold">Settings</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            App settings configuration will be added here.
          </p>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Create Template</Button>
        </div>
      </form>
    </div>
  );
}
