import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type {
  AppPermissions,
  AppSettings,
  Branding,
  SplashScreen,
} from "../../types/app.types";

type AppInfo = {
  name: string;
  packageName: string;
  description: string;
  websiteUrl: string;
  version: string;
  icon: string;
  branding: Branding;
  splashScreen: SplashScreen;
  appPermissions: AppPermissions;
  appSettings: AppSettings;
};

type CreateAppState = {
  appInfo: AppInfo;
  templateId: string | null;
};

const initialState: CreateAppState = {
  appInfo: {
    name: "",
    packageName: "",
    description: "",
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
  },
  templateId: null,
};

const createAppSlice = createSlice({
  name: "createApp",
  initialState,

  reducers: {
    setAppInfo(state, action: PayloadAction<AppInfo>) {
      state.appInfo = action.payload;
    },

    setTemplateId(state, action: PayloadAction<string | null>) {
      state.templateId = action.payload;
    },

    resetCreateApp() {
      return initialState;
    },
  },
});

export const { setAppInfo, setTemplateId, resetCreateApp } =
  createAppSlice.actions;

export default createAppSlice.reducer;
