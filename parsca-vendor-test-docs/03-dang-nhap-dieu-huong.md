---
id: 03-dang-nhap-dieu-huong
title: Đăng nhập và điều hướng theo role
source_section: "2.2"
routes: [/login, /forgot-password, /vendor/*, /admin/*, /profile, /orders]
endpoints: ["POST /auth/login", "GET /auth/me"]
roles: [User, Vendor, Admin]
read_with: [01-canh-bao-moi-truong.md, 04-phien-lam-viec-logout.md, 19-ho-so.md]
---

# 2.2. ĐĂNG NHẬP VÀ ĐIỀU HƯỚNG THEO ROLE

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

## Đăng nhập
- Đăng nhập tại /login: email (hợp lệ) và mật khẩu (tối thiểu 8 ký tự).
- Mật khẩu được mã hoá bằng khoá công khai RSA ở trình duyệt trước khi gửi (gửi dưới dạng `passwordCiphertext`), BE giải mã.
- Nút "Quên mật khẩu" dẫn tới /forgot-password.
- Sai email hoặc sai mật khẩu đều trả cùng một thông báo 401 "Invalid email or password".
- Giới hạn: đăng nhập tối đa 5 lần/phút/IP (đăng ký, quên mật khẩu, đặt lại mật khẩu cũng 5 lần/phút/IP). Vượt thì 429. Giới hạn chung toàn hệ thống: 600 yêu cầu/phút.
- Token nằm trong cookie httpOnly (`access_token`, `refresh_token`), trình duyệt không đọc được. FE chỉ lưu cờ `parsca_session` = "1" trong localStorage để biết có cần hỏi /auth/me hay không.

## Điều hướng sau đăng nhập
- Vendor vào /vendor, admin vào /admin, user vào "/".
- Nếu URL có `?redirect=/duong-dan` thì đi tới đó, nhưng chỉ chấp nhận đường dẫn bắt đầu bằng "/" và không bắt đầu bằng "//" (chặn chuyển hướng ra ngoài).

## Bảng chặn truy cập (FE)
| Khu vực | Chưa đăng nhập | User | Vendor | Admin |
|---|---|---|---|---|
| /vendor/* | /login | về "/" | Vào được | chuyển /admin |
| /admin/* | /login | về "/" | chuyển /vendor | Vào được |
| /profile, /orders | /login | Vào được | Vào được | Vào được |

- Nếu /auth/me lỗi tạm thời (lỗi 5xx, mất mạng) mà không phải 401 thì màn hình hiện trạng thái "không khả dụng", không đá người dùng ra /login.
- Trên website bán hàng, menu tài khoản của vendor có thêm mục "Vendor" dẫn tới /vendor (admin thì có mục Admin).

## Ghi chú cho tester
- Test ma trận 3 role x 3 khu vực (/vendor, /admin, /profile): mỗi ô ghi lại kết quả (vào được hay bị chuyển tới đâu).
- Test redirect:
  - `?redirect=/admin` bằng tài khoản vendor: phải rơi về /vendor.
  - `?redirect=//evil.com`: phải bị bỏ qua, về /vendor.
  - `?redirect=/vendor/products`: đi tới đó.
- Test quên mật khẩu cho vendor: màn hình luôn báo thành công dù email có tồn tại hay không.
- Test 6 lần đăng nhập liên tiếp trong 60 giây để thấy 429.
- Tắt BE rồi mở /vendor khi đã có phiên: phải hiện trạng thái không khả dụng, không bị đá ra /login.
- Mở /vendor sau khi đăng xuất bằng nút Back của trình duyệt: không được thấy khung vendor.
