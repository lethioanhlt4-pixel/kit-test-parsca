---
id: 00-tong-quan
title: Tổng quan role Vendor
source_section: "1.1, 1.2, 1.3, 1.5"
routes: [/login, /vendor, /vendor/products, /vendor/products/new, /vendor/products/:id, /vendor/products/:id/edit, /vendor/orders, /vendor/orders/:id, /vendor/reviews, /vendor/payouts, /vendor/profile, /vendor/settings]
read_with: [01-canh-bao-moi-truong.md]
---

# TỔNG QUAN ROLE VENDOR

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

## 1.1. Role vendor là gì
- PARSCA là marketplace phụ tùng gồm 4 nhóm hàng (department): Marine, Auto, Door, Tools.
- Role "vendor" là nhân sự của bên bán hàng. Vendor có cổng riêng tại /vendor để đăng và quản lý sản phẩm của chính mình, và (theo thiết kế) xem đơn hàng, đánh giá, thanh toán.
- Ba role trong hệ thống: user (khách mua hàng), vendor (bên bán), admin (nhân viên nền tảng PARSCA).
- Vendor chỉ quản lý được sản phẩm do chính tài khoản đó tạo. Admin quản lý được tất cả.

## 1.2. Vendor được tạo ra như thế nào
- Không có đăng ký vendor. Tự đăng ký (POST /auth/register) luôn ra role user.
- Chỉ admin cấp role vendor, bằng màn Users (/admin/users, ô chọn role) hoặc API `PATCH /users/:id/role` với `{"role":"vendor"}`. Role chỉ nhận user, vendor, admin.
- Khi cấp role vendor, trường vendorId của tài khoản luôn là null. API đổi role không nhận vendorId (chỉ truyền role). Trường vendorId có trong schema (tham chiếu bảng "Vendor") nhưng trong code KHÔNG có bảng/module Vendor nào, và vendorId KHÔNG được dùng để phân quyền hay lọc dữ liệu.
- Hạ vendor xuống user hoặc admin thì vendorId bị xoá (null). Tài khoản không phải vendor mà có vendorId thì bị schema từ chối (lỗi "A <role> account must not carry a vendorId").
- Phạm vi dữ liệu của vendor được xác định bằng ID tài khoản người tạo (trường createdBy của sản phẩm), không phải bằng công ty. Hai tài khoản vendor của cùng một công ty KHÔNG thấy sản phẩm của nhau.

## 1.3. Bảng nhanh: cái gì chạy thật, cái gì giả lập

### Chạy thật (có gọi API)
- Đăng nhập, đăng xuất, phiên (cookie), /auth/me, quên / đặt lại mật khẩu.
- Danh sách, xem chi tiết, tạo, sửa, đổi trạng thái, xoá sản phẩm của chính mình.
- Upload ảnh sản phẩm (tối đa 5 ảnh mỗi sản phẩm).
- Import sản phẩm từ file CSV (có chạy thử "Check file" trước).
- Upload ảnh đại diện ở trang Profile.

### Giả lập, chỉ có giao diện (dữ liệu viết cứng trong FE, không lưu)
- Dashboard (các số liệu hiện dấu "—").
- Orders: danh sách 20 đơn mẫu cố định và trang chi tiết đơn.
- Reviews: 13 đánh giá mẫu sinh ra từ 20 đơn mẫu.
- Payouts: số dư, bảng giao dịch 14 dòng, và cả quy trình thiết lập thanh toán.
- Settings: mục Brand và Vehicle fitment (sửa trong bộ nhớ trình duyệt, tải lại là mất).
- Profile: các ô họ, tên, số điện thoại, trạng thái (nút Save chỉ hiện thông báo). Danh sách "Devices" cũng là dữ liệu giả.

### Chưa có
- Đổi mật khẩu cho vendor, quản lý thiết bị đăng nhập, duyệt sản phẩm trước khi hiển thị, xoá ảnh đại diện trên giao diện.

## 1.5. Đường dẫn của vendor
| Đường dẫn | Màn hình |
|---|---|
| /login | Đăng nhập. Vendor đăng nhập xong vào /vendor |
| /vendor | Dashboard |
| /vendor/products | Danh sách sản phẩm (menu "Product Catalog") |
| /vendor/products/new | Thêm sản phẩm |
| /vendor/products/:id | Chi tiết sản phẩm |
| /vendor/products/:id/edit | Sửa sản phẩm |
| /vendor/orders, /vendor/orders/:id | Đơn hàng [GIẢ LẬP] |
| /vendor/reviews | Đánh giá [GIẢ LẬP] |
| /vendor/payouts | Thanh toán [GIẢ LẬP] |
| /vendor/profile | Hồ sơ (vào từ menu avatar góc phải, không nằm trong menu bên trái) |
| /vendor/settings | Tự chuyển sang /vendor/settings/brand. Vendor chỉ dùng được brand và fitment [GIẢ LẬP] |
| /vendor/<đường dẫn khác> | Trang "Coming soon" |

- Ngoài cổng vendor, vendor vẫn dùng được toàn bộ website bán hàng như một khách, và các trang tài khoản /profile, /orders (cho mọi role đã đăng nhập).
- Menu bên trái của vendor: Dashboard, Product Catalog, Orders, Review, Payouts.
- Thanh trên cùng: chuông thông báo (chỉ là nút giao diện), biểu tượng bánh răng (Settings), avatar (Profile và Log out).
