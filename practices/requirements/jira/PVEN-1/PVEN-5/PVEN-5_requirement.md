# PVEN-5: Phạm vi dữ liệu và phân quyền API của vendor

| Thuộc tính | Giá trị |
|---|---|
| **Issue Key** | PVEN-5 |
| **Loại** | Story |
| **Trạng thái** | To Do |
| **Độ ưu tiên** | Highest |
| **Người giao** | Unassigned |
| **Người báo** | QA PARSCA (mẫu) |
| **Labels** | vendor, security, data-scope, permission |
| **Components** | Products API, Auth |
| **Epic** | PVEN-1 |
| **Attachments** | 0 file(s) |
| **Ngày tạo** | 2026-10-20T17:30:00.000+0700 |
| **Cập nhật** | 2026-10-20T17:30:00.000+0700 |

## Mô tả (Description)

Là vendor, tôi muốn sản phẩm của tôi chỉ tôi quản lý được và tôi không thấy sản phẩm của vendor khác. Là chủ hệ thống, tôi muốn vendor chỉ gọi được API quản lý sản phẩm của mình, không gọi được API quản trị nền tảng.

- Endpoint: toàn bộ ma trận API (Nhóm 1 / 2 / 3)
- Nguồn: `docs/parsca-vendor-test-docs/05-phan-quyen-api.md`, `06-pham-vi-du-lieu.md`; `practices/requirements/parsca-vendor/02_requirements_access_control_data_scope.md`

> Đây là quy tắc quan trọng nhất của role vendor (rủi ro bảo mật cao nhất).

Acceptance Criteria:

| ID | Tiêu chí chấp nhận |
| --- | --- |
| AC-SCOPE-01 | Sản phẩm tạo bằng form hoặc import đều gán `createdBy` = tài khoản đang đăng nhập |
| AC-SCOPE-02 | Vendor gọi danh sách quản trị → chỉ nhận sản phẩm có `createdBy` = mình |
| AC-SCOPE-03 | Vendor xem / sửa / xoá sản phẩm của người khác → 404 "Product not found"; UI "Product not found or you do not have permission to view it." |
| AC-SCOPE-04 | Admin thấy tất cả, có cột "Created by" và bộ lọc `vendorName`; với vendor, `vendorName` bị bỏ qua |
| AC-SCOPE-05 | Mỗi sản phẩm trả `creator` (id + tên: tên tài khoản → email → "Unknown vendor") |
| AC-SCOPE-06 | Sản phẩm vendor tạo, nếu Active, xuất hiện ngay ở website |
| AC-SCOPE-07 | SKU và slug duy nhất toàn hệ thống |
| AC-SCOPE-08 | Hai tài khoản vendor (kể cả cùng công ty) không chia sẻ sản phẩm |
| AC-API-01 | Nhóm 1 — vendor gọi được: `GET /products/admin/all`, `GET /products/admin/:idOrSlug`, `POST /products`, `PATCH /products/:id`, `DELETE /products/:id`, `POST /products/upload`, `GET /products/import/template`, `POST /products/import` |
| AC-API-02 | Nhóm 2 — vendor bị 403 "You do not have permission to access this resource": `GET /users`, `PATCH /users/:id/role`, `GET /dashboard/stats`, API quản trị blog-posts, brand-logos, product-brands, fitment-options, quotes, newsletter-subscriptions |
| AC-API-03 | Nhóm 3 — công khai: `GET /products`, `GET /products/:idOrSlug`, `GET /product-brands`, `GET /fitment-options`, `/health`… |
| AC-API-04 | Không token → 401; token user → 403 với API vendor/admin |
| AC-API-05 | Body có trường không khai báo → 400; id sai định dạng bị từ chối |

### Tham số danh sách quản trị

| Tham số | Vendor | Admin |
| --- | --- | --- |
| page, limit (≤ 100), sort, status, departmentId, search | ✅ | ✅ |
| vendorName | ❌ Bị bỏ qua | ✅ Lọc theo tên/email |

## LUỒNG XỬ LÝ

1. V1 biết id/slug sản phẩm của V2 (qua website công khai)
2. V1 mở `/vendor/products/<id V2>` hoặc gọi `GET /products/admin/<id V2>`
3. BE thêm điều kiện `createdBy = V1` → không tìm thấy → 404 "Product not found"
4. UI hiển thị thông báo không có quyền + "Back to products"

## Câu hỏi mở

| ID | Câu hỏi |
| --- | --- |
| Q-V2 | Hai tài khoản vendor cùng công ty có cần chia sẻ sản phẩm không? |
| Q-V4 | Có chấp nhận rò rỉ thông tin SKU/slug của người khác qua 409 và lỗi import? |

## Attachments (0 file)

Không có.
