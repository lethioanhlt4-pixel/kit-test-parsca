---
id: 04-phien-lam-viec-logout
title: Phiên làm việc (cookie, refresh, đăng xuất)
source_section: "2.3"
routes: [Mọi màn cần đăng nhập]
endpoints: ["POST /auth/refresh", "POST /auth/logout", "GET /auth/me"]
roles: [Vendor, Admin, User]
read_with: [03-dang-nhap-dieu-huong.md, 12-import-csv.md, 19-ho-so.md]
---

# 2.3. PHIÊN LÀM VIỆC (COOKIE, REFRESH, ĐĂNG XUẤT)

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

## Token và cookie
- Access token sống 15 phút, refresh token sống 7 ngày. Cookie có thời hạn 7 ngày nhưng JWT bên trong access token vẫn hết hạn sau 15 phút và bị kiểm tra phía server.
- Cookie: httpOnly, sameSite=lax, chỉ gửi qua HTTPS khi cấu hình secure bật.
- BE đọc token từ cookie trước, nếu không có thì đọc từ header `Authorization: Bearer` (dành cho client không phải trình duyệt).

## Refresh tự động (FE)
- Khi gặp 401 (không phải API đăng nhập, đăng ký, refresh, quên / đặt lại mật khẩu, đăng xuất), FE tự gọi /auth/refresh một lần rồi gửi lại.
- Thất bại thì xoá cờ phiên và chuyển `/login?redirect=...`.
- Nhiều request cùng lúc dùng chung một lần refresh.
- Ngoại lệ: với yêu cầu upload file (ảnh, CSV) FE KHÔNG gửi lại sau khi refresh, chỉ làm mới phiên và trả lỗi để người dùng thao tác lại (tránh import hai lần).
- Dùng lại refresh token cũ: BE huỷ cả phiên (401 "Invalid session"), phải đăng nhập lại.

## Đăng xuất
- Xoá cookie và token refresh trên server; FE chuyển về trang chủ ngay và hiện toast thành công, hoặc cảnh báo nếu gọi API lỗi.
- Đổi mật khẩu hay đặt lại mật khẩu thành công làm mất mọi phiên đang mở (phải đăng nhập lại).

## Ghi chú cho tester
Test lần lượt:
1. Refresh thành công (đợi hết 15 phút hoặc nhờ Dev rút TTL).
2. Dùng lại refresh token cũ.
3. Đăng xuất rồi gọi API bằng cookie cũ.
4. Đăng xuất ở tab này rồi thao tác ở tab khác (tab kia phải mất phiên).
5. Import CSV khi access token hết hạn giữa chừng: phải nhận thông báo "phiên đã được làm mới, hãy thử lại", không import hai lần.
6. Vendor mở hai trình duyệt cùng lúc: mỗi tài khoản chỉ lưu một refresh token nên phiên cũ có thể mất khi refresh [SUY LUẬN].
