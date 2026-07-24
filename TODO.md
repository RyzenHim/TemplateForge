# Implementation Plan - Template File Upload Flow

## ✅ Phase 1: Backend Changes (Complete)

- [x] 1. `be/src/uploads/uploads.module.ts` - Export `CloudinaryService`
- [x] 2. `be/src/app/app.module.ts` - Import `UploadsModule`
- [x] 3. `be/src/templates/templates.module.ts` - Import `UploadsModule`
- [x] 4. `be/src/templates/templates.controller.ts` - Change `create()` to accept multipart with FileFieldsInterceptor
- [x] 5. `be/src/templates/templates.service.ts` - Inject CloudinaryService, upload files, store URLs
- [x] 6. `be/src/templates/dto/create-template.dto.ts` - No changes needed (already accepts strings for URLs)
- [x] 7. Backend compiles with 0 errors and all routes mapped

## ✅ Phase 2: Frontend Changes (Complete)

- [x] 8. `fe/src/app/lib/services/template.service.ts` - Change createTemplate to accept FormData
- [x] 9. `fe/src/app/lib/types/template.types.ts` - No changes needed (types already accept URL strings)
- [x] 10. `fe/src/app/components/TemplateForm.tsx` - Build FormData on submit with files
