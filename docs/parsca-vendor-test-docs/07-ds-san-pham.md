---
id: 07-ds-san-pham
title: Danh sách sản phẩm của vendor
source_section: "2.6"
routes: [/vendor/products]
endpoints: ["GET /products/admin/all"]
roles: [Vendor]
read_with: [06-pham-vi-du-lieu.md, 10-trang-thai-xoa-san-pham.md, 12-import-csv.md]
---

# 2.6. DANH SÁCH SẢN PHẨM CỦA VENDOR (/vendor/products)

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

## Bố cục
- Tiêu đề "Product", mô tả "Manage product visibility, pricing, stock, fitment data, and gallery assets."
- Nút "Import CSV" (xem `12-import-csv.md`) và nút "Add product" (đi tới /vendor/products/new).
- Nguồn dữ liệu: `GET /products/admin/all`. Tham số FE gửi: page, limit, sort, status (bỏ qua khi chọn "All statuses"), departmentId, search.

## Cột bảng (vendor)
| Cột | Nội dung |
|---|---|
| Product | Ảnh hoặc "No image", SKU, tên, brand |
| Category | Department và subcategory |
| Price | Đơn vị "CAD" (viết cứng) |
| Stock | Thẻ "In stock" / "Out of stock" và "N units" |
| Status | Ô chọn đổi trạng thái ngay |
| Last updated | |
| Actions | Sửa, xoá |

- Cột "Created by" và ô lọc theo tên người tạo CHỈ có ở admin.

## Tìm kiếm, lọc, sắp xếp
- Tìm kiếm: ô "Search by SKU, product name, brand…", đổi từ khoá thì về trang 1. Không có debounce rõ ràng trong code của màn hình.
- Lọc department: nút "All divisions" cùng 4 nút marine, auto, door, tools.
- Lọc trạng thái: mặc định "Active products". Lựa chọn: Active products, Draft products, Archived products, All statuses. Vì mặc định chỉ hiện Active nên sản phẩm Draft và Archived không thấy khi mới vào trang.
- Sắp xếp (phía server): Newest (mặc định), Price ↑, Price ↓, Name A–Z. Không sắp xếp bằng cách bấm tiêu đề cột.

## Phân trang
- Mặc định 10 dòng/trang, các mức 10, 20, 30, 50, nhãn "Rows per page".
- Thanh phân trang và ô chọn số dòng bị ẩn khi tổng chỉ có 1 trang (10 dòng trở xuống), nên không đổi được số dòng/trang trong trường hợp này.
- BE giới hạn tối đa 100 dòng/trang bất kể tham số limit.

## Tương tác
- Bấm vào dòng: mở trang chi tiết. Bấm vào ô đổi trạng thái, nút sửa, nút xoá không kích hoạt việc mở chi tiết.
- Không có chọn nhiều dòng và không có thao tác hàng loạt.

## Trạng thái màn hình
- Đang tải: chỉ hiện biểu tượng quay (không có chữ).
- Lỗi: "Failed to load products."
- Rỗng: "No products." (cùng một thông báo cho cả "chưa có sản phẩm" và "lọc không ra kết quả").
- Danh sách nhấp nháy khi đổi trang, lọc hoặc tìm.

## Ghi chú cho tester
- Test danh sách mặc định (chỉ Active), từng bộ lọc trạng thái, bộ lọc department kết hợp tìm kiếm, từng kiểu sắp xếp.
- Phân trang: cần ít nhất 25 sản phẩm của vendor để thấy trang 2 và các mức 10/20/30/50. Đổi bộ lọc khi đang ở trang 2 phải về trang 1.
- Tìm kiếm có khoảng trắng, chữ hoa, ký tự đặc biệt; danh sách rỗng; tắt BE để thấy "Failed to load products.".
- Kiểm tra vendor không thấy cột "Created by".
- Kiểm tra giá hiển thị đơn vị "CAD" cho mọi dòng.
- Kiểm tra sản phẩm có stockCount bằng 0 (dữ liệu cũ hoặc import) hiện "Out of stock · 0 units".
