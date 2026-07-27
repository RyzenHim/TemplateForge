"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";
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
  MonitorSmartphone,
  Save,
  Sparkles,
  Upload,
} from "lucide-react";

import Loader from "@/app/components/ui/Loader";
import Modal from "@/app/components/ui/Modal";
import Button from "@/app/components/ui/Button";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";

import { useCreateApp } from "@/app/lib/hooks/app/useCreateApp";
import { useApp } from "@/app/lib/hooks/app/useApp";
import { useUpdateApp } from "@/app/lib/hooks/app/useUpdateApp";
import { useCreateTemplate } from "@/app/lib/hooks/template/useCreateTemplate";
import { usePublicTemplates } from "@/app/lib/hooks/template/usePublicTemplates";
import { useTemplates } from "@/app/lib/hooks/template/useTemplates";
import { useAddons } from "@/app/lib/hooks/addons/useAddons";
import type { Template } from "@/app/lib/types/template.types";
import type { Addon } from "@/app/lib/types/addons/addons.types";
import type { AppAddon } from "@/app/lib/types/app.types";
import {
  getApiErrorMessage,
  showApiError,
  showApiSuccess,
} from "@/app/lib/utils";

// ── Schema ────────────────────────────────────────────────────────────────────

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
  platform: z
    .string()
    .refine((v) => ["Android", "iOS", "Android & iOS"].includes(v), {
      message: "Platform is required",
    }),
  websiteUrl: z.union([z.literal(""), z.url("Enter a valid website URL")]),
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
  thumbnail: z.union([z.literal(""), z.string().url()]),
});

type AppEditorValues = z.infer<typeof appEditorSchema>;

type SaveTemplateFormData = {
  name: string;
  description: string;
  category: string;
  visibility: "private" | "public";
  thumbnail: string;
};

// ── Defaults ──────────────────────────────────────────────────────────────────

const editorDefaults: AppEditorValues = {
  name: "",
  description: "",
  packageName: "",
  platform: "",
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
  thumbnail: "",
};

// ── Constants ─────────────────────────────────────────────────────────────────

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

function cloneValue<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type SplashKey = "logoImage" | "fullImage" | "animationJson";
type FileKey = "icon" | "thumbnail" | SplashKey;

const PLATFORMS = ["Android", "iOS", "Android & iOS"] as const;

// Which add-ons are available for a given app platform.
// Android → Android + Android & iOS; iOS → iOS + Android & iOS; Android & iOS → all.
function addonMatchesPlatform(addonPlatform: string, appPlatform: string) {
  if (appPlatform === "Android & iOS") return true;
  if (appPlatform === "Android")
    return addonPlatform === "Android" || addonPlatform === "Android & iOS";
  if (appPlatform === "iOS")
    return addonPlatform === "iOS" || addonPlatform === "Android & iOS";
  return false;
}

