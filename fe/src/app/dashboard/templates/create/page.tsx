"use client";

import { useEffect, useState, type KeyboardEvent, type ReactNode } from "react";

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
  Globe,
  ImageIcon,
  Loader2,
  Lock,
  Sparkles,
  X,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/app/lib/redux/hook/hooks";
import { resetCreateTemplate } from "@/app/lib/redux/slices/createTemplateSlice";

import { useCreateTemplate } from "@/app/lib/hooks/template/useCreateTemplate";

const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Use a 6-digit hex colour, for example #4F46E5");

const createTemplateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Template name is required")
    .max(100, "Name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters"),
  visibility: z.enum(["public", "private"], {
    message: "Choose whether this template is public or private",
  }),
  thumbnail: z.union([
    z.literal(""),
    z.string().url("Enter a valid thumbnail URL"),
  ]),
  category: z.string().trim(),
  tags: z.array(z.string().trim().min(1)),
  branding: z.object({
    primaryColor: hexColor,
  }),
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

type CreateTemplateFormData = z.infer<typeof createTemplateSchema>;

const permissions = [
  [
    "camera",
    "Camera",
    "Allow apps built from this template to capture photos and video.",
  ],
  ["microphone", "Microphone", "Allow apps to record audio."],
  ["location", "Location", "Allow apps to access the device location."],
  ["storage", "Storage", "Allow access to files and media."],
  ["notifications", "Notifications", "Allow apps to send notifications."],
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

const editorDefaults: CreateTemplateFormData = {
  name: "",
  description: "",
  visibility: "private",
  thumbnail: "",
  category: "",
  tags: [],
  branding: {
    primaryColor: "#4F46E5",
  },
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

export default function CreateTemplatePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const createTemplateMutation = useCreateTemplate();

  const templateInfo = useAppSelector(
    (state) => state.createTemplate.templateInfo,
  );

  const [tagInput, setTagInput] = useState("");

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
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateTemplateFormData>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: editorDefaults,
    mode: "onBlur",
  });

  // Prefill with values entered in CreateTemplateModal.
  // This only contains name + description; the rest stays at editorDefaults.
  useEffect(() => {
    if (!templateInfo) return;
    reset({
      ...editorDefaults,
      name: templateInfo.name || editorDefaults.name,
      description: templateInfo.description || editorDefaults.description,
    });
  }, [templateInfo, reset]);

  const values = useWatch({ control }) ?? editorDefaults;
  const tags = values.tags ?? [];
  const selectedPermissions = Object.values(values.appPermissions ?? {}).filter(
    Boolean,
  ).length;
  const splashAsset =
    values.splashScreen?.type === "image"
      ? values.splashScreen?.fullImage
      : values.splashScreen?.logoImage;

  function toggleSection(section: string) {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag || tags.includes(tag)) return;
    setValue("tags", [...tags, tag], {
      shouldValidate: true,
      shouldDirty: true,
    });
    setTagInput("");
  }

  function removeTag(index: number) {
    setValue(
      "tags",
      tags.filter((_, currentIndex) => currentIndex !== index),
      { shouldValidate: true, shouldDirty: true },
    );
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(tagInput);
    }
  }

  async function onSubmit(data: CreateTemplateFormData) {
    try {
      await createTemplateMutation.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        visibility: data.visibility,
        thumbnail: data.thumbnail || undefined,
        category: data.category || undefined,
        tags: data.tags.length > 0 ? data.tags : undefined,
        branding: data.branding,
        splashScreen: data.splashScreen,
        appPermissions: data.appPermissions,
        appSettings: data.appSettings,
      });

      dispatch(resetCreateTemplate());
      toast.success("Template created successfully.");
      router.push("/dashboard/templates");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create template.");
    }
  }

  const sectionClass =
    "rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900";
  const inputClass =
    "mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white";
  const labelClass = "text-sm font-medium text-zinc-800 dark:text-zinc-200";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="min-h-screen w-full bg-zinc-50 pb-28 dark:bg-zinc-950"
    >
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 pl-6 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/templates")}
              className="rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              aria-label="Back to templates"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Template editor
              </p>
              <h1 className="truncate text-xl font-bold text-zinc-950 dark:text-white">
                {values.name || "Create template"}
              </h1>
            </div>
          </div>
          <span
            className={`hidden rounded-full px-3 py-1.5 text-xs font-medium sm:inline-block ${
              values.visibility === "public"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {values.visibility === "public"
              ? "Public template"
              : "Private template"}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Configure a reusable blueprint for future applications. Fields
              marked with <span className="text-red-500">*</span> are required
              by the API.
            </p>

            <EditorSection
              title="Basic information"
              description="Name, category, visibility, and optional metadata."
              open={openSections.basic}
              onToggle={() => toggleSection("basic")}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Template name"
                  required
                  error={errors.name?.message}
                >
                  <input
                    className={inputClass}
                    placeholder="E-commerce starter"
                    {...register("name")}
                  />
                </Field>
                <Field label="Category" error={errors.category?.message}>
                  <input
                    className={inputClass}
                    placeholder="E-commerce, SaaS, Portfolio…"
                    {...register("category")}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field
                    label="Description"
                    error={errors.description?.message}
                  >
                    <textarea
                      className={`${inputClass} min-h-24 resize-y`}
                      placeholder="What kind of apps is this template best suited for?"
                      {...register("description")}
                    />
                  </Field>
                </div>
                <Field
                  label="Thumbnail URL"
                  hint="Optional preview image"
                  error={errors.thumbnail?.message}
                >
                  <input
                    className={inputClass}
                    placeholder="https://.../thumbnail.png"
                    {...register("thumbnail")}
                  />
                </Field>
                <div>
                  <Field
                    label="Tags"
                    hint="Press Enter to add"
                    error={errors.tags?.message}
                  >
                    <input
                      className={inputClass}
                      placeholder="mobile, ecommerce, starter"
                      value={tagInput}
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onBlur={() => {
                        if (tagInput.trim()) addTag(tagInput);
                      }}
                    />
                  </Field>
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span
                          key={`${tag}-${index}`}
                          className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="rounded-full p-0.5 hover:bg-violet-100 dark:hover:bg-violet-500/20"
                            aria-label={`Remove tag ${tag}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <fieldset className="sm:col-span-2">
                  <legend className={labelClass}>
                    Save type (visibility) <RequiredMark />
                  </legend>
                  {errors.visibility?.message && (
                    <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                      {errors.visibility.message}
                    </p>
                  )}
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        {
                          value: "private" as const,
                          label: "Private",
                          description:
                            "Only you can see and use this template.",
                          icon: Lock,
                        },
                        {
                          value: "public" as const,
                          label: "Public",
                          description:
                            "Visible in the public template gallery.",
                          icon: Globe,
                        },
                      ] as const
                    ).map(({ value, label, description, icon: Icon }) => (
                      <label
                        key={value}
                        className={`cursor-pointer rounded-xl border p-4 transition ${
                          values.visibility === value
                            ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10"
                            : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                        }`}
                      >
                        <input
                          type="radio"
                          value={value}
                          className="sr-only"
                          {...register("visibility")}
                        />
                        <span className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                          <Icon size={16} />
                          {label}
                        </span>
                        <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                          {description}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </EditorSection>

            <EditorSection
              title="Branding"
              description="Default brand colour applied to apps created from this template."
              open={openSections.branding}
              onToggle={() => toggleSection("branding")}
            >
              <Field
                label="Primary colour"
                required
                error={errors.branding?.primaryColor?.message}
              >
                <div className="mt-1.5 flex items-center gap-3">
                  <input
                    type="color"
                    className="h-10 w-12 cursor-pointer rounded border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950"
                    value={values.branding?.primaryColor || "#4F46E5"}
                    onChange={(event) =>
                      setValue("branding.primaryColor", event.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                  <input
                    className={`${inputClass} mt-0`}
                    placeholder="#4F46E5"
                    {...register("branding.primaryColor")}
                    value={values.branding?.primaryColor || "#4F46E5"}
                    onChange={(event) =>
                      setValue("branding.primaryColor", event.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                </div>
              </Field>
            </EditorSection>

            <EditorSection
              title="Splash screen"
              description="Default loading screen for apps built from this template."
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
                      className={`cursor-pointer rounded-xl border p-4 transition ${
                        values.splashScreen?.type === type
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10"
                          : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                      }`}
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
                    required
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
                          className="accent-violet-600"
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
              title="Default permissions"
              description="Capabilities enabled by default for apps using this template."
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
              title="Default settings"
              description="Device and web-view behaviour for apps created from this template."
              open={openSections.settings}
              onToggle={() => toggleSection("settings")}
            >
              <div className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Status bar colour"
                    required
                    error={errors.appSettings?.statusBarColor?.message}
                  >
                    <div className="mt-1.5 flex items-center gap-3">
                      <input
                        type="color"
                        className="h-10 w-12 cursor-pointer rounded border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950"
                        value={values.appSettings?.statusBarColor || "#000000"}
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
                        value={values.appSettings?.statusBarColor || "#000000"}
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
                    required
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
                        <div
                          key={option}
                          onClick={() =>
                            setValue("appSettings.orientation", option, {
                              shouldDirty: true,
                            })
                          }
                          className={`cursor-pointer rounded-lg border px-4 py-3 text-sm font-medium capitalize transition ${
                            values.appSettings?.orientation === option
                              ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
                              : "border-zinc-200 text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-300"
                          }`}
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

          <aside className="lg:sticky lg:top-6">
            <div className={`${sectionClass} overflow-hidden`}>
              <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Sparkles size={17} className="text-violet-600" />
                  <h2 className="font-semibold text-zinc-950 dark:text-white">
                    Live preview
                  </h2>
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  A summary of your template configuration.
                </p>
              </div>
              <div className="p-5">
                <div className="mx-auto w-52 overflow-hidden rounded-[2rem] border-8 border-zinc-900 bg-white shadow-xl dark:border-zinc-700">
                  <div
                    className="h-5"
                    style={{
                      backgroundColor:
                        values.appSettings?.statusBarColor || "#000000",
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
                      {values.name || "Your template"}
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
                    label="Save type"
                    value={values.visibility || "private"}
                    capitalized
                  />
                  <PreviewItem
                    label="Category"
                    value={values.category || "Not set"}
                  />
                  <PreviewItem
                    label="Tags"
                    value={tags.length > 0 ? tags.join(", ") : "None"}
                  />
                  <PreviewItem
                    label="Splash type"
                    value={values.splashScreen?.type || "logo"}
                    capitalized
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
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      Brand colour
                    </span>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-4 w-4 rounded-full border border-zinc-200 dark:border-zinc-600"
                        style={{
                          backgroundColor:
                            values.branding?.primaryColor || "#4F46E5",
                        }}
                      />
                      <span className="font-medium text-zinc-900 dark:text-white">
                        {values.branding?.primaryColor || "#4F46E5"}
                      </span>
                    </span>
                  </div>
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
            onClick={() => router.push("/dashboard/templates")}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createTemplateMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createTemplateMutation.isPending && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {createTemplateMutation.isPending
              ? "Creating…"
              : values.visibility === "public"
                ? "Create public template"
                : "Create private template"}
            <Check size={16} />
          </button>
        </div>
      </footer>
    </form>
  );
}

function RequiredMark() {
  return <span className="text-red-500">*</span>;
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
  required = false,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
        {required && <RequiredMark />}
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
      className={`flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-4 transition ${
        checked
          ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10"
          : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
      }`}
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
        className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 rounded-full transition ${
          checked ? "bg-violet-600" : "bg-zinc-300 dark:bg-zinc-600"
        }`}
      >
        {children}
        <span
          className={`pointer-events-none absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
            checked ? "left-4" : "left-0.5"
          }`}
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
        className={`max-w-40 text-right font-medium text-zinc-900 dark:text-white ${
          capitalized ? "capitalize" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
