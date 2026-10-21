# PARSCA ROLE VENDOR - INDEX TÀI LIỆU TEST

Nguồn: Tài liệu nghiệp vụ role Vendor cho đội test (BA). Viết từ đọc code BE và FE, chưa chạy hệ thống.

## Cách dùng cho AI testing automation
1. Đọc `01-canh-bao-moi-truong.md` TRƯỚC KHI chạy bất kỳ test nào (FE/BE lệch tiền tố /v1 và dạng {data, meta}).
2. Xác định màn / endpoint đang test → tra bảng bên dưới → đọc đúng file đó.
3. Test API thì luôn đọc kèm `05-phan-quyen-api.md` và `06-pham-vi-du-lieu.md`.
4. Đọc thêm các file trong mục `read_with` ở frontmatter.
5. File có `simulated: true` là màn [GIẢ LẬP]: không ghi bug cho việc không lưu / không gọi API.

## Quy ước đọc
- **GHI CHÚ CHO TESTER**: điểm cần test hoặc cần xác nhận.
- **THEO CODE HIỆN TẠI**: hệ thống đang chạy như vậy nhưng có thể chưa đúng ý nghiệp vụ. Gặp thì ghi bug hoặc câu hỏi, không coi là Pass.
- **[SUY LUẬN]**: suy ra từ code, cần chạy thật mới kết luận.
- **[GIẢ LẬP]**: màn hình chạy bằng dữ liệu viết cứng trong FE, không gọi API.

## Bảng điều hướng

| File | Mục gốc | Màn hình (FE) | Endpoint (BE) | Giả lập |
|---|---|---|---|---|
| 00-tong-quan.md | 1.1, 1.2, 1.3, 1.5 | Toàn bộ cổng /vendor, menu | - | - |
| 01-canh-bao-moi-truong.md | 1.4 | - | Mọi API (/v1, {data, meta}) | - |
| 02-cap-thu-hoi-role-vendor.md | 2.1 | /admin/users | PATCH /users/:id/role | - |
| 03-dang-nhap-dieu-huong.md | 2.2 | /login, /forgot-password, chặn /vendor /admin /profile | POST /auth/login | - |
| 04-phien-lam-viec-logout.md | 2.3 | Mọi màn (refresh, đa tab, logout) | /auth/refresh, /auth/logout, /auth/me | - |
| 05-phan-quyen-api.md | 2.4 | - | Ma trận API vendor / admin / công khai | - |
| 06-pham-vi-du-lieu.md | 2.5 | /vendor/products/* | createdBy, vendorName | - |
| 07-ds-san-pham.md | 2.6 | /vendor/products | GET /products/admin/all | - |
| 08-chi-tiet-san-pham.md | 2.7 | /vendor/products/:id | GET /products/admin/:idOrSlug | - |
| 09-them-sua-san-pham.md | 2.8 | /vendor/products/new, /vendor/products/:id/edit | POST /products, PATCH /products/:id | - |
| 10-trang-thai-xoa-san-pham.md | 2.9 | /vendor/products (ô trạng thái, nút xoá) | PATCH /products/:id {status}, DELETE /products/:id | - |
| 11-upload-anh.md | 2.10 | Form thêm / sửa sản phẩm | POST /products/upload | - |
| 12-import-csv.md | 2.11 | /vendor/products (Import CSV) | GET /products/import/template, POST /products/import | - |
| 13-dashboard.md | 2.12 | /vendor | (không gọi /dashboard/stats) | Có |
| 14-don-hang.md | 2.13 | /vendor/orders | - | Có |
| 15-chi-tiet-don-hang.md | 2.14 | /vendor/orders/:id | - | Có |
| 16-danh-gia.md | 2.15 | /vendor/reviews | - | Có |
| 17-thanh-toan-payouts.md | 2.16 | /vendor/payouts | - | Có (hoàn toàn) |
| 18-cai-dat-brand-fitment.md | 2.17 | /vendor/settings/brand, /vendor/settings/fitment | - | Có |
| 19-ho-so.md | 2.18 | /vendor/profile | POST /auth/me/avatar | Một phần |
| 20-vendor-tren-website.md | 2.19 | Website, /profile, /orders | GET /products, /products/:idOrSlug | - |

## Câu hỏi PO theo file

| Mã | File |
|---|---|
| Q-V2 | 06-pham-vi-du-lieu.md |
| Q-V4 | 06-pham-vi-du-lieu.md |
| Q-V5 | 12-import-csv.md, 18-cai-dat-brand-fitment.md |
| Q-V6 | 10-trang-thai-xoa-san-pham.md |
| Q-V8 | 15-chi-tiet-don-hang.md |
| Q-V9 | 13-dashboard.md |

## Tài khoản test cần chuẩn bị
- Ít nhất 2 vendor (V1, V2) và 1 admin, mỗi bên có sản phẩm riêng.
- Ít nhất 25 sản phẩm của 1 vendor để test phân trang.
- 1 user thường để test 403.
