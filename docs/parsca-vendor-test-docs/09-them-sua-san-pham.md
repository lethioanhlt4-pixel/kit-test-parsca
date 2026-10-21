---
id: 09-them-sua-san-pham
title: Thêm và sửa sản phẩm
source_section: "2.8"
routes: [/vendor/products/new, /vendor/products/:id/edit]
endpoints: ["POST /products", "PATCH /products/:id", "GET /product-brands", "GET /fitment-options"]
roles: [Vendor]
read_with: [05-phan-quyen-api.md, 06-pham-vi-du-lieu.md, 11-upload-anh.md, 20-vendor-tren-website.md]
---

# 2.8. THÊM VÀ SỬA SẢN PHẨM (/vendor/products/new, /vendor/products/:id/edit)

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

## Thông tin chung
- Form kiểm tra dữ liệu ngay khi gõ. Nút gửi là "Add Product" (tạo) hoặc "Update" (sửa), hiện trạng thái đang lưu.
- Nút "Cancel" quay về danh sách, KHÔNG hỏi khi có thay đổi chưa lưu.
- Gửi tạo: `POST /products`. Gửi sửa: `PATCH /products/:id` (gửi toàn bộ dữ liệu của form, không phải phần thay đổi).
- Thành công: toast "Saved", về /vendor/products. Lỗi: toast thông báo của server (nhiều lỗi nối bằng dấu phẩy) hoặc "Save failed", form giữ nguyên.
- Khi tạo, BE gán createdBy là tài khoản đang đăng nhập; đặt cờ isNew = true và thời điểm bắt đầu huy hiệu "mới" là lúc tạo, bất kể giá trị gửi lên.

## (a) Thông tin nhận diện
| Trường | Quy tắc | Thông báo lỗi |
|---|---|---|
| Name (bắt buộc) | Bỏ khoảng trắng hai đầu, tối thiểu 1 ký tự | "Name required" |
| SKU (bắt buộc) | Không cho gõ dấu cách; BE tự đổi thành CHỮ HOA; duy nhất toàn hệ thống | "SKU required" |
| Price (bắt buộc) | Chỉ chữ số và một dấu chấm, tối đa 4 chữ số thập phân. Mặc định 0 (0 hợp lệ) | "Price required" (trống), "Price must be 0 or greater" (âm) |
| Compare at | Không bắt buộc, từ 0 trở lên. Không kiểm tra có lớn hơn giá hay không | |
| Brand | Ô chọn lấy từ API công khai /product-brands | |

- Brand mặc định theo department: marine là "Parsca Marine", auto và door là "Parsca", tools là "Vevor". Đổi department thì brand đặt lại mặc định. Để trống khi gửi thì dùng mặc định của department.

## (b) Phân loại
- Department (bắt buộc): marine, auto, door, tools. Mặc định marine. Lỗi "Department required".
- Subcategory (bắt buộc): danh sách phụ thuộc department. Lỗi "Subcategory required".
- Đổi department xoá subcategory, category và categorySlug. Chọn subcategory thì tự điền category (tên hiển thị theo ngôn ngữ đang dùng) và categorySlug (bằng mã subcategory).
- BE chấp nhận 50 mã subcategory và KHÔNG kiểm tra subcategory có thuộc department hay không. Danh sách ở FE lấy từ dữ liệu bộ lọc của FE, có thể lệch với BE.

## (c) Ảnh (Gallery, bắt buộc)
- Phải có 1 đến 5 ảnh. Lỗi "At least one image is required" / "Maximum 5 images".
- FE chỉ lọc "image/*"; BE chỉ nhận jpeg, png, webp, gif và tối đa 10 MB mỗi ảnh (lỗi "Only image uploads are allowed"). Chi tiết API xem `11-upload-anh.md`.
- Upload lần lượt từng ảnh. Chọn nhiều hơn số chỗ còn lại thì bỏ phần dư và báo "A product can have at most 5 images". Ảnh lỗi hiện toast "<tên file>: <lỗi>". Bộ đếm "N/5 images".
- Ảnh đầu tiên là ảnh bìa (cover). Các ảnh khác có nút "Make cover image" (đưa lên đầu), mọi ảnh có nút "Remove image". Không kéo thả sắp xếp.

## (d) Trạng thái và tồn kho
- Status: Active (mặc định), Draft, Archived. Vendor chọn được cả ba, nghĩa là vendor tự xuất bản sản phẩm, không cần duyệt.
- "New" (checkbox): chỉ hiện khi SỬA, kèm gợi ý thời hạn huy hiệu. Khi tạo luôn là true.
- "In stock" (checkbox) mặc định bật.
- Condition (không bắt buộc): New, Used, Refurbished, OEM, Aftermarket.
- Availability: In Stock (mặc định), On Backorder, Discontinued.
- Rating (0 đến 5, bước 0,1, không bắt buộc): vendor tự nhập được điểm đánh giá của sản phẩm.
- Stock count (bắt buộc, số nguyên, từ 1 trở lên): mặc định 0 nên phải nhập mới lưu được. Lỗi "Stock count required" / "Stock count must be a whole number" / "Stock count must be at least 1".
- BE luôn tính lại "In stock" = (stockCount > 0). Vì stockCount tối thiểu là 1 nên ô "In stock" thực tế bị bỏ qua và sản phẩm luôn "In stock" khi lưu qua form.

