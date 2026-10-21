# TEST CASES — PARSCA VENDOR: PHẠM VI DỮ LIỆU (DATA SCOPE)

| Thông tin | Chi tiết |
|-----------|----------|
| **Dự án** | PARSCA — Role Vendor |
| **Module** | SCOPE — Phạm vi dữ liệu theo `createdBy` |
| **URL** | `{FE_URL}/vendor/products`, `/vendor/products/:id`, `/vendor/products/:id/edit` |
| **Requirements** | `practices/requirements/parsca-vendor/02_requirements_access_control_data_scope.md` |
| **Doc nguồn** | 06 (đọc kèm 05, 07, 09, 12) |
| **Phương pháp** | AI-RBT (Risk-Based Testing) — FULL 6 bước |
| **Ngày tạo** | 2026-10-20 |
| **Tổng số TC** | 14 |

> **Chuẩn bị bắt buộc:** V1, V2, Admin mỗi bên có sản phẩm riêng. Ghi lại `V2_PRODUCT_ID`, `V2_PRODUCT_SKU`, `V2_PRODUCT_SLUG`, `ADMIN_PRODUCT_ID`, `ADMIN_PRODUCT_SKU` vào `practices/context/ENV_PREFLIGHT_CHECKLIST.md`.
> Ma trận API 4 vai đầy đủ nằm trong `practices/testcases/api/API_TC_PARSCA_VENDOR.md`.

---

## TỔNG HỢP RISK LEVEL

| Module | Risk Level | Số TC |
|--------|-----------|-------|
| M4: SCOPE — Phạm vi dữ liệu | 🔴 High | 14 |

---

## TRACEABILITY MATRIX

| Requirement | Test Cases |
|------------|------------|
| AC-SCOPE-01 | SCOPE_TC_014 |
| AC-SCOPE-02 | SCOPE_TC_001, SCOPE_TC_002 |
| AC-SCOPE-03 | SCOPE_TC_003, SCOPE_TC_004, SCOPE_TC_005, SCOPE_TC_006, SCOPE_TC_007, SCOPE_TC_010 |
| AC-SCOPE-04 | SCOPE_TC_008, SCOPE_TC_013 |
| AC-SCOPE-05 | SCOPE_TC_013, SCOPE_TC_014 |
| AC-SCOPE-06 | (xem WEB_TC_001, PFORM_TC_045) |
| AC-SCOPE-07 | SCOPE_TC_009, SCOPE_TC_010, SCOPE_TC_011 |
| AC-SCOPE-08 | SCOPE_TC_012 |

---

## BẢNG TEST CASES

