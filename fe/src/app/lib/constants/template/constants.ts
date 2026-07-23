export const permissions = [
  ["camera", "Camera", "Allow apps to capture photos and video."],
  ["microphone", "Microphone", "Allow apps to record audio."],
  ["location", "Location", "Allow apps to access the device location."],
  ["storage", "Storage", "Allow access to files and media."],
  ["notifications", "Notifications", "Allow app notifications."],
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
