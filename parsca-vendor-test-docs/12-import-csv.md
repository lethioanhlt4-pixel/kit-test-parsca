---
id: 12-import-csv
title: Import sản phẩm bằng CSV
source_section: "2.11"
routes: [/vendor/products (hộp thoại Import CSV)]
endpoints: ["GET /products/import/template", "POST /products/import?dryRun=true", "POST /products/import"]
roles: [Vendor, Admin]
related_questions: [Q-V4, Q-V5]
read_with: [04-phien-lam-viec-logout.md, 06-pham-vi-du-lieu.md, 07-ds-san-pham.md, 20-vendor-tren-website.md]
---

# 2.11. IMPORT SẢN PHẨM BẰNG CSV

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

## Mở hộp thoại và file mẫu
- Mở bằng nút "Import CSV" ở danh sách sản phẩm. Hộp thoại "Import products from CSV".
- Nút "Template" tải file `parsca-products-template.csv` (GET /products/import/template): hàng tiêu đề đầy đủ và một dòng mẫu.

## Kiểm tra file
- Chọn file (accept .csv). FE không kiểm tra dung lượng, số dòng hay loại file.
- BE kiểm tra:
  - Chỉ nhận phần mở rộng .csv kèm loại file cho phép: lỗi "Only .csv files are accepted".
  - Tối đa 20 MB, một file.
  - Tối đa 50.000 dòng dữ liệu: lỗi "The file has N rows; the limit is 50000 per import. Please split it."
  - Phải có dòng dữ liệu: "The file has no data rows."
  - Phải có đủ cột bắt buộc: "Missing required column(s): ..."

## Bước 1: "Check file" (chạy thử)
- Gọi `POST /products/import?dryRun=true`, không ghi gì.
- Hiện "Validation result — nothing written yet" với các ô Rows, To create, To update, Skipped.
- Bảng các dòng bị bỏ qua (Line, SKU, Problem); lời nhắc sửa file và tải lại.

## Bước 2: Import thật
- Nút "Import N row(s)" (N = số tạo mới + cập nhật theo kết quả chạy thử). N bằng 0 thì nút "Nothing to import" bị khoá.
- Đổi file sau khi chạy thử thì kết quả bị xoá, phải chạy thử lại.
- Không có lỗi dòng: toast "<c> created, <u> updated" và đóng hộp thoại.
- Có dòng lỗi: giữ bảng "Import finished" với nút "Close" và "Import another file", toast cảnh báo "<c> created, <u> updated, <f> skipped — see the details below".
- Mất kết nối giữa chừng (không nhận được phản hồi, hoặc lỗi 502/504): hiện khung vàng "Connection lost before the server answered…", khuyên KHÔNG tải lại file mà kiểm tra danh sách sản phẩm trước; nút Import bị khoá.
- Hết phiên giữa chừng (401): thông báo phiên đã được làm mới, hãy thử lại; không tự gửi lại.

## Cột CSV
- Bắt buộc: sku, name, price, stockCount (tối thiểu 1).
- Tuỳ chọn: compareAtPrice, description, shortDescription, image, images (ngăn cách bằng |), brand, oemPartNumber, alternatePartNumbers (|), departmentId, subcategoryId, category, categorySlug, badgeLabel, isNew, inStock, inStockBadge, condition, availability, rating, ratingCount.
- Cột xe: vehicleType, make, model, submodel, yearStart, yearEnd, engine.
- Cột compatibility; cột "metadata.<tên>" thành thuộc tính tuỳ ý.
- Tên cột không phân biệt hoa thường, bỏ qua dấu cách và ký tự đặc biệt. Cột lạ bị bỏ qua.
- KHÔNG import được specifications và descriptionSections.

## Quy tắc xử lý
- Khớp theo SKU: có thì cập nhật, chưa có thì tạo mới.
- Ô trống khi cập nhật không ghi đè dữ liệu cũ.
- Dòng sai chỉ bị báo lỗi, các dòng đúng vẫn nhập.
- SKU trùng trong cùng file bị loại: "sku: duplicated in this file (already used on line N)".
- Slug sinh từ tên VÀ SKU (ví dụ `professional-bracket-mp-0004`) nên nhập lại không đổi URL.
- MỌI dòng đều thành trạng thái active (cột status bị bỏ qua).
- Ảnh là link https của nhà cung cấp được giữ nguyên, không sao chép về kho của PARSCA. Tối đa 5 ảnh mỗi sản phẩm vẫn áp dụng.
- Riêng vendor: dòng có SKU của người khác (kể cả admin) bị loại với lỗi "sku: this product belongs to another vendor". Sản phẩm mới tạo mang createdBy của vendor.
- Sau khi import, các brand và giá trị xe mới trong file được tự thêm vào danh mục dùng chung (bộ lọc brand và danh sách Make/Model/Submodel/Engine của website). Lỗi khi thêm các giá trị này chỉ ghi log, không làm hỏng import.

## Ghi chú cho tester
Chuẩn bị các file test:
- File đúng 5 dòng.
- File thiếu từng cột bắt buộc.
- File có stockCount 0.
- File có SKU của vendor khác và của admin.
- File có SKU lặp trong cùng file.
- File có cột status = draft (vẫn thành active).
- File không phải .csv (txt, xlsx).
- File hơn 20 MB; file hơn 50.000 dòng.
- File rỗng và file chỉ có tiêu đề.
- File có dòng tiêu đề giả Column1,Column2 ở dòng đầu (hệ thống bỏ qua dòng đó).
- File có BOM của Excel; ô có xuống dòng.
- File lẫn dòng đúng và dòng sai.

Test:
- Chạy thử rồi import; đổi file sau khi chạy thử; đóng hộp thoại giữa chừng.
- Ngắt mạng trong lúc import; hết phiên trong lúc import.
- Import lại cùng file: phải cập nhật, không nhân đôi.
- Sản phẩm mới có createdBy là vendor và chỉ vendor đó thấy trong danh sách của mình.
- Brand mới trong file xuất hiện ở bộ lọc brand của website: **THEO CODE HIỆN TẠI** vendor làm thay đổi danh mục dùng chung, hỏi PO tại câu **Q-V5**.

Ghi nhận: import chạy lâu (file lớn mất vài phút), mọi sản phẩm thành active không qua duyệt.
