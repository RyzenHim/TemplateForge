"use client";

import { useState } from "react";

import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";
import TemplateCard from "@/app/components/ui/TemplateCard";

import CreateTemplateModal from "./modals/CreateTemplateModal";
import { useTemplates } from "@/app/lib/hooks/template/useTemplates";

export default function TemplatePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: templates = [], isLoading, isError } = useTemplates();
  const privateTemplates = templates.filter(
    (template) => template.visibility === "private",
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Templates</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage reusable templates for your applications.
            </p>
          </div>

          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create Template
          </Button>
        </div>

        {isLoading ? (
          <Loader />
        ) : isError ? (
          <Card className="flex min-h-[300px] items-center justify-center">
            <p className="text-red-500">Failed to load templates.</p>
          </Card>
        ) : privateTemplates.length === 0 ? (
          <Card className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <h2 className="text-lg font-semibold">No Templates Yet</h2>

              <p className="mt-2 text-sm text-gray-500">
                Create your first template to reuse branding, permissions,
                settings, and more across multiple applications.
              </p>

              <Button
                className="mt-6"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Template
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {privateTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                actionHref="/dashboard/templates"
                actionLabel="Use template"
              />
            ))}
          </div>
        )}
      </div>

      <CreateTemplateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
