"use client";

import { useMemo, useState } from "react";

import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";
import TemplateCard from "@/app/components/ui/TemplateCard";
import SearchBar from "@/app/components/ui/SearchBar";

import CreateTemplateModal from "./modals/CreateTemplateModal";
import { useTemplates } from "@/app/lib/hooks/template/useTemplates";

export default function TemplatePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: templates = [], isLoading, isError } = useTemplates();

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    if (!normalizedQuery) return templates;

    return templates.filter((template) => {
      const haystacks = [
        template.name,
        template.description,
        template.category,
        ...(template.tags ?? []),
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return haystacks.some((value) => value.includes(normalizedQuery));
    });
  }, [templates, searchTerm]);

  return (
    <>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
        ) : templates.length === 0 ? (
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
          <>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search templates..."
            />

            {filteredTemplates.length === 0 ? (
              <Card className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <h2 className="text-lg font-semibold">No matching templates</h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Try a different search term.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    actionHref="/dashboard/templates"
                    actionLabel="Use template"
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <CreateTemplateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
