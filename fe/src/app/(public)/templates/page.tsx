"use client";

import { useMemo, useState } from "react";

import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";
import TemplateCard from "@/app/components/ui/TemplateCard";
import SearchBar from "@/app/components/ui/SearchBar";
import { usePublicTemplates } from "@/app/lib/hooks/template/usePublicTemplates";

export default function PublicTemplatePage() {
  const { data: templates = [], isLoading, isError } = usePublicTemplates();
  const [searchTerm, setSearchTerm] = useState("");

  const publicTemplates = useMemo(
    () => templates.filter((template) => template.visibility === "public"),
    [templates],
  );

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    if (!normalizedQuery) return publicTemplates;

    return publicTemplates.filter((template) => {
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
  }, [publicTemplates, searchTerm]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Public Templates
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Browse reusable templates shared by the community. Only templates
            saved as public are listed here.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Card className="flex min-h-[300px] items-center justify-center">
          <p className="text-red-500">Failed to load public templates.</p>
        </Card>
      ) : publicTemplates.length === 0 ? (
        <Card className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              No Public Templates Available
            </h2>

            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              There are currently no public templates to explore. Create a
              template and set its save type to public to share it here.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search public templates..."
          />

          {filteredTemplates.length === 0 ? (
            <Card className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  No matching templates
                </h2>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
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
                  actionHref="/login"
                  actionLabel="Use template"
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
