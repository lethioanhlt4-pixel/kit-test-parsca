# TÀI LIỆU YÊU CẦU - IMPORT SẢN PHẨM BẰNG CSV (VENDOR)

| Thông tin | Chi tiết |
|-----------|----------|
| Module | CSV (Import sản phẩm bằng CSV) |
| Hệ thống | PARSCA — Marketplace phụ tùng |
| URL | `{FE_URL}/vendor/products` (hộp thoại "Import products from CSV") |
| Endpoint | `GET /products/import/template`, `POST /products/import?dryRun=true`, `POST /products/import` |
| Doc nguồn | `12-import-csv.md` (2.11) — đọc kèm 04, 06, 07, 20 |
| Ngày tạo | 2026-10-20 |

---

## 1. TỔNG QUAN

- Vendor nhập hàng loạt sản phẩm bằng file CSV qua **2 bước**: "Check file" (chạy thử, không ghi) → "Import N row(s)" (ghi thật).
- Khớp theo **SKU**: SKU đã có (của chính vendor) → cập nhật; chưa có → tạo mới với `createdBy` = vendor.
- **Mọi dòng đều thành `active`** (cột `status` bị bỏ qua) → sản phẩm xuất hiện ngay ở website, không qua duyệt.
- Brand và giá trị xe mới trong file được **tự thêm vào danh mục dùng chung** → mâu thuẫn với việc vendor bị 403 ở API quản lý brand/fitment (**Q-V5**).

---

## 2. YÊU CẦU CHỨC NĂNG

### 2.1. Mở hộp thoại & file mẫu

> Là vendor, tôi muốn tải file mẫu để chuẩn bị dữ liệu đúng định dạng.

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-CSV-01 | Nút "Import CSV" ở danh sách sản phẩm mở hộp thoại "Import products from CSV" |
| AC-CSV-02 | Nút "Template" tải file `parsca-products-template.csv` (`GET /products/import/template`) gồm hàng tiêu đề đầy đủ + 1 dòng mẫu |

### 2.2. Kiểm tra file (BE)

> Là chủ hệ thống, tôi muốn chặn file sai định dạng / quá lớn trước khi xử lý.

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-CSV-03 | FE chỉ đặt `accept=.csv`, **không** kiểm tra dung lượng / số dòng / loại file |
| AC-CSV-04 | BE chỉ nhận phần mở rộng `.csv` kèm loại file cho phép → lỗi **"Only .csv files are accepted"** |
| AC-CSV-05 | Tối đa **20 MB**, **1 file** mỗi lần |
| AC-CSV-06 | Tối đa **50.000** dòng dữ liệu → lỗi **"The file has N rows; the limit is 50000 per import. Please split it."** |
| AC-CSV-07 | File phải có dòng dữ liệu → **"The file has no data rows."** |
| AC-CSV-08 | Thiếu cột bắt buộc → **"Missing required column(s): ..."** |
| AC-CSV-09 | Dòng tiêu đề giả `Column1,Column2,...` ở dòng đầu bị bỏ qua; BOM của Excel và ô có xuống dòng (trong ngoặc kép) được xử lý |

### 2.3. Bước 1 — Check file (dry run)

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-CSV-10 | "Check file" gọi `POST /products/import?dryRun=true`, **không ghi gì** |
| AC-CSV-11 | Hiển thị "Validation result — nothing written yet" với các ô **Rows, To create, To update, Skipped** + bảng dòng bỏ qua (Line, SKU, Problem) + lời nhắc sửa file và tải lại |

### 2.4. Bước 2 — Import thật

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-CSV-12 | Nút "Import N row(s)" với N = To create + To update. N = 0 → nút **"Nothing to import"** bị khoá |
| AC-CSV-13 | Đổi file sau khi chạy thử → kết quả chạy thử bị xoá, phải "Check file" lại |
| AC-CSV-14 | Không có dòng lỗi → toast **"&lt;c&gt; created, &lt;u&gt; updated"** và đóng hộp thoại |
| AC-CSV-15 | Có dòng lỗi → giữ bảng **"Import finished"** với nút "Close" và "Import another file"; toast cảnh báo **"&lt;c&gt; created, &lt;u&gt; updated, &lt;f&gt; skipped — see the details below"** |
| AC-CSV-16 | Mất kết nối (không phản hồi, 502/504) → khung vàng **"Connection lost before the server answered…"**, khuyên KHÔNG tải lại file mà kiểm tra danh sách trước; nút Import bị khoá |
| AC-CSV-17 | Hết phiên giữa chừng (401) → thông báo phiên đã được làm mới, hãy thử lại; **không tự gửi lại** |

