# TÀI LIỆU YÊU CẦU - QUẢN LÝ SẢN PHẨM (VENDOR)

| Thông tin | Chi tiết |
|-----------|----------|
| Module | PLIST (Danh sách) · PDTL (Chi tiết) · PFORM (Thêm/Sửa) · PSTAT (Trạng thái & Xoá) · IMG (Upload ảnh) |
| Hệ thống | PARSCA — Marketplace phụ tùng |
| URL | `{FE_URL}/vendor/products`, `/vendor/products/new`, `/vendor/products/:id`, `/vendor/products/:id/edit` |
| Endpoint | `GET /products/admin/all`, `GET /products/admin/:idOrSlug`, `POST /products`, `PATCH /products/:id`, `DELETE /products/:id`, `POST /products/upload`, `GET /product-brands`, `GET /fitment-options` |
| Doc nguồn | `07-ds-san-pham.md` (2.6), `08-chi-tiet-san-pham.md` (2.7), `09-them-sua-san-pham.md` (2.8), `10-trang-thai-xoa-san-pham.md` (2.9), `11-upload-anh.md` (2.10) |
| Ngày tạo | 2026-10-20 |

---

## 1. TỔNG QUAN

Vendor quản lý toàn bộ vòng đời sản phẩm **của chính mình**: xem danh sách (tìm, lọc, sắp xếp, phân trang), xem chi tiết, tạo/sửa qua form nhiều phần (nhận diện, phân loại, ảnh, trạng thái & tồn kho, số part & xe tương thích, mô tả), đổi trạng thái ngay trên danh sách và xoá vĩnh viễn. Sản phẩm **Active** hiển thị ngay trên website, không qua duyệt.

---

## 2. YÊU CẦU CHỨC NĂNG

### 2.1. Danh sách sản phẩm (PLIST)

> Là vendor, tôi muốn xem, tìm và lọc danh sách sản phẩm của mình để quản lý nhanh.

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-PLIST-01 | Tiêu đề "Product", mô tả "Manage product visibility, pricing, stock, fitment data, and gallery assets."; nút "Import CSV" và "Add product" (→ /vendor/products/new) |
| AC-PLIST-02 | Cột (vendor): Product (ảnh hoặc "No image", SKU, tên, brand) · Category (department + subcategory) · Price (đơn vị "CAD") · Stock · Status (ô chọn) · Last updated · Actions (sửa, xoá). **Không** có cột "Created by" |
| AC-PLIST-03 | Ô "Search by SKU, product name, brand…"; đổi từ khoá → về trang 1 |
| AC-PLIST-04 | Lọc department: "All divisions" + marine, auto, door, tools |
| AC-PLIST-05 | Lọc trạng thái mặc định "Active products"; lựa chọn: Active products, Draft products, Archived products, All statuses (All → không gửi `status`) |
| AC-PLIST-06 | Sắp xếp phía server: Newest (mặc định), Price ↑, Price ↓, Name A–Z; không sắp xếp bằng tiêu đề cột |
| AC-PLIST-07 | Phân trang mặc định 10 dòng; mức 10/20/30/50 ("Rows per page"); ẩn thanh phân trang + ô số dòng khi chỉ 1 trang; BE tối đa 100 dòng/trang; đổi bộ lọc/tìm → về trang 1 |
| AC-PLIST-08 | Bấm dòng → mở chi tiết; bấm ô trạng thái / nút sửa / nút xoá **không** mở chi tiết. Không có chọn nhiều / thao tác hàng loạt |
| AC-PLIST-09 | Trạng thái: đang tải (chỉ biểu tượng quay), lỗi "Failed to load products.", rỗng "No products." |
| AC-PLIST-10 | Stock: thẻ "In stock" / "Out of stock" + "N units" |

