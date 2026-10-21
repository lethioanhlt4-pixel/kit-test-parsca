---
id: 13-dashboard
title: Dashboard vendor
source_section: "2.12"
routes: [/vendor]
endpoints: ["(không được gọi) GET /dashboard/stats"]
roles: [Vendor, Admin]
simulated: true
related_questions: [Q-V9]
read_with: [05-phan-quyen-api.md]
---

# 2.12. DASHBOARD (/vendor) [GIẢ LẬP]

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

## Hiển thị
- Tiêu đề "Overview". Ô chọn "This month" và nút "Export" chỉ là hình (không bấm được chức năng).
- 5 thẻ số liệu: Total orders, Pending fulfillment, Shipped today, Returns open, Revenue (MTD). Tất cả hiện dấu "—" kèm ghi chú "Available in Epic 9/10/11".
- Khối "Order Volume (7 Days)" và "Top 5 products - Best sellers": trạng thái trống "No data yet".
- Bảng "Recent orders": "No orders yet — this table fills in once orders start flowing through the marketplace."
- Khối "Catalogue" (tổng số sản phẩm, theo trạng thái, và số yêu cầu báo giá) CHỈ hiện với admin. Vendor không thấy khối này. Với admin hiện đang dùng số giả cố định (44.312 sản phẩm...) thay cho API thật.

## Ghi chú cho tester
- Đây là màn hình tạm. Đừng ghi bug cho các dấu "—".
- Kiểm tra vendor không thấy khối "Catalogue" và không có yêu cầu nào tới API /dashboard/stats (tab Network).
- Chữ "Epic 9/10/11" là chú thích nội bộ hiện ra cho người dùng (hỏi PO có cần đổi chữ, **Q-V9**).
