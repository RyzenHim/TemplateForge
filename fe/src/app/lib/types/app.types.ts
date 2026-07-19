export interface Branding {
  primaryColor: string;
}

export interface SplashScreen {
  type: "animation" | "logo" | "image";
  animationJson: string;
  logoImage: string;
  fullImage: string;
  backgroundColor: string;
  playbackBehaviour: "once" | "loop";
}
interface CreateAppState {
  appInfo: {
    name: string;
    packageName: string;
    description: string;
    websiteUrl: string;
    version: string;
    icon: string;
  };

  templateId: string | null;
}
export interface AppPermissions {
  camera: boolean;
  microphone: boolean;
  location: boolean;
  storage: boolean;
  notifications: boolean;
}

export interface AppSettings {
  statusBarColor: string;
  orientation: "portrait" | "landscape" | "both";
  fullScreen: boolean;
  systemNavigationBarColor: string;
  pinchToZoom: boolean;
  callbackOnResume: boolean;
  disableCaching: boolean;
  kioskMode: boolean;
  disableScrollBounce: boolean;
}

export interface App {
  id: string;
  name: string;
  description: string;
  packageName: string;
  version: string;
  websiteUrl: string;
  icon: string;
  status: "draft" | "published" | "archived";
  owner: string;
  sourceTemplate: string | null;
  templateName?: string;
  branding: Branding;
  splashScreen: SplashScreen;
  appPermissions: AppPermissions;
  appSettings: AppSettings;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppRequest {
  name: string;
  description?: string;
  packageName: string;
  version?: string;
  websiteUrl?: string;
  icon?: string;
  templateId?: string;
  branding: Branding;
  splashScreen: SplashScreen;
  appPermissions: AppPermissions;
  appSettings: AppSettings;
}

export type UpdateAppRequest = Partial<CreateAppRequest>;

export interface CreateAppResponse {
  message: string;
  app: App;
}
