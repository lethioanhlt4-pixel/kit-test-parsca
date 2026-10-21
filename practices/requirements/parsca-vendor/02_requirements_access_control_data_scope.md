# TÀI LIỆU YÊU CẦU - PHÂN QUYỀN API & PHẠM VI DỮ LIỆU (VENDOR)

| Thông tin | Chi tiết |
|-----------|----------|
| Module | API (Phân quyền API) · SCOPE (Phạm vi dữ liệu createdBy) |
| Hệ thống | PARSCA — Marketplace phụ tùng |
| URL | `{FE_URL}/vendor/products`, `/vendor/products/:id`, `/vendor/products/:id/edit` |
| Endpoint | Toàn bộ ma trận API (Nhóm 1 / 2 / 3) · `GET /products/admin/all`, `GET /products/admin/:idOrSlug`, `POST /products`, `PATCH /products/:id`, `DELETE /products/:id`, `POST /products/import` |
| Doc nguồn | `05-phan-quyen-api.md` (2.4), `06-pham-vi-du-lieu.md` (2.5) |
| Ngày tạo | 2026-10-20 |

---

## 1. TỔNG QUAN

- Đây là **quy tắc quan trọng nhất** của role vendor: vendor chỉ thấy / mở / sửa / xoá được sản phẩm do **chính tài khoản đó** tạo (`createdBy`).
- BE tự thêm điều kiện `createdBy = ID vendor` vào list, detail, sửa, xoá; vendor **không thể** truyền tham số để bỏ điều kiện.
- Truy cập sản phẩm của người khác trả **404 "Product not found"** (không phải 403) — tránh lộ sự tồn tại.
- API chia 3 nhóm: vendor được gọi, vendor bị cấm (403), công khai.

---

## 2. YÊU CẦU CHỨC NĂNG

### 2.1. Phân quyền API (API)

> Là chủ hệ thống, tôi muốn vendor chỉ gọi được các API quản lý sản phẩm của mình, không gọi được API quản trị nền tảng.

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-API-01 | **Nhóm 1** — vendor/admin gọi được (cần đăng nhập): `GET /products/admin/all`, `GET /products/admin/:idOrSlug`, `POST /products`, `PATCH /products/:id`, `DELETE /products/:id` (204), `POST /products/upload`, `GET /products/import/template`, `POST /products/import` (`?dryRun=true`). Mọi role đã đăng nhập: `/auth/me`, `/auth/logout`, `POST /auth/me/avatar`, `DELETE /auth/me/avatar` |
| AC-API-02 | **Nhóm 2** — vendor bị 403 "You do not have permission to access this resource": `GET /users`, `PATCH /users/:id/role`, `GET /dashboard/stats`, API quản trị blog-posts, brand-logos, product-brands (POST/PATCH/DELETE, admin/all), fitment-options (POST/PATCH/DELETE, admin/all), quotes (quản trị), newsletter-subscriptions (quản trị) |
| AC-API-03 | **Nhóm 3** — công khai: `GET /products`, `GET /products/:idOrSlug`, `/products/category-counts`, `/products/filter-summary`, `/products/filter-options`, `GET /product-brands`, `GET /fitment-options`, `GET /brand-logos`, `GET /blog-posts`, `POST /contact`, `POST /quotes`, `POST /newsletter-subscriptions`, `/sitemap*.xml`, `/health`, `/public/uploads/...` |
| AC-API-04 | Không token → 401 với API cần đăng nhập; token user → 403 với API vendor/admin |
| AC-API-05 | Body có trường không khai báo → 400; id sai định dạng ở PATCH/DELETE bị từ chối |
| AC-API-06 | Màn Settings vendor dùng dữ liệu giả; nếu đổi sang API thật vendor sẽ nhận 403 |

### 2.2. Phạm vi dữ liệu (SCOPE)

> Là vendor, tôi muốn sản phẩm của tôi chỉ tôi quản lý được, và tôi không nhìn thấy sản phẩm của vendor khác trong cổng quản lý.

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-SCOPE-01 | Sản phẩm tạo bằng form hoặc import đều gán `createdBy` = tài khoản đang đăng nhập (bắt buộc) |
| AC-SCOPE-02 | Vendor gọi danh sách quản trị → chỉ nhận sản phẩm có `createdBy` = mình (không thấy của vendor khác hay admin) |
| AC-SCOPE-03 | Vendor xem chi tiết / sửa / xoá sản phẩm của người khác → **404 "Product not found"**; UI hiển thị "Product not found or you do not have permission to view it." |
| AC-SCOPE-04 | Admin thấy tất cả, có cột "Created by" và bộ lọc `vendorName` (khớp tên hoặc email, không phân biệt hoa thường). Với vendor, `vendorName` bị bỏ qua |
| AC-SCOPE-05 | Mỗi sản phẩm trả về `creator` (id + tên hiển thị: tên tài khoản → nếu rỗng thì email → không tìm thấy thì "Unknown vendor") |
| AC-SCOPE-06 | Sản phẩm vendor tạo, nếu Active, xuất hiện ngay ở website; không có bước duyệt |
| AC-SCOPE-07 | SKU và slug duy nhất **toàn hệ thống** (không theo vendor) |
| AC-SCOPE-08 | Hai tài khoản vendor (kể cả cùng công ty) không chia sẻ sản phẩm |

