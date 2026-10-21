# PVEN-4: Danh sách, đổi trạng thái và xoá sản phẩm

| Thuộc tính | Giá trị |
|---|---|
| **Issue Key** | PVEN-4 |
| **Loại** | Story |
| **Trạng thái** | To Do |
| **Độ ưu tiên** | High |
| **Người giao** | Unassigned |
| **Người báo** | QA PARSCA (mẫu) |
| **Labels** | vendor, product, list, status, delete |
| **Components** | Vendor Portal, Products API |
| **Epic** | PVEN-1 |
| **Attachments** | 0 file(s) |
| **Ngày tạo** | 2026-10-20T17:30:00.000+0700 |
| **Cập nhật** | 2026-10-20T17:30:00.000+0700 |

## Mô tả (Description)

Là vendor, tôi muốn xem, tìm, lọc danh sách sản phẩm của mình, đổi trạng thái ngay trên danh sách và xoá sản phẩm không còn bán.

- URL: `{FE_URL}/vendor/products`, `{FE_URL}/vendor/products/:id`
- Endpoint: `GET /products/admin/all`, `GET /products/admin/:idOrSlug`, `PATCH /products/:id`, `DELETE /products/:id`
- Nguồn: `docs/parsca-vendor-test-docs/07-ds-san-pham.md`, `08-chi-tiet-san-pham.md`, `10-trang-thai-xoa-san-pham.md`; `practices/requirements/parsca-vendor/03_requirements_product_management.md` (2.1, 2.2, 2.4)
- Seed dữ liệu: `practices/test-data/csv/plist_seed_25_products.csv`

Acceptance Criteria:

| ID | Tiêu chí chấp nhận |
| --- | --- |
| AC-PLIST-01 | Tiêu đề "Product"; nút "Import CSV" và "Add product" (→ `/vendor/products/new`) |
| AC-PLIST-02 | Cột: Product, Category, Price ("CAD"), Stock, Status (ô chọn), Last updated, Actions. Không có cột "Created by" |
| AC-PLIST-03 | Ô "Search by SKU, product name, brand…"; đổi từ khoá → về trang 1 |
| AC-PLIST-04 | Lọc department: "All divisions" + marine, auto, door, tools |
| AC-PLIST-05 | Lọc trạng thái mặc định "Active products"; có Draft, Archived, All statuses |
| AC-PLIST-06 | Sắp xếp phía server: Newest (mặc định), Price ↑, Price ↓, Name A–Z |
| AC-PLIST-07 | Phân trang mặc định 10 dòng (10/20/30/50); ẩn khi chỉ 1 trang; BE tối đa 100 dòng/trang |
| AC-PLIST-08 | Bấm dòng → mở chi tiết; bấm ô trạng thái / sửa / xoá không mở chi tiết |
| AC-PLIST-09 | Trạng thái tải, lỗi "Failed to load products.", rỗng "No products." |
| AC-PLIST-10 | Stock: thẻ "In stock" / "Out of stock" + "N units" |
| AC-PDTL-01 | Chi tiết: ảnh thu nhỏ, SKU, category, tên, giá "<giá> CAD" + giá so sánh gạch ngang, tồn kho, nút "Edit product", "Delete" |
| AC-PDTL-03 | Lỗi hoặc không có quyền → "Product not found or you do not have permission to view it." + "Back to products" |
| AC-PDTL-04 | Xoá từ chi tiết → toast "Product deleted" và về danh sách |
| AC-PSTAT-01 | Ô chọn trạng thái từng hàng → `PATCH /products/:id {status}`; toast "Status updated"; không hỏi xác nhận |
| AC-PSTAT-02 | Trong lúc đổi, ô chọn của tất cả hàng bị khoá |
| AC-PSTAT-03 | Sau khi đổi, hàng có thể biến mất khỏi danh sách đang lọc |
| AC-PSTAT-04 | Draft và Archived đều ẩn khỏi website |
| AC-PSTAT-05 | Hộp thoại "Delete product?" — bấm ra ngoài không đóng; thành công toast "Deleted 1" |
| AC-PSTAT-06 | Xoá hẳn khỏi DB (204); ảnh dùng chung với sản phẩm khác được giữ lại |
| AC-PSTAT-07 | Id không tồn tại hoặc của người khác → 404 "Product not found" |

## LUỒNG XỬ LÝ

### Đổi trạng thái
1. Ở danh sách, chọn trạng thái mới trong ô Status của hàng → mọi ô khoá
2. `PATCH {status}` → toast "Status updated" → hàng có thể biến mất khỏi bộ lọc hiện tại

### Xoá
1. Bấm thùng rác → hộp thoại "Delete product?"
2. Bấm "Delete" → `DELETE` 204 → toast "Deleted 1" → ảnh không còn dùng bị xoá khỏi kho

## Câu hỏi mở

| ID | Câu hỏi |
| --- | --- |
| Q-V6 | BE có chặn xoá sản phẩm đã có đơn hàng? |
| Q-V16 | Ba huy hiệu cố định ở trang chi tiết có giữ? |

## Attachments (0 file)

Không có.
