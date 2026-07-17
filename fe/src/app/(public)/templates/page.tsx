"use client";

import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";
import { usePublicTemplates } from "@/app/lib/hooks/template/usePublicTemplates";

export default function PublicTemplatePage() {
  const { data: templates = [], isLoading, isError } = usePublicTemplates();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Public Templates</h1>

          <p className="mt-1 text-sm text-gray-500">
            Browse reusable templates shared by the community.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Card className="flex min-h-[300px] items-center justify-center">
          <p className="text-red-500">Failed to load public templates.</p>
        </Card>
      ) : templates.length === 0 ? (
        <Card className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              No Public Templates Available
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              There are currently no public templates to explore.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="p-5">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">{template.name}</h3>

                  <p className="mt-2 text-sm text-gray-500">
                    {template.description || "No description provided."}
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button variant="secondary">Use Template</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
