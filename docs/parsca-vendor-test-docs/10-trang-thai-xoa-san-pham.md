---
id: 10-trang-thai-xoa-san-pham
title: Đổi trạng thái và xoá sản phẩm
source_section: "2.9"
routes: [/vendor/products]
endpoints: ["PATCH /products/:id {status}", "DELETE /products/:id", "GET /products"]
roles: [Vendor]
related_questions: [Q-V6]
read_with: [06-pham-vi-du-lieu.md, 07-ds-san-pham.md, 20-vendor-tren-website.md]
---

# 2.9. ĐỔI TRẠNG THÁI VÀ XOÁ SẢN PHẨM

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

## Đổi trạng thái
- Ô chọn trong từng hàng (Active, Draft, Archived), gọi `PATCH /products/:id` với `{status}`.
- Thành công: toast "Status updated". Lỗi: toast thông báo server hoặc "Update failed". Không có xác nhận.
- Trong lúc một lần đổi đang chạy, ô chọn của TẤT CẢ các hàng bị khoá.
- Sau khi đổi, hàng có thể biến mất khỏi danh sách đang lọc (ví dụ đang lọc Active mà chuyển sang Draft).
- Draft và Archived đều ẩn khỏi website. Về hiển thị hai trạng thái giống nhau.

## Xoá
- Nút thùng rác mở hộp thoại "Delete product?" với nội dung 'This will permanently delete "<tên>". This action cannot be undone.'
- Nút "Delete" và nút đóng X. Bấm ra ngoài hộp thoại KHÔNG đóng được.
- Thành công: toast "Deleted 1". Lỗi: toast thông báo server hoặc "Delete failed".
- Xoá là xoá hẳn khỏi database (204). Hệ thống cũng xoá các ảnh của sản phẩm trên kho lưu trữ, nhưng chỉ những ảnh không còn sản phẩm nào khác dùng (ảnh dùng chung được giữ lại).
- Id không tồn tại hoặc thuộc người khác: 404 "Product not found".

## Ghi chú cho tester
- Test đổi qua lại cả 3 trạng thái và kiểm tra ngay ở website (GET /products công khai): Active hiện, Draft và Archived ẩn.
- Test xoá: xác nhận, đóng bằng X, bấm ra ngoài, xoá khi lỗi mạng.
- Test xoá hai sản phẩm dùng chung một ảnh (nhập CSV): xoá một sản phẩm thì ảnh vẫn hiển thị ở sản phẩm còn lại.
- Chưa rõ BE có chặn xoá sản phẩm đã có đơn hàng không (hiện không có đơn thật), ghi vào câu hỏi **Q-V6**.
