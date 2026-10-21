---
id: 11-upload-anh
title: Upload ảnh sản phẩm
source_section: "2.10"
routes: [/vendor/products/new, /vendor/products/:id/edit]
endpoints: ["POST /products/upload"]
roles: [Vendor, Admin]
read_with: [05-phan-quyen-api.md, 09-them-sua-san-pham.md]
---

# 2.10. UPLOAD ẢNH SẢN PHẨM

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

> Quy tắc ảnh trên form (1 đến 5 ảnh, ảnh bìa, bộ đếm) xem `09-them-sua-san-pham.md` mục (c).

## Nghiệp vụ
- API: `POST /products/upload` (vendor hoặc admin), multipart trường "file".
- Trả `{imagePath: <đường dẫn công khai trên kho lưu trữ đám mây>}`. Giá trị này đưa vào danh sách ảnh của sản phẩm.
- Chỉ nhận jpeg, png, webp, gif; tối đa 10 MB.
- Thiếu file: 400 "Image file is required". Sai loại: 400 "Only image uploads are allowed".
- File lưu trong bộ nhớ tạm rồi đẩy lên kho lưu trữ, không ghi vào đĩa.
- Kiểm tra loại file dựa vào loại do trình duyệt khai báo (MIME).

## Ghi chú cho tester
- Test từng định dạng hợp lệ, pdf, svg.
- File đổi đuôi (nội dung không phải ảnh nhưng khai báo là ảnh) có thể lọt qua [SUY LUẬN].
- Đúng 10 MB và 11 MB.
- User thường gọi API upload (403), không token (401).
