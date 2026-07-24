"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
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

import Loader from "@/app/components/ui/Loader";
import { useTemplate } from "@/app/lib/hooks/template/useTemplate";
import { useUpdateTemplate } from "@/app/lib/hooks/template/useUpdateTemplate";
import { useCreateTemplate } from "@/app/lib/hooks/template/useCreateTemplate";
import { showApiError, showApiSuccess } from "@/app/lib/utils";
import { editorDefaults } from "@/app/lib/defaults/template/defaults";
import {
  permissions,
  settingToggles,
} from "@/app/lib/constants/template/constants";
import { useAppDispatch, useAppSelector } from "@/app/lib/redux/hook/hooks";
import { resetCreateTemplate } from "@/app/lib/redux/slices/createTemplateSlice";
import {
  templateSchema,
  type TemplateValues,
} from "@/app/lib/schemas/template/schema";

interface TemplateFormProps {
  mode: "create" | "edit";
}

// Keys of every image-ish field that supports a "pick a file to preview"
// flow. None of these are ever written into the RHF form state — the file
// input only ever produces a local blob: URL used for rendering. The actual
// value that gets validated and sent to the backend is whatever the user
// types/pastes into the paired URL text field.
type PreviewKey = "thumbnail" | "logoImage" | "fullImage" | "animationJson";

