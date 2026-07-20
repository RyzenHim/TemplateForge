"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";
import { useTemplate } from "@/app/lib/hooks/template/useTemplate";
import { useUpdateTemplate } from "@/app/lib/hooks/template/useUpdateTemplate";
import { showApiError, showApiSuccess } from "@/app/lib/utils";

const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Use a 6-digit hex colour, for example #4F46E5");

const templateEditorSchema = z.object({
  name: z.string().trim().min(1, "Template name is required").max(100),
  description: z.string().trim().max(500),
  visibility: z.enum(["public", "private"]),
  thumbnail: z.union([
    z.literal(""),
    z.string().url("Enter a valid thumbnail URL"),
  ]),
  category: z.string().trim(),
  tags: z.array(z.string().trim().min(1)),
  branding: z.object({ primaryColor: hexColor }),
  splashScreen: z.object({
    type: z.enum(["animation", "logo", "image"]),
    animationJson: z.string(),
    logoImage: z.string(),
    fullImage: z.string(),
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

type TemplateEditorValues = z.infer<typeof templateEditorSchema>;

const editorDefaults: TemplateEditorValues = {
  name: "",
  description: "",
  visibility: "private",
  thumbnail: "",
  category: "",
  tags: [],
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
    statusBarColor: "#000000",
    orientation: "portrait",
    fullScreen: false,
    systemNavigationBarColor: "#FFFFFF",
    pinchToZoom: false,
    callbackOnResume: false,
    disableCaching: false,
    kioskMode: false,
    disableScrollBounce: false,
  },
};

const permissions = [
  ["camera", "Camera", "Allow apps to capture photos and video."],
  ["microphone", "Microphone", "Allow apps to record audio."],
  ["location", "Location", "Allow apps to access the device location."],
  ["storage", "Storage", "Allow access to files and media."],
  ["notifications", "Notifications", "Allow app notifications."],
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

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: template, isLoading } = useTemplate(id);
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateTemplate();
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
    formState: { errors },
  } = useForm<TemplateEditorValues>({
    resolver: zodResolver(templateEditorSchema),
    defaultValues: editorDefaults,
    mode: "onBlur",
  });

  useEffect(() => {
    if (template) {
      reset({
        name: template.name || "",
        description: template.description || "",
        visibility: template.visibility || "private",
        thumbnail: template.thumbnail || "",
        category: template.category || "",
        tags: template.tags || [],
        branding: {
          primaryColor: template.branding?.primaryColor || "#4F46E5",
        },
        splashScreen: {
          type: template.splashScreen?.type || "logo",
          animationJson: template.splashScreen?.animationJson || "",
          logoImage: template.splashScreen?.logoImage || "",
          fullImage: template.splashScreen?.fullImage || "",
          backgroundColor: template.splashScreen?.backgroundColor || "#FFFFFF",
          playbackBehaviour: template.splashScreen?.playbackBehaviour || "once",
        },
        appPermissions: {
          camera: Boolean(template.appPermissions?.camera),
          microphone: Boolean(template.appPermissions?.microphone),
          location: Boolean(template.appPermissions?.location),
          storage: Boolean(template.appPermissions?.storage),
          notifications: Boolean(template.appPermissions?.notifications),
        },
        appSettings: {
          statusBarColor: template.appSettings?.statusBarColor || "#000000",
          orientation: template.appSettings?.orientation || "portrait",
          fullScreen: Boolean(template.appSettings?.fullScreen),
          systemNavigationBarColor:
            template.appSettings?.systemNavigationBarColor || "#FFFFFF",
          pinchToZoom: template.appSettings?.pinchToZoom !== false,
          callbackOnResume: Boolean(template.appSettings?.callbackOnResume),
          disableCaching: Boolean(template.appSettings?.disableCaching),
          kioskMode: Boolean(template.appSettings?.kioskMode),
          disableScrollBounce: Boolean(
            template.appSettings?.disableScrollBounce,
          ),
        },
      });
    }
  }, [template, reset]);

  const values = useWatch({ control }) ?? editorDefaults;
  const selectedPermissions = Object.values(values.appPermissions ?? {}).filter(
    Boolean,
  ).length;

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  function onSubmit(data: TemplateEditorValues) {
    updateTemplate(
      { id, data },
      {
        onSuccess(response) {
          showApiSuccess(response.message);
          router.push(`/dashboard/templates/${id}`);
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
    return <Loader text="Loading template..." />;
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
              onClick={() => router.push(`/dashboard/templates/${id}`)}
              className="rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              aria-label="Back to details"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Edit template
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
              Update the template settings and defaults below. Changes will be
              saved for this template.
            </p>

            <EditorSection
              title="Basic information"
              description="Identity details for this template."
              open={openSections.basic}
              onToggle={() => toggleSection("basic")}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Template name" error={errors.name?.message}>
                  <input
                    className={inputClass}
                    placeholder="Starter Template"
                    {...register("name")}
                  />
                </Field>
                <Field label="Visibility" error={errors.visibility?.message}>
                  <select className={inputClass} {...register("visibility")}>
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </Field>
                <Field label="Category" error={errors.category?.message}>
                  <input
                    className={inputClass}
                    placeholder="E-commerce"
                    {...register("category")}
                  />
                </Field>
                <Field label="Thumbnail URL" error={errors.thumbnail?.message}>
                  <input
                    className={inputClass}
                    placeholder="https://.../thumb.png"
                    {...register("thumbnail")}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field
                    label="Description"
                    error={errors.description?.message}
                  >
                    <textarea
                      className={`${inputClass} min-h-24 resize-y`}
                      placeholder="Describe the template"
                      {...register("description")}
                    />
                  </Field>
                </div>
              </div>
            </EditorSection>

            <EditorSection
              title="Branding"
              description="Set the template brand colour."
              open={openSections.branding}
              onToggle={() => toggleSection("branding")}
            >
              <div className="grid gap-5 sm:grid-cols-2">
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
              description="Choose how apps using this template introduce themselves while loading."
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
              title="Template permissions"
              description="Enable only the capabilities your apps should inherit."
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
              title="Template settings"
              description="Control the defaults for app behaviour."
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
            <Card className="p-5">
              <h2 className="font-semibold text-zinc-950 dark:text-white">
                Preview
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
                    <div className="text-2xl">🎨</div>
                    <span className="mt-2 block truncate text-[10px] font-bold text-zinc-900 dark:text-white">
                      {values.name || "Template"}
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
                <div className="mt-6 w-full space-y-3 text-sm">
                  <PreviewItem
                    label="Visibility"
                    value={values.visibility || "private"}
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
            </Card>
          </aside>
        </div>
      </main>

      <footer className="fixed left-64 right-0 bottom-0 z-20 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto flex max-w-7xl flex-col-reverse gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/templates/${id}`)}
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
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs text-red-500">{error}</span>
      ) : null}
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
      className={`flex cursor-pointer items-start justify-between rounded-xl border p-4 transition ${checked ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"}`}
    >
      <div className="pr-3">
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
          {title}
        </p>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>
      {children}
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
    <div className="flex items-center justify-between rounded-lg border border-zinc-200/70 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
      <span
        className={`font-medium text-zinc-950 dark:text-zinc-50 ${capitalized ? "capitalize" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
