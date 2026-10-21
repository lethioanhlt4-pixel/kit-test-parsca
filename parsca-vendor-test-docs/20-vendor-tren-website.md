---
id: 20-vendor-tren-website
title: Vendor trên website bán hàng
source_section: "2.19"
routes: [Website storefront, /profile, /orders]
endpoints: ["GET /products", "GET /products/:idOrSlug", "/products/category-counts", "/products/filter-options"]
roles: [Vendor, Khách]
read_with: [03-dang-nhap-dieu-huong.md, 09-them-sua-san-pham.md, 10-trang-thai-xoa-san-pham.md, 12-import-csv.md]
---

# 2.19. VENDOR TRÊN WEBSITE BÁN HÀNG

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

## Nghiệp vụ
- Vendor dùng website như khách: xem sản phẩm, giỏ hàng, thanh toán, /profile, /orders.
- Các trang /profile và /orders (khu vực tài khoản khách) cho phép mọi role đã đăng nhập; vendor không bị chuyển sang /vendor khi vào các trang này.
- Menu tài khoản trên đầu trang có thêm mục "Vendor" dẫn tới /vendor.
- Sản phẩm vendor tạo (trạng thái Active) hiển thị ở danh sách, tìm kiếm, bộ lọc của website như sản phẩm khác (không phân biệt tạo bởi ai). Tên vendor (creator) có trong dữ liệu trả về của API.

## Ghi chú cho tester
Test vòng đời end-to-end:
1. Vendor tạo sản phẩm Active: ngay lập tức tìm thấy ở website.
2. Đổi sang Draft: biến mất khỏi website.
3. Mở lại link chi tiết công khai của sản phẩm Draft: phải 404.
4. Đổi lại Active: hiện lại.
5. Xoá: mất hẳn.

Kiểm tra thêm: bộ lọc, đếm danh mục (category-counts) và bộ lọc brand/xe của website cập nhật theo thay đổi của vendor. Hệ thống có bộ nhớ đệm, chỉ làm mới sau khi tạo / sửa / xoá / import thành công; nếu không dùng Redis thì không có đệm.
