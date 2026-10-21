# TÀI LIỆU YÊU CẦU - CẤP ROLE, ĐĂNG NHẬP & PHIÊN LÀM VIỆC (VENDOR)

| Thông tin | Chi tiết |
|-----------|----------|
| Module | ROLE (Cấp/thu hồi role) · LOGIN (Đăng nhập & điều hướng) · SESS (Phiên & logout) |
| Hệ thống | PARSCA — Marketplace phụ tùng |
| URL | `{FE_URL}/login`, `{FE_URL}/forgot-password`, `{FE_URL}/admin/users` |
| Endpoint | `PATCH /users/:id/role`, `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout` |
| Doc nguồn | `00-tong-quan.md` (1.2), `02-cap-thu-hoi-role-vendor.md` (2.1), `03-dang-nhap-dieu-huong.md` (2.2), `04-phien-lam-viec-logout.md` (2.3) |
| Ngày tạo | 2026-10-20 |

---

## 1. TỔNG QUAN

- Không có đăng ký vendor: `POST /auth/register` luôn ra role `user`. **Chỉ admin** cấp role vendor qua `/admin/users` hoặc `PATCH /users/:id/role`.
- Vendor đăng nhập tại `/login`, được điều hướng vào `/vendor`. FE chặn truy cập theo role.
- Phiên dùng JWT trong cookie httpOnly: access token 15 phút, refresh token 7 ngày; FE tự refresh khi gặp 401.
- Role được BE kiểm tra lại từ **database** ở mỗi request yêu cầu role → thu hồi có hiệu lực ngay.

---

## 2. YÊU CẦU CHỨC NĂNG

### 2.1. Cấp và thu hồi role vendor (ROLE)

> Là admin, tôi muốn cấp/thu hồi role vendor cho tài khoản để kiểm soát ai được quản lý sản phẩm trên PARSCA.

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-ROLE-01 | Admin chọn role "vendor" ở ô role của tài khoản trên /admin/users → toast "Role updated to vendor"; tài khoản đó đăng nhập vào được /vendor |
| AC-ROLE-02 | `PATCH /users/:id/role` body `{"role":"vendor"}` → trả thông tin user với `role: "vendor"`, `vendorId: null` |
| AC-ROLE-03 | Role không thuộc {user, vendor, admin} (vd "superadmin") → 400 "Role must be user, vendor, or admin" |
| AC-ROLE-04 | Không tìm thấy user → 404 "User not found" |
| AC-ROLE-05 | Admin không tự bỏ quyền admin: API 400 "You cannot remove your own admin role"; UI khoá ô role của chính admin với chú thích "You cannot change your own admin role" |
| AC-ROLE-06 | Hạ vendor xuống user/admin → mất quyền API vendor **ngay lập tức** (không chờ token 15 phút hết hạn) |
| AC-ROLE-07 | Hạ vendor xuống user hoặc admin → `vendorId` bị xoá (null) |
| AC-ROLE-08 | Token user hoặc vendor gọi `PATCH /users/:id/role` → 403 |
| AC-ROLE-09 | Bảng Users có bộ lọc theo role (user, vendor, admin) kèm số lượng; role lạ hiển thị ô khoá màu đỏ "Unrecognised role ... needs migrating" |

### 2.2. Đăng nhập và điều hướng theo role (LOGIN)

