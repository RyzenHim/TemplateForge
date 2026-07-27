# TODO: Platform Change Warning & Add-on Filtering ✅

## Task

When the platform dropdown is changed while editing an app:

1. Show a confirmation/warning dialog about incompatible add-ons ✅
2. On confirm: filter/clear incompatible add-ons + update platform ✅
3. On cancel: revert platform to previous selection ✅

## Changes Made

### 1. `fe/src/app/components/AppForm.tsx`

- ✅ Added `useRef` to React imports
- ✅ Added `ConfirmDialog` import
- ✅ Added state: `previousPlatformRef`, `showPlatformWarning`, `pendingPlatformValue`
- ✅ Added `confirmPlatformChange` handler - updates platform & filters incompatible add-ons
- ✅ Added `cancelPlatformChange` handler - reverts platform to previous value
- ✅ Modified platform `<select>` to intercept onChange with warning logic
- ✅ Added `<ConfirmDialog>` component for platform change warning
- ✅ Added `previousPlatformRef.current` initialization in hydrate effect
