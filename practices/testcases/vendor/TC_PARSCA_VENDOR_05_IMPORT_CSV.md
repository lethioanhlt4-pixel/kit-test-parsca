# TEST CASES — PARSCA VENDOR: IMPORT SẢN PHẨM BẰNG CSV

| Thông tin | Chi tiết |
|-----------|----------|
| **Dự án** | PARSCA — Role Vendor |
| **Module** | CSV — Import sản phẩm bằng CSV |
| **URL** | `{FE_URL}/vendor/products` (hộp thoại "Import products from CSV") |
| **Requirements** | `practices/requirements/parsca-vendor/04_requirements_import_csv.md` |
| **Doc nguồn** | 12 (đọc kèm 04, 06, 07, 20) |
| **Phương pháp** | AI-RBT (Risk-Based Testing) — FULL 6 bước |
| **Ngày tạo** | 2026-10-20 |
| **Tổng số TC** | 28 |

> **Chuẩn bị bắt buộc:**
> 1. Chạy `python3 practices/scripts/generate_fixtures.py` (đặt biến môi trường `V2_PRODUCT_SKU`, `ADMIN_PRODUCT_SKU` trước) → sinh file lớn + file đã thay placeholder vào `practices/test-data/generated/`.
> 2. File CSV nhỏ nằm ở `practices/test-data/csv/`. File có placeholder `{{V2_PRODUCT_SKU}}` / `{{ADMIN_PRODUCT_SKU}}` phải dùng bản đã thay trong `practices/test-data/generated/`.
> 3. Trước mỗi lần chạy lại suite: Admin xoá các SKU `AUTO-CSV-*` của lần chạy trước (hoặc đổi hậu tố ngày trong file) để TC "To create" độc lập.

---

## TỔNG HỢP RISK LEVEL

| Module | Risk Level | Số TC |
|--------|-----------|-------|
| M10: CSV — Import sản phẩm bằng CSV | 🔴 High | 28 |

---

## TRACEABILITY MATRIX

| Requirement | Test Cases |
|------------|------------|
| AC-CSV-01 | CSV_TC_001 |
| AC-CSV-02 | CSV_TC_001 |
| AC-CSV-03 | CSV_TC_011, CSV_TC_014 |
| AC-CSV-04 | CSV_TC_011 |
| AC-CSV-05 | CSV_TC_014 |
| AC-CSV-06 | CSV_TC_013 |
| AC-CSV-07 | CSV_TC_012 |
| AC-CSV-08 | CSV_TC_008 |
| AC-CSV-09 | CSV_TC_015, CSV_TC_019 |
| AC-CSV-10 | CSV_TC_002 |
| AC-CSV-11 | CSV_TC_002, CSV_TC_007 |
| AC-CSV-12 | CSV_TC_003 |
| AC-CSV-13 | CSV_TC_023 |
| AC-CSV-14 | CSV_TC_004 |
| AC-CSV-15 | CSV_TC_007 |
| AC-CSV-16 | CSV_TC_025 |
| AC-CSV-17 | CSV_TC_026 |
| AC-CSV-18 | CSV_TC_004, CSV_TC_005 |
| AC-CSV-19 | CSV_TC_006, CSV_TC_007 |
| AC-CSV-20 | CSV_TC_010, CSV_TC_022 |
| AC-CSV-21 | CSV_TC_016, CSV_TC_021 |
| AC-CSV-22 | CSV_TC_017, CSV_TC_018, CSV_TC_028 |
| AC-CSV-23 | CSV_TC_027 |
| AC-CSV-24 | CSV_TC_020, CSV_TC_028 |
| NFR-CSV-01 | CSV_TC_013 |
| (Hộp thoại) | CSV_TC_024 |
| (Ràng buộc stockCount ≥ 1) | CSV_TC_009 |

---

## BẢNG TEST CASES