### 2.2. Chi tiết sản phẩm (PDTL)

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-PDTL-01 | Dùng `GET /products/admin/:id`; hiển thị dải ảnh thu nhỏ (bấm xem ảnh lớn), SKU, tên category, tên, mô tả ngắn, giá "<giá> CAD" + giá so sánh gạch ngang (nếu có), trạng thái tồn kho + số lượng, nút "Edit product", "Delete", tab mô tả / thông số / tương thích |
| AC-PDTL-02 | Ba huy hiệu cố định viết cứng: Secure Payment, 30-day returns, 2-year warranty |
| AC-PDTL-03 | Lỗi hoặc không có quyền → "Product not found or you do not have permission to view it." + liên kết "Back to products" |
| AC-PDTL-04 | Xoá: hộp thoại xác nhận → thành công toast "Product deleted" và về danh sách; lỗi toast "Delete failed" hoặc thông báo server |

### 2.3. Thêm / sửa sản phẩm (PFORM)

> Là vendor, tôi muốn tạo và cập nhật sản phẩm với đầy đủ thông tin để bán trên PARSCA.

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-PFORM-01 | Form validate ngay khi gõ; nút gửi "Add Product" (tạo) / "Update" (sửa) có trạng thái đang lưu; "Cancel" về danh sách, **không** hỏi khi có thay đổi chưa lưu |
| AC-PFORM-02 | Tạo `POST /products`; sửa `PATCH /products/:id` (gửi toàn bộ form). Thành công toast "Saved" → /vendor/products. Lỗi: toast thông báo server (nhiều lỗi nối dấu phẩy) hoặc "Save failed", form giữ nguyên |
| AC-PFORM-03 | Khi tạo, BE gán `createdBy` = tài khoản đăng nhập, `isNew = true`, thời điểm bắt đầu huy hiệu "mới" = lúc tạo (bất kể giá trị gửi lên) |
| AC-PFORM-04 | Name: bắt buộc, bỏ khoảng trắng 2 đầu, tối thiểu 1 ký tự — "Name required" |
| AC-PFORM-05 | SKU: bắt buộc, không cho gõ dấu cách, BE đổi CHỮ HOA, duy nhất toàn hệ thống — "SKU required"; trùng → 409 `Product with SKU "XXX" already exists` |
| AC-PFORM-06 | Price: bắt buộc, chỉ chữ số và một dấu chấm, tối đa 4 chữ số thập phân, mặc định 0 (0 hợp lệ) — "Price required" (trống), "Price must be 0 or greater" (âm) |
| AC-PFORM-07 | Compare at: không bắt buộc, ≥ 0; **không** kiểm tra có lớn hơn giá |
| AC-PFORM-08 | Brand: ô chọn từ `/product-brands`; mặc định theo department (marine → "Parsca Marine", auto & door → "Parsca", tools → "Vevor"); đổi department → đặt lại mặc định; để trống khi gửi → dùng mặc định |
| AC-PFORM-09 | Department bắt buộc (marine/auto/door/tools, mặc định marine) — "Department required". Subcategory bắt buộc, phụ thuộc department — "Subcategory required". Đổi department xoá subcategory, category, categorySlug. Chọn subcategory tự điền category (tên theo ngôn ngữ) và categorySlug (= mã subcategory). BE chấp nhận 50 mã subcategory, **không** kiểm tra subcategory thuộc department |
| AC-PFORM-10 | Gallery bắt buộc 1–5 ảnh — "At least one image is required" / "Maximum 5 images". FE lọc `image/*`; upload lần lượt; chọn quá số chỗ còn lại → bỏ phần dư + "A product can have at most 5 images"; ảnh lỗi toast "<tên file>: <lỗi>"; bộ đếm "N/5 images"; ảnh đầu là cover; nút "Make cover image", "Remove image"; không kéo thả |
| AC-PFORM-11 | Status: Active (mặc định), Draft, Archived — vendor chọn được cả ba (tự xuất bản, không duyệt) |
| AC-PFORM-12 | Checkbox "New" chỉ hiện khi **sửa** (kèm gợi ý thời hạn); false → true đặt lại thời điểm huy hiệu; true → true không kéo dài |
| AC-PFORM-13 | "In stock" mặc định bật; BE luôn tính lại `inStock = (stockCount > 0)` |
| AC-PFORM-14 | Condition (tuỳ chọn): New, Used, Refurbished, OEM, Aftermarket. Availability: In Stock (mặc định), On Backorder, Discontinued. Rating 0–5 bước 0,1 (tuỳ chọn) |
| AC-PFORM-15 | Stock count bắt buộc, số nguyên ≥ 1 (mặc định 0) — "Stock count required" / "Stock count must be a whole number" / "Stock count must be at least 1" |
| AC-PFORM-16 | OEM part number (tuỳ chọn). Alternate part numbers: Enter hoặc nút thêm; cắt khoảng trắng; không trùng ("Part number already exists"); xoá từng cái; Enter không gửi form |
| AC-PFORM-17 | Compatible model (chỉ department có xe: marine, auto): 1 dòng Make, Model, Submodel, Engine (từ `/fitment-options`, có thể xoá) + Year start, Year end (nguyên ≥ 0); để trống hết → bỏ dòng; **không** kiểm tra năm bắt đầu < năm kết thúc |
| AC-PFORM-18 | Material (metadata, tuỳ chọn); Short Description (tuỳ chọn); Detailed Description: nhiều khối Title ("Title required") + Body rich text ("Body required"), "Add description section", xoá khối; Specifications & Compatibility: dòng Label/Value ("Label required" / "Value required"), không giới hạn số dòng |
| AC-PFORM-19 | Trùng SKU / slug → 409 (cả tạo và sửa, sửa loại trừ chính nó). Đổi tên → slug đổi theo; sản phẩm import giữ slug kết thúc "-<sku>" |
| AC-PFORM-20 | BE: giá, giá so sánh, tồn kho, năm, rating không âm; rating ≤ 5; trường không khai báo / status lạ / subcategory lạ / 0 hoặc 6 ảnh / stockCount 0 → 400 |

