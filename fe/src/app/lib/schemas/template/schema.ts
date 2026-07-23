import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Use a 6-digit hex colour, for example #4F46E5");

export const templateSchema = z.object({
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

export type TemplateValues = z.infer<typeof templateSchema>;
