---
id: 18-cai-dat-brand-fitment
title: Cài đặt (Settings) của vendor - Brand và Vehicle fitment
source_section: "2.17"
routes: [/vendor/settings, /vendor/settings/brand, /vendor/settings/fitment, /vendor/settings/logo, /vendor/settings/blog]
endpoints: ["(vendor bị 403) POST/PATCH/DELETE /product-brands", "(vendor bị 403) POST/PATCH/DELETE /fitment-options"]
roles: [Vendor]
simulated: true
related_questions: [Q-V5]
read_with: [05-phan-quyen-api.md, 09-them-sua-san-pham.md, 12-import-csv.md]
---

# 2.17. CÀI ĐẶT (SETTINGS) CỦA VENDOR: BRAND VÀ VEHICLE FITMENT [GIẢ LẬP]

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

## Điều hướng
- Bánh răng trên thanh tiêu đề mở menu các mục vendor được dùng: "Brand" và "Vehicle fitment".
- Các mục Logo và Blog chỉ dành cho admin. Gõ /vendor/settings/logo hoặc /vendor/settings/blog thì trang tự chuyển sang mục đầu tiên được phép (Brand).

## Brand
- Bảng tên thương hiệu: ngày tạo, tên, mô tả, nhãn "Hidden" nếu ẩn.
- Tìm kiếm, lọc ngày, phân trang.
- Thêm, sửa: tên bắt buộc, mô tả tối đa 500 ký tự, thứ tự, hiển thị.
- Xoá có xác nhận.

## Vehicle fitment
- Quản lý danh mục Vehicle type, Make, Model, Submodel, Engine (mỗi cấp thuộc cấp trước).

## Giới hạn
- Cả hai chạy trên dữ liệu giả trong bộ nhớ: sửa chỉ có hiệu lực trong tab này, tải lại là mất.
- KHÔNG ảnh hưởng tới bộ lọc ở website hay form sản phẩm (các danh sách đó lấy từ API công khai).
- Lý do trong code: các API quản lý brand và fitment chỉ cho admin (vendor gọi sẽ nhận 403).

## Ghi chú cho tester
- Kiểm tra vendor thấy đúng hai mục.
- Gõ URL mục bị cấm thì được chuyển về Brand.
- Thêm brand rồi tải lại: mất.
- Brand vừa thêm KHÔNG xuất hiện trong ô Brand của form sản phẩm.
- Hỏi PO vendor có quyền sửa danh mục dùng chung hay không (**Q-V5**). Hiện tại vendor có thể gián tiếp tạo brand và giá trị xe mới qua import CSV (xem `12-import-csv.md`).