### 2.4. Đổi trạng thái & xoá (PSTAT)

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-PSTAT-01 | Ô chọn từng hàng (Active, Draft, Archived) → `PATCH /products/:id {status}`; toast "Status updated"; lỗi toast server hoặc "Update failed"; không hỏi xác nhận |
| AC-PSTAT-02 | Trong lúc một lần đổi đang chạy, ô chọn của **tất cả** hàng bị khoá |
| AC-PSTAT-03 | Sau khi đổi, hàng có thể biến mất khỏi danh sách đang lọc |
| AC-PSTAT-04 | Draft và Archived đều ẩn khỏi website (hiển thị giống nhau) |
| AC-PSTAT-05 | Nút thùng rác mở hộp thoại "Delete product?" — 'This will permanently delete "<tên>". This action cannot be undone.'; nút "Delete" và X; bấm ra ngoài **không** đóng; thành công toast "Deleted 1"; lỗi toast server / "Delete failed" |
| AC-PSTAT-06 | Xoá hẳn khỏi DB (204); xoá ảnh trên kho chỉ khi không sản phẩm nào khác dùng (ảnh dùng chung giữ lại) |
| AC-PSTAT-07 | Id không tồn tại hoặc của người khác → 404 "Product not found" |
| AC-PSTAT-08 | Chưa rõ BE có chặn xoá sản phẩm đã có đơn (Q-V6) |

### 2.5. Upload ảnh sản phẩm (IMG)

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-IMG-01 | `POST /products/upload` (vendor/admin), multipart trường "file" → `{imagePath: <URL công khai>}` |
| AC-IMG-02 | Chỉ nhận jpeg, png, webp, gif; tối đa 10 MB |
| AC-IMG-03 | Thiếu file → 400 "Image file is required"; sai loại → 400 "Only image uploads are allowed" |
| AC-IMG-04 | Kiểm tra loại file dựa trên MIME trình duyệt khai báo; file lưu bộ nhớ tạm rồi đẩy lên kho, không ghi đĩa |
| AC-IMG-05 | User thường → 403; không token → 401 |

