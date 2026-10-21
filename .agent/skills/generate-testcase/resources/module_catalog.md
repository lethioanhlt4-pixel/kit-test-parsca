# MODULE CATALOG — PARSCA Vendor

> Bản đồ module dùng chung cho mọi skill. Cột "Bắt buộc phủ" = các điểm doc ghi trong "GHI CHÚ CHO TESTER" / "THEO CODE HIỆN TẠI".

| # | Mã | Module | Doc | Route / Endpoint | Giả lập | Risk | Bắt buộc phủ |
|---|----|--------|-----|------------------|---------|------|--------------|
| M1 | ROLE | Cấp / thu hồi role vendor | 02 | `/admin/users`, `PATCH /users/:id/role` | – | 🔴 | Hạ quyền mất API ngay; `vendorId` null; admin không tự bỏ quyền ("You cannot remove your own admin role"); user/vendor gọi đổi role → 403 |
| M2 | LOGIN | Đăng nhập & điều hướng | 03 | `/login`, `POST /auth/login`, `GET /auth/me` | – | 🔴 | Ma trận guard 4 vai × `/vendor/*`, `/admin/*`, `/profile`, `/orders`; mật khẩu ≥ 8; 429 sau 5 lần/phút; BE 5xx → "không khả dụng" |
| M3 | SESS | Phiên & đăng xuất | 04 | `/auth/refresh`, `/auth/logout` | – | 🔴 | Refresh 1 lần, dùng chung; refresh cũ → "Invalid session"; upload 401 không gửi lại; logout tab khác |
| M4 | SCOPE | Phạm vi dữ liệu | 06 | `/vendor/products/*`, `GET/PATCH/DELETE /products/...` | – | 🔴 | 404 thay 403; `vendorName` bị bỏ qua; `creator` fallback; SKU/slug unique toàn hệ thống (Q-V4); Q-V2 |
| M5 | PLIST | Danh sách sản phẩm | 07 | `GET /products/admin/all` | – | 🟡 | Mặc định "Active products"; sort server; limit ≤ 100; "Failed to load products." |
| M6 | PDTL | Chi tiết sản phẩm | 08 | `/vendor/products/:id` | – | 🟢 | 3 huy hiệu cố định; không quyền → thông báo |
| M7 | PSTAT | Đổi trạng thái & xoá | 10 | `PATCH {status}`, `DELETE` 204 | – | 🔴 | Không xác nhận khi đổi status; xoá có "Delete product?"; dọn ảnh; Q-V6 |
| M8 | PFORM | Thêm / sửa sản phẩm | 09 | `/vendor/products/new`, `/:id/edit`, `POST/PATCH /products` | – | 🔴 | Validation từng trường; 1–5 ảnh; 409 SKU/slug; vendor tự chọn Active; Rating; In stock bị bỏ qua |
| M9 | IMG | Upload ảnh | 11 | `POST /products/upload` | – | 🟡 | "Image file is required"; "Only image uploads are allowed"; 10 MB; MIME theo trình duyệt |
| M10 | CSV | Import CSV | 12 | `GET /products/import/template`, `POST /products/import[?dryRun=true]` | – | 🔴 | Dry run không ghi; mọi dòng active; SKU người khác; brand/xe mới vào danh mục (Q-V5); mất mạng/401; import lại không nhân đôi |
| M11 | DASH | Dashboard | 13 | `/vendor` | ✅ | 🟢 | Không khối "Catalogue"; không gọi `/dashboard/stats`; "Epic 9/10/11" (Q-V9) |
| M12 | ORD | Danh sách đơn | 14 | `/vendor/orders` | ✅ | 🟢 | 20 đơn chung mọi vendor (Q-V8); không cột "Created by"; bộ lọc thời gian rỗng tháng 10 |
| M13 | ORDD | Chi tiết đơn | 15 | `/vendor/orders/:id`, `/orders/:id` | ✅ | 🟡 | 6 đơn mẫu theo trạng thái; Cancel khoá delivered/returned/canceled; khách xem PII (Q-V8); "Order not found" |
| M14 | REV | Đánh giá | 16 | `/vendor/reviews` | ✅ | 🟢 | 13 đánh giá, phân bố sao; Back về Orders |
| M15 | SET | Settings | 18 | `/vendor/settings/*` | ✅ | 🟢 | Chỉ Brand + Vehicle fitment; logo/blog → Brand; reload mất; không ảnh hưởng form (Q-V5) |
| M16 | PAY | Payouts | 17 | `/vendor/payouts` | ✅ (hoàn toàn) | 🟡 | 3 thẻ; wizard 4 bước; thông báo bắt buộc; toast bước 3; che số tài khoản; rủi ro PII mẫu |
| M17 | PROF | Hồ sơ | 19 | `/vendor/profile`, `POST/DELETE /auth/me/avatar` | Một phần | 🟡 | Avatar thật; Save chỉ toast; không đổi mật khẩu; Forgot password 1 giờ, huỷ mọi phiên |
| M18 | WEB | Vendor trên website | 20 | Storefront, `GET /products`, `category-counts` | – | 🔴 | Active → hiện ngay; Draft/Archived/Xoá → 404; menu "Vendor"; cache |
| – | API | Ma trận quyền | 05 | Nhóm 1 / 2 / 3 | – | 🔴 | 4 vai × mọi endpoint; `POST /product-brands`, `PATCH /fitment-options/:id` → 403; trường lạ 400 |

## Doc nền (đọc trước mọi module)
- `00-tong-quan.md` — tổng quan, danh sách màn giả lập
- `01-canh-bao-moi-truong.md` — lệch `/v1` và `{data, meta}`
- `README.md` — mục lục, quy ước nhãn