### M4: SCOPE — Phạm vi dữ liệu (🔴 High Risk)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_SCOPE_TC_001 | M4: SCOPE | 🔴 High | V1 chỉ thấy sản phẩm của chính V1 trong danh sách | V1 có ≥ 25 sản phẩm; V2 và Admin có sản phẩm riêng; V1 đăng nhập | 1. Mở `/vendor/products`<br>2. Chọn lọc trạng thái "All statuses", Rows per page 50<br>3. Duyệt mọi trang, đối chiếu SKU với danh sách sản phẩm V1 đã chuẩn bị<br>4. DevTools → Network: mở response `GET /products/admin/all` | 1. Danh sách hiển thị<br>2. Hiển thị mọi trạng thái<br>3. **100%** sản phẩm là của V1; không có SKU của V2 / Admin<br>4. Mọi item có `creator.id` = id V1; tổng số = số sản phẩm của V1 | Critical | V1: `${VENDOR1_EMAIL}`<br>SKU V2: `${V2_PRODUCT_SKU}` | Yes | API | @Smoke @DataScope @Security @CriticalPath |
| PARSCA_SCOPE_TC_002 | M4: SCOPE | 🔴 High | V1 không thấy sản phẩm do Admin tạo | Admin có sản phẩm `${ADMIN_PRODUCT_SKU}` (Active) | 1. V1 mở `/vendor/products`, lọc "All statuses"<br>2. Tìm kiếm `${ADMIN_PRODUCT_SKU}`<br>3. Tìm kiếm tên sản phẩm của Admin | 1. Danh sách hiển thị<br>2. **"No products."**<br>3. **"No products."** (dù sản phẩm Admin vẫn hiện trên website công khai) | Critical | SKU Admin: `${ADMIN_PRODUCT_SKU}` | Yes | UI | @DataScope @Security @Regression |
| PARSCA_SCOPE_TC_003 | M4: SCOPE | 🔴 High | V1 mở trang chi tiết sản phẩm của V2 bằng URL trực tiếp | V1 đăng nhập; biết `${V2_PRODUCT_ID}` | 1. Truy cập `{FE_URL}/vendor/products/${V2_PRODUCT_ID}`<br>2. Quan sát nội dung và Network<br>3. Bấm "Back to products" | 1. Trang hiển thị **"Product not found or you do not have permission to view it."**<br>2. `GET /products/admin/${V2_PRODUCT_ID}` trả **404 "Product not found"** (không phải 403); không lộ dữ liệu sản phẩm V2<br>3. Về `/vendor/products` | Critical | id: `${V2_PRODUCT_ID}` | Yes | UI | @Smoke @DataScope @Security @CriticalPath |
| PARSCA_SCOPE_TC_004 | M4: SCOPE | 🔴 High | V1 mở trang sửa sản phẩm của V2 bằng URL trực tiếp | V1 đăng nhập | 1. Truy cập `{FE_URL}/vendor/products/${V2_PRODUCT_ID}/edit`<br>2. Quan sát form | 1. Trang hiển thị "Product not found or you do not have permission to view it."<br>2. **Không** hiển thị form có dữ liệu V2; không có nút Update hoạt động | Critical | id: `${V2_PRODUCT_ID}` | Yes | UI | @DataScope @Security @Regression |
| PARSCA_SCOPE_TC_005 | M4: SCOPE | 🔴 High | V1 gọi PATCH sửa sản phẩm của V2 qua API (IDOR) | Token V1; ghi lại giá trị hiện tại của sản phẩm V2 (bằng Admin) | 1. Gửi `PATCH {API_URL}/products/${V2_PRODUCT_ID}` bằng token V1 body `{"name":"Hacked by V1 20261020","price":1}`<br>2. Gửi `PATCH` body `{"status":"archived"}`<br>3. Admin gọi `GET /products/admin/${V2_PRODUCT_ID}` | 1. **404 "Product not found"**<br>2. **404 "Product not found"**<br>3. Tên, giá, trạng thái sản phẩm V2 **không đổi** | Critical | Body: `{"name":"Hacked by V1 20261020","price":1}` | Yes | API | @DataScope @Security @Regression |
| PARSCA_SCOPE_TC_006 | M4: SCOPE | 🔴 High | V1 gọi DELETE xoá sản phẩm của V2 qua API (IDOR) | Token V1 | 1. Gửi `DELETE {API_URL}/products/${V2_PRODUCT_ID}` bằng token V1<br>2. V2 mở `/vendor/products`, tìm `${V2_PRODUCT_SKU}`<br>3. Gửi `DELETE /products/${ADMIN_PRODUCT_ID}` bằng token V1 | 1. **404 "Product not found"**<br>2. Sản phẩm V2 **vẫn còn**, ảnh vẫn hiển thị<br>3. **404**; sản phẩm Admin vẫn còn | Critical | id V2, id Admin | Yes | API | @DataScope @Security @Regression |
| PARSCA_SCOPE_TC_007 | M4: SCOPE | 🔴 High | V1 truy cập sản phẩm của V2 bằng slug | Biết `${V2_PRODUCT_SLUG}` (lấy từ website công khai) | 1. Gửi `GET {API_URL}/products/admin/${V2_PRODUCT_SLUG}` bằng token V1<br>2. Truy cập `{FE_URL}/vendor/products/${V2_PRODUCT_SLUG}`<br>3. Gửi `GET /products/${V2_PRODUCT_SLUG}` (công khai, không token) | 1. **404 "Product not found"**<br>2. "Product not found or you do not have permission to view it."<br>3. 200 nếu sản phẩm Active (API công khai — đúng thiết kế) | High | slug: `${V2_PRODUCT_SLUG}` | Yes | API | @DataScope @Security @Regression |
| PARSCA_SCOPE_TC_008 | M4: SCOPE | 🔴 High | Vendor truyền tham số vendorName bị bỏ qua | Token V1; biết tên/email V2 | 1. Gửi `GET /products/admin/all?vendorName=<tên V2>` bằng token V1<br>2. Gửi `GET /products/admin/all?vendorName=${VENDOR2_EMAIL}`<br>3. Gửi `GET /products/admin/all?vendorName=` (rỗng) và so sánh với không tham số | 1. Chỉ trả sản phẩm của **V1**<br>2. Chỉ trả sản phẩm của **V1**<br>3. Kết quả giống nhau (tham số không ảnh hưởng) | High | vendorName: tên V2, `${VENDOR2_EMAIL}`, `""` | Yes | API | @DataScope @Security @Regression |
| PARSCA_SCOPE_TC_009 | M4: SCOPE | 🔴 High | Tạo sản phẩm có SKU trùng sản phẩm của V2 — lộ thông tin SKU tồn tại | V1 đăng nhập; `${V2_PRODUCT_SKU}` tồn tại | 1. Mở `/vendor/products/new`, nhập đủ trường bắt buộc với SKU = `${V2_PRODUCT_SKU}`<br>2. Bấm "Add Product"<br>3. Lặp lại với SKU = `${ADMIN_PRODUCT_SKU}` | 1. Form hợp lệ<br>2. **409** toast `Product with SKU "<SKU V2>" already exists`; form giữ nguyên<br>3. 409 cùng dạng<br>⚠️ **THEO CODE HIỆN TẠI:** thông báo xác nhận SKU đã tồn tại ở đâu đó → ghi Bug/Q **Q-V4**, không PASS | High | SKU: `${V2_PRODUCT_SKU}`, `${ADMIN_PRODUCT_SKU}` | Yes | UI | @DataScope @Security @CodeHienTai |
| PARSCA_SCOPE_TC_010 | M4: SCOPE | 🔴 High | Import CSV có SKU của V2 không ghi đè sản phẩm V2 | Tạo file `scope_sku_other_vendor.csv` gồm 1 dòng SKU `${V2_PRODUCT_SKU}`, name `Overwrite Try 20261020`, price `1`, stockCount `5` | 1. V1 mở Import CSV, chọn file, bấm "Check file"<br>2. Bấm Import (nếu có dòng hợp lệ)<br>3. V2 mở sản phẩm `${V2_PRODUCT_SKU}`<br>4. V1 kiểm tra danh sách của mình | 1. Bảng Skipped có dòng: **"sku: this product belongs to another vendor"**; To update = 0<br>2. "Nothing to import" (nút khoá) hoặc 0 updated<br>3. Tên, giá, tồn kho sản phẩm V2 **không đổi**<br>4. Không xuất hiện sản phẩm mới mang SKU V2<br>⚠️ THEO CODE HIỆN TẠI: thông báo lộ việc SKU thuộc vendor khác → ghi **Q-V4** | Critical | File: `practices/test-data/generated/scope_sku_other_vendor.csv` (bản đã thay placeholder từ `practices/test-data/csv/scope_sku_other_vendor.csv`) | Yes | UI | @DataScope @Security @CodeHienTai |
| PARSCA_SCOPE_TC_011 | M4: SCOPE | 🟡 Medium | Import tên sinh slug trùng sản phẩm người khác — lỗi lộ SKU của họ | Biết tên + SKU sản phẩm V2 (import trước đó) | 1. V1 tạo file CSV 1 dòng: SKU mới `AUTO-SCOPE011-20261020`, name trùng tên sản phẩm V2 sao cho slug sinh ra trùng (theo quy tắc tên + SKU, cần SKU tương tự `-<sku>`)<br>2. Check file<br>3. Đọc thông báo lỗi dòng | 1. File hợp lệ về cấu trúc<br>2. Dòng bị Skipped với lỗi trùng slug<br>3. Ghi nhận: thông báo **kèm SKU của sản phẩm kia**<br>⚠️ THEO CODE HIỆN TẠI → ghi **Q-V4** | Medium | SKU: `AUTO-SCOPE011-20261020` | Partial | UI | @DataScope @Security @CodeHienTai |
| PARSCA_SCOPE_TC_012 | M4: SCOPE | 🟡 Medium | Hai vendor (giả định cùng công ty) không chia sẻ sản phẩm | V1, V2 coi như cùng một công ty; `vendorId` của cả hai = null | 1. Gọi `GET /auth/me` cho V1 và V2<br>2. V1 tạo sản phẩm `AUTO-SCOPE012-20261020`<br>3. V2 mở `/vendor/products`, lọc All statuses, tìm `AUTO-SCOPE012-20261020` | 1. Cả hai `vendorId: null` (không có liên kết công ty)<br>2. Tạo thành công<br>3. **"No products."** — V2 không thấy<br>📝 Ghi nhận để PO trả lời **Q-V2** (đúng code; chưa rõ đúng nghiệp vụ) | Medium | SKU: `AUTO-SCOPE012-20261020` | Yes | UI | @DataScope @CodeHienTai |
| PARSCA_SCOPE_TC_013 | M4: SCOPE | 🔴 High | Admin thấy sản phẩm của V1 và V2 kèm cột "Created by" và lọc theo vendor | Admin đăng nhập | 1. Mở danh sách sản phẩm của admin, lọc All statuses<br>2. Quan sát cột "Created by"<br>3. Nhập tên V1 viết HOA vào ô lọc vendor<br>4. Nhập email V2 viết thường vào ô lọc vendor<br>5. Nhập `zz_no_vendor_20261020` | 1. Thấy sản phẩm của V1, V2 và Admin<br>2. Mỗi dòng hiển thị tên người tạo (tên tài khoản; nếu tên rỗng → email; không tìm thấy → "Unknown vendor")<br>3. Chỉ sản phẩm của V1 (không phân biệt hoa thường)<br>4. Chỉ sản phẩm của V2 (khớp email)<br>5. "No products." | High | Tên V1 (HOA), `${VENDOR2_EMAIL}`, `zz_no_vendor_20261020` | Yes | UI | @DataScope @Regression |
| PARSCA_SCOPE_TC_014 | M4: SCOPE | 🔴 High | Sản phẩm mới tạo được gán createdBy là vendor đang đăng nhập | V1 đăng nhập | 1. V1 tạo sản phẩm tối thiểu SKU `AUTO-SCOPE014-20261020`<br>2. Mở Network response của `POST /products`<br>3. Admin xem danh sách, tìm SKU<br>4. V2 tìm SKU trong danh sách của V2 | 1. Toast "Saved"<br>2. `createdBy` = id V1; `creator.name` = tên tài khoản V1<br>3. Cột "Created by" = V1<br>4. "No products." | High | SKU: `AUTO-SCOPE014-20261020`<br>Name: `Auto Scope TC014 20261020` | Yes | API | @DataScope @Regression |

