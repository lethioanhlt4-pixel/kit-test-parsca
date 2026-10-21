# ✅ ENV PRE-FLIGHT CHECKLIST — PARSCA Vendor

> **Nguồn:** `docs/parsca-vendor-test-docs/01-canh-bao-moi-truong.md` (mục 1.4) + `docs/parsca-vendor-test-docs/README.md` (Tài khoản test cần chuẩn bị).
> **BẮT BUỘC** hoàn tất checklist này trước khi chạy bất kỳ TC nào trong kit.

---

## 1. Vấn Đề Đã Biết

| # | Vấn đề | Hệ quả |
|---|--------|--------|
| 1 | FE gọi API với tiền tố `/v1` (vd `/v1/products`) và đọc dữ liệu dạng `{data, meta}` | – |
| 2 | BE trong bản zip **không** có `/v1`, trả dữ liệu trực tiếp (không bọc) | Ghép nguyên hai bản → chức năng gọi API có thể 404 hoặc đọc sai dữ liệu |
| 3 | `api-schema.ts` của FE dùng `/v1` và có bọc | Có thể môi trường test dùng BE phiên bản khác / có proxy |
| 4 | Màn giả lập vẫn chạy bình thường dù API lỗi | Không dùng màn giả lập để kết luận môi trường OK |

---

## 2. Checklist Xác Nhận Với Dev

| # | Hạng mục | Giá trị xác nhận | Người xác nhận | Ngày | ✔ |
|---|----------|------------------|----------------|------|---|
| 1 | URL FE môi trường test | `{FE_URL}` | | | ☐ |
| 2 | URL API môi trường test | `{API_URL}` | | | ☐ |
| 3 | API có tiền tố `/v1`? | Có / Không | | | ☐ |
| 4 | Response bọc `{data, meta}`? | Có / Không | | | ☐ |
| 5 | Có lớp proxy thêm `/v1` / bọc dữ liệu? | Có / Không | | | ☐ |
| 6 | Bản BE đang deploy (commit / version) | | | | ☐ |
| 7 | Cookie `secure` có bật (HTTPS)? | Có / Không | | | ☐ |
| 8 | Có dùng Redis cache? | Có / Không | | | ☐ |
| 9 | Cách rút TTL access token để test refresh (mặc định 15 phút) | | | | ☐ |
| 10 | Email môi trường test nhận được (forgot password) — hộp thư nào? | | | | ☐ |
| 11 | Có thể tắt BE tạm thời để test trạng thái "không khả dụng"? | Có / Không | | | ☐ |
| 12 | Giới hạn rate limit có áp dụng ở môi trường test (5/phút/IP)? | Có / Không | | | ☐ |

---

## 3. Tài Khoản & Dữ Liệu Cần Chuẩn Bị

| # | Tài khoản | Role | Biến môi trường | Dữ liệu yêu cầu | ✔ |
|---|-----------|------|-----------------|-----------------|---|
| 1 | Vendor 1 (V1) | vendor | `VENDOR1_EMAIL` / `VENDOR1_PASSWORD` | ≥ 25 sản phẩm (đủ Active/Draft/Archived, 4 department) | ☐ |
| 2 | Vendor 2 (V2) | vendor | `VENDOR2_EMAIL` / `VENDOR2_PASSWORD` | ≥ 3 sản phẩm riêng (ghi lại id + SKU) | ☐ |
| 3 | Admin | admin | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | ≥ 2 sản phẩm do admin tạo | ☐ |
| 4 | User thường | user | `USER_EMAIL` / `USER_PASSWORD` | – | ☐ |
| 5 | User dự phòng (để nâng/hạ role) | user | `ROLE_TEST_EMAIL` / `ROLE_TEST_PASSWORD` | – | ☐ |

> 🔐 Mật khẩu chỉ lưu trong file `.env` cục bộ (đã nằm trong `.gitignore`). **KHÔNG** ghi vào file `.md`, **KHÔNG** commit.

### Ghi lại ID dữ liệu tham chiếu (điền sau khi chuẩn bị)

| Khoá | Giá trị |
|------|---------|
| `V2_PRODUCT_ID` | |
| `V2_PRODUCT_SKU` | |
| `ADMIN_PRODUCT_ID` | |
| `ADMIN_PRODUCT_SKU` | |
| `V1_PRODUCT_ID_ACTIVE` | |
| `V1_PRODUCT_ID_DRAFT` | |
| `V1_PRODUCT_ID_ARCHIVED` | |

---

## 4. Smoke Kiểm Tra Môi Trường (5 phút)

| # | Bước | Kỳ vọng | Nếu fail |
|---|------|---------|----------|
| 1 | Đăng nhập V1 tại `{FE_URL}/login` | Vào `/vendor` | Dừng — báo Dev |
| 2 | DevTools → Network → gọi `GET /auth/me` (hoặc `/v1/auth/me`) | 200, `role: "vendor"`, `vendorId: null` | Kiểm tra tiền tố `/v1` |
| 3 | Mở `/vendor/products` | Bảng sản phẩm hiển thị (không phải "Failed to load products.") | Mọi API lỗi → **BLOCKED**, không log bug từng màn |
| 4 | Postman: `GET {API_URL}/products` không token | 200, danh sách sản phẩm công khai | Kiểm tra URL / proxy |
| 5 | Postman: `GET {API_URL}/products/admin/all` không token | 401 | Kiểm tra guard |

---

## 5. Kết Luận Pre-flight

| Kết quả | Hành động |
|---------|-----------|
| ✅ Tất cả mục 2–4 OK | Bắt đầu Smoke trong `practices/README.md` (mục Smoke) |
| ⚠️ Lệch `/v1` / `{data, meta}` nhưng có proxy | Ghi chú vào `PROJECT_CONTEXT.md`, dùng URL qua proxy cho Postman |
| ❌ Mọi API lỗi | **BLOCKED** — báo BA/Dev, không ghi bug từng màn hình |