> Là vendor, tôi muốn đăng nhập bằng email và mật khẩu để vào cổng /vendor quản lý sản phẩm.

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-LOGIN-01 | Email hợp lệ + mật khẩu đúng (≥ 8 ký tự) → vendor vào `/vendor`, admin vào `/admin`, user vào `/` |
| AC-LOGIN-02 | Mật khẩu được mã hoá bằng khoá công khai RSA ở trình duyệt, gửi dưới dạng `passwordCiphertext` (không gửi plaintext) |
| AC-LOGIN-03 | Sai email hoặc sai mật khẩu → cùng một thông báo 401 "Invalid email or password" |
| AC-LOGIN-04 | Email phải đúng định dạng; mật khẩu tối thiểu 8 ký tự (validate ở form) |
| AC-LOGIN-05 | Nút "Quên mật khẩu" dẫn tới `/forgot-password`; màn hình luôn báo thành công dù email có tồn tại hay không |
| AC-LOGIN-06 | Đăng nhập tối đa 5 lần/phút/IP (cũng áp dụng register, forgot, reset); vượt → 429. Giới hạn chung 600 request/phút |
| AC-LOGIN-07 | Token nằm trong cookie httpOnly `access_token`, `refresh_token` (JS không đọc được); FE chỉ lưu `parsca_session = "1"` trong localStorage |
| AC-LOGIN-08 | Chặn truy cập FE theo bảng: /vendor/* (Chưa ĐN → /login; User → "/"; Vendor ✅; Admin → /admin) · /admin/* (Chưa ĐN → /login; User → "/"; Vendor → /vendor; Admin ✅) · /profile, /orders (Chưa ĐN → /login; mọi role ✅) |
| AC-LOGIN-09 | `?redirect=/duong-dan` chỉ chấp nhận đường dẫn bắt đầu "/" và không bắt đầu "//"; vẫn phải tuân theo guard role |
| AC-LOGIN-10 | `/auth/me` lỗi tạm thời (5xx, mất mạng) mà không phải 401 → hiện trạng thái "không khả dụng", không đá người dùng ra /login |
| AC-LOGIN-11 | Sau đăng xuất, mở /vendor bằng nút Back của trình duyệt → không thấy khung vendor |

### 2.3. Phiên làm việc và đăng xuất (SESS)

> Là vendor, tôi muốn phiên làm việc được duy trì an toàn và đăng xuất triệt để để không ai dùng lại phiên của tôi.

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-SESS-01 | Gặp 401 (trừ API login, register, refresh, forgot/reset, logout) → FE tự gọi `/auth/refresh` **một lần** rồi gửi lại request |
| AC-SESS-02 | Nhiều request cùng lúc bị 401 → dùng chung **một** lần refresh |
| AC-SESS-03 | Refresh thất bại → xoá cờ phiên, chuyển `/login?redirect=<trang hiện tại>` |
| AC-SESS-04 | Đăng xuất → xoá cookie và refresh token trên server; FE về trang chủ ngay + toast thành công, hoặc cảnh báo nếu gọi API lỗi |
| AC-SESS-05 | Dùng lại refresh token cũ → BE huỷ cả phiên (401 "Invalid session"), phải đăng nhập lại |
| AC-SESS-06 | Đăng xuất ở tab này → tab khác mất phiên khi thao tác |
| AC-SESS-07 | Upload file (ảnh, CSV) gặp 401 → FE chỉ làm mới phiên và báo lỗi để người dùng thao tác lại, **không** tự gửi lại |
| AC-SESS-08 | Mỗi tài khoản chỉ lưu một refresh token → đăng nhập 2 trình duyệt có thể làm mất phiên cũ khi refresh [SUY LUẬN] |

---

## 3. ĐẶC TẢ TRƯỜNG DỮ LIỆU

### 3.1. Trang Login (`/login`)

| Tên trường | Loại UI | Bắt buộc | Quy tắc | Ghi chú |
|------------|---------|----------|---------|---------|
| Email | Textbox | Có | Định dạng email hợp lệ | – |
| Password | Textbox (masked) | Có | Tối thiểu 8 ký tự | Mã hoá RSA → `passwordCiphertext` |
| Đăng nhập | Button | N/A | – | – |
| Quên mật khẩu | Link | N/A | → `/forgot-password` | – |

### 3.2. Ô role trên `/admin/users`

| Tên trường | Loại UI | Giá trị | Ghi chú |
|------------|---------|---------|---------|
| Role | Dropdown | user, vendor, admin | Ô của chính admin bị khoá; role lạ → ô khoá đỏ |
| Bộ lọc role | Filter | user, vendor, admin (kèm số lượng) | – |

### 3.3. Cookie / Storage

| Khoá | Nơi lưu | Thuộc tính | TTL |
|------|---------|-----------|-----|
| `access_token` | Cookie | httpOnly, sameSite=lax, secure (nếu bật) | JWT 15 phút (cookie 7 ngày) |
| `refresh_token` | Cookie | httpOnly, sameSite=lax, secure (nếu bật) | 7 ngày |
| `parsca_session` | localStorage | Giá trị "1" | Đến khi logout / refresh lỗi |

---

## 4. LUỒNG XỬ LÝ

### 4.1. Cấp role vendor (Happy Path)
1. Admin đăng nhập → `/admin/users`
2. Lọc role "user", tìm tài khoản cần cấp
3. Chọn "vendor" ở ô role → toast "Role updated to vendor"
4. Tài khoản đó đăng nhập → vào `/vendor`; `/auth/me` trả `role: "vendor"`, `vendorId: null`

### 4.2. Thu hồi role vendor
1. Vendor đang đăng nhập, mở `/vendor/products`
2. Admin hạ role vendor → user
3. Vendor gọi API sản phẩm admin → 403 ngay
4. UI vendor cập nhật khi `/auth/me` được tải lại (ghi nhận thời gian)

### 4.3. Đăng nhập vendor
1. Truy cập `/login` (có thể kèm `?redirect=`)
2. Nhập email + mật khẩu → FE mã hoá RSA → `POST /auth/login`
3. Thành công → set cookie httpOnly + `parsca_session=1` → điều hướng theo role / redirect hợp lệ

### 4.4. Refresh tự động
1. Access token hết hạn → request trả 401
2. FE gọi `/auth/refresh` (1 lần, dùng chung) → thành công → gửi lại request
3. Thất bại → xoá cờ → `/login?redirect=...`

### 4.5. Đăng xuất
1. Avatar → Log out → `POST /auth/logout`
2. Server xoá cookie + refresh token → FE về trang chủ + toast

---

## 5. TỔNG HỢP THÔNG BÁO LỖI

| # | Thông báo | Loại | Điều kiện |
|---|-----------|------|-----------|
| 1 | Role updated to vendor | Toast (thành công) | Đổi role thành công |
| 2 | Role must be user, vendor, or admin | API 400 | Role không hợp lệ |
| 3 | User not found | API 404 | Id user không tồn tại |
| 4 | You cannot remove your own admin role | API 400 | Admin tự hạ quyền |
| 5 | You cannot change your own admin role | Chú thích UI | Ô role của chính admin |
| 6 | Unrecognised role ... needs migrating | Chú thích UI (đỏ) | Role lạ trong DB |
| 7 | You do not have permission to access this resource | API 403 | Sai role |
| 8 | Invalid email or password | API 401 | Sai email hoặc mật khẩu |
| 9 | (429 Too Many Requests) | API 429 | > 5 lần/phút/IP |
| 10 | Invalid session | API 401 | Reuse refresh token |

---

## 6. CẤU TRÚC GIAO DIỆN (Khung vendor sau đăng nhập)

```
+--------------------------------------------------------------------+
| [Logo]                               [🔔] [⚙ Settings] [Avatar ▼]   |
|                                              ├ Profile             |
|                                              └ Log out             |
+--------------+-----------------------------------------------------+
| Dashboard    |                                                     |
| Product      |               Nội dung màn hình                     |
|   Catalog    |                                                     |
| Orders       |                                                     |
| Review       |                                                     |
| Payouts      |                                                     |
+--------------+-----------------------------------------------------+
```

---

## 7. YÊU CẦU PHI CHỨC NĂNG

| ID | Nội dung |
|----|----------|
| NFR-AUTH-01 | Bảo mật: mật khẩu mã hoá RSA phía trình duyệt trước khi gửi |
| NFR-AUTH-02 | Bảo mật: token chỉ trong cookie httpOnly, sameSite=lax |
| NFR-AUTH-03 | Bảo mật: thông báo lỗi đăng nhập chung, không tiết lộ email tồn tại |
| NFR-AUTH-04 | Bảo mật: chặn open redirect (`//`) |
| NFR-AUTH-05 | Bảo mật: rate limit 5 lần/phút/IP cho các API xác thực; 600 request/phút toàn hệ thống |
| NFR-AUTH-06 | Độ tin cậy: lỗi tạm thời `/auth/me` không đăng xuất người dùng |

---

## 8. CÂU HỎI CẦN LÀM RÕ VỚI PO/USER

| ID | Câu hỏi |
|----|---------|
| Q-AUTH-01 | Sau khi hạ quyền, UI vendor cần cập nhật trong bao lâu (AMB-22)? |
| Q-AUTH-02 | Đăng nhập 2 trình duyệt cùng lúc có được hỗ trợ (AMB-17)? |
| Q-AUTH-03 | Có cần chức năng đổi mật khẩu cho vendor (hiện chỉ "Forgot password")? |
