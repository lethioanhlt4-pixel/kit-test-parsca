---
id: 19-ho-so
title: Hồ sơ vendor (Profile)
source_section: "2.18"
routes: [/vendor/profile, /profile, /forgot-password, /reset-password]
endpoints: ["POST /auth/me/avatar", "DELETE /auth/me/avatar"]
roles: [Vendor]
simulated: partial
read_with: [03-dang-nhap-dieu-huong.md, 04-phien-lam-viec-logout.md]
---

# 2.18. HỒ SƠ (/vendor/profile)

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

## Ảnh đại diện (chạy thật)
- Nút "Add image" (chưa có ảnh) hoặc "Change image".
- Chỉ nhận jpeg, png, webp, gif, tối đa 10 MB; gợi ý "Maximum file size: 10 MB · Formats: JPEG, PNG, WEBP, GIF".
- Chọn file là upload ngay, không cần bấm Save (`POST /auth/me/avatar`).
- Sai loại: toast "Choose a JPEG, PNG, WebP or GIF image."
- Quá lớn: toast "That image is X.X MB — the limit is 10 MB."
- Thành công: toast "Profile picture updated." và avatar trên thanh tiêu đề đổi theo.
- Hết phiên: "Your session was renewed. Please choose the image again."
- Không có nút xoá ảnh trên giao diện (BE có API DELETE /auth/me/avatar). Ảnh cũ không bị xoá khỏi kho lưu trữ.

## Thông tin cá nhân [GIẢ LẬP]
- First name và Last name (sửa được, tách từ tên tài khoản), Email (chỉ đọc), Phone number (sửa được, trống), Status Active/Inactive (sửa được).
- Nút Save chỉ hiện toast "Your picture saves straight away. The other fields need the profile endpoint, which is not built yet." Không lưu gì, tải lại là mất; không có Cancel.

## Devices [GIẢ LẬP]
- Danh sách thiết bị đăng nhập viết cứng; thiết bị hiện tại có nhãn "This device".
- Nút "Sign out" ở thiết bị khác chỉ hiện toast "Session management arrives with the sessions API."

## Đổi mật khẩu
- Vendor KHÔNG có chức năng đổi mật khẩu ở /vendor/profile.
- Hộp thoại đổi mật khẩu chỉ có ở trang tài khoản khách (/profile); bấm Confirm chỉ hiện lỗi "Changing your password needs an API endpoint that does not exist yet. Use “Forgot password?” on the sign-in page for now." (BE không có API đổi mật khẩu).
- Cách duy nhất đổi mật khẩu hiện nay là "Forgot password".

## Ghi chú cho tester
- Ảnh đại diện: png dưới 10 MB, đúng ranh giới 10 MB, 11 MB, pdf, svg, file đổi đuôi .png, chọn lại cùng một file, huỷ hộp chọn file, kiểm tra avatar cập nhật ở thanh tiêu đề và menu.
- Ô Save: sửa họ tên, điện thoại, trạng thái rồi Save (chỉ có toast), tải lại thì mất.
- Trạng thái Active/Inactive không phải trạng thái tài khoản thật (đừng ghi nhận là chức năng khoá tài khoản).
- Kiểm tra vendor không thấy mục đổi mật khẩu.
- Luồng "Forgot password" với tài khoản vendor:
  - Nhận email chứa liên kết hiệu lực 1 giờ.
  - Đặt lại mật khẩu thành công thì mọi phiên bị đăng xuất.
  - Liên kết dùng lại hoặc hết hạn: "This reset link is invalid or has expired."
  - Trang /reset-password thiếu `?token=` không hiện form.
