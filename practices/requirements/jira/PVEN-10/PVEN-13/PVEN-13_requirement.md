# PVEN-13: Phiên làm việc và đăng xuất

| Thuộc tính | Giá trị |
|---|---|
| **Issue Key** | PVEN-13 |
| **Loại** | Story |
| **Trạng thái** | To Do |
| **Độ ưu tiên** | High |
| **Người giao** | Unassigned |
| **Người báo** | QA PARSCA (mẫu) |
| **Labels** | auth, session, logout, security |
| **Components** | Vendor Portal, Auth API |
| **Epic** | PVEN-10 |
| **Attachments** | 0 file(s) |
| **Ngày tạo** | 2026-10-20T17:30:00.000+0700 |
| **Cập nhật** | 2026-10-20T17:30:00.000+0700 |

## Mô tả (Description)

Là vendor, tôi muốn phiên làm việc được duy trì an toàn và đăng xuất triệt để để không ai dùng lại phiên của tôi. Phiên dùng JWT trong cookie httpOnly: access token 15 phút, refresh token 7 ngày; FE tự refresh khi gặp 401.

- Endpoint: `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout`
- Nguồn: `docs/parsca-vendor-test-docs/04-phien-lam-viec-logout.md`; `practices/requirements/parsca-vendor/01_requirements_auth_role_session.md` (2.3)

Acceptance Criteria:

| ID | Tiêu chí chấp nhận |
| --- | --- |
| AC-SESS-01 | Gặp 401 (trừ login, register, refresh, forgot/reset, logout) → FE tự gọi `/auth/refresh` một lần rồi gửi lại request |
| AC-SESS-02 | Nhiều request cùng lúc bị 401 → dùng chung một lần refresh |
| AC-SESS-03 | Refresh thất bại → xoá cờ phiên, chuyển `/login?redirect=<trang hiện tại>` |
| AC-SESS-04 | Đăng xuất → xoá cookie và refresh token trên server; FE về trang chủ + toast thành công (hoặc cảnh báo nếu API lỗi) |
| AC-SESS-05 | Dùng lại refresh token cũ → BE huỷ cả phiên (401 "Invalid session") |
| AC-SESS-06 | Đăng xuất ở tab này → tab khác mất phiên khi thao tác |
| AC-SESS-07 | Upload file (ảnh, CSV) gặp 401 → chỉ làm mới phiên và báo lỗi, không tự gửi lại |
| AC-SESS-08 | Mỗi tài khoản chỉ lưu một refresh token → đăng nhập 2 trình duyệt có thể mất phiên cũ [SUY LUẬN] |

### Cookie / Storage

| Khoá | Nơi lưu | Thuộc tính | TTL |
| --- | --- | --- | --- |
| access_token | Cookie | httpOnly, sameSite=lax, secure (nếu bật) | JWT 15 phút |
| refresh_token | Cookie | httpOnly, sameSite=lax, secure (nếu bật) | 7 ngày |
| parsca_session | localStorage | Giá trị "1" | Đến khi logout / refresh lỗi |

## LUỒNG XỬ LÝ

### Refresh tự động
1. Access token hết hạn → request trả 401
2. FE gọi `/auth/refresh` (1 lần, dùng chung) → thành công → gửi lại request
3. Thất bại → xoá cờ → `/login?redirect=...`

### Đăng xuất
1. Avatar → Log out → `POST /auth/logout`
2. Server xoá cookie + refresh token → FE về trang chủ + toast

## Câu hỏi mở

| ID | Câu hỏi |
| --- | --- |
| Q-AUTH-02 | Đăng nhập 2 trình duyệt cùng lúc có được hỗ trợ? |

## Attachments (0 file)

Không có.
