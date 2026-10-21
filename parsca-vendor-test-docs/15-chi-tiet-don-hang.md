---
id: 15-chi-tiet-don-hang
title: Chi tiết đơn hàng
source_section: "2.14"
routes: [/vendor/orders/:id, /orders/:id]
endpoints: []
roles: [Vendor, Admin, User]
simulated: true
related_questions: [Q-V8]
read_with: [14-don-hang.md]
---

# 2.14. CHI TIẾT ĐƠN HÀNG (/vendor/orders/:id) [GIẢ LẬP]

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

## Chung
- Admin và vendor thấy CÙNG một trang (biến thể "seller").
- Đơn không tồn tại: panel "Order not found" ("No order matches this link. It may have been removed.") kèm nút "Back to orders".

## Đầu trang
- Nút quay lại, mã đơn, "Created: ... · Updated: ...".
- "Invoice": chỉ hiện toast "This is not connected yet — the orders service is still being built."
- "Contact": mở email tới khách (chạy thật).
- "Cancel order": bị khoá khi đơn đã delivered, returned hoặc canceled (chú thích "An order that is <trạng thái> can no longer be cancelled"); các trạng thái còn lại bấm chỉ hiện toast "chưa kết nối", không huỷ gì.

## Cột trái
- Products: ảnh, tên, SKU, "x<số lượng>", thành tiền "142.00 CAD".
- Order timeline: mới nhất ở trên, nội dung phụ thuộc trạng thái.
- Shipping information: Carrier, Tracking Number kèm nút sao chép (chạy thật), Shipped, Est. Delivery, Delivered, nút "Track package" (chỉ hiện toast "chưa kết nối").

## Cột phải
- Shipping: tên, email, số điện thoại, địa chỉ, mã đơn, Currency luôn "CAD", điểm đến.
- Payment detail: Subtotal, Shipping, giảm giá nếu có, Total excl. tax, Payment method luôn "Credit card", Status, Transaction ID.
- Review: chỉ khi đơn có đánh giá; không có nút trả lời, sửa, xoá.

## Chưa có
- Cập nhật trạng thái, đánh dấu đã giao, nhập mã vận đơn, hoàn tiền, in. Các nút Invoice, Cancel order, Track package chỉ là giao diện.

## Ghi chú cho tester
- Test mỗi trạng thái bằng một đơn mẫu:
  | Đơn | Trạng thái |
  |---|---|
  | 2134 | pending |
  | 2135 | in_production |
  | 2138 | shipped |
  | 2136 | delivered |
  | 2137 | returned |
  | 2139 | canceled |
- Kiểm tra timeline, ngày giao, nút Cancel, bấm các nút chỉ hiện toast và tải lại không có gì thay đổi.
- Dữ liệu viết cứng cần biết để không báo nhầm:
  - Phí ship cố định 10.
  - Số lượng từ 3 trở lên giảm 6% ("Volume discount (6%)").
  - Điện thoại và địa chỉ giống nhau mọi đơn.
  - Hãng vận chuyển chọn theo số, mã vận đơn luôn dạng UPS, tiền tệ luôn CAD.
  - Đơn có số lượng từ 3 trở lên bị tách thành hai dòng sản phẩm (một dòng là sản phẩm khác).
- Mâu thuẫn trong dữ liệu mẫu (ghi nhận để PO biết):
  - Timeline luôn ghi "Payment confirmed" kể cả đơn chưa thanh toán.
  - Đơn 2147 "refund issued" nhưng thanh toán chỉ hoàn một phần.
  - Đơn shipped vẫn cho "Cancel".
- Mở /vendor/orders/<id sai> và /vendor/orders/ORD-2136 (id thật là "ord-2136").
- KHÔNG tách dữ liệu theo vendor: mọi vendor mở được mọi đơn. Cả khách hàng cũng mở được mọi đơn mẫu ở /orders/:id (lộ tên, email, địa chỉ mẫu); ghi nhận để PO biết khi nối API thật (**Q-V8**).
