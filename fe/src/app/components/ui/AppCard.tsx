import Link from "next/link";

import Card from "@/app/components/ui/Card";

interface AppCardProps {
  app: {
    id: string;
    name: string;
    description?: string;
    packageName: string;
    templateName: string;
    updatedAt: string;
  };
}

export default function AppCard({ app }: AppCardProps) {
  return (
    <Card className="group transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-3xl">📱</div>

          <h3 className="mt-3 truncate text-lg font-semibold text-zinc-900 dark:text-white">
            {app.name}
          </h3>

          {app.description && (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
              {app.description}
            </p>
          )}
        </div>

        <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
          Active
        </span>
      </div>

      <div className="mt-5 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">Package</span>

          <span className="truncate font-medium text-zinc-900 dark:text-white">
            {app.packageName}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">Template</span>

          <span className="font-medium text-zinc-900 dark:text-white">
            {app.templateName}
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Updated {app.updatedAt}
        </span>

        <Link
          href={`/dashboard/apps/${app.id}`}
          className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Open →
        </Link>
      </div>
    </Card>
  );
}
