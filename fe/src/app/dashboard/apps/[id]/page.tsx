"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Globe,
  Settings2,
  ShieldAlert,
  Smartphone,
  Sparkles,
} from "lucide-react";

import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";

import { useApp } from "@/app/lib/hooks/app/useApp";

export default function AppDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: app, isLoading, isError } = useApp(id);

  if (isLoading) {
    return <Loader text="Loading app details..." />;
  }

  if (isError || !app) {
    return (
      <div className="mx-auto max-w-4xl p-8 text-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 dark:border-red-900/30 dark:bg-red-950/10">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-red-700 dark:text-red-400">
            Application Not Found
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            The application you are trying to view does not exist or you do not have permission to view it.
          </p>
          <Button className="mt-6" onClick={() => router.push("/dashboard/apps")}>
            Back to Apps
          </Button>
        </div>
      </div>
    );
  }

  const permissionsList = [
    { key: "camera", name: "Camera", desc: "Allow capturing photos & videos" },
    { key: "microphone", name: "Microphone", desc: "Allow recording audio" },
    { key: "location", name: "Location", desc: "Allow accessing GPS location" },
    { key: "storage", name: "Storage", desc: "Allow reading/writing local files" },
    { key: "notifications", name: "Notifications", desc: "Allow sending push notifications" },
  ] as const;

  const settingsList = [
    { key: "fullScreen", name: "Full Screen Mode", desc: "Hides system status/navigation bars" },
    { key: "pinchToZoom", name: "Pinch to Zoom", desc: "Allows users to zoom in/out of pages" },
    { key: "callbackOnResume", name: "Resume Callback", desc: "Executes resume events when app is foregrounded" },
    { key: "disableCaching", name: "Disable Cache", desc: "Force loads fresh web contents" },
    { key: "kioskMode", name: "Kiosk Mode", desc: "Locks app in active full-screen focus" },
    { key: "disableScrollBounce", name: "Disable Scroll Bounce", desc: "Disables overscroll physics bounce" },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 sm:p-8">
      {/* Back & Breadcrumb Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/apps")}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label="Back to apps"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Link href="/dashboard/apps" className="hover:underline">Apps</Link>
              <ChevronRight size={12} />
              <span className="font-medium text-zinc-900 dark:text-white">{app.name}</span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              App Configuration
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/dashboard/apps/${app.id}/edit`}>
            <Button className="flex items-center gap-2">
              <Settings2 size={16} />
              Edit Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Info Card */}
      <Card className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-4xl shadow-md border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700">
              {app.icon ? (
                <img src={app.icon} alt={app.name} className="h-full w-full object-cover rounded-2xl" />
              ) : (
                "📱"
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">{app.name}</h2>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {app.status || "active"}
                </span>
              </div>
              <p className="text-sm font-mono text-zinc-500">{app.packageName}</p>
              {app.description && (
                <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
                  {app.description}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-200/60 bg-zinc-50/50 p-4 text-sm md:w-80 dark:border-zinc-800 dark:bg-zinc-900/30">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Version</p>
              <p className="font-semibold text-zinc-950 dark:text-zinc-50">{app.version || "1.0.0"}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Website</p>
              {app.websiteUrl ? (
                <a
                  href={app.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <Globe size={14} /> Visit
                </a>
              ) : (
                <p className="font-semibold text-zinc-400">None</p>
              )}
            </div>
            <div className="col-span-2 border-t border-zinc-200/60 pt-2 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Last Modified</p>
              <p className="text-zinc-950 dark:text-zinc-50">
                {new Date(app.updatedAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Branding & Design */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Sparkles size={18} />
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Branding & Design</h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Primary Color</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className="h-8 w-8 rounded-lg border border-zinc-200 shadow-sm dark:border-zinc-700"
                  style={{ backgroundColor: app.branding?.primaryColor || "#4F46E5" }}
                />
                <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {app.branding?.primaryColor || "#4F46E5"}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Splash Screen */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div className="rounded-lg bg-violet-50 p-1.5 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
              <Smartphone size={18} />
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Splash Screen</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Splash Type</p>
              <p className="mt-1 font-semibold capitalize text-zinc-900 dark:text-zinc-100">
                {app.splashScreen?.type || "logo"}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Background Color</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className="h-6 w-6 rounded-md border border-zinc-200 shadow-sm dark:border-zinc-700"
                  style={{ backgroundColor: app.splashScreen?.backgroundColor || "#FFFFFF" }}
                />
                <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {app.splashScreen?.backgroundColor || "#FFFFFF"}
                </span>
              </div>
            </div>
            {app.splashScreen?.type === "animation" ? (
              <div className="col-span-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Animation URL (Lottie JSON)</p>
                <p className="mt-1 break-all text-xs font-mono text-zinc-800 dark:text-zinc-200">
                  {app.splashScreen.animationJson || "None"}
                </p>
              </div>
            ) : app.splashScreen?.type === "image" ? (
              <div className="col-span-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Splash Image URL</p>
                <p className="mt-1 break-all text-xs font-mono text-zinc-800 dark:text-zinc-200">
                  {app.splashScreen.fullImage || "None"}
                </p>
              </div>
            ) : (
              <div className="col-span-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Centred Logo URL</p>
                <p className="mt-1 break-all text-xs font-mono text-zinc-800 dark:text-zinc-200">
                  {app.splashScreen?.logoImage || "None"}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Playback Behaviour</p>
              <p className="mt-1 font-semibold capitalize text-zinc-900 dark:text-zinc-100">
                {app.splashScreen?.playbackBehaviour || "once"}
              </p>
            </div>
          </div>
        </Card>

        {/* Permissions */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <ShieldAlert size={18} />
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">App Permissions</h3>
          </div>

          <div className="grid gap-3">
            {permissionsList.map(({ key, name, desc }) => {
              const enabled = Boolean(app.appPermissions?.[key]);
              return (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-zinc-200/60 p-3 dark:border-zinc-800 bg-zinc-50/20"
                >
                  <div>
                    <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{desc}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      enabled
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {enabled ? "Granted" : "Disabled"}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Advanced Settings */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div className="rounded-lg bg-amber-50 p-1.5 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Settings2 size={18} />
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">App Settings</h3>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Screen Orientation</p>
                <p className="mt-1 font-semibold capitalize text-zinc-900 dark:text-zinc-100">
                  {app.appSettings?.orientation || "portrait"}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Status Bar Color</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className="h-5 w-5 rounded border border-zinc-200 shadow-sm dark:border-zinc-700"
                    style={{ backgroundColor: app.appSettings?.statusBarColor || "#FFFFFF" }}
                  />
                  <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {app.appSettings?.statusBarColor || "#FFFFFF"}
                  </span>
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">System Nav Bar Color</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className="h-5 w-5 rounded border border-zinc-200 shadow-sm dark:border-zinc-700"
                    style={{ backgroundColor: app.appSettings?.systemNavigationBarColor || "#FFFFFF" }}
                  />
                  <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {app.appSettings?.systemNavigationBarColor || "#FFFFFF"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800 grid gap-2.5">
              {settingsList.map(({ key, name, desc }) => {
                const enabled = Boolean(app.appSettings?.[key]);
                return (
                  <div key={key} className="flex items-center justify-between text-sm py-1.5">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{name}</p>
                      <p className="text-xs text-zinc-500">{desc}</p>
                    </div>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        enabled ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
