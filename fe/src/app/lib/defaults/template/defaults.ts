import { TemplateValues } from "../../schemas/template/schema";

export const editorDefaults: TemplateValues = {
  name: "",
  description: "",
  visibility: "private",
  thumbnail: "",
  category: "",
  tags: [],
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
