export const permissions = [
  ["camera", "Camera", "Allow the app to capture photos and video."],
  ["microphone", "Microphone", "Allow the app to record audio."],
  ["location", "Location", "Allow the app to access the device location."],
  ["storage", "Storage", "Allow access to files and media."],
  ["notifications", "Notifications", "Allow the app to send notifications."],
] as const;

export const settingToggles = [
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

export const permissionsList = [
  { key: "camera", name: "Camera", desc: "Allow capturing photos & videos" },
  { key: "microphone", name: "Microphone", desc: "Allow recording audio" },
  { key: "location", name: "Location", desc: "Allow accessing GPS location" },
  {
    key: "storage",
    name: "Storage",
    desc: "Allow reading/writing local files",
  },
  {
    key: "notifications",
    name: "Notifications",
    desc: "Allow sending push notifications",
  },
] as const;

export const settingsList = [
  {
    key: "fullScreen",
    name: "Full Screen Mode",
    desc: "Hides system status/navigation bars",
  },
  {
    key: "pinchToZoom",
    name: "Pinch to Zoom",
    desc: "Allows users to zoom in/out of pages",
  },
  {
    key: "callbackOnResume",
    name: "Resume Callback",
    desc: "Executes resume events when app is foregrounded",
  },
  {
    key: "disableCaching",
    name: "Disable Cache",
    desc: "Force loads fresh web contents",
  },
  {
    key: "kioskMode",
    name: "Kiosk Mode",
    desc: "Locks app in active full-screen focus",
  },
  {
    key: "disableScrollBounce",
    name: "Disable Scroll Bounce",
    desc: "Disables overscroll physics bounce",
  },
] as const;
