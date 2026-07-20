"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Loader2,
  Save,
  Sparkles,
  Upload,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/app/lib/redux/hook/hooks";
import {
  resetCreateApp,
  setTemplateId,
} from "@/app/lib/redux/slices/createAppSlice";
import { useCreateApp } from "@/app/lib/hooks/app/useCreateApp";
import { useCreateTemplate } from "@/app/lib/hooks/template/useCreateTemplate";
import { usePublicTemplates } from "@/app/lib/hooks/template/usePublicTemplates";
import { useTemplates } from "@/app/lib/hooks/template/useTemplates";
import type { Template } from "@/app/lib/types/template.types";
import Modal from "@/app/components/ui/Modal";

const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Use a 6-digit hex colour, for example #4F46E5");

function cloneValue<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

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

type SaveTemplateFormData = {
  name: string;
  description: string;
  category: string;
  visibility: "private" | "public";
  thumbnail: string;
};

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

/**
 * App editor for /dashboard/apps/create.
 *
 * The CreateAppModal stores the initial appInfo/templateId in Redux. This page
 * starts from that draft, lets the user customise it, and creates the app only
 * from the final submitted payload.
 */
export default function CreateAppPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const draft = useAppSelector((state) => state.createApp);
  const { mutate: createApp, isPending: isCreating } = useCreateApp();
  const { mutate: createTemplate, isPending: isCreatingTemplate } =
    useCreateTemplate();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true,
    branding: true,
    splash: true,
    permissions: true,
    settings: true,
    template: true,
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [importTab, setImportTab] = useState<"private" | "public">("private");

  const { data: privateTemplates = [], isLoading: isLoadingPrivate } =
    useTemplates();
  const { data: publicTemplates = [], isLoading: isLoadingPublic } =
    usePublicTemplates();

  const reduxDefaults = useMemo<AppEditorValues>(
    () => ({
      ...editorDefaults,
      ...draft.appInfo,
    }),
    [draft],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AppEditorValues>({
    resolver: zodResolver(appEditorSchema),
    defaultValues: reduxDefaults,
    mode: "onBlur",
  });

  const {
    register: registerTemplate,
    handleSubmit: handleTemplateSubmit,
    reset: resetTemplateForm,
    formState: { errors: templateErrors },
  } = useForm<SaveTemplateFormData>({
    resolver: zodResolver(
      z.object({
        name: z
          .string()
          .trim()
          .min(2, "Template name must be at least 2 characters"),
        description: z
          .string()
          .trim()
          .max(500, "Description cannot exceed 500 characters"),
        category: z.string().trim().min(1, "Choose a category"),
        visibility: z.enum(["private", "public"]),
        thumbnail: z.union([
          z.literal(""),
          z.string().url("Enter a valid thumbnail URL"),
        ]),
      }),
    ),
    mode: "onBlur",
    defaultValues: {
      name: "",
      description: "",
      category: "",
      visibility: "private",
      thumbnail: "",
    },
  });

  const values = useWatch({ control }) ?? reduxDefaults;

  // Redux can be populated by the modal after this editor is mounted.
  useEffect(() => {
    reset(reduxDefaults);
  }, [reduxDefaults, reset]);

  useEffect(() => {
    if (!isSaveTemplateModalOpen) return;

    resetTemplateForm({
      name: "",
      description: "",
      category: "",
      visibility: "private",
      thumbnail: "",
    });
  }, [isSaveTemplateModalOpen, resetTemplateForm]);
  const selectedPermissions = Object.values(values.appPermissions ?? {}).filter(
    Boolean,
  ).length;
  const splashAsset =
    values.splashScreen?.type === "image"
      ? values.splashScreen.fullImage
      : values.splashScreen?.logoImage;

  function toggleSection(section: string) {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  function applyImportedTemplate(template: Template) {
    const currentValues = getValues();
    const appInfo = template.settings?.appInfo;

    setValue("name", appInfo?.appName ?? currentValues.name, {
      shouldDirty: true,
    });
    setValue("packageName", appInfo?.packageName ?? currentValues.packageName, {
      shouldDirty: true,
    });
    setValue("version", appInfo?.version ?? currentValues.version ?? "1.0.0", {
      shouldDirty: true,
    });
    setValue("websiteUrl", appInfo?.websiteUrl ?? currentValues.websiteUrl, {
      shouldDirty: true,
    });
    setValue("icon", appInfo?.icon ?? currentValues.icon, {
      shouldDirty: true,
    });
    setValue("description", currentValues.description, { shouldDirty: true });

    setValue(
      "branding",
      cloneValue(
        template.branding ?? currentValues.branding ?? editorDefaults.branding,
      ),
      { shouldDirty: true },
    );
    setValue(
      "splashScreen",
      cloneValue(
        template.splashScreen ??
          currentValues.splashScreen ??
          editorDefaults.splashScreen,
      ),
      { shouldDirty: true },
    );
    setValue(
      "appPermissions",
      cloneValue(
        template.appPermissions ??
          currentValues.appPermissions ??
          editorDefaults.appPermissions,
      ),
      { shouldDirty: true },
    );
    setValue(
      "appSettings",
      cloneValue(
        template.appSettings ??
          currentValues.appSettings ??
          editorDefaults.appSettings,
      ),
      { shouldDirty: true },
    );

    dispatch(setTemplateId(template.id));

    toast.success("Template settings imported successfully.");
    setIsImportModalOpen(false);
  }

  function onSubmit(formData: AppEditorValues) {
    const appPayload = {
      name: formData.name,
      description: formData.description || undefined,
      packageName: formData.packageName,
      version: formData.version || undefined,
      websiteUrl: formData.websiteUrl || undefined,
      icon: formData.icon || undefined,
      templateId: draft.templateId ?? undefined,
      branding: cloneValue(formData.branding),
      splashScreen: cloneValue(formData.splashScreen),
      appPermissions: cloneValue(formData.appPermissions),
      appSettings: cloneValue(formData.appSettings),
    };

    createApp(appPayload, {
      onSuccess: () => {
        dispatch(resetCreateApp());
        router.push("/dashboard/apps");
      },
      // TODO: Use the project's showApiError(error) helper here.
    });
  }

  function onSaveTemplateSubmit(data: SaveTemplateFormData) {
    const templatePayload = {
      name: data.name,
      description: data.description || undefined,
      visibility: data.visibility,
      thumbnail: data.thumbnail || undefined,
      category: data.category || undefined,
      branding: {
        primaryColor: values.branding?.primaryColor ?? "#4F46E5",
      },
      splashScreen: {
        type: values.splashScreen?.type ?? "logo",
        animationJson: values.splashScreen?.animationJson ?? "",
        logoImage: values.splashScreen?.logoImage ?? "",
        fullImage: values.splashScreen?.fullImage ?? "",
        backgroundColor: values.splashScreen?.backgroundColor ?? "#FFFFFF",
        playbackBehaviour: values.splashScreen?.playbackBehaviour ?? "once",
      },
      appPermissions: {
        camera: Boolean(values.appPermissions?.camera),
        microphone: Boolean(values.appPermissions?.microphone),
        location: Boolean(values.appPermissions?.location),
        storage: Boolean(values.appPermissions?.storage),
        notifications: Boolean(values.appPermissions?.notifications),
      },
      appSettings: {
        statusBarColor: values.appSettings?.statusBarColor ?? "#FFFFFF",
        orientation: values.appSettings?.orientation ?? "portrait",
        fullScreen: Boolean(values.appSettings?.fullScreen),
        systemNavigationBarColor:
          values.appSettings?.systemNavigationBarColor ?? "#FFFFFF",
        pinchToZoom: Boolean(values.appSettings?.pinchToZoom),
        callbackOnResume: Boolean(values.appSettings?.callbackOnResume),
        disableCaching: Boolean(values.appSettings?.disableCaching),
        kioskMode: Boolean(values.appSettings?.kioskMode),
        disableScrollBounce: Boolean(values.appSettings?.disableScrollBounce),
      },
    };

    createTemplate(templatePayload, {
      onSuccess: () => {
        toast.success("Template saved successfully.");
        setIsSaveTemplateModalOpen(false);
      },
      onError: () => {
        toast.error("Unable to save template right now.");
      },
    });
  }

  const sectionClass =
    "rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900";
  const inputClass =
    "mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white";
  const labelClass = "text-sm font-medium text-zinc-800 dark:text-zinc-200";

  return (
    <>
      <Modal
        open={isSaveTemplateModalOpen}
        onClose={() => setIsSaveTemplateModalOpen(false)}
        title="Save as template"
        description="Save the current app configuration as a reusable template."
        width="lg"
      >
        <form
          onSubmit={handleTemplateSubmit(onSaveTemplateSubmit)}
          className="space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Template name" error={templateErrors.name?.message}>
              <input
                className={inputClass}
                placeholder="E-commerce starter"
                {...registerTemplate("name")}
              />
            </Field>
            <Field label="Category" error={templateErrors.category?.message}>
              <input
                className={inputClass}
                placeholder="E-commerce"
                {...registerTemplate("category")}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field
                label="Template description"
                error={templateErrors.description?.message}
              >
                <textarea
                  className={`${inputClass} min-h-20 resize-y`}
                  placeholder="What does this template provide?"
                  {...registerTemplate("description")}
                />
              </Field>
            </div>
            <Field
              label="Thumbnail URL"
              error={templateErrors.thumbnail?.message}
            >
              <input
                className={inputClass}
                placeholder="https://.../thumbnail.png"
                {...registerTemplate("thumbnail")}
              />
            </Field>
            <fieldset>
              <legend className={labelClass}>Visibility</legend>
              <div className="mt-2 flex gap-3">
                {(["private", "public"] as const).map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2 text-sm capitalize text-zinc-700 dark:text-zinc-300"
                  >
                    <input
                      type="radio"
                      value={option}
                      className="accent-indigo-600"
                      {...registerTemplate("visibility")}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsSaveTemplateModalOpen(false)}
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingTemplate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingTemplate ? "Saving…" : "Save template"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import template settings"
        description="Choose a template to prefill matching app settings."
        width="lg"
      >
        <div className="space-y-4">
          <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-800">
            {(["private", "public"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setImportTab(tab)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition ${importTab === tab ? "bg-white text-indigo-700 shadow-sm dark:bg-zinc-900 dark:text-indigo-300" : "text-zinc-600 dark:text-zinc-300"}`}
              >
                {tab} templates
              </button>
            ))}
          </div>

          {importTab === "private" ? (
            isLoadingPrivate ? (
              <p className="text-sm text-zinc-500">Loading your templates…</p>
            ) : privateTemplates.length === 0 ? (
              <p className="text-sm text-zinc-500">
                You do not have any private templates yet.
              </p>
            ) : (
              <div className="space-y-2">
                {privateTemplates
                  .filter((template) => template.visibility === "private")
                  .map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => applyImportedTemplate(template)}
                      className="w-full rounded-xl border border-zinc-200 p-4 text-left transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {template.name}
                          </p>
                          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            {template.description || "No description provided"}
                          </p>
                        </div>
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {template.visibility}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            )
          ) : isLoadingPublic ? (
            <p className="text-sm text-zinc-500">Loading public templates…</p>
          ) : publicTemplates.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No public templates are available.
            </p>
          ) : (
            <div className="space-y-2">
              {publicTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyImportedTemplate(template)}
                  className="w-full rounded-xl border border-zinc-200 p-4 text-left transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white">
                        {template.name}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {template.description || "No description provided"}
                      </p>
                    </div>
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {template.visibility}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="min-h-screen w-full bg-zinc-50 pb-28 dark:bg-zinc-950"
      >
        <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 pl-6 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard/apps")}
                className="rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                aria-label="Back to apps"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  App editor
                </p>
                <h1 className="truncate text-xl font-bold text-zinc-950 dark:text-white">
                  {values.name || "Create application"}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"
              >
                Import from template
              </button>
              {draft.templateId && (
                <span className="hidden rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 sm:inline-block dark:bg-indigo-500/10 dark:text-indigo-300">
                  Template selected
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Configure every setting before creating your app. Changes are
                kept in the current draft until you submit.
              </p>

              <EditorSection
                title="Basic information"
                description="Identity and release details for this application."
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
                    error={errors.packageName?.message}
                  >
                    <input
                      className={inputClass}
                      placeholder="com.templateforge.shopping"
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
                  <Field
                    label="App icon URL"
                    hint="Upload integration comes next"
                    error={errors.icon?.message}
                  >
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
                    {/* TODO: Connect Upload to object storage and set the returned URL with setValue("icon", url). */}
                  </Field>
                  <Field
                    label="Primary colour"
                    error={errors.branding?.primaryColor?.message}
                  >
                    <div className="mt-1.5 flex items-center gap-3">
                      <input
                        type="color"
                        className="h-10 w-12 cursor-pointer rounded border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950"
                        value={values.branding?.primaryColor || "#4F46E5"}
                        onChange={(event) =>
                          setValue(
                            "branding.primaryColor",
                            event.target.value,
                            {
                              shouldDirty: true,
                              shouldValidate: true,
                            },
                          )
                        }
                      />
                      <input
                        className={`${inputClass} mt-0`}
                        {...register("branding.primaryColor")}
                        value={values.branding?.primaryColor || "#4F46E5"}
                        onChange={(event) =>
                          setValue(
                            "branding.primaryColor",
                            event.target.value,
                            {
                              shouldDirty: true,
                              shouldValidate: true,
                            },
                          )
                        }
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
                      <label
                        key={type}
                        className={`cursor-pointer rounded-xl border p-4 transition ${values.splashScreen?.type === type ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"}`}
                      >
                        <input
                          type="radio"
                          value={type}
                          className="sr-only"
                          {...register("splashScreen.type")}
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
                      </label>
                    ))}
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {values.splashScreen?.type === "animation" ? (
                      <Field
                        label="Animation JSON URL"
                        hint="MP4 is intentionally not supported yet"
                      >
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
                          value={
                            values.splashScreen?.backgroundColor || "#FFFFFF"
                          }
                          onChange={(event) =>
                            setValue(
                              "splashScreen.backgroundColor",
                              event.target.value,
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              },
                            )
                          }
                        />
                        <input
                          className={`${inputClass} mt-0`}
                          {...register("splashScreen.backgroundColor")}
                          value={
                            values.splashScreen?.backgroundColor || "#FFFFFF"
                          }
                          onChange={(event) =>
                            setValue(
                              "splashScreen.backgroundColor",
                              event.target.value,
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              },
                            )
                          }
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
                          value={
                            values.appSettings?.statusBarColor || "#FFFFFF"
                          }
                          onChange={(event) =>
                            setValue(
                              "appSettings.statusBarColor",
                              event.target.value,
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              },
                            )
                          }
                        />
                        <input
                          className={`${inputClass} mt-0`}
                          {...register("appSettings.statusBarColor")}
                          value={
                            values.appSettings?.statusBarColor || "#FFFFFF"
                          }
                          onChange={(event) =>
                            setValue(
                              "appSettings.statusBarColor",
                              event.target.value,
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              },
                            )
                          }
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
                          value={
                            values.appSettings?.systemNavigationBarColor ||
                            "#FFFFFF"
                          }
                          onChange={(event) =>
                            setValue(
                              "appSettings.systemNavigationBarColor",
                              event.target.value,
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              },
                            )
                          }
                        />
                        <input
                          className={`${inputClass} mt-0`}
                          {...register("appSettings.systemNavigationBarColor")}
                          value={
                            values.appSettings?.systemNavigationBarColor ||
                            "#FFFFFF"
                          }
                          onChange={(event) =>
                            setValue(
                              "appSettings.systemNavigationBarColor",
                              event.target.value,
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              },
                            )
                          }
                        />
                      </div>
                    </Field>
                  </div>
                  <fieldset>
                    <legend className={labelClass}>Screen orientation</legend>
                    <div className="mt-2 grid gap-3 sm:grid-cols-3">
                      {(["portrait", "landscape", "both"] as const).map(
                        (option) => (
                          <label
                            key={option}
                            className={`cursor-pointer rounded-lg border px-4 py-3 text-sm font-medium capitalize transition ${values.appSettings?.orientation === option ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300" : "border-zinc-200 text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-300"}`}
                          >
                            <input
                              type="radio"
                              value={option}
                              className="sr-only"
                              {...register("appSettings.orientation")}
                            />
                            {option}
                          </label>
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

            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className={`${sectionClass} overflow-hidden`}>
                <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Sparkles size={17} className="text-indigo-600" />
                    <h2 className="font-semibold text-zinc-950 dark:text-white">
                      Live preview
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    A summary of the current form values.
                  </p>
                </div>
                <div className="p-5">
                  <div className="mx-auto w-52 overflow-hidden rounded-[2rem] border-8 border-zinc-900 bg-white shadow-xl dark:border-zinc-700">
                    <div
                      className="h-5"
                      style={{
                        backgroundColor:
                          values.appSettings?.statusBarColor || "#FFFFFF",
                      }}
                    />
                    <div
                      className="flex aspect-[9/15] flex-col items-center justify-center px-5 text-center"
                      style={{
                        backgroundColor:
                          values.splashScreen?.backgroundColor || "#FFFFFF",
                      }}
                    >
                      {splashAsset ? (
                        <img
                          src={splashAsset}
                          alt="Splash preview"
                          className="max-h-24 max-w-24 rounded-xl object-contain"
                        />
                      ) : (
                        <ImageIcon
                          className="h-10 w-10"
                          style={{ color: values.branding?.primaryColor }}
                        />
                      )}
                      <span className="mt-3 text-sm font-bold text-zinc-900">
                        {values.name || "Your app"}
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
                  <div className="mt-6 space-y-3 text-sm">
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
                    <PreviewItem
                      label="Source"
                      value={
                        draft.templateId ? "Selected template" : "Started fresh"
                      }
                    />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>

        <footer className="fixed left-64 right-0 bottom-0 z-20 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
          <div className="mx-auto flex max-w-7xl flex-col-reverse gap-3 px-4 py-4 pl-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => router.push("/dashboard/apps")}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                disabled={isCreating || isCreatingTemplate}
                onClick={() => setIsSaveTemplateModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-500/30 dark:bg-zinc-900 dark:text-indigo-300 dark:hover:bg-zinc-800"
              >
                {isCreatingTemplate && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {isCreatingTemplate ? "Saving…" : "Save as template"}
              </button>
              <button
                type="submit"
                disabled={isCreating || isCreatingTemplate}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating && <Loader2 size={16} className="animate-spin" />}
                {isCreating ? "Creating…" : "Create app"}
                <Check size={16} />
              </button>
            </div>
          </div>
        </footer>
      </form>
    </>
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
        className={`max-w-40 text-right font-medium text-zinc-900 dark:text-white ${capitalized ? "capitalize" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
