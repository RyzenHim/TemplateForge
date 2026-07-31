import { AppEditorValues } from "../../schemas/apps/schema";

export const editorDefaults: AppEditorValues = {
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
