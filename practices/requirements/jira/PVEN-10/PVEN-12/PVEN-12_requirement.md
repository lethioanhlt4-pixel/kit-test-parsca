# PVEN-12: Đăng nhập và điều hướng theo role

| Thuộc tính | Giá trị |
|---|---|
| **Issue Key** | PVEN-12 |
| **Loại** | Story |
| **Trạng thái** | To Do |
| **Độ ưu tiên** | Highest |
| **Người giao** | Unassigned |
| **Người báo** | QA PARSCA (mẫu) |
| **Labels** | auth, login, routing, security |
| **Components** | Vendor Portal, Auth API |
| **Epic** | PVEN-10 |
| **Attachments** | 0 file(s) |
| **Ngày tạo** | 2026-10-20T17:30:00.000+0700 |
| **Cập nhật** | 2026-10-20T17:30:00.000+0700 |

## Mô tả (Description)

Là vendor, tôi muốn đăng nhập bằng email và mật khẩu để vào cổng `/vendor` quản lý sản phẩm; FE chặn truy cập theo role.

- URL: `{FE_URL}/login`, `{FE_URL}/forgot-password`
- Endpoint: `POST /auth/login`, `GET /auth/me`
- Nguồn: `docs/parsca-vendor-test-docs/03-dang-nhap-dieu-huong.md`; `practices/requirements/parsca-vendor/01_requirements_auth_role_session.md` (2.2)

Acceptance Criteria:

| ID | Tiêu chí chấp nhận |
| --- | --- |
| AC-LOGIN-01 | Email hợp lệ + mật khẩu đúng (≥ 8 ký tự) → vendor vào `/vendor`, admin vào `/admin`, user vào `/` |
| AC-LOGIN-02 | Mật khẩu mã hoá RSA ở trình duyệt, gửi dưới dạng `passwordCiphertext` (không plaintext) |
| AC-LOGIN-03 | Sai email hoặc sai mật khẩu → cùng thông báo 401 "Invalid email or password" |
| AC-LOGIN-04 | Email đúng định dạng; mật khẩu tối thiểu 8 ký tự (validate ở form) |
| AC-LOGIN-05 | "Quên mật khẩu" → `/forgot-password`; luôn báo thành công dù email có tồn tại hay không |
| AC-LOGIN-06 | Tối đa 5 lần/phút/IP cho login, register, forgot, reset; vượt → 429. Giới hạn chung 600 request/phút |
| AC-LOGIN-07 | Token trong cookie httpOnly `access_token`, `refresh_token`; FE chỉ lưu `parsca_session = "1"` trong localStorage |
| AC-LOGIN-08 | Guard: `/vendor/*` (chưa ĐN → /login; user → "/"; admin → /admin) · `/admin/*` (vendor → /vendor) · `/profile`, `/orders` (mọi role đã ĐN) |
| AC-LOGIN-09 | `?redirect=` chỉ nhận đường dẫn bắt đầu "/" và không bắt đầu "//"; vẫn tuân guard role |
| AC-LOGIN-10 | `/auth/me` lỗi tạm thời (5xx, mất mạng) → trạng thái "không khả dụng", không đá ra /login |
| AC-LOGIN-11 | Sau đăng xuất, bấm Back về /vendor → không thấy khung vendor |

### Trang Login

| Tên trường | Loại UI | Bắt buộc | Quy tắc | Ghi chú |
| --- | --- | --- | --- | --- |
| Email | Textbox | Có | Định dạng email hợp lệ | – |
| Password | Textbox (masked) | Có | Tối thiểu 8 ký tự | Mã hoá RSA → `passwordCiphertext` |
| Đăng nhập | Button | N/A | – | – |
| Quên mật khẩu | Link | N/A | → `/forgot-password` | – |

## LUỒNG XỬ LÝ

1. Truy cập `/login` (có thể kèm `?redirect=`)
2. Nhập email + mật khẩu → FE mã hoá RSA → `POST /auth/login`
3. Thành công → set cookie httpOnly + `parsca_session=1` → điều hướng theo role / redirect hợp lệ
4. Thất bại → 401 "Invalid email or password"; quá 5 lần/phút → 429

## Câu hỏi mở

| ID | Câu hỏi |
| --- | --- |
| Q-AUTH-03 | Có cần chức năng đổi mật khẩu cho vendor (hiện chỉ "Forgot password")? |

## Attachments (0 file)

Không có.
