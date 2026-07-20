import type {
  AppPermissions,
  AppSettings,
  Branding,
  SplashScreen,
} from "./app.types";

export interface Template {
  id: string;
  name: string;
  description: string;
  visibility: "public" | "private";
  thumbnail: string;
  category: string;
  tags: string[];
  owner: string;
  settings?: {
    appInfo?: {
      appName?: string;
      packageName?: string;
      version?: string;
      websiteUrl?: string;
      icon?: string;
    };
  };
  branding: Branding;
  splashScreen: SplashScreen;
  appPermissions: AppPermissions;
  appSettings: AppSettings;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  visibility: "public" | "private";
  thumbnail?: string;
  category?: string;
  tags?: string[];
  branding: Branding;
  splashScreen: SplashScreen;
  appPermissions: AppPermissions;
  appSettings: AppSettings;
}

export type UpdateTemplateRequest = Partial<CreateTemplateRequest>;

export interface TemplateResponse {
  message: string;
  template: Template;
}
