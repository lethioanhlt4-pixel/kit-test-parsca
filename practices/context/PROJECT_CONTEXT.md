# Project Context — PARSCA (Role Vendor)

## Hướng Dẫn Sử Dụng

File này chứa thông tin ngữ cảnh của dự án PARSCA cho phạm vi **role Vendor**. **Agent cần đọc file này trước khi bắt đầu bất kỳ tác vụ manual/automation nào** trong kit.

> ⚠️ Các ô `{...}` cần được cập nhật sau khi Dev xác nhận môi trường (xem `ENV_PREFLIGHT_CHECKLIST.md`).

---

## Application Overview

- **Tên ứng dụng:** PARSCA
- **Mô tả:** Marketplace phụ tùng gồm 4 department: **Marine, Auto, Door, Tools**. Vendor có cổng riêng `/vendor` để đăng và quản lý sản phẩm của chính mình; theo thiết kế còn xem đơn hàng, đánh giá, thanh toán (hiện là giả lập).
- **Loại:** Web App (FE SPA) + REST API (BE)
- **URL môi trường test:** FE `{FE_URL}` · API `{API_URL}`
- **Ba role:** `user` (khách mua), `vendor` (bên bán), `admin` (nhân viên PARSCA)

## Tech Stack (theo tài liệu BA)

- **Frontend:** SPA, gọi API với tiền tố `/v1`, đọc dạng `{data, meta}`, i18n (đa ngôn ngữ), hợp đồng API `api-schema.ts`
- **Backend:** REST API, phân quyền bằng `@Roles`, kiểm tra role từ database ở mỗi request có yêu cầu role
- **Lưu trữ ảnh:** Kho lưu trữ đám mây (public URL); upload qua bộ nhớ tạm, không ghi đĩa
- **Cache:** Redis (tuỳ môi trường) cho dữ liệu công khai sản phẩm
- **Authentication:** JWT trong cookie httpOnly (`access_token` 15 phút, `refresh_token` 7 ngày), sameSite=lax; fallback header `Authorization: Bearer`. Mật khẩu mã hoá RSA ở trình duyệt (`passwordCiphertext`)
- **Rate limit:** 5 lần/phút/IP cho login, register, forgot, reset · 600 request/phút toàn hệ thống

## Key Features & Modules (role Vendor)

| Module | Mô tả | Chạy thật / Giả lập | Priority |
|--------|-------|---------------------|----------|
| Cấp / thu hồi role | Admin đổi role user ↔ vendor ↔ admin | Thật | High |
| Đăng nhập & điều hướng | /login, guard /vendor /admin /profile, redirect an toàn | Thật | High |
| Phiên & logout | Refresh tự động, đa tab, logout | Thật | High |
| Phân quyền API | 3 nhóm API: vendor được gọi / bị cấm / công khai | Thật | High |
| Phạm vi dữ liệu | `createdBy` — vendor chỉ thấy sản phẩm mình tạo; người khác → 404 | Thật | High |
| Danh sách sản phẩm | Search, filter department/status, sort, phân trang | Thật | Medium |
| Chi tiết sản phẩm | Ảnh, giá CAD, tab mô tả/thông số/tương thích, xoá | Thật | Low |
| Thêm / sửa sản phẩm | Form nhiều phần, 1–5 ảnh, validate realtime | Thật | High |
| Đổi trạng thái & xoá | Active / Draft / Archived; xoá vĩnh viễn | Thật | High |
| Upload ảnh | jpeg/png/webp/gif ≤ 10 MB | Thật | Medium |
| Import CSV | Check file (dry run) → Import; upsert theo SKU | Thật | High |
| Dashboard | Số liệu "—" | Giả lập | Low |
| Orders / Order detail | 20 đơn mẫu ORD-2134 → ORD-2153 | Giả lập | Low / Medium |
| Reviews | 13 đánh giá mẫu | Giả lập | Low |
| Payouts | Số dư, 14 giao dịch, wizard 4 bước | Giả lập hoàn toàn | Medium |
| Settings | Brand, Vehicle fitment (bộ nhớ tab) | Giả lập | Low |
| Profile | Avatar (thật) · Thông tin + Devices (giả lập) | Một phần | Medium |
| Vendor trên website | Sản phẩm Active xuất hiện ngay trên storefront | Thật | High |

## Environment Details

| Môi trường | FE URL | API URL | `/v1` + `{data, meta}`? | Credentials |
|------------|--------|---------|-------------------------|-------------|
| Dev | `{DEV_FE_URL}` | `{DEV_API_URL}` | `{Cần Dev xác nhận}` | Lưu trong `.env` (không commit) |
| Test / Staging | `{TEST_FE_URL}` | `{TEST_API_URL}` | `{Cần Dev xác nhận}` | Lưu trong `.env` (không commit) |
| Production | – | – | – | N/A (KHÔNG test trên prod) |

> Biến môi trường dùng trong kit: `FE_URL`, `API_URL`, `VENDOR1_EMAIL`, `VENDOR1_PASSWORD`, `VENDOR2_EMAIL`, `VENDOR2_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `USER_EMAIL`, `USER_PASSWORD`.

## Routes của Vendor

| Đường dẫn | Màn hình |
|-----------|----------|
| /login | Đăng nhập — vendor xong vào /vendor |
| /vendor | Dashboard [GIẢ LẬP] |
| /vendor/products | Danh sách sản phẩm (menu "Product Catalog") |
| /vendor/products/new | Thêm sản phẩm |
| /vendor/products/:id | Chi tiết sản phẩm |
| /vendor/products/:id/edit | Sửa sản phẩm |
| /vendor/orders, /vendor/orders/:id | Đơn hàng [GIẢ LẬP] |
| /vendor/reviews | Đánh giá [GIẢ LẬP] |
| /vendor/payouts | Thanh toán [GIẢ LẬP] |
| /vendor/profile | Hồ sơ (menu avatar góc phải) |
| /vendor/settings | → /vendor/settings/brand; vendor chỉ có Brand và Vehicle fitment [GIẢ LẬP] |
| /vendor/<khác> | Trang "Coming soon" |

## Notes (Business rules & Known issues quan trọng)

- **Không có đăng ký vendor**: `POST /auth/register` luôn ra role `user`; chỉ admin cấp role vendor.
- `vendorId` luôn `null` với vendor, **không** dùng để phân quyền/lọc. Hai vendor cùng công ty **không** thấy sản phẩm của nhau (Q-V2).
- Truy cập sản phẩm của người khác trả **404 "Product not found"** (không phải 403).
- **SKU và slug duy nhất toàn hệ thống** → lộ thông tin SKU tồn tại (Q-V4).
- Vendor **tự xuất bản** sản phẩm Active, **không có bước duyệt**.
- Import CSV: mọi dòng thành **active**; brand/giá trị xe mới tự thêm vào **danh mục dùng chung** (Q-V5).
- Lệch FE/BE về `/v1` và `{data, meta}` — xem `ENV_PREFLIGHT_CHECKLIST.md`.