---

## 3. ĐẶC TẢ TRƯỜNG DỮ LIỆU — FORM SẢN PHẨM

| Phần | Trường | Loại UI | Bắt buộc | Mặc định | Quy tắc | Thông báo lỗi |
|------|--------|---------|----------|----------|---------|---------------|
| (a) | Name | Textbox | Có | – | Trim, ≥ 1 ký tự | Name required |
| (a) | SKU | Textbox | Có | – | Không dấu cách, BE → HOA, duy nhất | SKU required · 409 |
| (a) | Price | Textbox số | Có | 0 | Chữ số + 1 dấu chấm, ≤ 4 thập phân, ≥ 0 | Price required · Price must be 0 or greater |
| (a) | Compare at | Textbox số | Không | – | ≥ 0 | – |
| (a) | Brand | Dropdown (API) | Không | Theo department | – | – |
| (b) | Department | Dropdown | Có | marine | marine/auto/door/tools | Department required |
| (b) | Subcategory | Dropdown phụ thuộc | Có | – | Theo department (FE) | Subcategory required |
| (c) | Gallery | File upload nhiều | Có | – | 1–5 ảnh, jpeg/png/webp/gif, ≤ 10 MB | At least one image is required · Maximum 5 images · A product can have at most 5 images |
| (d) | Status | Dropdown | Có | Active | Active/Draft/Archived | – |
| (d) | New | Checkbox | – | (chỉ khi sửa) | – | – |
| (d) | In stock | Checkbox | – | Bật | BE tính lại | – |
| (d) | Condition | Dropdown | Không | – | New/Used/Refurbished/OEM/Aftermarket | – |
| (d) | Availability | Dropdown | – | In Stock | In Stock/On Backorder/Discontinued | – |
| (d) | Rating | Number | Không | – | 0–5, bước 0,1 | – |
| (d) | Stock count | Number | Có | 0 | Nguyên ≥ 1 | Stock count required · …whole number · …at least 1 |
| (e) | OEM part number | Textbox | Không | – | – | – |
| (e) | Alternate part numbers | Tag input | Không | – | Trim, không trùng | Part number already exists |
| (e) | Make/Model/Submodel/Engine | Dropdown (API) | Không | – | Chỉ marine, auto | – |
| (e) | Year start / Year end | Number | Không | – | Nguyên ≥ 0 | – |
| (f) | Material | Textbox | Không | – | metadata | – |
| (f) | Short Description | Textarea | Không | – | – | – |
| (f) | Detailed Description | Khối Title + Rich text | Title/Body bắt buộc trong khối | – | – | Title required · Body required |
| (f) | Specifications | Dòng Label/Value | Cả hai bắt buộc trong dòng | – | – | Label required · Value required |
| (f) | Compatibility | Dòng Label/Value | Cả hai bắt buộc trong dòng | – | – | Label required · Value required |
| (g) | badgeLabel, inStockBadge, description, category, categorySlug | Ẩn | – | – | Vẫn gửi lên | – |

---

## 4. LUỒNG XỬ LÝ

### 4.1. Tạo sản phẩm (Happy Path)
1. `/vendor/products` → "Add product"
2. Nhập Name, SKU, Price; chọn Department, Subcategory; upload 1–5 ảnh; nhập Stock count ≥ 1
3. Bấm "Add Product" → `POST /products` → toast "Saved" → về danh sách
4. Nếu Active → sản phẩm xuất hiện ngay trên website

### 4.2. Đổi trạng thái
1. Ở danh sách, chọn trạng thái mới trong ô Status của hàng → mọi ô khoá
2. `PATCH {status}` → toast "Status updated" → hàng có thể biến mất khỏi bộ lọc hiện tại

### 4.3. Xoá
1. Bấm thùng rác → hộp thoại "Delete product?"
2. Bấm "Delete" → `DELETE` 204 → toast "Deleted 1" → ảnh không còn dùng bị xoá khỏi kho

---

## 5. TỔNG HỢP THÔNG BÁO LỖI