### M10: CSV — Import sản phẩm bằng CSV (🔴 High Risk)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_CSV_TC_001 | M10: CSV | 🔴 High | Mở hộp thoại Import CSV và tải file mẫu Template | V1 đăng nhập, ở `/vendor/products` | 1. Bấm nút "Import CSV"<br>2. Bấm nút "Template"<br>3. Mở file vừa tải bằng trình soạn thảo văn bản<br>4. Kiểm tra Network | 1. Hộp thoại **"Import products from CSV"** mở<br>2. Tải về file **`parsca-products-template.csv`**<br>3. Có hàng tiêu đề đầy đủ (gồm `sku,name,price,stockCount` và các cột tuỳ chọn) + **đúng 1 dòng mẫu**<br>4. `GET /products/import/template` → 200 | High | – | Yes | UI | @Regression |
| PARSCA_CSV_TC_002 | M10: CSV | 🔴 High | "Check file" với file hợp lệ 5 dòng — chạy thử không ghi dữ liệu | V1 đăng nhập; 5 SKU `AUTO-CSV-0001..0005` chưa tồn tại | 1. Mở Import CSV, chọn `csv_valid_5_rows.csv`<br>2. Bấm "Check file"<br>3. Quan sát kết quả và Network<br>4. Đóng hộp thoại, tìm `AUTO-CSV-0001` trong danh sách | 1. Tên file hiển thị<br>2. Gọi `POST /products/import?dryRun=true`<br>3. Hiện **"Validation result — nothing written yet"**: Rows **5**, To create **5**, To update **0**, Skipped **0**<br>4. **"No products."** — chưa có gì được ghi | High | File: `practices/test-data/csv/csv_valid_5_rows.csv` | Yes | UI | @Regression @CriticalPath |
| PARSCA_CSV_TC_003 | M10: CSV | 🔴 High | Nút Import hiển thị đúng số dòng N và khoá khi N = 0 | V1 đăng nhập | 1. Chọn `csv_valid_5_rows.csv` → Check file<br>2. Quan sát nút hành động<br>3. Đổi sang `csv_stockcount_zero_all.csv` (mọi dòng stockCount 0) → Check file<br>4. Quan sát nút hành động | 1. Kết quả chạy thử hiển thị<br>2. Nút **"Import 5 row(s)"** bấm được (N = To create + To update)<br>3. Skipped = số dòng của file, To create = 0, To update = 0<br>4. Nút **"Nothing to import"** bị **khoá** | High | `csv_valid_5_rows.csv`, `csv_stockcount_zero_all.csv` | Yes | UI | @Regression @Boundary |
| PARSCA_CSV_TC_004 | M10: CSV | 🔴 High | Import thật file hợp lệ 5 dòng — tạo mới thành công | V1 đăng nhập; SKU `AUTO-CSV-0001..0005` chưa tồn tại | 1. Chọn `csv_valid_5_rows.csv` → Check file<br>2. Bấm "Import 5 row(s)"<br>3. Quan sát toast và hộp thoại<br>4. Lọc "All statuses", tìm `AUTO-CSV-000`<br>5. Mở 1 sản phẩm, kiểm tra trạng thái và người tạo (Network `GET /products/admin/:id`) | 1. Rows 5, To create 5<br>2. Gọi `POST /products/import` (không dryRun)<br>3. Toast **"5 created, 0 updated"**; hộp thoại **tự đóng**<br>4. Hiển thị đủ 5 sản phẩm<br>5. Status **Active**; `createdBy` = id V1 | Critical | File: `practices/test-data/csv/csv_valid_5_rows.csv`<br>SKU: `AUTO-CSV-0001..0005` | Yes | UI | @Smoke @CriticalPath @Regression |
| PARSCA_CSV_TC_005 | M10: CSV | 🔴 High | Import lại cùng file — cập nhật, không nhân đôi, không đổi slug | Đã chạy CSV_TC_004; ghi lại slug của `AUTO-CSV-0004` | 1. Chọn lại `csv_valid_5_rows.csv` → Check file<br>2. Bấm Import<br>3. Tìm `AUTO-CSV-000` trong danh sách (All statuses)<br>4. So sánh slug `AUTO-CSV-0004` với slug đã ghi | 1. Rows 5, To create **0**, To update **5**, Skipped 0<br>2. Toast **"0 created, 5 updated"**<br>3. Vẫn **đúng 5** sản phẩm (không bản sao)<br>4. Slug **không đổi** | Critical | `csv_valid_5_rows.csv` | Yes | UI | @Regression @CriticalPath |
| PARSCA_CSV_TC_006 | M10: CSV | 🔴 High | Ô trống khi cập nhật không ghi đè dữ liệu cũ | `AUTO-CSV-0001` tồn tại với description, brand, compareAtPrice có giá trị (từ CSV_TC_004) | 1. Chọn `csv_partial_update_blank_cells.csv` (SKU `AUTO-CSV-0001`, name + price mới `55.50`, các cột description/brand/compareAtPrice **để trống**) → Check file → Import<br>2. Mở chi tiết `AUTO-CSV-0001` | 1. To update 1; toast "0 created, 1 updated"<br>2. Name, Price = giá trị mới; **description, brand, compareAtPrice giữ nguyên** giá trị cũ | High | File: `practices/test-data/csv/csv_partial_update_blank_cells.csv` | Yes | API | @Regression |
| PARSCA_CSV_TC_007 | M10: CSV | 🔴 High | File lẫn dòng đúng và dòng sai — dòng đúng vẫn nhập, bảng "Import finished" | V1 đăng nhập; SKU trong file chưa tồn tại | 1. Chọn `csv_mixed_valid_invalid.csv` (3 dòng đúng `AUTO-CSV-0101..0103`; dòng 5 thiếu name; dòng 6 price `abc`) → Check file<br>2. Bấm "Import 3 row(s)"<br>3. Quan sát hộp thoại<br>4. Bấm "Import another file"<br>5. Đóng, tìm `AUTO-CSV-010` | 1. Rows 5, To create 3, Skipped **2**; bảng Line/SKU/Problem có dòng 5 và 6 kèm lỗi; lời nhắc sửa file<br>2. Toast cảnh báo **"3 created, 0 updated, 2 skipped — see the details below"**<br>3. Hộp thoại **không đóng**, hiện bảng **"Import finished"** với nút "Close" và "Import another file"<br>4. Hộp thoại về trạng thái chọn file mới<br>5. Có đúng 3 sản phẩm hợp lệ | High | File: `practices/test-data/csv/csv_mixed_valid_invalid.csv` | Yes | UI | @Regression |
| PARSCA_CSV_TC_008 | M10: CSV | 🔴 High | File thiếu từng cột bắt buộc bị từ chối | V1 đăng nhập | 1. Check file `csv_missing_sku.csv`<br>2. Check file `csv_missing_name.csv`<br>3. Check file `csv_missing_price.csv`<br>4. Check file `csv_missing_stockcount.csv` | 1. Lỗi **"Missing required column(s): sku"**<br>2. **"Missing required column(s): name"**<br>3. **"Missing required column(s): price"**<br>4. **"Missing required column(s): stockCount"**<br>(Không có nút Import hoạt động; không ghi dữ liệu) | High | `practices/test-data/csv/csv_missing_{sku,name,price,stockcount}.csv` | Yes | API | @Regression @Boundary |
| PARSCA_CSV_TC_009 | M10: CSV | 🔴 High | stockCount = 0 bị loại, stockCount = 1 hợp lệ (biên tối thiểu) | V1 đăng nhập | 1. Chọn `csv_stockcount_zero.csv` (dòng 2: `AUTO-CSV-0201` stockCount **0**; dòng 3: `AUTO-CSV-0202` stockCount **1**) → Check file<br>2. Đọc bảng Skipped<br>3. Import | 1. Rows 2, To create 1, Skipped 1<br>2. Dòng 2 SKU `AUTO-CSV-0201` báo lỗi stockCount (tối thiểu 1)<br>3. Chỉ `AUTO-CSV-0202` được tạo | High | File: `practices/test-data/csv/csv_stockcount_zero.csv` | Yes | API | @Boundary @Regression |
| PARSCA_CSV_TC_010 | M10: CSV | 🔴 High | SKU lặp trong cùng file bị loại | V1 đăng nhập | 1. Chọn `csv_dup_sku_in_file.csv` (dòng 2 và dòng 4 cùng SKU `AUTO-CSV-0301`; dòng 3 `AUTO-CSV-0302`) → Check file<br>2. Đọc bảng Skipped | 1. To create 2, Skipped 1<br>2. Dòng 4: **"sku: duplicated in this file (already used on line 2)"** | High | File: `practices/test-data/csv/csv_dup_sku_in_file.csv` | Yes | API | @Regression |
| PARSCA_CSV_TC_011 | M10: CSV | 🔴 High | File không phải .csv (.txt, .xlsx) bị từ chối | V1 đăng nhập | 1. Trong hộp chọn file, quan sát bộ lọc loại file<br>2. Chuyển bộ lọc "All files", chọn `csv_not_csv.txt` → Check file<br>3. Chọn `csv_valid_5_rows.xlsx` → Check file | 1. Hộp chọn file mặc định chỉ hiện `.csv` (accept)<br>2. Lỗi **"Only .csv files are accepted"**<br>3. Lỗi **"Only .csv files are accepted"** | High | `practices/test-data/csv/csv_not_csv.txt`, `practices/test-data/generated/csv_valid_5_rows.xlsx` | Yes | API | @Regression @Security |
| PARSCA_CSV_TC_012 | M10: CSV | 🟡 Medium | File rỗng và file chỉ có tiêu đề bị từ chối | V1 đăng nhập | 1. Check file `csv_empty.csv` (0 byte)<br>2. Check file `csv_header_only.csv` | 1. Lỗi **"The file has no data rows."** (hoặc lỗi thiếu cột — ghi nhận câu chữ thực tế)<br>2. Lỗi **"The file has no data rows."** | Medium | `practices/test-data/csv/csv_empty.csv`, `csv_header_only.csv` | Yes | API | @Boundary @Regression |
| PARSCA_CSV_TC_013 | M10: CSV | 🟡 Medium | Giới hạn 50.000 dòng dữ liệu (BVA) | Đã chạy `generate_fixtures.py`; dùng hậu tố SKU riêng để tránh trùng | 1. Check file `csv_50000_rows.csv`<br>2. Quan sát thời gian chờ và UI<br>3. Check file `csv_50001_rows.csv` | 1. Chạy thử thành công: Rows **50000**, không lỗi giới hạn<br>2. UI giữ trạng thái chờ (có thể vài phút), không treo/timeout phía FE<br>3. Lỗi **"The file has 50001 rows; the limit is 50000 per import. Please split it."**<br>📝 KHÔNG bấm Import thật ở bước 1 trên môi trường dùng chung | Medium | `practices/test-data/generated/csv_50000_rows.csv`, `csv_50001_rows.csv` | Yes | API | @Boundary @NeedDevSupport |
| PARSCA_CSV_TC_014 | M10: CSV | 🟡 Medium | File lớn hơn 20 MB bị từ chối | Đã chạy `generate_fixtures.py` | 1. Chọn `csv_over_20mb.csv` (≈ 20.5 MB, < 50.000 dòng)<br>2. Bấm Check file<br>3. Quan sát Network | 1. FE **không** chặn ở bước chọn file<br>2. BE từ chối; hiển thị thông báo lỗi dung lượng (ghi nhận câu chữ thực tế) [SUY LUẬN]<br>3. Response 4xx (thường 413/400); không ghi dữ liệu | Medium | `practices/test-data/generated/csv_over_20mb.csv` | Yes | API | @Boundary @SuyLuan |
| PARSCA_CSV_TC_015 | M10: CSV | 🟡 Medium | Dòng tiêu đề giả "Column1,Column2,..." ở dòng đầu được bỏ qua | V1 đăng nhập | 1. Chọn `csv_fake_header_column1.csv` (dòng 1 `Column1,Column2,Column3,Column4`; dòng 2 tiêu đề thật; 2 dòng dữ liệu `AUTO-CSV-0401..0402`) → Check file | 1. Rows **2**, To create 2, Skipped 0 (dòng Column1 bị bỏ qua, không báo thiếu cột) | Medium | File: `practices/test-data/csv/csv_fake_header_column1.csv` | Yes | API | @Regression |
| PARSCA_CSV_TC_016 | M10: CSV | 🔴 High | Cột status = draft bị bỏ qua — sản phẩm vẫn Active; cập nhật sản phẩm Draft thành Active | V1 tạo bằng form sản phẩm `AUTO-CSV16-20261020` trạng thái **Draft** | 1. Chọn `csv_status_draft.csv` (dòng 2: SKU mới `AUTO-CSV-0501` status `draft`; dòng 3: SKU `AUTO-CSV16-20261020` status `draft`, price `77`) → Check file → Import<br>2. Kiểm tra trạng thái `AUTO-CSV-0501`<br>3. Kiểm tra trạng thái `AUTO-CSV16-20261020`<br>4. Khách (không đăng nhập) tìm 2 SKU trên website | 1. To create 1, To update 1; toast "1 created, 1 updated"<br>2. Status **Active** (cột status bị bỏ qua)<br>3. ⚠️ THEO CODE HIỆN TẠI [SUY LUẬN]: chuyển **Active** dù trước đó Draft → ghi **Q-V17**, không PASS<br>4. Cả 2 hiện trên website ngay — ghi nhận **Q-V10** | Critical | File: `practices/test-data/csv/csv_status_draft.csv`<br>SKU: `AUTO-CSV-0501`, `AUTO-CSV16-20261020` | Yes | E2E | @CodeHienTai @SuyLuan @CriticalPath |
| PARSCA_CSV_TC_017 | M10: CSV | 🔴 High | Dòng có SKU của vendor khác (V2) bị loại | Biết `${V2_PRODUCT_SKU}`; đã sinh `generated/csv_sku_other_vendor.csv` (1 dòng V2 + 1 dòng hợp lệ `AUTO-CSV-0601`) | 1. V1 chọn file → Check file<br>2. Đọc bảng Skipped<br>3. Import<br>4. V2 mở sản phẩm `${V2_PRODUCT_SKU}` | 1. To create 1, To update **0**, Skipped 1<br>2. Dòng SKU V2: **"sku: this product belongs to another vendor"**<br>3. Toast "1 created, 0 updated, 1 skipped — see the details below"<br>4. Sản phẩm V2 **không đổi**<br>⚠️ THEO CODE HIỆN TẠI: thông báo lộ SKU tồn tại ở vendor khác → ghi **Q-V4** | Critical | `practices/test-data/generated/csv_sku_other_vendor.csv` | Yes | UI | @DataScope @Security @CodeHienTai |
| PARSCA_CSV_TC_018 | M10: CSV | 🔴 High | Dòng có SKU của Admin bị loại | Biết `${ADMIN_PRODUCT_SKU}`; đã sinh `generated/csv_sku_admin.csv` | 1. V1 chọn file → Check file<br>2. Import (nếu có dòng hợp lệ)<br>3. Admin mở sản phẩm `${ADMIN_PRODUCT_SKU}` | 1. Dòng SKU Admin: **"sku: this product belongs to another vendor"**<br>2. Không cập nhật sản phẩm Admin<br>3. Dữ liệu sản phẩm Admin **không đổi**<br>⚠️ THEO CODE HIỆN TẠI → ghi **Q-V4** | Critical | `practices/test-data/generated/csv_sku_admin.csv` | Yes | UI | @DataScope @Security @CodeHienTai |
| PARSCA_CSV_TC_019 | M10: CSV | 🟡 Medium | File xuất từ Excel có BOM và ô có xuống dòng | V1 đăng nhập | 1. Chọn `csv_bom_multiline.csv` (UTF-8 BOM, CRLF; ô description trong ngoặc kép chứa 2 dòng; SKU `AUTO-CSV-0701`) → Check file → Import<br>2. Mở chi tiết `AUTO-CSV-0701` | 1. Không báo thiếu cột `sku` (BOM không dính vào tên cột); To create 1<br>2. Description giữ **xuống dòng**, không bị cắt sang cột khác | Medium | File: `practices/test-data/csv/csv_bom_multiline.csv` | Yes | API | @Regression |
| PARSCA_CSV_TC_020 | M10: CSV | 🟡 Medium | Tên cột không phân biệt hoa thường/dấu cách; cột lạ bị bỏ qua | V1 đăng nhập | 1. Chọn `csv_column_case_unknown.csv` (tiêu đề `SKU, Name ,PRICE,stock_count,Unknown Col`; SKU `AUTO-CSV-0801`) → Check file → Import<br>2. Mở chi tiết `AUTO-CSV-0801` | 1. Nhận đủ 4 cột bắt buộc; To create 1; không lỗi do cột lạ<br>2. Dữ liệu đúng; không có trường "Unknown Col" | Medium | File: `practices/test-data/csv/csv_column_case_unknown.csv` | Yes | API | @Regression |
| PARSCA_CSV_TC_021 | M10: CSV | 🟡 Medium | Cột images ngăn cách bằng dấu gạch đứng, link https giữ nguyên, tối đa 5 ảnh | Link ảnh https công khai truy cập được | 1. Chọn `csv_images_links.csv` (dòng 2 `AUTO-CSV-0901`: 5 link; dòng 3 `AUTO-CSV-0902`: 6 link) → Check file<br>2. Import<br>3. Mở `AUTO-CSV-0901`, kiểm tra URL ảnh trong Network | 1. Dòng 3 bị Skipped hoặc ghi nhận cách xử lý (cắt còn 5) — ghi lại thực tế<br>2. `AUTO-CSV-0901` được tạo<br>3. 5 ảnh; URL **giữ nguyên link https nhà cung cấp** (không phải `/public/uploads/...`) | Medium | File: `practices/test-data/csv/csv_images_links.csv` | Yes | API | @Boundary @Regression |
| PARSCA_CSV_TC_022 | M10: CSV | 🟡 Medium | Slug sinh từ tên và SKU | Đã chạy CSV_TC_004 | 1. Mở chi tiết `AUTO-CSV-0004` (name "Professional Bracket") qua Network `GET /products/admin/:id`<br>2. Mở website công khai bằng slug | 1. Slug = **`professional-bracket-auto-csv-0004`**<br>2. Trang chi tiết công khai mở được (sản phẩm Active) | Medium | SKU: `AUTO-CSV-0004` | Yes | API | @Regression |
| PARSCA_CSV_TC_023 | M10: CSV | 🟡 Medium | Đổi file sau khi chạy thử — kết quả bị xoá, phải chạy thử lại | V1 đăng nhập | 1. Chọn `csv_valid_5_rows.csv` → Check file<br>2. Chọn file khác `csv_mixed_valid_invalid.csv` (không bấm Check file)<br>3. Quan sát kết quả và nút Import<br>4. Bấm Check file | 1. Kết quả Rows 5<br>2. File mới được chọn<br>3. Kết quả chạy thử cũ **biến mất**; không có nút "Import 5 row(s)"<br>4. Kết quả mới của file 2 | Medium | `csv_valid_5_rows.csv`, `csv_mixed_valid_invalid.csv` | Yes | UI | @Regression |
| PARSCA_CSV_TC_024 | M10: CSV | 🟡 Medium | Đóng hộp thoại giữa chừng sau khi chạy thử — không ghi dữ liệu | SKU `AUTO-CSV-1001..1005` chưa tồn tại | 1. Chọn `csv_valid_5_rows_b.csv` → Check file<br>2. Đóng hộp thoại (X / ESC)<br>3. Tìm `AUTO-CSV-100` trong danh sách<br>4. Mở lại Import CSV | 1. Kết quả To create 5<br>2. Hộp thoại đóng<br>3. **"No products."**<br>4. Hộp thoại ở trạng thái ban đầu (không giữ kết quả cũ) | Medium | File: `practices/test-data/csv/csv_valid_5_rows_b.csv` | Yes | UI | @Regression |
| PARSCA_CSV_TC_025 | M10: CSV | 🔴 High | Mất kết nối trong lúc Import — khung vàng cảnh báo, nút Import bị khoá | V1 đăng nhập; DevTools mở | 1. Chọn `csv_valid_5_rows_c.csv` → Check file<br>2. DevTools → Network: chặn request `POST /products/import` (Block request URL) hoặc chọn "Offline"<br>3. Bấm Import<br>4. Bỏ chặn mạng, kiểm tra danh sách sản phẩm | 1. Kết quả To create 5<br>2. –<br>3. Hiện khung vàng **"Connection lost before the server answered…"**, khuyên **không** tải lại file mà kiểm tra danh sách trước; nút Import **bị khoá**<br>4. Ghi nhận số sản phẩm đã/không tạo; không có bản sao | High | File: `practices/test-data/csv/csv_valid_5_rows_c.csv` | Partial | UI | @Regression @NeedDevSupport |
| PARSCA_CSV_TC_026 | M10: CSV | 🟡 Medium | Hết phiên (401) trong lúc Import — thông báo làm mới phiên, không tự gửi lại | Access token TTL ngắn (D-03) hoặc xoá cookie access token trước khi Import | 1. Chọn `csv_valid_5_rows_d.csv` → Check file<br>2. Làm access token hết hạn<br>3. Bấm Import<br>4. Kiểm tra Network số lần gọi `POST /products/import`<br>5. Bấm Import lại | 1. To create 5<br>2. –<br>3. Thông báo phiên đã được làm mới, hãy thử lại<br>4. **Không** tự gửi lại request import<br>5. Import thành công "5 created, 0 updated" | Medium | File: `practices/test-data/csv/csv_valid_5_rows_d.csv` | Partial | UI | @Regression @NeedDevSupport |
| PARSCA_CSV_TC_027 | M10: CSV | 🔴 High | Brand và giá trị xe mới trong file được thêm vào danh mục dùng chung | Brand `AutoBrandCSV20261020`, make `AutoMakeCSV20261020` chưa tồn tại | 1. V1 import `csv_new_brand_vehicle.csv` (SKU `AUTO-CSV-1101`, brand + make/model mới)<br>2. Gọi `GET /product-brands` và `GET /fitment-options` (công khai)<br>3. Khách mở website → bộ lọc Brand và Make<br>4. V1 mở form thêm sản phẩm → ô Brand | 1. Toast "1 created, 0 updated"<br>2. Có `AutoBrandCSV20261020` và `AutoMakeCSV20261020`<br>3. Giá trị mới xuất hiện trong bộ lọc<br>4. Ghi nhận brand mới có trong ô Brand hay không<br>⚠️ **THEO CODE HIỆN TẠI:** vendor gián tiếp sửa danh mục dùng chung (trong khi `POST /product-brands` bị 403) → ghi **Q-V5**, không PASS | High | File: `practices/test-data/csv/csv_new_brand_vehicle.csv`<br>Brand: `AutoBrandCSV20261020` | Yes | E2E | @CodeHienTai @Security |
| PARSCA_CSV_TC_028 | M10: CSV | 🔴 High | Sản phẩm import mang createdBy của vendor; specifications không import được | V1 đăng nhập | 1. Import `csv_extra_columns.csv` (SKU `AUTO-CSV-1201`, có cột `specifications`, `descriptionSections`, `createdBy` = id V2, `metadata.color` = `red`)<br>2. Mở Network chi tiết `AUTO-CSV-1201`<br>3. V2 tìm `AUTO-CSV-1201` trong danh sách của V2 | 1. To create 1 (các cột không hỗ trợ bị bỏ qua)<br>2. `createdBy` = **id V1** (không lấy từ file); **không có** specifications/descriptionSections; có thuộc tính `color: red`<br>3. **"No products."** | High | File: `practices/test-data/csv/csv_extra_columns.csv` | Yes | API | @DataScope @Security @Regression |

