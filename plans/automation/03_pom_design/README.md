# Bước 3: Thiết kế cấu trúc POM (POM Design) — PARSCA Vendor

**Workflow:** `/gen-script` (tiếp tục)
**Skill:** `generate-playwright-script`

---

## Mục đích

Từ locators **đã verify** ở Bước 2, định hình các class trong `pages/` và `api/` của `playwright-parsca/` — đúng file, tên method theo nghiệp vụ PARSCA — **trước khi** viết spec.

## Cách sử dụng

1. Đảm bảo đã review locators + bảng Network ở Bước 2.
2. Gửi file `prompt.txt` cho AI.
3. AI phác thảo:
   - Class Page / Dialog / Api + file path
   - Locator declarations (getter, từ Bước 2)
   - Method signatures + body
   - Fixture đăng ký page / api trong `fixtures/test.ts`
4. Review kiến trúc → sang Bước 4.

## Quy tắc đặt tên

| Thành phần | Quy tắc | Ví dụ PARSCA |
|---|---|---|
| **Page class** | PascalCase + `Page` / `Dialog` | `ProductListPage`, `ProductFormPage`, `ImportCsvDialog` |
| **Api class** | PascalCase + `Api` | `ProductsApi`, `UsersApi` |
| **Locator** | camelCase getter mô tả element | `skuInput`, `checkFileButton`, `notFoundMessage` |
| **Method** | camelCase hành động nghiệp vụ | `fillIdentity()`, `uploadImages()`, `runDryRun()`, `changeStatus(sku, status)` |
| **File** | Trùng tên class | `pages/vendor/ProductFormPage.ts` |

## Lưu ý

- Chỉ thiết kế **Page / Api classes**, CHƯA sinh spec.
- Màn giả lập đặt trong `pages/vendor/simulated/`, chỉ có method đọc / assert hiển thị.
- Không thêm locator chưa có trong bảng Bước 2.