### 2.5. Quy tắc xử lý dữ liệu

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-CSV-18 | Khớp theo SKU: có → cập nhật, chưa có → tạo mới. Import lại cùng file **không nhân đôi** |
| AC-CSV-19 | Ô trống khi cập nhật **không ghi đè** dữ liệu cũ. Dòng sai chỉ bị báo lỗi, dòng đúng vẫn nhập |
| AC-CSV-20 | SKU trùng trong cùng file bị loại: **"sku: duplicated in this file (already used on line N)"**. Slug sinh từ tên **và** SKU (vd `professional-bracket-mp-0004`) → nhập lại không đổi URL |
| AC-CSV-21 | **Mọi dòng thành `active`** (cột `status` bị bỏ qua). Ảnh link https của nhà cung cấp giữ nguyên, không sao chép; tối đa 5 ảnh/sản phẩm (`images` ngăn cách bằng dấu gạch đứng) |
| AC-CSV-22 | Riêng vendor: dòng có SKU của người khác (kể cả admin) bị loại **"sku: this product belongs to another vendor"**; sản phẩm mới mang `createdBy` của vendor |
| AC-CSV-23 | Sau import, brand và giá trị xe mới được tự thêm vào danh mục dùng chung (bộ lọc brand, Make/Model/Submodel/Engine của website). Lỗi khi thêm chỉ ghi log, không hỏng import — ⚠️ THEO CODE HIỆN TẠI (**Q-V5**) |
| AC-CSV-24 | Tên cột không phân biệt hoa thường, bỏ qua dấu cách/ký tự đặc biệt; cột lạ bị bỏ qua; **không** import được `specifications`, `descriptionSections` |

---

## 3. ĐẶC TẢ TRƯỜNG DỮ LIỆU (CỘT CSV)

### 3.1. Cột bắt buộc

| Cột | Kiểu | Ràng buộc | Ghi chú |
|-----|------|-----------|---------|
| `sku` | string | Bắt buộc, duy nhất toàn hệ thống | Khoá khớp tạo/cập nhật; BE đổi CHỮ HOA |
| `name` | string | Bắt buộc | Dùng sinh slug cùng SKU |
| `price` | number | Bắt buộc, ≥ 0 | – |
| `stockCount` | integer | Bắt buộc, **tối thiểu 1** | 0 → dòng bị Skipped |

### 3.2. Cột tuỳ chọn

| Nhóm | Cột |
|------|-----|
| Giá / mô tả | `compareAtPrice`, `description`, `shortDescription` |
| Ảnh | `image`, `images` (ngăn cách bằng dấu gạch đứng, tối đa 5) |
| Thương hiệu / mã | `brand`, `oemPartNumber`, `alternatePartNumbers` (ngăn cách bằng dấu gạch đứng) |
| Danh mục | `departmentId`, `subcategoryId`, `category`, `categorySlug` |
| Hiển thị | `badgeLabel`, `isNew`, `inStock`, `inStockBadge`, `condition`, `availability`, `rating`, `ratingCount` |
| Xe | `vehicleType`, `make`, `model`, `submodel`, `yearStart`, `yearEnd`, `engine` |
| Khác | `compatibility`, `metadata.<tên>` (thuộc tính tuỳ ý) |
| Bị bỏ qua | `status` (luôn active), `specifications`, `descriptionSections`, cột lạ |

### 3.3. Giới hạn file

| Giới hạn | Giá trị | Phân vùng BVA |
|----------|---------|---------------|
| Dung lượng | 20 MB | 19.9 MB (pass) / 20 MB (biên) / 20.1 MB (fail) |
| Số dòng dữ liệu | 50.000 | 49.999 / 50.000 (pass) / 50.001 (fail) |
| Số dòng tối thiểu | 1 | 0 dòng (chỉ header) → fail |
| Ảnh / sản phẩm | 5 | 5 (pass) / 6 (fail hoặc cắt — cần ghi nhận) |

---

## 4. LUỒNG XỬ LÝ

