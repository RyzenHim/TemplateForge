"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Loader2,
  MonitorSmartphone,
  Save,
  Sparkles,
  Upload,
} from "lucide-react";

import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";

import { useApp } from "@/app/lib/hooks/app/useApp";
import { useUpdateApp } from "@/app/lib/hooks/app/useUpdateApp";
import { showApiError, showApiSuccess } from "@/app/lib/utils";

const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Use a 6-digit hex colour, for example #4F46E5");

const appEditorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "App name must be at least 2 characters")
    .max(50),
  description: z
    .string()
    .trim()
    .max(200, "Description cannot exceed 200 characters"),
  packageName: z
    .string()
    .trim()
    .regex(
      /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/,
      "Enter a valid Android package name",
    ),
  websiteUrl: z.union([
    z.literal(""),
    z.string().url("Enter a valid website URL"),
  ]),
  version: z
    .string()
    .trim()
    .regex(/^$|^\d+\.\d+(\.\d+)?$/, "Use a version such as 1.0.0"),
  icon: z.union([z.literal(""), z.string().url("Enter a valid icon URL")]),
  branding: z.object({ primaryColor: hexColor }),
  splashScreen: z.object({
    type: z.enum(["animation", "logo", "image"]),
    animationJson: z.string(),
    logoImage: z.union([
      z.literal(""),
      z.string().url("Enter a valid image URL"),
    ]),
    fullImage: z.union([
      z.literal(""),
      z.string().url("Enter a valid image URL"),
    ]),
    backgroundColor: hexColor,
    playbackBehaviour: z.enum(["once", "loop"]),
  }),
  appPermissions: z.object({
    camera: z.boolean(),
    microphone: z.boolean(),
    location: z.boolean(),
    storage: z.boolean(),
    notifications: z.boolean(),
  }),
  appSettings: z.object({
    statusBarColor: hexColor,
    orientation: z.enum(["portrait", "landscape", "both"]),
    fullScreen: z.boolean(),
    systemNavigationBarColor: hexColor,
    pinchToZoom: z.boolean(),
    callbackOnResume: z.boolean(),
    disableCaching: z.boolean(),
    kioskMode: z.boolean(),
    disableScrollBounce: z.boolean(),
  }),
});

type AppEditorValues = z.infer<typeof appEditorSchema>;

const editorDefaults: AppEditorValues = {
  name: "",
  description: "",
  packageName: "",
  websiteUrl: "",
  version: "1.0.0",
  icon: "",
  branding: { primaryColor: "#4F46E5" },
  splashScreen: {
    type: "logo",
    animationJson: "",
    logoImage: "",
    fullImage: "",
    backgroundColor: "#FFFFFF",
    playbackBehaviour: "once",
  },
  appPermissions: {
    camera: false,
    microphone: false,
    location: false,
    storage: false,
    notifications: false,
  },
  appSettings: {
    statusBarColor: "#FFFFFF",
    orientation: "portrait",
    fullScreen: false,
    systemNavigationBarColor: "#FFFFFF",
    pinchToZoom: true,
    callbackOnResume: false,
    disableCaching: false,
    kioskMode: false,
    disableScrollBounce: false,
  },
};

const permissions = [
  ["camera", "Camera", "Allow the app to capture photos and video."],
  ["microphone", "Microphone", "Allow the app to record audio."],
  ["location", "Location", "Allow the app to access the device location."],
  ["storage", "Storage", "Allow access to files and media."],
  ["notifications", "Notifications", "Allow the app to send notifications."],
] as const;

const settingToggles = [
  ["fullScreen", "Enable full screen", "Hide system UI while the app is open."],
  ["pinchToZoom", "Enable pinch to zoom", "Let users zoom web content."],
  [
    "callbackOnResume",
    "Callback on app resume",
    "Run the configured callback after returning to the app.",
  ],
  ["disableCaching", "Disable caching", "Always load fresh web content."],
  [
    "kioskMode",
    "Enable kiosk mode",
    "Keep the app focused for managed devices.",
  ],
  [
    "disableScrollBounce",
    "Disable scroll bounce",
    "Remove the overscroll bounce effect.",
  ],
] as const;