## (e) Số part và xe tương thích
- OEM part number (không bắt buộc).
- Alternate part numbers: nhập rồi Enter hoặc bấm nút thêm; cắt khoảng trắng, không thêm trùng ("Part number already exists"), xoá từng cái. Enter không gửi form.
- Compatible model (chỉ hiện với department có xe, theo ghi chú code là marine và auto): đúng 1 dòng gồm Make, Model, Submodel, Engine (ô chọn lấy từ /fitment-options, có thể xoá) và Year start, Year end (số nguyên từ 0). Để trống hết thì bỏ dòng. Không kiểm tra năm bắt đầu nhỏ hơn năm kết thúc.

## (f) Mô tả
- Material (không bắt buộc, lưu vào metadata).
- Short Description: ô nhiều dòng, không bắt buộc.
- Detailed Description: nhiều khối, mỗi khối có Title (bắt buộc, "Title required") và Body (bắt buộc, "Body required", trình soạn thảo rich text: danh sách, gạch chân, căn lề). Nút "Add description section", xoá từng khối. Không sắp xếp lại khối.
- Specifications: các dòng Label và Value (cả hai bắt buộc, "Label required" / "Value required").
- Compatibility: giống Specifications (ví dụ BOAT TYPE, HULL TYPE). Không giới hạn số dòng.

## (g) Trường không có ô nhập nhưng vẫn được gửi
- badgeLabel (gửi chuỗi rỗng hoặc giá trị đã có), inStockBadge (mặc định true), description (nội dung cũ), category, categorySlug.

## Quy tắc BE khi lưu
- Trùng SKU: 409 `Product with SKU "XXX" already exists`. Trùng slug: 409 `Product with slug "xxx" already exists`. Cả tạo và sửa đều kiểm tra trùng (sửa loại trừ chính sản phẩm đó).
- Đổi tên thì slug tự đổi theo. Với sản phẩm nhập từ CSV, slug luôn kết thúc bằng "-<sku>" và được giữ dạng đó khi đổi tên.
- Sửa: nếu bật "New" từ false lên true thì đặt lại thời điểm bắt đầu huy hiệu; chỉ gửi isNew=true mà trước đó đã true thì không kéo dài huy hiệu.
- Giá, giá so sánh, tồn kho, năm, điểm đánh giá không được âm; điểm đánh giá tối đa 5.

## Ghi chú cho tester
1. Gửi form rỗng: phải thấy các lỗi Subcategory required, At least one image is required, Stock count must be at least 1 (Name và SKU cũng báo lỗi, Price mặc định 0 nên không báo).
2. Tạo tối thiểu (tên, SKU, giá, subcategory, 1 ảnh, tồn kho 1) và tạo đầy đủ mọi trường rồi mở lại để đối chiếu từng giá trị.
3. SKU: có dấu cách (bị chặn), chữ thường (đổi thành hoa), trùng với sản phẩm của chính vendor, trùng với sản phẩm của vendor khác hoặc admin (cùng nhận 409).
4. Tên cho ra slug trùng; tên chỉ có ký tự đặc biệt hoặc không phải chữ Latin [SUY LUẬN: slug có thể rỗng và lưu lỗi].
5. Giá: chữ cái, hai dấu chấm, hơn 4 số thập phân, dán chuỗi, số âm, để trống; Compare at nhỏ hơn giá; tồn kho 0, -1, 1.5, để trống; rating 5.1, -1, 4.55.
6. Đổi department sau khi chọn subcategory, brand, xe tương thích: subcategory xoá, brand về mặc định, ô xe ẩn với department không có xe nhưng giá trị cũ vẫn được gửi [SUY LUẬN].
7. Ảnh: 1, 5 và 6 ảnh cùng lúc; định dạng SVG, HEIC, file hơn 10 MB (lỗi chỉ hiện sau khi upload); một ảnh lỗi trong nhiều ảnh (các ảnh khác vẫn lên); xoá ảnh bìa; đặt ảnh bìa; xoá hết ảnh (viền đỏ và lỗi); rời trang giữa lúc upload.
8. Tạo với Draft, Archived: sản phẩm không hiện ở website; Active: hiện ở website ngay (kiểm tra GET /products công khai).
9. **THEO CODE HIỆN TẠI** cần ghi nhận:
   - Bỏ tick "In stock" vẫn lưu thành inStock=true.
   - Vendor nhập được Rating.
   - Vendor tự xuất bản không qua duyệt.
   - Không cảnh báo khi rời form chưa lưu.
   - Ảnh đã upload bị bỏ lại trên kho lưu trữ nếu không lưu sản phẩm.
10. Mô tả: khối chỉ có tiêu đề, chỉ có nội dung, nội dung rich text trống; HTML/script trong tiêu đề (kiểm tra không bị chạy ở trang chi tiết và website).
11. Xe tương thích: năm bắt đầu lớn hơn năm kết thúc, năm không phải số, chỉ chọn Make; giá trị xe đã bị admin xoá khỏi danh mục vẫn hiện cho sản phẩm cũ.
12. Bấm Update hai lần liên tiếp: nút bị khoá khi đang lưu. Hết phiên khi bấm lưu: thông báo lỗi và không mất dữ liệu đã nhập [SUY LUẬN].
13. Mở sửa sản phẩm cũ chỉ có trường "image" (không có "images"), hoặc có brand không còn trong danh mục: form vẫn mở được.
14. Gọi API trực tiếp với trường không khai báo, status lạ, subcategory lạ, 0 hoặc 6 ảnh, stockCount 0: phải 400.
15. Vendor đưa subcategory không thuộc department qua API: **THEO CODE HIỆN TẠI** lưu được.