---

## 3. ĐẶC TẢ TRƯỜNG DỮ LIỆU

### 3.1. Trường phạm vi trên sản phẩm

| Trường | Kiểu | Nguồn | Ghi chú |
|--------|------|-------|---------|
| `createdBy` | ID tài khoản | BE gán khi tạo | Không nhận từ client (gửi lên → 400 trường lạ) |
| `creator.id` | ID | BE tính | – |
| `creator.name` | string | Tên tài khoản → email → "Unknown vendor" | Chỉ admin thấy cột "Created by" trên UI |
| `sku` | string | Client | Duy nhất toàn hệ thống, BE đổi CHỮ HOA |
| `slug` | string | BE sinh từ tên (import: tên + SKU) | Duy nhất toàn hệ thống |

### 3.2. Tham số danh sách quản trị

| Tham số | Vendor | Admin |
|---------|--------|-------|
| `page`, `limit` (≤ 100), `sort`, `status`, `departmentId`, `search` | ✅ | ✅ |
| `vendorName` | ❌ Bị bỏ qua | ✅ Lọc theo tên/email |

---

## 4. LUỒNG XỬ LÝ

### 4.1. Vendor truy cập sản phẩm của người khác
1. V1 biết id/slug sản phẩm của V2 (qua website công khai hoặc đoán)
2. V1 mở `/vendor/products/<id V2>` hoặc gọi `GET /products/admin/<id V2>`
3. BE thêm điều kiện `createdBy = V1` → không tìm thấy → **404 "Product not found"**
4. UI hiển thị "Product not found or you do not have permission to view it." + "Back to products"

### 4.2. Kiểm tra ma trận quyền một endpoint
1. Gọi endpoint không token → 401 (nếu cần đăng nhập)
2. Gọi bằng token user → 403 (nếu là API vendor/admin)
3. Gọi bằng token vendor → theo nhóm
4. Gọi bằng token admin → 200/201/204

---

## 5. TỔNG HỢP THÔNG BÁO LỖI

| # | Thông báo | Loại | Điều kiện |
|---|-----------|------|-----------|
| 1 | You do not have permission to access this resource | API 403 | Sai role |
| 2 | (401 Unauthorized) | API 401 | Không token / token hết hạn |
| 3 | Product not found | API 404 | Sản phẩm không tồn tại hoặc thuộc người khác |
| 4 | Product not found or you do not have permission to view it. | UI | Mở chi tiết / sửa sản phẩm không có quyền |
| 5 | Product with SKU "XXX" already exists | API 409 | Trùng SKU (kể cả của người khác) |
| 6 | Product with slug "xxx" already exists | API 409 | Trùng slug |
| 7 | sku: this product belongs to another vendor | Lỗi dòng import | SKU thuộc người khác |
| 8 | (400 Bad Request — property ... should not exist) | API 400 | Trường lạ trong body |

---

## 6. CẤU TRÚC GIAO DIỆN

```
Vendor — /vendor/products                     Admin — /admin/products
+------------------------------------------+  +----------------------------------------------+
| Product | Category | Price | Stock |     |  | Product | Category | ... | Created by |   |
| Status  | Last updated | Actions         |  | [Ô lọc tên vendor]                           |
| (KHÔNG có cột Created by)                |  | (Có cột Created by + lọc vendorName)         |
+------------------------------------------+  +----------------------------------------------+
```

---

## 7. YÊU CẦU PHI CHỨC NĂNG

| ID | Nội dung |
|----|----------|
| NFR-SCOPE-01 | Bảo mật: lọc createdBy thực hiện phía BE, không phụ thuộc FE |
| NFR-SCOPE-02 | Bảo mật: trả 404 thay vì 403 để không lộ sự tồn tại của sản phẩm người khác |
| NFR-SCOPE-03 | Bảo mật: chống mass assignment (không nhận `createdBy` từ client) |
| NFR-SCOPE-04 | Toàn vẹn dữ liệu: import của vendor không được ghi đè sản phẩm người khác |

---

## 8. CÂU HỎI CẦN LÀM RÕ VỚI PO/USER

| ID | Câu hỏi |
|----|---------|
| Q-V2 | Hai tài khoản vendor cùng công ty có cần chia sẻ sản phẩm? |
| Q-V4 | Có chấp nhận rò rỉ thông tin SKU/slug tồn tại qua 409 và lỗi import? |
| Q-V5 | Vendor có được thay đổi danh mục dùng chung (brand, fitment) gián tiếp qua import? |