---

## TỔNG HỢP AMBIGUITIES ĐÃ GIẢI QUYẾT

| # | Ambiguity | Giải quyết bằng |
|---|-----------|-----------------|
| Q-V4 | Thông báo "this product belongs to another vendor" lộ SKU tồn tại | CSV_TC_017, CSV_TC_018 gắn `@CodeHienTai` |
| Q-V5 | Import thêm brand/xe vào danh mục chung | CSV_TC_027 gắn `@CodeHienTai` |
| Q-V10 | Import luôn Active, không duyệt | CSV_TC_016 bước 4 |
| Q-V17 | Import cập nhật sản phẩm Draft → Active? | CSV_TC_016 bước 3 `@SuyLuan` |
| AMB | Thông báo lỗi > 20 MB chưa có câu chữ | CSV_TC_014 ghi nhận thực tế `@SuyLuan` |
| AMB | Quá 5 ảnh: bỏ dòng hay cắt bớt? | CSV_TC_021 ghi nhận thực tế |
| AMB | File 0 byte báo "no data rows" hay "missing column"? | CSV_TC_012 ghi nhận thực tế |

---

## THỐNG KÊ

| Tiêu chí | Số lượng |
|----------|----------|
| **Tổng TC** | **28** |
| Critical Priority | 5 (CSV_004, 005, 016, 017, 018) |
| High Priority | 12 |
| Medium Priority | 11 |
| Automatable Yes / Partial / No | 26 / 2 / 0 |
| Kỹ thuật BVA | stockCount 0/1, 50.000/50.001 dòng, 20 MB, 5/6 ảnh, 0 dòng |
| Kỹ thuật EP | Loại file (.csv/.txt/.xlsx), chủ sở hữu SKU (mới/của mình/V2/Admin) |
| Kỹ thuật State Transition | Chọn file → Check → Import → Finished; đổi file / đóng / mất mạng / 401 |
| Kỹ thuật Error Guessing | BOM, ô nhiều dòng, header giả Column1, cột lạ, mass assignment `createdBy` |
