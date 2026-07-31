import z from "zod";

export const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Use a 6-digit hex colour, for example #4F46E5");

export const appEditorSchema = z.object({
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

export type AppEditorValues = z.infer<typeof appEditorSchema>;
