---
id: 02-cap-thu-hoi-role-vendor
title: Cấp và thu hồi role vendor (do admin làm)
source_section: "2.1"
routes: [/admin/users, /vendor]
endpoints: ["PATCH /users/:id/role", "GET /auth/me", "GET /products/admin/all"]
roles: [Admin, Vendor, User]
read_with: [00-tong-quan.md, 05-phan-quyen-api.md, 03-dang-nhap-dieu-huong.md]
---

# 2.1. CẤP VÀ THU HỒI ROLE VENDOR (DO ADMIN LÀM)

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

## Nghiệp vụ
- Cách làm: Admin vào /admin/users, chọn role "vendor" ở ô role của tài khoản. API: `PATCH /users/:id/role` body `{"role":"vendor"}`.
- Thành công: toast "Role updated to vendor". API trả thông tin user với role "vendor", vendorId null.
- Role sai (ví dụ "superadmin"): 400 "Role must be user, vendor, or admin". Không tìm thấy user: 404 "User not found".
- Admin không tự bỏ quyền admin của chính mình: API trả 400 "You cannot remove your own admin role". Ở giao diện ô role của chính admin bị khoá (chú thích "You cannot change your own admin role").
- Role lạ (không thuộc user, vendor, admin) hiển thị ô khoá màu đỏ với chú thích "Unrecognised role ... needs migrating".
- Bảng Users có bộ lọc theo role (user, vendor, admin) kèm số lượng từng role.
- Khi role bị đổi, API kiểm tra lại role từ database ở mỗi lần gọi API có yêu cầu role (không tin role trong token). Nên vendor bị hạ quyền mất quyền API NGAY LẬP TỨC, không phải chờ 15 phút.

## Ghi chú cho tester
Test các trường hợp:
1. Admin nâng user thành vendor: user đó đăng nhập và vào /vendor được; kiểm tra bằng API /auth/me thấy role "vendor", vendorId null.
2. Hạ vendor xuống user: vendor đang đăng nhập gọi API sản phẩm admin (ví dụ `GET /products/admin/all`) phải nhận 403 ngay, không đợi token hết hạn. Trên giao diện, trang đang mở có thể vẫn hiển thị cho đến khi /auth/me được tải lại; ghi nhận thời gian giao diện cập nhật.
3. Hạ vendor xuống user rồi kiểm tra vendorId bị xoá (null).
4. Đổi sang vendor rồi sang admin rồi sang user, kiểm tra từng bước.
5. Gọi API đổi role bằng token user hoặc vendor: phải 403.
6. Admin tự đổi role chính mình sang user qua API: phải 400.

Không có chức năng "gán vendor vào công ty" nên mọi vendor đều có vendorId null. Đừng mong đợi trường này khác null.
