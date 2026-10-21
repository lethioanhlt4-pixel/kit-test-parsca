---
id: 08-chi-tiet-san-pham
title: Chi tiết sản phẩm
source_section: "2.7"
routes: [/vendor/products/:id]
endpoints: ["GET /products/admin/:idOrSlug", "DELETE /products/:id"]
roles: [Vendor]
read_with: [06-pham-vi-du-lieu.md, 10-trang-thai-xoa-san-pham.md]
---

# 2.7. CHI TIẾT SẢN PHẨM (/vendor/products/:id)

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

## Nghiệp vụ
- Dùng API `GET /products/admin/:id`.
- Lỗi hoặc không có quyền: "Product not found or you do not have permission to view it." kèm liên kết "Back to products".

## Hiển thị
- Dải ảnh thu nhỏ (bấm để xem ảnh lớn).
- SKU và tên category, tên sản phẩm, mô tả ngắn.
- Giá "<giá> CAD" và giá so sánh gạch ngang nếu có.
- Trạng thái tồn kho và số lượng.
- Ba huy hiệu cố định viết cứng: Secure Payment, 30-day returns, 2-year warranty.
- Nút "Edit product", nút "Delete".
- Các tab chi tiết: mô tả, thông số, tương thích.

## Xoá ở trang này
- Hộp thoại xác nhận. Thành công: toast "Product deleted" rồi về danh sách. Lỗi: toast "Delete failed" hoặc thông báo của server.

## Ghi chú cho tester
- Ba huy hiệu đảm bảo (thanh toán, hoàn trả 30 ngày, bảo hành 2 năm) là nội dung viết cứng, không phải chính sách của vendor. Hỏi PO có cần giữ lại không.
- Test sản phẩm không có ảnh, không có giá so sánh, chuyển ảnh, nút Edit đi đúng sản phẩm.
