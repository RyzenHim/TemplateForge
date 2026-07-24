# Addon Creation Wiring Fixes

- [x] **Step 1**: Fix Platform type typo in `addons.types.ts` — Already correct (`"Android & iOS"`)
- [x] **Step 2**: Fix `useCreateAddon.ts` — Added `router.push('/dashboard/addons')` on success, added `onError` with console.error
- [x] **Step 3**: Fix `AddonsForm.tsx` — Added mutation error banner, switched to `mutateAsync` for double-submit prevention, added `isPending` state for button disable/text
- [x] **Verify**: All edits applied successfully
