---
id: 16-danh-gia
title: Đánh giá (Reviews)
source_section: "2.15"
routes: [/vendor/reviews]
endpoints: []
roles: [Vendor, Admin]
simulated: true
read_with: [14-don-hang.md, 15-chi-tiet-don-hang.md]
---

# 2.15. ĐÁNH GIÁ (/vendor/reviews) [GIẢ LẬP]

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

## Bố cục
- Không có tiêu đề, không có điểm trung bình, không có biểu đồ phân bố sao. Chỉ có thanh công cụ và bảng.
- Trang dùng chữ tiếng Anh viết cứng, không đổi theo ngôn ngữ.

## Dữ liệu
- 13 đánh giá sinh ra từ các đơn mẫu có điểm (ngày đánh giá = ngày đơn + 5 ngày; nội dung là văn bản mẫu theo số sao).
- Phân bố: 5 sao có 5, 4 sao có 4, 3 sao có 2, 2 sao có 1, 1 sao có 1.
- Sắp mới nhất trước, cố định.

## Công cụ
- Ô tìm "Search...": nội dung, mã đơn, tên và email khách, tên sản phẩm, SKU.
- Bộ lọc thời gian (như `14-don-hang.md`).
- Bộ lọc số sao: All, 5 ★ đến 1 ★, khớp đúng số sao.
- Đổi bộ lọc thì về trang 1.

## Bảng
- Cột: Rate, Created, Review (cắt 2 dòng), Customer, Product, Order ID. Không sắp xếp theo cột.
- Bấm dòng mở chi tiết đơn tương ứng trong cùng cổng (/vendor hoặc /admin).
- Rỗng: "No reviews match these filters." (cùng một câu cho cả hai trường hợp).
- Không có chức năng trả lời, xoá, báo cáo, xuất.

## Ghi chú cho tester
- Test lọc từng mức sao và đối chiếu số lượng ở trên.
- Tìm theo từng loại trường; chuỗi không có kết quả.
- "Specific date" chưa chọn ngày: trả về tất cả.
- Kết hợp bộ lọc, phân trang, đổi cỡ trang.
- Bộ lọc thời gian tương đối trả rỗng với dữ liệu mẫu (xem `14-don-hang.md`).
- Mọi vendor thấy cùng 13 đánh giá.
- Sau khi bấm một dòng rồi bấm Back: quay về trang đơn hàng chứ không phải trang đánh giá.
