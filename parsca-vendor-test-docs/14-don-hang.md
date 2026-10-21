---
id: 14-don-hang
title: Danh sách đơn hàng của vendor
source_section: "2.13"
routes: [/vendor/orders]
endpoints: []
roles: [Vendor, Admin]
simulated: true
read_with: [15-chi-tiet-don-hang.md, 16-danh-gia.md]
---

# 2.13. ĐƠN HÀNG CỦA VENDOR (/vendor/orders) [GIẢ LẬP]

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

## Dữ liệu
- Toàn bộ là 20 đơn mẫu viết cứng (ORD-2134 đến ORD-2153), dùng chung cho mọi vendor và cả admin. Không có API đơn hàng.
- Ngày của đơn mẫu từ 30/05/2026 đến 08/08/2026.

## Cột bảng
Order ID, Product (ảnh, tên, SKU), Customer (tên, email), Destination, Total (số lượng), Amount, Payment, Created, Rating, Status. Bảng của admin có thêm cột "Created by" (tên và email vendor).

## Giá trị
- Trạng thái đơn: Pending, In production, Shipped, Delivered, Returned, Canceled.
- Thanh toán: To be invoiced, Invoiced, Pending, Paid, Partially refunded, Refunded, Refused, Canceled.

## Bộ lọc và phân trang
- Ô tìm: mã đơn, tên sản phẩm, SKU, tên và email khách.
- Status (chọn nhiều), Destination, Payment (chọn nhiều).
- Thời gian: All, Yesterday, Last 7 days, Last 30 days, This Month, Last month, Specific date.
- Rate: đúng số sao 5 đến 1.
- Mọi bộ lọc đổi thì về trang 1. Phân trang phía trình duyệt với các mức 10, 20, 30, 50 dòng.
- Bấm vào dòng mở /vendor/orders/<id>.
- Trạng thái rỗng: "orders.empty" hoặc "orders.noMatch" (văn bản dịch theo ngôn ngữ).

## Ghi chú cho tester
- Nếu hôm test là tháng 10/2026 thì các bộ lọc thời gian tương đối (Yesterday, Last 7 days, Last 30 days, This Month, Last month) cho kết quả rỗng; chỉ "All" và "Specific date" có dữ liệu. Đây KHÔNG phải lỗi.
- Kiểm tra mọi vendor đều thấy cùng 20 đơn (không tách theo vendor).
- Kiểm tra vendor không thấy cột "Created by".
- Kết hợp nhiều bộ lọc.
- Đổi ngôn ngữ: cột nhãn dùng i18n nhưng một số nhãn lọc dùng bản tiếng Anh cố định (ví dụ "Partially Refunded" và "Partially refunded" viết khác nhau).