### 4.1. Luồng chính (Happy path)
1. Vendor mở `/vendor/products` → bấm "Import CSV"
2. (Tuỳ chọn) bấm "Template" tải file mẫu
3. Chọn file `.csv` → bấm "Check file"
4. BE chạy thử → hiển thị Rows / To create / To update / Skipped
5. Bấm "Import N row(s)" → BE ghi thật
6. Không lỗi → toast "c created, u updated" + đóng hộp thoại → danh sách cập nhật

### 4.2. Luồng có dòng lỗi
1. Bước 1–4 như trên, Skipped > 0 → bảng Line / SKU / Problem
2. Bấm Import (nếu N > 0) → bảng "Import finished" + toast cảnh báo "... f skipped — see the details below"
3. Vendor chọn "Close" hoặc "Import another file"

### 4.3. Luồng ngoại lệ
- Đổi file sau Check → kết quả bị xoá → phải Check lại
- Mất mạng / 502 / 504 → khung vàng, nút Import khoá → kiểm tra danh sách trước khi thử lại
- 401 giữa chừng → thông báo làm mới phiên → người dùng tự bấm lại

---

## 5. TỔNG HỢP THÔNG BÁO LỖI

| # | Thông báo | Loại | Điều kiện |
|---|-----------|------|-----------|
| 1 | Only .csv files are accepted | API 400 | Sai phần mở rộng / loại file |
| 2 | The file has N rows; the limit is 50000 per import. Please split it. | API 400 | > 50.000 dòng |
| 3 | The file has no data rows. | API 400 | Rỗng / chỉ header |
| 4 | Missing required column(s): ... | API 400 | Thiếu cột bắt buộc |
| 5 | (413 / lỗi dung lượng) | API | > 20 MB — câu chữ cần ghi nhận khi chạy thật [SUY LUẬN] |
| 6 | sku: duplicated in this file (already used on line N) | Lỗi dòng | SKU lặp trong file |
| 7 | sku: this product belongs to another vendor | Lỗi dòng | SKU của vendor khác / admin |
| 8 | Nothing to import | UI (nút khoá) | N = 0 |
| 9 | &lt;c&gt; created, &lt;u&gt; updated, &lt;f&gt; skipped — see the details below | Toast cảnh báo | Có dòng lỗi |
| 10 | Connection lost before the server answered… | UI khung vàng | Mất kết nối / 502 / 504 |

---

## 6. CẤU TRÚC GIAO DIỆN

```
+-------------------------------------------------------------+
| Import products from CSV                              [X]   |
|-------------------------------------------------------------|
| [Template]   [Choose file: products.csv]   [Check file]     |
|-------------------------------------------------------------|
| Validation result — nothing written yet                     |
| [Rows 5] [To create 5] [To update 0] [Skipped 0]            |
| +---------+---------------+-------------------------------+ |
| | Line    | SKU           | Problem                       | |
| +---------+---------------+-------------------------------+ |
| Fix the file and upload it again.                           |
|-------------------------------------------------------------|
|                          [Cancel]  [Import 5 row(s)]        |
+-------------------------------------------------------------+
```

---

## 7. YÊU CẦU PHI CHỨC NĂNG

| ID | Nội dung |
|----|----------|
| NFR-CSV-01 | Hiệu năng: file lớn (gần 50.000 dòng) có thể mất vài phút — UI phải giữ trạng thái chờ, không timeout phía FE |
| NFR-CSV-02 | Toàn vẹn: import lại cùng file là idempotent (không nhân đôi, không đổi slug) |
| NFR-CSV-03 | Bảo mật: không ghi đè sản phẩm của vendor khác / admin; không nhận `createdBy` từ file |
| NFR-CSV-04 | Độ tin cậy: mất kết nối giữa chừng không khuyến khích gửi lại (tránh ghi đôi) |
| NFR-CSV-05 | Tương thích: hỗ trợ CSV xuất từ Excel (BOM UTF-8, CRLF, ô nhiều dòng) |

---

## 8. CÂU HỎI CẦN LÀM RÕ VỚI PO/USER

| ID | Câu hỏi |
|----|---------|
| Q-V4 | Có chấp nhận rò rỉ thông tin SKU tồn tại qua lỗi "this product belongs to another vendor"? |
| Q-V5 | Vendor có được gián tiếp thêm brand / giá trị xe vào danh mục chung qua import? |
| Q-V10 | Import luôn tạo sản phẩm Active không qua duyệt — có chấp nhận? |
| Q-V17 | Import cập nhật sản phẩm đang Draft/Archived có tự chuyển Active? |