export default function TemplateForm({ mode }: TemplateFormProps) {
  const isEdit = mode === "edit";

  const router = useRouter();
  const params = useParams();

  const id = params?.id as string | undefined;

  const dispatch = useAppDispatch();

  const templateInfo = useAppSelector(
    (state) => state.createTemplate.templateInfo,
  );

  const { data: template, isLoading } = useTemplate(isEdit ? id : undefined);
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateTemplate();
  const createTemplateMutation = useCreateTemplate();

  const [tagInput, setTagInput] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true,
    branding: true,
    splash: true,
    permissions: true,
    settings: true,
  });

  // Local preview state. These are object URLs created from whatever file
  // the user picks — good for showing a live preview, useless (and unsafe)
  // to submit to the backend, so they never touch react-hook-form state.
  const [previews, setPreviews] = useState<Partial<Record<PreviewKey, string>>>(
    {},
  );
  const [selectedFiles, setSelectedFiles] = useState<
    Partial<Record<PreviewKey, File>>
  >({});

  function setPreviewFor(key: PreviewKey, file: File) {
    setSelectedFiles((current) => ({
      ...current,
      [key]: file,
    }));

    setPreviews((current) => {
      const next = { ...current };
      if (next[key]) URL.revokeObjectURL(next[key]!);
      next[key] = URL.createObjectURL(file);
      // const blobUrl = URL.createObjectURL(file);
      // console.log(blobUrl);

      return next;
    });
  }
  //cleaner for the remaining url in the browser
  // This ensures all Blob URLs are released when the component unmounts.
  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previews]);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TemplateValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: editorDefaults,
    mode: "onBlur",
  });

  useEffect(() => {
    if (!isEdit || !template) return;
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
        disableScrollBounce: Boolean(template.appSettings?.disableScrollBounce),
      },
    });
  }, [isEdit, template, reset]);

  // Create mode: prefill name/description that were entered in
  // CreateTemplateModal and stashed in redux — ONCE, on mount. After that the
  // form inputs are the source of truth, so user edits are never clobbered by
  // later redux reference change.
  const createPrefillDone = useRef(false);
  useEffect(() => {
    if (isEdit || createPrefillDone.current || !templateInfo) return;
    createPrefillDone.current = true;
    reset({
      ...editorDefaults,
      name: templateInfo.name || editorDefaults.name,
      description: templateInfo.description || editorDefaults.description,
    });
  }, [isEdit, templateInfo, reset]);

  const values = useWatch({ control }) ?? editorDefaults;
  const tags = values.tags ?? [];
  const selectedPermissions = Object.values(values.appPermissions ?? {}).filter(
    Boolean,
  ).length;

  // What the phone mockup should actually render for the splash screen:
  // prefer a locally-picked file preview, fall back to whatever URL is
  // currently saved on the field. "logo" and "animation" are treated
  // identically — both are just a small centred image.
  const splashPreviewSrc =
    values.splashScreen?.type === "image"
      ? previews.fullImage || values.splashScreen?.fullImage
      : values.splashScreen?.type === "animation"
        ? previews.animationJson || values.splashScreen?.animationJson
        : previews.logoImage || values.splashScreen?.logoImage;

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

  function onSubmit(data: TemplateValues) {
    if (isEdit) {
      if (!id) return;
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
      return;
    }

    // Build FormData for multipart upload
    const formData = new FormData();

    // Basic fields
    formData.append("name", data.name);
    formData.append("visibility", data.visibility);
    if (data.description) formData.append("description", data.description);
    if (data.category) formData.append("category", data.category);

    // Tags (send as JSON string array)
    if (data.tags.length > 0) {
      formData.append("tags", JSON.stringify(data.tags));
    }

    // Nested objects — stringify for multipart
    formData.append("branding", JSON.stringify(data.branding));
    formData.append("splashScreen", JSON.stringify(data.splashScreen));
    formData.append("appPermissions", JSON.stringify(data.appPermissions));
    formData.append("appSettings", JSON.stringify(data.appSettings));

    // Thumbnail file — if user selected a file, send it
    if (selectedFiles.thumbnail) {
      formData.append("thumbnail", selectedFiles.thumbnail);
    }

    // Splash image — send ONE file based on splashScreen.type
    const splashType = data.splashScreen.type;
    if (splashType === "image" && selectedFiles.fullImage) {
      formData.append("splashImage", selectedFiles.fullImage);
    } else if (splashType === "animation" && selectedFiles.animationJson) {
      formData.append("splashImage", selectedFiles.animationJson);
    } else if (selectedFiles.logoImage) {
      formData.append("splashImage", selectedFiles.logoImage);
    }

    createTemplateMutation.mutate(formData, {
      onSuccess() {
        dispatch(resetCreateTemplate());
        toast.success("Template created successfully.");
        router.push("/dashboard/templates");
      },
      onError(error) {
        console.error(error);
        toast.error("Failed to create template.");
      },
    });
  }

  const isSubmitting = isEdit ? isUpdating : createTemplateMutation.isPending;
  const backHref = isEdit
    ? `/dashboard/templates/${id}`
    : "/dashboard/templates";
  const eyebrow = isEdit ? "Edit template" : "Template editor";
  const submitLabel = isEdit
    ? "Save changes"
    : values.visibility === "public"
      ? "Create public template"
      : "Create private template";

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white";
  const labelClass = "text-sm font-medium text-zinc-800 dark:text-zinc-200";
  const sectionClass =
    "rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900";

  if (isEdit && isLoading) {
    return <Loader text="Loading template..." />;
  }

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
              onClick={() => router.push(backHref)}
              className="rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {eyebrow}
              </p>
              <h1 className="truncate text-xl font-bold text-zinc-950 dark:text-white">
                {values.name || (isEdit ? "Edit details" : "Create template")}
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
              {isEdit ? (
                "Update the template settings and defaults below. Changes will be saved for this template."
              ) : (
                <>
                  Configure a reusable blueprint for future applications. Fields
                  marked with <span className="text-red-500">*</span> are
                  required by the API.
                </>
              )}
            </p>

            <EditorSection
              title="Basic information"
              description="Identity details for this template."
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
                  <ImageDropzone
                    preview={previews.thumbnail}
                    onFileChange={(file) => setPreviewFor("thumbnail", file)}
                    hint="Upload an image — it will be sent to the server when you create the template."
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
                          className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="rounded-full p-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
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
                    Visibility <RequiredMark />
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
                        onClick={() =>
                          setValue("visibility", value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        className={`cursor-pointer rounded-xl border p-4 transition ${
                          values.visibility === value
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                            : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                        }`}
                      >
                        <input
                          type="radio"
                          value={value}
                          className="sr-only"
                          {...register("visibility")}
                          checked={values.visibility === value}
                          readOnly
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
              description="Set the template brand colour."
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
                  />
                </div>
              </Field>
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
                      className={`cursor-pointer rounded-xl border p-4 transition ${
                        values.splashScreen?.type === type
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
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
                          ? "Small looping image while loading"
                          : type === "image"
                            ? "Fill the screen with an image"
                            : "Show a centred logo"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {values.splashScreen?.type === "animation" ? (
                    // Same treatment as "logo" — a small centred image. The
                    // only difference is we nudge people toward PNGs.
                    <Field
                      label="Animation image"
                      hint="A small looping GIF shown while the app loads"
                      error={errors.splashScreen?.animationJson?.message}
                    >
                      <input
                        className={inputClass}
                        placeholder="https://.../animation.gif"
                        {...register("splashScreen.animationJson")}
                      />
                      <ImageDropzone
                        preview={previews.animationJson}
                        onFileChange={(file) =>
                          setPreviewFor("animationJson", file)
                        }
                        accept="image/gif"
                        hint="Upload an image — it will be sent when you create the template."
                      />
                    </Field>
                  ) : values.splashScreen?.type === "image" ? (
                    <Field
                      label="Full image"
                      hint="Fills the entire splash screen"
                      error={errors.splashScreen?.fullImage?.message}
                    >
                      <input
                        className={inputClass}
                        placeholder="https://.../splash.png"
                        {...register("splashScreen.fullImage")}
                      />
                      <ImageDropzone
                        preview={previews.fullImage}
                        onFileChange={(file) =>
                          setPreviewFor("fullImage", file)
                        }
                        hint="Upload an image — it will be sent when you create the template."
                      />
                    </Field>
                  ) : (
                    <Field
                      label="Logo image"
                      hint="A small centred logo"
                      error={errors.splashScreen?.logoImage?.message}
                    >
                      <input
                        className={inputClass}
                        placeholder="https://.../logo.png"
                        {...register("splashScreen.logoImage")}
                      />
                      <ImageDropzone
                        preview={previews.logoImage}
                        onFileChange={(file) =>
                          setPreviewFor("logoImage", file)
                        }
                        hint="Upload an image — it will be sent when you create the template."
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
              title={isEdit ? "Template permissions" : "Default permissions"}
              description={
                isEdit
                  ? "Enable only the capabilities your apps should inherit."
                  : "Capabilities enabled by default for apps using this template."
              }
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
              title={isEdit ? "Template settings" : "Default settings"}
              description={
                isEdit
                  ? "Control the defaults for app behaviour."
                  : "Device and web-view behaviour for apps created from this template."
              }
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
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
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
                  <Sparkles size={17} className="text-indigo-600" />
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
                    className="relative flex aspect-[9/15] items-center justify-center overflow-hidden px-4 text-center"
                    style={{
                      backgroundColor:
                        values.splashScreen?.backgroundColor || "#FFFFFF",
                    }}
                  >
                    {values.splashScreen?.type === "image" &&
                      splashPreviewSrc && (
                        <img
                          src={splashPreviewSrc}
                          alt="Splash preview"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      )}
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      {values.splashScreen?.type === "image" ? (
                        !splashPreviewSrc && (
                          <ImageIcon
                            className="h-10 w-10"
                            style={{ color: values.branding?.primaryColor }}
                          />
                        )
                      ) : splashPreviewSrc ? (
                        <img
                          src={splashPreviewSrc}
                          alt="Logo preview"
                          className="max-h-24 max-w-24 rounded-xl object-contain"
                        />
                      ) : (
                        <ImageIcon
                          className="h-10 w-10"
                          style={{ color: values.branding?.primaryColor }}
                        />
                      )}

                      <span className="text-sm font-bold text-zinc-900">
                        {values.name || "Your template"}
                      </span>
                    </div>
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
                    label="Visibility"
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
            onClick={() => router.push(backHref)}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {submitLabel}
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

// A small, self-contained "pick a file to preview" control. It never writes
// to react-hook-form — it only ever produces a local blob: URL for the
// caller to render. The caller is responsible for the real (backend-bound)
// URL field that sits above/beside it.
function ImageDropzone({
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
            alt="Selected file preview"
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
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            onFileChange(file);
            // Reset so picking the same file again still fires onChange.
            event.target.value = "";
          }}
        />
      </label>
      <div className="min-w-0 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
        <span className="block font-medium text-zinc-700 dark:text-zinc-300">
          {preview ? "Preview updated" : "Upload to preview"}
        </span>
        <span className="block">
          {hint ?? "Not sent to the server — paste a URL to actually save it."}
        </span>
      </div>
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
      className={`flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-4 transition ${
        checked
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
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
          checked ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-600"
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
