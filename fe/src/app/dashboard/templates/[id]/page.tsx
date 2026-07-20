"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Eye,
  Pencil,
  ShieldAlert,
  Sparkles,
  Settings,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";

import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";
import { useTemplate } from "@/app/lib/hooks/template/useTemplate";

export default function TemplateDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: template, isLoading, isError } = useTemplate(id);

  if (isLoading) {
    return <Loader text="Loading template details..." />;
  }

  if (isError || !template) {
    return (
      <div className="mx-auto max-w-4xl p-8 text-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 dark:border-red-900/30 dark:bg-red-950/10">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-red-700 dark:text-red-400">
            Template Not Found
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            The template you are trying to view does not exist or you do not
            have permission to view it.
          </p>
          <Button
            className="mt-6"
            onClick={() => router.push("/dashboard/templates")}
          >
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  const isOwnerEditable =
    typeof window !== "undefined" &&
    template.owner === localStorage.getItem("userId");

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/templates")}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label="Back to templates"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Link href="/dashboard/templates" className="hover:underline">
                Templates
              </Link>
              <ChevronRight size={12} />
              <span className="font-medium text-zinc-900 dark:text-white">
                {template.name}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Template Details
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isOwnerEditable ? (
            <Link href={`/dashboard/templates/${template.id}/edit`}>
              <Button className="flex items-center gap-2">
                <Pencil size={16} />
                Edit Template
              </Button>
            </Link>
          ) : null}
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-4xl shadow-md dark:border-zinc-700 dark:bg-zinc-800">
              {template.thumbnail ? (
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                "🎨"
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">
                  {template.name}
                </h2>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {template.visibility}
                </span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {template.description || "No description provided."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-200/60 bg-zinc-50/50 p-4 text-sm md:w-80 dark:border-zinc-800 dark:bg-zinc-900/30">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Category
              </p>
              <p className="font-semibold text-zinc-950 dark:text-zinc-50">
                {template.category || "General"}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Tags</p>
              <p className="font-semibold text-zinc-950 dark:text-zinc-50">
                {template.tags?.length ? template.tags.length : 0}
              </p>
            </div>
            <div className="col-span-2 border-t border-zinc-200/60 pt-2 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Last Modified
              </p>
              <p className="text-zinc-950 dark:text-zinc-50">
                {new Date(template.updatedAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Sparkles size={18} />
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
              Branding
            </h3>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Primary Color
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <span
                className="h-8 w-8 rounded-lg border border-zinc-200 shadow-sm dark:border-zinc-700"
                style={{
                  backgroundColor: template.branding?.primaryColor || "#4F46E5",
                }}
              />
              <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {template.branding?.primaryColor || "#4F46E5"}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div className="rounded-lg bg-violet-50 p-1.5 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <Eye size={18} />
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
              Splash Screen
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Type</p>
              <p className="mt-1 font-semibold capitalize text-zinc-900 dark:text-zinc-100">
                {template.splashScreen?.type || "logo"}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Background Color
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className="h-6 w-6 rounded-md border border-zinc-200 shadow-sm dark:border-zinc-700"
                  style={{
                    backgroundColor:
                      template.splashScreen?.backgroundColor || "#FFFFFF",
                  }}
                />
                <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {template.splashScreen?.backgroundColor || "#FFFFFF"}
                </span>
              </div>
            </div>
            {template.splashScreen?.type === "animation" && (
              <div className="col-span-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Animation JSON URL</p>
                <p className="mt-1 break-all text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {template.splashScreen?.animationJson || "Not set"}
                </p>
              </div>
            )}
            {template.splashScreen?.type === "image" && (
              <div className="col-span-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Full Image URL</p>
                <p className="mt-1 break-all text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {template.splashScreen?.fullImage || "Not set"}
                </p>
              </div>
            )}
            {template.splashScreen?.type === "logo" && (
              <div className="col-span-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Logo Image URL</p>
                <p className="mt-1 break-all text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {template.splashScreen?.logoImage || "Not set"}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Playback Behaviour</p>
              <p className="mt-1 font-semibold capitalize text-zinc-900 dark:text-zinc-100">
                {template.splashScreen?.playbackBehaviour || "once"}
              </p>
            </div>
          </div>
        </Card>

        {/* Card 3: App Settings */}
        <Card className="p-6 space-y-6 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div className="rounded-lg bg-zinc-50 p-1.5 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400">
              <Settings size={18} />
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
              App Settings
            </h3>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Screen Orientation</p>
              <p className="mt-1 font-semibold capitalize text-zinc-900 dark:text-zinc-100">
                {template.appSettings?.orientation || "portrait"}
              </p>
            </div>

            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Status Bar Color</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className="h-6 w-6 rounded-md border border-zinc-200 shadow-sm dark:border-zinc-700"
                  style={{
                    backgroundColor: template.appSettings?.statusBarColor || "#FFFFFF",
                  }}
                />
                <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {template.appSettings?.statusBarColor || "#FFFFFF"}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">System Navigation Bar Color</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className="h-6 w-6 rounded-md border border-zinc-200 shadow-sm dark:border-zinc-700"
                  style={{
                    backgroundColor: template.appSettings?.systemNavigationBarColor || "#FFFFFF",
                  }}
                />
                <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {template.appSettings?.systemNavigationBarColor || "#FFFFFF"}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">Device Features</h4>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">Full Screen Mode</span>
                {template.appSettings?.fullScreen ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check size={14} /> Enabled</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-zinc-400"><X size={14} /> Disabled</span>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">Pinch to Zoom</span>
                {template.appSettings?.pinchToZoom ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check size={14} /> Enabled</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-zinc-400"><X size={14} /> Disabled</span>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">Callback on Resume</span>
                {template.appSettings?.callbackOnResume ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check size={14} /> Enabled</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-zinc-400"><X size={14} /> Disabled</span>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">Disable Caching</span>
                {template.appSettings?.disableCaching ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check size={14} /> Enabled</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-zinc-400"><X size={14} /> Disabled</span>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">Kiosk Mode</span>
                {template.appSettings?.kioskMode ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check size={14} /> Enabled</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-zinc-400"><X size={14} /> Disabled</span>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">Disable Scroll Bounce</span>
                {template.appSettings?.disableScrollBounce ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check size={14} /> Enabled</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-zinc-400"><X size={14} /> Disabled</span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Card 4: App Permissions */}
        <Card className="p-6 space-y-6 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <ShieldCheck size={18} />
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
              App Permissions
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">Camera</span>
              {template.appPermissions?.camera ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check size={14} /> Allowed</span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-zinc-400"><X size={14} /> Denied</span>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">Microphone</span>
              {template.appPermissions?.microphone ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check size={14} /> Allowed</span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-zinc-400"><X size={14} /> Denied</span>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">Location Access</span>
              {template.appPermissions?.location ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check size={14} /> Allowed</span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-zinc-400"><X size={14} /> Denied</span>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">Storage Access</span>
              {template.appPermissions?.storage ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check size={14} /> Allowed</span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-zinc-400"><X size={14} /> Denied</span>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
              <span className="text-zinc-600 dark:text-zinc-400">Push Notifications</span>
              {template.appPermissions?.notifications ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><Check size={14} /> Allowed</span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-zinc-400"><X size={14} /> Denied</span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
