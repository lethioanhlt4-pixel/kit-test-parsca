# PVEN-11: Cấp và thu hồi role vendor

| Thuộc tính | Giá trị |
|---|---|
| **Issue Key** | PVEN-11 |
| **Loại** | Story |
| **Trạng thái** | To Do |
| **Độ ưu tiên** | High |
| **Người giao** | Unassigned |
| **Người báo** | QA PARSCA (mẫu) |
| **Labels** | admin, role, vendor |
| **Components** | Admin Portal, Users API |
| **Epic** | PVEN-10 |
| **Attachments** | 0 file(s) |
| **Ngày tạo** | 2026-10-20T17:30:00.000+0700 |
| **Cập nhật** | 2026-10-20T17:30:00.000+0700 |

## Mô tả (Description)

Là admin, tôi muốn cấp/thu hồi role vendor cho tài khoản để kiểm soát ai được quản lý sản phẩm trên PARSCA. Không có đăng ký vendor: `POST /auth/register` luôn ra role `user`.

- URL: `{FE_URL}/admin/users`
- Endpoint: `PATCH /users/:id/role`
- Nguồn: `docs/parsca-vendor-test-docs/02-cap-thu-hoi-role-vendor.md`; `practices/requirements/parsca-vendor/01_requirements_auth_role_session.md` (2.1)

Acceptance Criteria:

| ID | Tiêu chí chấp nhận |
| --- | --- |
| AC-ROLE-01 | Admin chọn role "vendor" trên `/admin/users` → toast "Role updated to vendor"; tài khoản đó vào được `/vendor` |
| AC-ROLE-02 | `PATCH /users/:id/role` body `{"role":"vendor"}` → trả user với `role: "vendor"`, `vendorId: null` |
| AC-ROLE-03 | Role không thuộc {user, vendor, admin} → 400 "Role must be user, vendor, or admin" |
| AC-ROLE-04 | Không tìm thấy user → 404 "User not found" |
| AC-ROLE-05 | Admin không tự bỏ quyền admin: API 400 "You cannot remove your own admin role"; UI khoá ô role của chính admin |
| AC-ROLE-06 | Hạ vendor xuống user/admin → mất quyền API vendor ngay lập tức (role kiểm tra lại từ DB mỗi request) |
| AC-ROLE-07 | Hạ vendor xuống user hoặc admin → `vendorId` bị xoá (null) |
| AC-ROLE-08 | Token user hoặc vendor gọi `PATCH /users/:id/role` → 403 |
| AC-ROLE-09 | Bảng Users có bộ lọc role kèm số lượng; role lạ hiển thị ô khoá đỏ "Unrecognised role ... needs migrating" |

### Ô role trên /admin/users

| Tên trường | Loại UI | Giá trị | Ghi chú |
| --- | --- | --- | --- |
| Role | Dropdown | user, vendor, admin | Ô của chính admin bị khoá; role lạ → ô khoá đỏ |
| Bộ lọc role | Filter | user, vendor, admin (kèm số lượng) | – |

## LUỒNG XỬ LÝ

### Cấp role
1. Admin đăng nhập → `/admin/users`
2. Lọc role "user", tìm tài khoản cần cấp
3. Chọn "vendor" ở ô role → toast "Role updated to vendor"
4. Tài khoản đó đăng nhập → vào `/vendor`; `/auth/me` trả `role: "vendor"`

### Thu hồi role
1. Vendor đang mở `/vendor/products`
2. Admin hạ role vendor → user
3. Vendor gọi API sản phẩm admin → 403 ngay
4. UI vendor cập nhật khi `/auth/me` được tải lại (ghi nhận thời gian)

## Câu hỏi mở

| ID | Câu hỏi |
| --- | --- |
| Q-AUTH-01 | Sau khi hạ quyền, UI vendor cần cập nhật trong bao lâu? |

## Attachments (0 file)

Không có.
