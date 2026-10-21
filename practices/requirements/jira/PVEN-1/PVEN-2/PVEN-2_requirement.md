# PVEN-2: Thêm / sửa sản phẩm và upload ảnh

| Thuộc tính | Giá trị |
|---|---|
| **Issue Key** | PVEN-2 |
| **Loại** | Story |
| **Trạng thái** | To Do |
| **Độ ưu tiên** | Highest |
| **Người giao** | Unassigned |
| **Người báo** | QA PARSCA (mẫu) |
| **Labels** | vendor, product, form, upload |
| **Components** | Vendor Portal, Products API |
| **Epic** | PVEN-1 |
| **Attachments** | 0 file(s) |
| **Ngày tạo** | 2026-10-20T17:30:00.000+0700 |
| **Cập nhật** | 2026-10-20T17:30:00.000+0700 |

## Mô tả (Description)

Là vendor, tôi muốn tạo và cập nhật sản phẩm với đầy đủ thông tin (nhận diện, phân loại, ảnh, tồn kho, số part, xe tương thích, mô tả) để bán trên PARSCA.

- URL: `{FE_URL}/vendor/products/new`, `{FE_URL}/vendor/products/:id/edit`
- Endpoint: `POST /products`, `PATCH /products/:id`, `POST /products/upload`, `GET /product-brands`, `GET /fitment-options`
- Nguồn: `docs/parsca-vendor-test-docs/09-them-sua-san-pham.md`, `11-upload-anh.md`; `practices/requirements/parsca-vendor/03_requirements_product_management.md` (2.3, 2.5)

Acceptance Criteria:

| ID | Tiêu chí chấp nhận |
| --- | --- |
| AC-PFORM-01 | Form validate ngay khi gõ; nút "Add Product" (tạo) / "Update" (sửa) có trạng thái đang lưu; "Cancel" về danh sách, không hỏi khi có thay đổi chưa lưu |
| AC-PFORM-02 | Tạo `POST /products`, sửa `PATCH /products/:id`. Thành công toast "Saved" → `/vendor/products`. Lỗi: toast thông báo server hoặc "Save failed", form giữ nguyên |
| AC-PFORM-03 | Khi tạo, BE gán `createdBy` = tài khoản đăng nhập, `isNew = true`, thời điểm huy hiệu "mới" = lúc tạo |
| AC-PFORM-04 | Name bắt buộc, trim, ≥ 1 ký tự — "Name required" |
| AC-PFORM-05 | SKU bắt buộc, không cho gõ dấu cách, BE đổi CHỮ HOA, duy nhất toàn hệ thống — "SKU required"; trùng → 409 `Product with SKU "XXX" already exists` |
| AC-PFORM-06 | Price bắt buộc, chữ số + 1 dấu chấm, ≤ 4 chữ số thập phân, 0 hợp lệ — "Price required" / "Price must be 0 or greater" |
| AC-PFORM-07 | Compare at không bắt buộc, ≥ 0; không kiểm tra lớn hơn giá |
| AC-PFORM-08 | Brand chọn từ `/product-brands`; mặc định theo department (marine → "Parsca Marine", auto và door → "Parsca", tools → "Vevor") |
| AC-PFORM-09 | Department bắt buộc (mặc định marine) — "Department required"; Subcategory bắt buộc, phụ thuộc department — "Subcategory required" |
| AC-PFORM-10 | Gallery 1–5 ảnh — "At least one image is required" / "Maximum 5 images" / "A product can have at most 5 images"; ảnh đầu là cover |
| AC-PFORM-11 | Status: Active (mặc định), Draft, Archived — vendor chọn được cả ba, không qua duyệt |
| AC-PFORM-12 | Checkbox "New" chỉ hiện khi sửa; false → true đặt lại thời điểm huy hiệu |
| AC-PFORM-13 | BE luôn tính lại `inStock = (stockCount > 0)` |
| AC-PFORM-15 | Stock count bắt buộc, số nguyên ≥ 1 — "Stock count required" / "…whole number" / "…at least 1" |
| AC-PFORM-16 | Alternate part numbers: trim, không trùng — "Part number already exists"; Enter không gửi form |
| AC-PFORM-17 | Compatible model chỉ với marine, auto; năm nguyên ≥ 0; không kiểm tra năm bắt đầu < năm kết thúc |
| AC-PFORM-18 | Detailed Description: khối Title + Body ("Title required" / "Body required"); Specifications và Compatibility: Label/Value bắt buộc trong dòng |
| AC-PFORM-19 | Trùng SKU / slug → 409 (cả tạo và sửa); đổi tên → slug đổi theo |
| AC-PFORM-20 | BE: số âm, rating > 5, trường lạ, status lạ, subcategory lạ, 0 hoặc 6 ảnh, stockCount 0 → 400 |
| AC-IMG-01 | `POST /products/upload` multipart trường "file" → `{imagePath: <URL công khai>}` |
| AC-IMG-02 | Chỉ nhận jpeg, png, webp, gif; tối đa 10 MB |
| AC-IMG-03 | Thiếu file → 400 "Image file is required"; sai loại → 400 "Only image uploads are allowed" |
| AC-IMG-05 | User thường → 403; không token → 401 |

### Form sản phẩm — trường chính

| Tên trường | Loại UI | Bắt buộc | Mặc định | Quy tắc | Thông báo lỗi |
| --- | --- | --- | --- | --- | --- |
| Name | Textbox | Có | – | Trim, ≥ 1 ký tự | Name required |
| SKU | Textbox | Có | – | Không dấu cách, BE → HOA, duy nhất | SKU required · 409 |
| Price | Textbox số | Có | 0 | ≤ 4 thập phân, ≥ 0 | Price required · Price must be 0 or greater |
| Department | Dropdown | Có | marine | marine/auto/door/tools | Department required |
| Subcategory | Dropdown phụ thuộc | Có | – | Theo department | Subcategory required |
| Gallery | Upload nhiều | Có | – | 1–5 ảnh, jpeg/png/webp/gif, ≤ 10 MB | At least one image is required · Maximum 5 images |
| Status | Dropdown | Có | Active | Active/Draft/Archived | – |
| Stock count | Number | Có | 0 | Nguyên ≥ 1 | Stock count required · …at least 1 |

## LUỒNG XỬ LÝ

1. Vendor mở `/vendor/products` → bấm "Add product"
2. Nhập Name, SKU, Price; chọn Department, Subcategory
3. Upload 1–5 ảnh (`POST /products/upload` lần lượt từng ảnh)
4. Nhập Stock count ≥ 1 → bấm "Add Product"
5. `POST /products` → toast "Saved" → về danh sách; nếu Active → hiện ngay trên website

## Câu hỏi mở

| ID | Câu hỏi |
| --- | --- |
| Q-V10 | Vendor tự xuất bản sản phẩm Active không qua duyệt — có chấp nhận? |
| Q-V11 | Vendor có được tự nhập Rating (0–5) cho sản phẩm? |
| Q-V13 | Có cần cảnh báo khi rời form chưa lưu và dọn ảnh mồ côi trên storage? |
| Q-V14 | Giới hạn "10 MB" được tính là 10.000.000 hay 10.485.760 byte? |
| Q-V15 | Có cần chặn: Compare at < Price; Year start > Year end; Subcategory không thuộc Department? |

## Attachments (0 file)

Không có. Bố cục form xem mục "CẤU TRÚC GIAO DIỆN" trong `practices/requirements/parsca-vendor/03_requirements_product_management.md`.
