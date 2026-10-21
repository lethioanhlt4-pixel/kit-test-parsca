# PVEN-3: Import sản phẩm bằng CSV

| Thuộc tính | Giá trị |
|---|---|
| **Issue Key** | PVEN-3 |
| **Loại** | Story |
| **Trạng thái** | To Do |
| **Độ ưu tiên** | Highest |
| **Người giao** | Unassigned |
| **Người báo** | QA PARSCA (mẫu) |
| **Labels** | vendor, product, import, csv |
| **Components** | Vendor Portal, Products API |
| **Epic** | PVEN-1 |
| **Attachments** | 0 file(s) |
| **Ngày tạo** | 2026-10-20T17:30:00.000+0700 |
| **Cập nhật** | 2026-10-20T17:30:00.000+0700 |

## Mô tả (Description)

Là vendor, tôi muốn nhập hàng loạt sản phẩm bằng file CSV qua 2 bước "Check file" (chạy thử, không ghi) → "Import N row(s)" (ghi thật) để không phải tạo từng sản phẩm bằng tay.

- URL: `{FE_URL}/vendor/products` (hộp thoại "Import products from CSV")
- Endpoint: `GET /products/import/template`, `POST /products/import?dryRun=true`, `POST /products/import`
- Nguồn: `docs/parsca-vendor-test-docs/12-import-csv.md`; `practices/requirements/parsca-vendor/04_requirements_import_csv.md`
- Fixture: `practices/test-data/csv/` (sinh bằng `practices/scripts/generate_fixtures.py`)

Acceptance Criteria:

| ID | Tiêu chí chấp nhận |
| --- | --- |
| AC-CSV-01 | Nút "Import CSV" mở hộp thoại "Import products from CSV" |
| AC-CSV-02 | Nút "Template" tải `parsca-products-template.csv` gồm hàng tiêu đề đầy đủ + 1 dòng mẫu |
| AC-CSV-03 | FE chỉ đặt `accept=.csv`, không kiểm tra dung lượng / số dòng / loại file |
| AC-CSV-04 | BE chỉ nhận `.csv` → "Only .csv files are accepted" |
| AC-CSV-05 | Tối đa 20 MB, 1 file mỗi lần |
| AC-CSV-06 | Tối đa 50.000 dòng → "The file has N rows; the limit is 50000 per import. Please split it." |
| AC-CSV-07 | Không có dòng dữ liệu → "The file has no data rows." |
| AC-CSV-08 | Thiếu cột bắt buộc → "Missing required column(s): ..." |
| AC-CSV-09 | Bỏ qua dòng tiêu đề giả `Column1,Column2,...`; xử lý BOM và ô có xuống dòng |
| AC-CSV-10 | "Check file" gọi `POST /products/import?dryRun=true`, không ghi gì |
| AC-CSV-11 | Hiển thị "Validation result — nothing written yet": Rows, To create, To update, Skipped + bảng Line / SKU / Problem |
| AC-CSV-12 | Nút "Import N row(s)" với N = To create + To update; N = 0 → "Nothing to import" bị khoá |
| AC-CSV-13 | Đổi file sau khi chạy thử → kết quả bị xoá, phải Check lại |
| AC-CSV-14 | Không dòng lỗi → toast "c created, u updated" và đóng hộp thoại |
| AC-CSV-15 | Có dòng lỗi → bảng "Import finished" (nút "Close", "Import another file") + toast "… f skipped — see the details below" |
| AC-CSV-16 | Mất kết nối / 502 / 504 → khung vàng "Connection lost before the server answered…", nút Import khoá |
| AC-CSV-17 | 401 giữa chừng → báo phiên đã làm mới, không tự gửi lại |
| AC-CSV-18 | Khớp theo SKU: có → cập nhật, chưa có → tạo; import lại không nhân đôi |
| AC-CSV-19 | Ô trống khi cập nhật không ghi đè; dòng sai bị báo lỗi, dòng đúng vẫn nhập |
| AC-CSV-20 | SKU trùng trong file → "sku: duplicated in this file (already used on line N)"; slug = tên + SKU |
| AC-CSV-21 | Mọi dòng thành `active` (cột `status` bị bỏ qua); link ảnh https giữ nguyên; tối đa 5 ảnh |
| AC-CSV-22 | SKU của người khác (kể cả admin) → "sku: this product belongs to another vendor"; sản phẩm mới mang `createdBy` của vendor |
| AC-CSV-23 | Brand và giá trị xe mới tự thêm vào danh mục dùng chung — ⚠️ THEO CODE HIỆN TẠI (Q-V5) |
| AC-CSV-24 | Tên cột không phân biệt hoa thường / dấu cách; cột lạ bị bỏ qua; không import `specifications`, `descriptionSections` |

### Cột CSV

| Cột | Kiểu | Bắt buộc | Ràng buộc |
| --- | --- | --- | --- |
| sku | string | Có | Duy nhất toàn hệ thống, BE đổi CHỮ HOA |
| name | string | Có | Dùng sinh slug cùng SKU |
| price | number | Có | ≥ 0 |
| stockCount | integer | Có | Tối thiểu 1 (0 → Skipped) |
| compareAtPrice, description, brand, departmentId, images, make, model… | – | Không | Xem mục 3.2 của requirement 04 |
| status, specifications, descriptionSections | – | – | Bị bỏ qua |

## LUỒNG XỬ LÝ

1. Vendor mở `/vendor/products` → bấm "Import CSV"
2. (Tuỳ chọn) bấm "Template" tải file mẫu
3. Chọn file `.csv` → bấm "Check file" → xem Rows / To create / To update / Skipped
4. Bấm "Import N row(s)" → BE ghi thật
5. Không lỗi → toast + đóng hộp thoại; có lỗi → bảng "Import finished"

## Câu hỏi mở

| ID | Câu hỏi |
| --- | --- |
| Q-V4 | Có chấp nhận rò rỉ thông tin SKU/slug của người khác qua lỗi import? |
| Q-V5 | Vendor có quyền sửa danh mục dùng chung (brand, giá trị xe)? |
| Q-V17 | Import CSV cập nhật sản phẩm đang Draft/Archived → có tự chuyển Active? |

## Attachments (0 file)

Không có. Bố cục hộp thoại xem mục "CẤU TRÚC GIAO DIỆN" trong `practices/requirements/parsca-vendor/04_requirements_import_csv.md`.
