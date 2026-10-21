---
id: 06-pham-vi-du-lieu
title: Phạm vi dữ liệu của vendor (quy tắc quan trọng nhất)
source_section: "2.5"
routes: [/vendor/products, /vendor/products/:id, /vendor/products/:id/edit]
endpoints: ["GET /products/admin/all", "GET /products/admin/:idOrSlug", "PATCH /products/:id", "DELETE /products/:id", "POST /products", "POST /products/import"]
roles: [Vendor, Admin]
related_questions: [Q-V2, Q-V4]
read_with: [05-phan-quyen-api.md, 07-ds-san-pham.md, 09-them-sua-san-pham.md, 12-import-csv.md]
---

# 2.5. PHẠM VI DỮ LIỆU CỦA VENDOR (QUY TẮC QUAN TRỌNG NHẤT)

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

## Quy tắc
- Mỗi sản phẩm lưu trường `createdBy` = ID tài khoản người tạo (bắt buộc). Sản phẩm tạo bằng form hoặc import đều gán createdBy là tài khoản đang đăng nhập.
- Khi gọi các API quản trị, nếu role là vendor thì BE tự thêm điều kiện `createdBy = ID của vendor đó` vào: danh sách, xem chi tiết, sửa, xoá. Không cần và không thể truyền tham số để bỏ điều kiện này.
- Vì vậy vendor không thấy, không mở, không sửa, không xoá được sản phẩm do vendor khác hoặc admin tạo. Truy cập sản phẩm của người khác trả **404 "Product not found"** (không phải 403).
- Admin: không có điều kiện này, thấy tất cả. Admin có thêm bộ lọc theo tên vendor (tham số `vendorName`, khớp tên hoặc email, không phân biệt hoa thường). Với vendor tham số `vendorName` bị bỏ qua.
- Mỗi sản phẩm trả về thông tin "creator" (id và tên hiển thị của người tạo; tên là tên tài khoản, nếu rỗng thì email; không tìm thấy thì "Unknown vendor").
- Sản phẩm vendor tạo ra, nếu trạng thái là active, xuất hiện ngay ở website bán hàng cho mọi người. Không có bước duyệt.
- SKU là duy nhất trên TOÀN HỆ THỐNG, không phải theo vendor. Slug (tạo từ tên) cũng duy nhất toàn hệ thống.

## Ghi chú cho tester
Chuẩn bị: ít nhất 2 tài khoản vendor (V1, V2) và 1 admin, mỗi bên có sản phẩm riêng.

Test:
1. V1 chỉ thấy sản phẩm của V1 trong danh sách.
2. V1 mở /vendor/products/<id của V2> và /edit: phải ra trang "Product not found or you do not have permission to view it."
3. V1 gọi PATCH / DELETE sản phẩm của V2 qua API: phải 404 và sản phẩm V2 không đổi.
4. V1 không thấy sản phẩm admin tạo.
5. Admin thấy sản phẩm của cả V1 và V2 kèm cột "Created by" và lọc được theo tên vendor.
6. V1 truyền `?vendorName=V2` vẫn chỉ thấy sản phẩm của V1.

**THEO CODE HIỆN TẠI**, các điểm rò rỉ thông tin cần ghi nhận và hỏi PO có chấp nhận không (**Q-V4**):
- V1 tạo sản phẩm có SKU trùng với của V2 hoặc admin nhận 409 `Product with SKU "..." already exists` (cho biết SKU đó đã tồn tại ở đâu đó).
- Import CSV có SKU thuộc người khác nhận lỗi dòng "sku: this product belongs to another vendor".
- Import có tên sản phẩm sinh ra slug trùng với sản phẩm khác sẽ hiện kèm SKU của sản phẩm kia trong thông báo lỗi.

Hai tài khoản cùng công ty không chia sẻ sản phẩm (câu hỏi **Q-V2**).