interface AppFormProps {
  mode: "create" | "edit";
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AppForm({ mode }: AppFormProps) {
  const isEdit = mode === "edit";
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  // hooks
  const { data: app, isLoading } = useApp(isEdit ? id : undefined);
  const { mutate: createApp, isPending: isCreating } = useCreateApp();
  const { mutate: updateApp, isPending: isUpdating } = useUpdateApp();
  const { mutate: createTemplate, isPending: isCreatingTemplate } =
    useCreateTemplate();
  const { data: privateTemplates = [], isLoading: isLoadingPrivate } =
    useTemplates();
  const { data: publicTemplates = [], isLoading: isLoadingPublic } =
    usePublicTemplates();
  const { data: addons = [] } = useAddons();

  const isPending = isCreating || isUpdating;

  // state
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [importTab, setImportTab] = useState<"private" | "public">("private");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [selectedFiles, setSelectedFiles] = useState<
    Partial<Record<FileKey, File>>
  >({});
  const [previews, setPreviews] = useState<Partial<Record<FileKey, string>>>(
    {},
  );
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true,
    branding: true,
    splash: true,
    permissions: true,
    settings: true,
    addOns: true,
  });
  const [hasHydrated, setHasHydrated] = useState(false);

  // platform change warning
  const previousPlatformRef = useRef<string>("");
  const [showPlatformWarning, setShowPlatformWarning] = useState(false);
  const [pendingPlatformValue, setPendingPlatformValue] = useState<string>("");

  // file helper
  function setFileFor(key: FileKey, file: File) {
    setSelectedFiles((prev) => ({ ...prev, [key]: file }));
    setPreviews((prev) => {
      const next = { ...prev };
      if (next[key]) URL.revokeObjectURL(next[key]!);
      next[key] = URL.createObjectURL(file);
      return next;
    });
  }

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => url && URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // form
  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<AppEditorValues>({
    resolver: zodResolver(appEditorSchema),
    defaultValues: editorDefaults,
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

  const values = useWatch({ control }) ?? editorDefaults;

  // hydrate form in edit mode
  useEffect(() => {
    if (!isEdit || !app || hasHydrated) return;
    reset({
      name: app.name || "",
      description: app.description || "",
      packageName: app.packageName || "",
      platform: app.platform || "",
      websiteUrl: app.websiteUrl || "",
      version: app.version || "1.0.0",
      icon: app.icon || "",
      thumbnail: app.thumbnail || "",
      branding: { primaryColor: app.branding?.primaryColor || "#4F46E5" },
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
    if (app.addons?.length > 0) {
      setSelectedAddons(
        app.addons.map((a: AppAddon) => ({
          id: a.addonId,
          name: a.name,
          description: a.description || "",
          icon: a.icon,
          category: a.category,
          platform: a.platform as any,
          createdAt: "",
          updatedAt: "",
        })),
      );
    }
    previousPlatformRef.current = app.platform || "";
    setHasHydrated(true);
  }, [isEdit, app, hasHydrated, reset]);

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

  // derived
  const selectedPermissions = Object.values(values.appPermissions ?? {}).filter(
    Boolean,
  ).length;
  const availableAddons = addons.filter((addon) =>
    addonMatchesPlatform(addon.platform, values.platform ?? ""),
  );
  const splashAsset =
    values.splashScreen?.type === "image"
      ? previews.fullImage || values.splashScreen?.fullImage
      : values.splashScreen?.type === "animation"
        ? previews.animationJson || values.splashScreen?.animationJson
        : previews.logoImage || values.splashScreen?.logoImage;

  function toggleSection(section: string) {
    setOpenSections((c) => ({ ...c, [section]: !c[section] }));
  }

  function confirmPlatformChange() {
    const newPlatform = pendingPlatformValue;
    setValue("platform", newPlatform, {
      shouldDirty: true,
      shouldValidate: true,
    });
    previousPlatformRef.current = newPlatform;

    // Filter out add-ons that are not compatible with the new platform
    setSelectedAddons((prev) =>
      prev.filter((addon) => addonMatchesPlatform(addon.platform, newPlatform)),
    );

    setShowPlatformWarning(false);
    setPendingPlatformValue("");
  }

  function cancelPlatformChange() {
    setShowPlatformWarning(false);
    setPendingPlatformValue("");
    // Reset the select to the previous platform value
    setValue("platform", previousPlatformRef.current, {
      shouldDirty: false,
    });
  }

  function applyImportedTemplate(template: Template) {
    const cur = getValues();
    const appInfo = template.settings?.appInfo;
    setValue("name", appInfo?.appName ?? cur.name, { shouldDirty: true });
    setValue("packageName", appInfo?.packageName ?? cur.packageName, {
      shouldDirty: true,
    });
    setValue("description", (appInfo as any)?.description ?? cur.description, {
      shouldDirty: true,
    });
    setValue("websiteUrl", appInfo?.websiteUrl ?? cur.websiteUrl, {
      shouldDirty: true,
    });
    setValue("version", appInfo?.version ?? cur.version ?? "1.0.0", {
      shouldDirty: true,
    });
    setValue(
      "branding",
      cloneValue(template.branding ?? cur.branding ?? editorDefaults.branding),
      { shouldDirty: true },
    );
    setValue(
      "splashScreen",
      cloneValue(
        template.splashScreen ??
          cur.splashScreen ??
          editorDefaults.splashScreen,
      ),
      { shouldDirty: true },
    );
    setValue(
      "appPermissions",
      cloneValue(
        template.appPermissions ??
          cur.appPermissions ??
          editorDefaults.appPermissions,
      ),
      { shouldDirty: true },
    );
    setValue(
      "appSettings",
      cloneValue(
        template.appSettings ?? cur.appSettings ?? editorDefaults.appSettings,
      ),
      { shouldDirty: true },
    );
    setSelectedTemplateId(template.id);
    toast.success("Template settings imported successfully.");
    setIsImportModalOpen(false);
  }

  function buildPayload(formData: AppEditorValues): FormData {
    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("packageName", formData.packageName);
    payload.append("platform", formData.platform);
    payload.append("version", formData.version);
    if (formData.description)
      payload.append("description", formData.description);
    if (formData.websiteUrl) payload.append("websiteUrl", formData.websiteUrl);
    if (selectedFiles.icon) payload.append("icon", selectedFiles.icon);
    if (selectedFiles.thumbnail)
      payload.append("thumbnail", selectedFiles.thumbnail);
    else if (formData.thumbnail)
      payload.append("thumbnail", formData.thumbnail);
    const splashType = formData.splashScreen?.type || "logo";
    if (splashType === "image" && selectedFiles.fullImage)
      payload.append("splashImage", selectedFiles.fullImage);
    else if (splashType === "animation" && selectedFiles.animationJson)
      payload.append("splashImage", selectedFiles.animationJson);
    else if (selectedFiles.logoImage)
      payload.append("splashImage", selectedFiles.logoImage);
    payload.append("branding", JSON.stringify(formData.branding));
    payload.append("splashScreen", JSON.stringify(formData.splashScreen));
    payload.append("appPermissions", JSON.stringify(formData.appPermissions));
    payload.append("appSettings", JSON.stringify(formData.appSettings));
    payload.append(
      "addons",
      JSON.stringify(
        selectedAddons.map((a) => ({
          addonId: a.id,
          name: a.name,
          description: a.description,
          icon: a.icon,
          category: a.category,
          platform: a.platform,
        })),
      ),
    );
    return payload;
  }

  const onSubmit = useCallback(
    (formData: AppEditorValues) => {
      console.log("edit");

      const payload = buildPayload(formData);

      if (isEdit) {
        if (!id) return;
        if (selectedTemplateId)
          payload.append("templateId", selectedTemplateId);
        updateApp(
          { id, data: payload as any },
          {
            onSuccess: (res) => {
              showApiSuccess(
                (res as any)?.message ?? "App updated successfully.",
              );
              router.push("/dashboard/apps");
            },
            onError: showApiError,
          },
        );
      } else {
        if (selectedTemplateId)
          payload.append("templateId", selectedTemplateId);
        console.log("Create");
        createApp(payload as any, {
          onSuccess: () => router.push("/dashboard/apps"),
          onError: (error) => {
            const message = getApiErrorMessage(error);
            if (message && /package name/i.test(message)) {
              setError("packageName", { type: "server", message });
              setOpenSections((c) => ({ ...c, basic: true }));
            }
            showApiError(error);
          },
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isEdit,
      id,
      selectedTemplateId,
      selectedAddons,
      selectedFiles,
      createApp,
      updateApp,
      router,
      setError,
    ],
  );

  function onSaveTemplateSubmit(data: SaveTemplateFormData) {
    createTemplate(
      {
        name: data.name,
        description: data.description || undefined,
        visibility: data.visibility,
        thumbnail: data.thumbnail || undefined,
        category: data.category || undefined,
        branding: { primaryColor: values.branding?.primaryColor ?? "#4F46E5" },
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
      } as any,
      {
        onSuccess: () => {
          toast.success("Template saved successfully.");
          setIsSaveTemplateModalOpen(false);
        },
        onError: () => toast.error("Unable to save template right now."),
      },
    );
  }

  const sectionClass =
    "rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900";
  const inputClass =
    "mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white";
  const labelClass = "text-sm font-medium text-zinc-800 dark:text-zinc-200";

  if (isEdit && isLoading) return <Loader text="Loading app…" />;

  return (
    <>
      {/* Save as template modal */}
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
                {(["private", "public"] as const).map((opt) => (
                  <label
                    key={opt}
                    className="flex cursor-pointer items-center gap-2 text-sm capitalize text-zinc-700 dark:text-zinc-300"
                  >
                    <input
                      type="radio"
                      value={opt}
                      className="accent-indigo-600"
                      {...registerTemplate("visibility")}
                    />
                    {opt}
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

      {/* Import from template modal */}
      <Modal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import settings"
        description="Choose a template to prefill settings."
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
                  .filter((t) => t.visibility === "private")
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

      {/* Main form */}
      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log("Validation errors:", errors);
        })}
        // onSubmit={handleSubmit(onSubmit)}
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
                  {values.name ||
                    (isEdit ? "Edit application" : "Create application")}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSaveTemplateModalOpen(true)}
                className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <Save size={15} className="mr-1.5" /> Save as template
              </button>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex cursor-pointer items-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"
              >
                Import from template
              </button>
              {selectedTemplateId && (
                <span className="hidden rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 sm:inline-block dark:bg-indigo-500/10 dark:text-indigo-300">
                  Template selected
                </span>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                {isEdit ? "Save changes" : "Create app"}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {isEdit
                  ? "Make your changes below and click Save changes when done."
                  : "Configure every setting before creating your app."}
              </p>

              {/* Basic */}
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
                      {...register("packageName", {
                        onChange: () => clearErrors("packageName"),
                      })}
                    />
                  </Field>
                  <Field
                    label="Platform"
                    hint="Add-ons are filtered by the selected platform."
                    error={errors.platform?.message}
                  >
                    <select
                      className={inputClass}
                      value={values.platform || ""}
                      onChange={(e) => {
                        const newPlatform = e.target.value;
                        const prevPlatform = previousPlatformRef.current;

                        // In edit mode, if platform actually changes and has hydrated, show warning
                        if (
                          isEdit &&
                          hasHydrated &&
                          prevPlatform &&
                          newPlatform &&
                          newPlatform !== prevPlatform &&
                          selectedAddons.length > 0
                        ) {
                          setPendingPlatformValue(newPlatform);
                          setShowPlatformWarning(true);
                        } else {
                          setValue("platform", newPlatform, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                          previousPlatformRef.current = newPlatform;
                        }
                      }}
                    >
                      <option value="">Select a platform</option>
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
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
                      label="Thumbnail URL"
                      hint="Shown on the app card. Optional."
                      error={errors.thumbnail?.message}
                    >
                      <div className="mt-1.5 flex gap-2">
                        <input
                          className={inputClass.replace(
                            "w-full ",
                            "min-w-0 flex-1 ",
                          )}
                          placeholder="https://.../thumbnail.png"
                          {...register("thumbnail")}
                        />
                        <label className="mt-1.5 inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
                          <Upload size={16} /> Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) setFileFor("thumbnail", f);
                            }}
                          />
                        </label>
                      </div>
                      {(previews.thumbnail || (isEdit && values.thumbnail)) && (
                        <div className="mt-2 flex items-center gap-2">
                          <img
                            src={previews.thumbnail || values.thumbnail}
                            alt="Thumbnail preview"
                            className="h-10 w-16 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                          <span className="text-xs text-zinc-500">
                            {previews.thumbnail
                              ? "New thumbnail preview"
                              : "Current thumbnail"}
                          </span>
                        </div>
                      )}
                    </Field>
                  </div>
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

              {/* Branding */}
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
                      <label className="mt-1.5 inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
                        <Upload size={16} /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setFileFor("icon", f);
                          }}
                        />
                      </label>
                    </div>
                    {(previews.icon || (isEdit && values.icon)) && (
                      <div className="mt-2 flex items-center gap-2">
                        <img
                          src={previews.icon || values.icon}
                          alt="Icon preview"
                          className="h-10 w-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <span className="text-xs text-zinc-500">
                          {previews.icon ? "New icon preview" : "Current icon"}
                        </span>
                      </div>
                    )}
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
                        onChange={(e) =>
                          setValue("branding.primaryColor", e.target.value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      />
                      <input
                        className={`${inputClass} mt-0`}
                        {...register("branding.primaryColor")}
                      />
                    </div>
                  </Field>
                </div>
              </EditorSection>

              {/* Splash screen */}
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
                        className={`relative cursor-pointer rounded-xl border p-4 transition ${values.splashScreen?.type === type ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"}`}
                      >
                        <input
                          type="radio"
                          value={type}
                          className="hidden"
                          {...register("splashScreen.type")}
                        />
                        <span className="block text-sm font-semibold capitalize text-zinc-900 dark:text-white">
                          {type === "image" ? "Full image" : type}
                        </span>
                        <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                          {type === "animation"
                            ? "Use a looping GIF"
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
                        label="Animation image"
                        hint="A small looping GIF shown while the app loads"
                      >
                        <input
                          className={inputClass}
                          placeholder="https://.../animation.gif"
                          {...register("splashScreen.animationJson")}
                        />
                        <AppImageDropzone
                          preview={previews.animationJson}
                          onFileChange={(f) => setFileFor("animationJson", f)}
                          accept="image/gif"
                          hint="Upload an image — it will be sent when you save."
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
                        <AppImageDropzone
                          preview={previews.fullImage}
                          onFileChange={(f) => setFileFor("fullImage", f)}
                          hint="Upload an image — it will be sent when you save."
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
                        <AppImageDropzone
                          preview={previews.logoImage}
                          onFileChange={(f) => setFileFor("logoImage", f)}
                          hint="Upload an image — it will be sent when you save."
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
                          onChange={(e) =>
                            setValue(
                              "splashScreen.backgroundColor",
                              e.target.value,
                              { shouldDirty: true, shouldValidate: true },
                            )
                          }
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
                      {(["once", "loop"] as const).map((opt) => (
                        <label
                          key={opt}
                          className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                        >
                          <input
                            type="radio"
                            value={opt}
                            className="accent-indigo-600"
                            {...register("splashScreen.playbackBehaviour")}
                          />
                          <span className="capitalize">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </EditorSection>

              {/* Permissions */}
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
                        className="hidden"
                        {...register(`appPermissions.${key}`)}
                      />
                    </ToggleCard>
                  ))}
                </div>
              </EditorSection>

              {/* App settings */}
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
                          onChange={(e) =>
                            setValue(
                              "appSettings.statusBarColor",
                              e.target.value,
                              { shouldDirty: true, shouldValidate: true },
                            )
                          }
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
                          value={
                            values.appSettings?.systemNavigationBarColor ||
                            "#FFFFFF"
                          }
                          onChange={(e) =>
                            setValue(
                              "appSettings.systemNavigationBarColor",
                              e.target.value,
                              { shouldDirty: true, shouldValidate: true },
                            )
                          }
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
                        (opt) => (
                          <label
                            key={opt}
                            className={`relative cursor-pointer rounded-lg border px-4 py-3 text-sm font-medium capitalize transition ${values.appSettings?.orientation === opt ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300" : "border-zinc-200 text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-300"}`}
                          >
                            <input
                              type="radio"
                              value={opt}
                              className="hidden"
                              {...register("appSettings.orientation")}
                            />
                            {opt}
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
                          className="hidden"
                          {...register(`appSettings.${key}`)}
                        />
                      </ToggleCard>
                    ))}
                  </div>
                </div>
              </EditorSection>

              {/* Add-ons */}
              <EditorSection
                title="Add-ons"
                description="Select the addons for your app"
                open={openSections.addOns}
                onToggle={() => toggleSection("addOns")}
              >
                <div className="space-y-4">
                  <Button
                    type="button"
                    onClick={() => {
                      if (!values.platform) {
                        toast.error("Please select a platform first.");
                        return;
                      }
                      setIsAddonModalOpen(true);
                    }}
                  >
                    Select Add-ons
                  </Button>
                  {selectedAddons.length > 0 && (
                    <div className="space-y-2">
                      {selectedAddons.map((addon) => (
                        <div
                          key={addon.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-3">
                            {addon.icon && (
                              <img
                                src={addon.icon}
                                alt={addon.name}
                                className="h-8 w-8 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                {addon.name}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {addon.platform} · {addon.category}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedAddons((p) =>
                                p.filter((a) => a.id !== addon.id),
                              )
                            }
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Modal
                  open={isAddonModalOpen}
                  onClose={() => setIsAddonModalOpen(false)}
                  title="Select Add-ons"
                  description="Choose add-ons to include in your app."
                  width="lg"
                >
                  <div className="space-y-3">
                    {availableAddons.length === 0 ? (
                      <p className="py-8 text-center text-sm text-zinc-500">
                        No add-ons available for{" "}
                        {values.platform || "this platform"}.
                      </p>
                    ) : (
                      availableAddons.map((addon) => {
                        const isSelected = selectedAddons.some(
                          (a) => a.id === addon.id,
                        );
                        return (
                          <button
                            key={addon.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedAddons((p) =>
                                  p.filter((a) => a.id !== addon.id),
                                );
                              } else {
                                setSelectedAddons((p) => [...p, addon]);
                              }
                            }}
                            className={`w-full rounded-xl border p-4 text-left transition ${isSelected ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-zinc-200 hover:border-indigo-400 hover:bg-indigo-50 dark:border-zinc-700 dark:hover:bg-zinc-800"}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                {addon.icon && (
                                  <img
                                    src={addon.icon}
                                    alt={addon.name}
                                    className="h-10 w-10 rounded-lg object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-semibold text-zinc-900 dark:text-white">
                                    {addon.name}
                                  </p>
                                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                                    {addon.platform} · {addon.category}
                                  </p>
                                  {addon.description && (
                                    <p className="mt-1 text-xs text-zinc-400 line-clamp-1">
                                      {addon.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {isSelected && (
                                <span className="text-sm font-medium text-indigo-600">
                                  Selected
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                    <div className="flex justify-end pt-3">
                      <Button
                        type="button"
                        onClick={() => setIsAddonModalOpen(false)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </Modal>
              </EditorSection>
            </div>

            {/* Sidebar preview */}
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
                      className="flex h-96 flex-col items-center justify-center"
                      style={{
                        backgroundColor:
                          values.splashScreen?.backgroundColor || "#FFFFFF",
                      }}
                    >
                      {splashAsset ? (
                        <img
                          src={splashAsset}
                          alt="Splash"
                          className="h-24 w-24 rounded-2xl object-contain"
                        />
                      ) : (
                        <MonitorSmartphone
                          size={48}
                          className="text-zinc-300"
                        />
                      )}
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    <PreviewItem label="App name" value={values.name || "—"} />
                    <PreviewItem label="Platform" value={values.platform || "—"} />
                    <PreviewItem
                      label="Package"
                      value={values.packageName || "—"}
                    />
                    <PreviewItem
                      label="Version"
                      value={values.version || "—"}
                    />
                    <PreviewItem
                      label="Permissions"
                      value={`${selectedPermissions} enabled`}
                    />
                    <PreviewItem
                      label="Orientation"
                      value={values.appSettings?.orientation || "portrait"}
                      capitalized
                    />
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-zinc-500 dark:text-zinc-400">
                        Brand colour
                      </span>
                      <span
                        className="h-5 w-5 rounded-full border border-zinc-200 dark:border-zinc-700"
                        style={{
                          backgroundColor:
                            values.branding?.primaryColor || "#4F46E5",
                        }}
                      />
                    </div>
                    <PreviewItem
                      label="Source"
                      value={
                        selectedTemplateId
                          ? "Template imported"
                          : "Started fresh"
                      }
                    />
                    <PreviewItem
                      label="Add-ons"
                      value={`${selectedAddons.length} selected`}
                    />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </form>

      {/* Platform change warning */}
      <ConfirmDialog
        open={showPlatformWarning}
        onClose={cancelPlatformChange}
        onConfirm={confirmPlatformChange}
        title="Change platform?"
        description="Changing the platform may remove add-ons that are not compatible with the new platform. Do you want to proceed?"
        confirmText="Change platform"
        cancelText="Cancel"
        confirmVariant="primary"
      />
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function EditorSection({
  title,
  description,
  open,
  onToggle,
  children,
}: {
  title: string;
  description?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <div>
          <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          )}
        </div>
        {open ? (
          <ChevronUp size={18} className="shrink-0 text-zinc-400" />
        ) : (
          <ChevronDown size={18} className="shrink-0 text-zinc-400" />
        )}
      </button>
      {open && (
        <div className="border-t border-zinc-100 px-6 pb-6 pt-5 dark:border-zinc-800">
          {children}
        </div>
      )}
    </div>
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
    <div>
      <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </label>
      {hint && (
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      )}
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
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
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${checked ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700"}`}
    >
      {children}
      <div className="flex-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-white">
          {title}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>
      <div
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${checked ? "border-indigo-600 bg-indigo-600" : "border-zinc-300 dark:border-zinc-600"}`}
      >
        {checked && <Check size={11} className="text-white" strokeWidth={3} />}
      </div>
    </label>
  );
}

function PreviewItem({
  label,
  value,
  capitalized,
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

function AppImageDropzone({
  preview,
  onFileChange,
  accept = "image/*",
  hint,
}: {
  preview?: string | null;
  onFileChange: (file: File) => void;
  accept?: string;
  hint?: string;
}) {
  const inputId = useId();
  return (
    <div className="mt-2 flex items-center gap-3">
      <label
        htmlFor={inputId}
        className="group relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-zinc-300 bg-zinc-50 transition hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/10"
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageIcon
            size={20}
            className="text-zinc-400 transition group-hover:text-indigo-500"
          />
        )}
        <input
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            onFileChange(f);
            e.target.value = "";
          }}
        />
      </label>
      <div className="min-w-0 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
        <span className="block font-medium text-zinc-700 dark:text-zinc-300">
          {preview ? "Preview updated" : "Upload to preview"}
        </span>
        <span className="block">
          {hint ?? "Upload an image — it will be sent when you save."}
        </span>
      </div>
    </div>
  );
}