---

## TỔNG HỢP AMBIGUITIES ĐÃ GIẢI QUYẾT

| # | Ambiguity | Giải quyết bằng |
|---|-----------|-----------------|
| AMB-01 (Q-V2) | Vendor cùng công ty không chia sẻ sản phẩm | SCOPE_TC_012 ghi nhận hiện trạng, chờ PO |
| AMB-02 (Q-V4) | Rò rỉ thông tin SKU/slug thuộc người khác | SCOPE_TC_009, 010, 011 gắn `@CodeHienTai` |
| – | Truy cập bằng slug thay vì id | SCOPE_TC_007 |
| – | Tham số `vendorName` rỗng | SCOPE_TC_008 bước 3 |

---

## THỐNG KÊ

| Tiêu chí | Số lượng |
|----------|----------|
| **Tổng TC** | **14** |
| Critical Priority | 7 (SCOPE_001, 002, 003, 004, 005, 006, 010) |
| High Priority | 5 |
| Medium Priority | 2 |
| Kỹ thuật EP | Chủ sở hữu: V1 / V2 / Admin (SCOPE_001–007) |
| Kỹ thuật Decision Table | Hành động (xem/sửa/xoá) × Chủ sở hữu (SCOPE_003–007) |
| Kỹ thuật Error Guessing | Truy cập bằng slug, tham số vendorName, mass assignment qua import |