| # | Thông báo | Loại | Điều kiện |
|---|-----------|------|-----------|
| 1 | Failed to load products. | UI | Lỗi tải danh sách |
| 2 | No products. | UI | Không có / lọc không ra kết quả |
| 3 | Product not found or you do not have permission to view it. | UI | Chi tiết/sửa không quyền |
| 4 | Saved / Save failed | Toast | Lưu form |
| 5 | Status updated / Update failed | Toast | Đổi trạng thái |
| 6 | Deleted 1 / Product deleted / Delete failed | Toast | Xoá (danh sách / chi tiết) |
| 7 | Name required · SKU required · Price required · Price must be 0 or greater · Department required · Subcategory required | Inline | Form |
| 8 | At least one image is required · Maximum 5 images · A product can have at most 5 images | Inline / Toast | Gallery |
| 9 | Stock count required · Stock count must be a whole number · Stock count must be at least 1 | Inline | Stock |
| 10 | Part number already exists · Title required · Body required · Label required · Value required | Inline | Part numbers / Mô tả |
| 11 | Product with SKU "XXX" already exists · Product with slug "xxx" already exists | API 409 | Trùng |
| 12 | Image file is required · Only image uploads are allowed | API 400 | Upload |

---

## 6. CẤU TRÚC GIAO DIỆN

```
/vendor/products
+-----------------------------------------------------------------------+
| Product                                      [Import CSV] [Add product]|
| Manage product visibility, pricing, stock, fitment data, and gallery…  |
| [Search by SKU, product name, brand…] [All divisions|marine|auto|door|tools] |
| [Active products ▼] [Newest ▼]                                        |
| Product | Category | Price | Stock | Status ▼ | Last updated | ✎ 🗑   |
| ...                                                                   |
| Rows per page [10 ▼]                               < 1 2 3 >          |
+-----------------------------------------------------------------------+

/vendor/products/new
+-----------------------------------------------------------------------+
| (a) Name* · SKU* · Price* · Compare at · Brand                        |
| (b) Department* · Subcategory*                                        |
| (c) Gallery* [N/5 images] [cover][Make cover image][Remove image]     |
| (d) Status · In stock · Condition · Availability · Rating · Stock count*|
| (e) OEM part number · Alternate part numbers · Compatible model       |
| (f) Material · Short Description · Detailed Description · Specs · Compatibility |
|                                           [Cancel] [Add Product]      |
+-----------------------------------------------------------------------+
```

---

## 7. YÊU CẦU PHI CHỨC NĂNG

| ID | Nội dung |
|----|----------|
| NFR-PROD-01 | Bảo mật: nội dung HTML/script trong tên, tiêu đề mô tả không được thực thi ở trang chi tiết và website (XSS) |
| NFR-PROD-02 | Toàn vẹn: nút lưu khoá khi đang lưu, không tạo bản ghi trùng khi double click |
| NFR-PROD-03 | Hiệu năng: danh sách tối đa 100 dòng/trang phía BE |
| NFR-PROD-04 | Lưu trữ: xoá sản phẩm dọn ảnh không còn dùng |

---

## 8. CÂU HỎI CẦN LÀM RÕ VỚI PO/USER

| ID | Câu hỏi |
|----|---------|
| Q-V6 | BE có chặn xoá sản phẩm đã có đơn hàng? |
| Q-V10 | Vendor tự xuất bản Active không qua duyệt — có chấp nhận? |
| Q-V11 | Vendor có được tự nhập Rating? |
| Q-V12 | Ô "In stock" luôn bị bỏ qua — có bỏ ô này? |
| Q-V13 | Cần cảnh báo rời form chưa lưu và dọn ảnh mồ côi? |
| Q-V14 | "10 MB" = 10.000.000 hay 10.485.760 byte? |
| Q-V15 | Có chặn Compare at < Price, Year start > Year end, Subcategory sai department? |
| Q-V16 | Có giữ 3 huy hiệu cố định ở trang chi tiết? |