export default function EditAppPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: app, isLoading } = useApp(id);
  const { mutate: updateApp, isPending: isUpdating } = useUpdateApp();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true,
    branding: true,
    splash: true,
    permissions: true,
    settings: true,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AppEditorValues>({
    resolver: zodResolver(appEditorSchema),
    defaultValues: editorDefaults,
    mode: "onBlur",
  });

  useEffect(() => {
    if (app) {
      reset({
        name: app.name || "",
        description: app.description || "",
        packageName: app.packageName || "",
        websiteUrl: app.websiteUrl || "",
        version: app.version || "1.0.0",
        icon: app.icon || "",
        branding: {
          primaryColor: app.branding?.primaryColor || "#4F46E5",
        },
        splashScreen: {
          type: app.splashScreen?.type || "logo",
          animationJson: app.splashScreen?.animationJson || "",
          logoImage: app.splashScreen?.logoImage || "",
          fullImage: app.splashScreen?.fullImage || "",
          backgroundColor: app.splashScreen?.backgroundColor || "#FFFFFF",
          playbackBehaviour: app.splashScreen?.playbackBehaviour || "once",
        },
        appPermissions: {
          camera: Boolean(app.appPermissions?.camera),
          microphone: Boolean(app.appPermissions?.microphone),
          location: Boolean(app.appPermissions?.location),
          storage: Boolean(app.appPermissions?.storage),
          notifications: Boolean(app.appPermissions?.notifications),
        },
        appSettings: {
          statusBarColor: app.appSettings?.statusBarColor || "#FFFFFF",
          orientation: app.appSettings?.orientation || "portrait",
          fullScreen: Boolean(app.appSettings?.fullScreen),
          systemNavigationBarColor:
            app.appSettings?.systemNavigationBarColor || "#FFFFFF",
          pinchToZoom: app.appSettings?.pinchToZoom !== false,
          callbackOnResume: Boolean(app.appSettings?.callbackOnResume),
          disableCaching: Boolean(app.appSettings?.disableCaching),
          kioskMode: Boolean(app.appSettings?.kioskMode),
          disableScrollBounce: Boolean(app.appSettings?.disableScrollBounce),
        },
      });
    }
  }, [app, reset]);

  const values = useWatch({ control }) ?? editorDefaults;
  // console.log("splash screen", values.splashScreen.type);
  // console.log("orientation", values.appSettings.orientation);
  console.log("on the app edit page");
  const selectedPermissions = Object.values(values.appPermissions ?? {}).filter(
    Boolean,
  ).length;

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  function onSubmit(data: AppEditorValues) {
    updateApp(
      {
        id,
        data,
      },
      {
        onSuccess(response) {
          showApiSuccess(response.message);
          router.push(`/dashboard/apps/${id}`);
        },
        onError(error) {
          showApiError(error);
        },
      },
    );
  }

  const sectionClass =
    "rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900";
  const inputClass =
    "mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white";
  const labelClass = "text-sm font-medium text-zinc-800 dark:text-zinc-200";

  if (isLoading) {
    return <Loader text="Loading application..." />;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="min-h-screen bg-zinc-50 pb-28 dark:bg-zinc-950"
    >
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/apps/${id}`)}
              className="rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              aria-label="Back to details"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Edit application
              </p>
              <h1 className="truncate text-xl font-bold text-zinc-950 dark:text-white">
                {values.name || "Edit details"}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Edit configurations and capabilities for this application. Once
              ready, click Save changes.
            </p>

            <EditorSection
              title="Basic information"
              description="Identity details for this application."
              open={openSections.basic}
              onToggle={() => toggleSection("basic")}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="App name" error={errors.name?.message}>
                  <input
                    className={inputClass}
                    placeholder="Shopping App"
                    {...register("name")}
                  />
                </Field>
                <Field
                  label="Package name"
                  hint="Cannot be modified"
                  error={errors.packageName?.message}
                >
                  <input
                    className={`${inputClass} bg-zinc-100 dark:bg-zinc-850 cursor-not-allowed`}
                    placeholder="com.templateforge.shopping"
                    disabled
                    {...register("packageName")}
                  />
                </Field>
                <Field
                  label="Version"
                  hint="For example, 1.0.0"
                  error={errors.version?.message}
                >
                  <input
                    className={inputClass}
                    placeholder="1.0.0"
                    {...register("version")}
                  />
                </Field>
                <Field label="Website URL" error={errors.websiteUrl?.message}>
                  <input
                    className={inputClass}
                    placeholder="https://example.com"
                    {...register("websiteUrl")}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field
                    label="Description"
                    error={errors.description?.message}
                  >
                    <textarea
                      className={`${inputClass} min-h-24 resize-y`}
                      placeholder="A short description of your app"
                      {...register("description")}
                    />
                  </Field>
                </div>
              </div>
            </EditorSection>

            <EditorSection
              title="Branding"
              description="Set the app icon and primary brand colour."
              open={openSections.branding}
              onToggle={() => toggleSection("branding")}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="App icon URL" error={errors.icon?.message}>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      className={inputClass.replace(
                        "w-full ",
                        "min-w-0 flex-1 ",
                      )}
                      placeholder="https://.../icon.png"
                      {...register("icon")}
                    />
                    <button
                      type="button"
                      className="mt-1.5 inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-300 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      <Upload size={16} /> Upload
                    </button>
                  </div>
                </Field>
                <Field
                  label="Primary colour"
                  error={errors.branding?.primaryColor?.message}
                >
                  <div className="mt-1.5 flex items-center gap-3">
                    <input
                      type="color"
                      className="h-10 w-12 cursor-pointer rounded border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950"
                      {...register("branding.primaryColor")}
                    />
                    <input
                      className={`${inputClass} mt-0`}
                      {...register("branding.primaryColor")}
                    />
                  </div>
                </Field>
              </div>
            </EditorSection>

            <EditorSection
              title="Splash screen"
              description="Choose how the app introduces itself while loading."
              open={openSections.splash}
              onToggle={() => toggleSection("splash")}
            >
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  {(["logo", "image", "animation"] as const).map((type) => (
                    <div
                      key={type}
                      onClick={() =>
                        setValue("splashScreen.type", type, {
                          shouldDirty: true,
                        })
                      }
                      className={`cursor-pointer rounded-xl border p-4 transition ${values.splashScreen?.type === type ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"}`}
                    >
                      <input
                        type="radio"
                        value={type}
                        className="sr-only"
                        {...register("splashScreen.type")}
                        checked={values.splashScreen?.type === type}
                        readOnly
                      />
                      <span className="block text-sm font-semibold capitalize text-zinc-900 dark:text-white">
                        {type === "image" ? "Full image" : type}
                      </span>
                      <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                        {type === "animation"
                          ? "Use a Lottie JSON URL"
                          : type === "image"
                            ? "Fill the screen with an image"
                            : "Show a centred logo"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {values.splashScreen?.type === "animation" ? (
                    <Field label="Animation JSON URL">
                      <input
                        className={inputClass}
                        placeholder="https://.../animation.json"
                        {...register("splashScreen.animationJson")}
                      />
                    </Field>
                  ) : values.splashScreen?.type === "image" ? (
                    <Field
                      label="Full image URL"
                      error={errors.splashScreen?.fullImage?.message}
                    >
                      <input
                        className={inputClass}
                        placeholder="https://.../splash.png"
                        {...register("splashScreen.fullImage")}
                      />
                    </Field>
                  ) : (
                    <Field
                      label="Logo image URL"
                      error={errors.splashScreen?.logoImage?.message}
                    >
                      <input
                        className={inputClass}
                        placeholder="https://.../logo.png"
                        {...register("splashScreen.logoImage")}
                      />
                    </Field>
                  )}
                  <Field
                    label="Background colour"
                    error={errors.splashScreen?.backgroundColor?.message}
                  >
                    <div className="mt-1.5 flex items-center gap-3">
                      <input
                        type="color"
                        className="h-10 w-12 cursor-pointer rounded border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950"
                        {...register("splashScreen.backgroundColor")}
                      />
                      <input
                        className={`${inputClass} mt-0`}
                        {...register("splashScreen.backgroundColor")}
                      />
                    </div>
                  </Field>
                </div>
                <fieldset>
                  <legend className={labelClass}>Playback behaviour</legend>
                  <div className="mt-2 flex gap-3">
                    {(["once", "loop"] as const).map((option) => (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        <input
                          type="radio"
                          value={option}
                          className="accent-indigo-600"
                          {...register("splashScreen.playbackBehaviour")}
                        />
                        <span className="capitalize">{option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </EditorSection>

            <EditorSection
              title="App permissions"
              description="Enable only the capabilities your app genuinely needs."
              open={openSections.permissions}
              onToggle={() => toggleSection("permissions")}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {permissions.map(([key, title, description]) => (
                  <ToggleCard
                    key={key}
                    title={title}
                    description={description}
                    checked={Boolean(values.appPermissions?.[key])}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      {...register(`appPermissions.${key}`)}
                    />
                  </ToggleCard>
                ))}
              </div>
            </EditorSection>

            <EditorSection
              title="App settings"
              description="Control the device and web-view behaviour."
              open={openSections.settings}
              onToggle={() => toggleSection("settings")}
            >
              <div className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Status bar colour"
                    error={errors.appSettings?.statusBarColor?.message}
                  >
                    <div className="mt-1.5 flex items-center gap-3">
                      <input
                        type="color"
                        className="h-10 w-12 cursor-pointer rounded border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950"
                        {...register("appSettings.statusBarColor")}
                      />
                      <input
                        className={`${inputClass} mt-0`}
                        {...register("appSettings.statusBarColor")}
                      />
                    </div>
                  </Field>
                  <Field
                    label="System navigation bar colour"
                    error={
                      errors.appSettings?.systemNavigationBarColor?.message
                    }
                  >
                    <div className="mt-1.5 flex items-center gap-3">
                      <input
                        type="color"
                        className="h-10 w-12 cursor-pointer rounded border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950"
                        {...register("appSettings.systemNavigationBarColor")}
                      />
                      <input
                        className={`${inputClass} mt-0`}
                        {...register("appSettings.systemNavigationBarColor")}
                      />
                    </div>
                  </Field>
                </div>
                <fieldset>
                  <legend className={labelClass}>Screen orientation</legend>
                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    {(["portrait", "landscape", "both"] as const).map(
                      (option) => (
                        <div
                          key={option}
                          onClick={() =>
                            setValue("appSettings.orientation", option, {
                              shouldDirty: true,
                            })
                          }
                          className={`cursor-pointer rounded-lg border px-4 py-3 text-sm font-medium capitalize transition ${values.appSettings?.orientation === option ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300" : "border-zinc-200 text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-300"}`}
                        >
                          <input
                            type="radio"
                            value={option}
                            className="sr-only"
                            {...register("appSettings.orientation")}
                            checked={values.appSettings?.orientation === option}
                            readOnly
                          />
                          {option}
                        </div>
                      ),
                    )}
                  </div>
                </fieldset>
                <div className="grid gap-3 sm:grid-cols-2">
                  {settingToggles.map(([key, title, description]) => (
                    <ToggleCard
                      key={key}
                      title={title}
                      description={description}
                      checked={Boolean(values.appSettings?.[key])}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        {...register(`appSettings.${key}`)}
                      />
                    </ToggleCard>
                  ))}
                </div>
              </div>
            </EditorSection>
          </div>

          <aside className="sticky top-6 hidden space-y-5 lg:block">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="font-semibold text-zinc-950 dark:text-white">
                Live Preview
              </h2>
              <div className="mt-4 flex flex-col items-center">
                <div
                  className="relative flex h-[360px] w-[180px] flex-col overflow-hidden rounded-[24px] border-[6px] border-zinc-950 bg-white shadow-xl dark:bg-zinc-900"
                  style={{
                    borderColor: values.branding?.primaryColor || "#09090b",
                  }}
                >
                  <div
                    className="flex h-5 items-center justify-between px-2 text-[8px] font-medium"
                    style={{
                      backgroundColor:
                        values.appSettings?.statusBarColor || "#FFFFFF",
                      color:
                        values.appSettings?.statusBarColor === "#FFFFFF"
                          ? "#000"
                          : "#FFF",
                    }}
                  >
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col items-center justify-center p-3 text-center">
                    {values.icon ? (
                      <img
                        src={values.icon}
                        alt="Preview Icon"
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="text-2xl">📱</div>
                    )}
                    <span className="mt-2 block truncate text-[10px] font-bold text-zinc-900 dark:text-white">
                      {values.name || "App Name"}
                    </span>
                  </div>
                  <div
                    className="h-5"
                    style={{
                      backgroundColor:
                        values.appSettings?.systemNavigationBarColor ||
                        "#FFFFFF",
                    }}
                  />
                </div>
                <div className="mt-6 space-y-3 text-sm w-full">
                  <PreviewItem
                    label="Package"
                    value={values.packageName || "Not set"}
                  />
                  <PreviewItem
                    label="Version"
                    value={values.version || "Not set"}
                  />
                  <PreviewItem
                    label="Orientation"
                    value={values.appSettings?.orientation || "portrait"}
                    capitalized
                  />
                  <PreviewItem
                    label="Permissions"
                    value={`${selectedPermissions} enabled`}
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="fixed left-64 right-0 bottom-0 z-20 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto flex max-w-7xl flex-col-reverse gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/apps/${id}`)}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating && <Loader2 size={16} className="animate-spin" />}
              Save changes
              <Check size={16} />
            </button>
          </div>
        </div>
      </footer>
    </form>
  );
}

function EditorSection({
  title,
  description,
  open,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
      >
        <span>
          <span className="block font-semibold text-zinc-950 dark:text-white">
            {title}
          </span>
          <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </span>
        </span>
        {open ? (
          <ChevronUp size={20} className="shrink-0 text-zinc-500" />
        ) : (
          <ChevronDown size={20} className="shrink-0 text-zinc-500" />
        )}
      </button>
      {open && (
        <div className="border-t border-zinc-100 px-5 py-5 dark:border-zinc-800">
          {children}
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </span>
      {hint && <span className="ml-2 text-xs text-zinc-500">{hint}</span>}
      {children}
      {error && (
        <span className="mt-1.5 block text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </label>
  );
}

function ToggleCard({
  title,
  description,
  checked,
  children,
}: {
  title: string;
  description: string;
  checked: boolean;
  children: ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-4 transition ${checked ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"}`}
    >
      <span>
        <span className="block text-sm font-semibold text-zinc-900 dark:text-white">
          {title}
        </span>
        <span className="mt-1 block text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          {description}
        </span>
      </span>
      <span
        className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 rounded-full transition ${checked ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-600"}`}
      >
        {children}
        <span
          className={`pointer-events-none absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "left-4" : "left-0.5"}`}
        />
      </span>
    </label>
  );
}

function PreviewItem({
  label,
  value,
  capitalized = false,
}: {
  label: string;
  value: string;
  capitalized?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
      <span
        className={`max-w-40 truncate text-right font-medium text-zinc-900 dark:text-white ${capitalized ? "capitalize" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
