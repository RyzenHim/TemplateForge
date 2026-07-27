# TODO: Add View Button & Detail Page for Addons

## Completed Steps

- [x] 1. Create `fe/src/app/dashboard/addons/[id]/page.tsx` — Addon detail page with back navigation, header (icon, name, platform, category), info card, description, and edit button.
- [x] 2. Update `fe/src/app/dashboard/addons/page.tsx` — Add "View" button (Eye icon) to `AddonCard` linking to detail page.
- [x] 3. Update `fe/src/app/lib/types/addons/addons.types.ts` — Added `createdAt` and `updatedAt` fields to `Addon` type.

## Additional Fixes

- [x] 4. **Backend `addons.service.ts`** — Made `findAll()` public (no owner filter) and `findOne()` public (no owner filter). `update()` and `remove()` still require owner.
- [x] 5. **Backend `addons.controller.ts`** — Removed `req.user.id` from `findOne()` call since it no longer needs user context.
- [x] 6. **Frontend `addons.types.ts`** — Added `owner?: string` field to `Addon` type.
- [x] 7. **Frontend `addons/page.tsx`** — `AddonCard` now checks ownership and conditionally shows Edit/Delete buttons only for owners.
- [x] 8. **Frontend `addons/[id]/page.tsx`** — Detail page now shows Edit button only if current user is the owner.
