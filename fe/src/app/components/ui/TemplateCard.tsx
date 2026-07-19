import Link from "next/link";

import Card from "@/app/components/ui/Card";
import type { Template } from "@/app/lib/types/template.types";

interface TemplateCardProps {
  template: Template;
  actionHref?: string;
  actionLabel?: string;
}

function formatUpdatedAt(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TemplateCard({
  template,
  actionHref = "/login",
  actionLabel = "Use template",
}: TemplateCardProps) {
  const visibleTags = template.tags?.slice(0, 3) ?? [];

  return (
    <Card className="group flex h-full flex-col transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {template.thumbnail ? (
            <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
              <img
                src={template.thumbnail}
                alt={`${template.name} thumbnail`}
                className="h-28 w-full object-cover"
              />
            </div>
          ) : (
            <div
              className="flex h-28 items-center justify-center rounded-xl border border-zinc-200 text-4xl dark:border-zinc-800"
              style={{
                backgroundColor: `${template.branding.primaryColor}20`,
              }}
            >
              🎨
            </div>
          )}

          <h3 className="mt-4 truncate text-lg font-semibold text-zinc-900 dark:text-white">
            {template.name}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
            {template.description || "No description provided."}
          </p>
        </div>

        <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          {template.visibility}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {template.category ? (
          <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
            {template.category}
          </span>
        ) : null}
        {visibleTags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-violet-50 px-2.5 py-1 text-xs text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Updated {formatUpdatedAt(template.updatedAt)}
        </span>

        <Link
          href={actionHref}
          className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {actionLabel} →
        </Link>
      </div>
    </Card>
  );
}
