# TEST CASES — PARSCA VENDOR: DANH SÁCH, CHI TIẾT, TRẠNG THÁI & XOÁ SẢN PHẨM

| Thông tin | Chi tiết |
|-----------|----------|
| **Dự án** | PARSCA — Role Vendor |
| **Module** | PLIST · PDTL · PSTAT |
| **URL** | `{FE_URL}/vendor/products`, `{FE_URL}/vendor/products/:id` |
| **Requirements** | `practices/requirements/parsca-vendor/03_requirements_product_management.md` (mục 2.1, 2.2, 2.4) |
| **Doc nguồn** | 07, 08, 10 (đọc kèm 06, 20) |
| **Phương pháp** | AI-RBT (Risk-Based Testing) — FULL 6 bước |
| **Ngày tạo** | 2026-10-20 |
| **Tổng số TC** | 38 |

> **Dữ liệu chuẩn bị (V1):** ≥ 25 sản phẩm gồm: 15 Active, 6 Draft, 4 Archived; đủ 4 department; ≥ 1 sản phẩm không ảnh (dữ liệu cũ) và ≥ 1 sản phẩm stockCount = 0 (import/dữ liệu cũ); ≥ 1 sản phẩm có Compare at. Dùng `practices/test-data/csv/plist_seed_25_products.csv` để tạo nhanh rồi đổi trạng thái.

---

## TỔNG HỢP RISK LEVEL

| Module | Risk Level | Số TC |
|--------|-----------|-------|
| M7: PSTAT — Đổi trạng thái & xoá | 🔴 High | 11 |
| M5: PLIST — Danh sách sản phẩm | 🟡 Medium | 20 |
| M6: PDTL — Chi tiết sản phẩm | 🟢 Low | 7 |

---

## TRACEABILITY MATRIX

| Requirement | Test Cases |
|------------|------------|
| AC-PLIST-01 | PLIST_TC_001 |
| AC-PLIST-02 | PLIST_TC_002, PLIST_TC_019 |
| AC-PLIST-03 | PLIST_TC_007, PLIST_TC_008, PLIST_TC_009, PLIST_TC_010, PLIST_TC_011, PLIST_TC_017 |
| AC-PLIST-04 | PLIST_TC_006, PLIST_TC_007 |
| AC-PLIST-05 | PLIST_TC_001, PLIST_TC_003, PLIST_TC_004, PLIST_TC_005 |
| AC-PLIST-06 | PLIST_TC_013 |
| AC-PLIST-07 | PLIST_TC_015, PLIST_TC_016, PLIST_TC_017, PLIST_TC_018 |
| AC-PLIST-08 | PLIST_TC_014 |
| AC-PLIST-09 | PLIST_TC_012, PLIST_TC_020 |
| AC-PLIST-10 | PLIST_TC_019 |
| AC-PDTL-01 | PDTL_TC_001, PDTL_TC_002, PDTL_TC_003, PDTL_TC_005 |
| AC-PDTL-02 | PDTL_TC_004 |
| AC-PDTL-03 | PDTL_TC_007 |
| AC-PDTL-04 | PDTL_TC_006 |
| AC-PSTAT-01 | PSTAT_TC_001, PSTAT_TC_002, PSTAT_TC_003, PSTAT_TC_005 |
| AC-PSTAT-02 | PSTAT_TC_004 |
| AC-PSTAT-03 | PSTAT_TC_001 |
| AC-PSTAT-04 | PSTAT_TC_001, PSTAT_TC_002, PSTAT_TC_003 |
| AC-PSTAT-05 | PSTAT_TC_006, PSTAT_TC_007, PSTAT_TC_008, PSTAT_TC_009 |
| AC-PSTAT-06 | PSTAT_TC_006, PSTAT_TC_010 |
| AC-PSTAT-07 | (xem SCOPE_TC_006, API_PROD_TC_017) |
| AC-PSTAT-08 | PSTAT_TC_011 |

---

## BẢNG TEST CASES

### M5: PLIST — Danh sách sản phẩm (🟡 Medium Risk)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_PLIST_TC_001 | M5: PLIST | 🟡 Medium | Danh sách mặc định chỉ hiển thị sản phẩm Active và bố cục đúng | V1 đăng nhập; có sản phẩm Active, Draft, Archived | 1. Bấm menu "Product Catalog"<br>2. Quan sát tiêu đề, mô tả, nút<br>3. Quan sát ô lọc trạng thái và các dòng<br>4. Network: request `GET /products/admin/all` | 1. Mở `/vendor/products`<br>2. Tiêu đề "Product"; mô tả "Manage product visibility, pricing, stock, fitment data, and gallery assets."; nút "Import CSV", "Add product"<br>3. Ô lọc = "Active products"; chỉ có sản phẩm Active (15 sản phẩm); không thấy Draft/Archived<br>4. Tham số có `status=active`, `page=1`, `limit=10`, `sort` = Newest | High | V1: 15 Active / 6 Draft / 4 Archived | Yes | UI | @Smoke @CriticalPath |
| PARSCA_PLIST_TC_002 | M5: PLIST | 🟡 Medium | Bảng của vendor có đúng 7 cột, không có cột "Created by" | V1 đăng nhập | 1. Mở `/vendor/products`<br>2. Đọc tiêu đề các cột<br>3. Kiểm tra khu vực bộ lọc | 1. Bảng hiển thị<br>2. Đúng thứ tự: Product · Category · Price · Stock · Status · Last updated · Actions<br>3. **Không** có cột "Created by" và **không** có ô lọc theo tên người tạo | Medium | – | Yes | UI | @DataScope @Regression |
| PARSCA_PLIST_TC_003 | M5: PLIST | 🟡 Medium | Lọc "Draft products" | V1 có 6 sản phẩm Draft | 1. Chọn ô lọc trạng thái "Draft products"<br>2. Quan sát danh sách và Network | 1. Danh sách nhấp nháy rồi tải lại, về trang 1<br>2. Chỉ 6 sản phẩm Draft; request có `status=draft` | Medium | 6 Draft | Yes | UI | @Regression |
| PARSCA_PLIST_TC_004 | M5: PLIST | 🟡 Medium | Lọc "Archived products" | V1 có 4 sản phẩm Archived | 1. Chọn "Archived products" | 1. Chỉ 4 sản phẩm Archived; request `status=archived` | Medium | 4 Archived | Yes | UI | @Regression |
| PARSCA_PLIST_TC_005 | M5: PLIST | 🟡 Medium | Lọc "All statuses" không gửi tham số status | V1 có 25 sản phẩm | 1. Chọn "All statuses"<br>2. Kiểm tra Network<br>3. Đếm tổng số sản phẩm (đổi Rows per page 30) | 1. Hiển thị mọi trạng thái<br>2. Request **không** có tham số `status`<br>3. Tổng = 25 | Medium | 25 sản phẩm | Yes | UI | @Regression |
| PARSCA_PLIST_TC_006 | M5: PLIST | 🟡 Medium | Lọc department từng nút và "All divisions" | V1 có sản phẩm ở 4 department; lọc "All statuses" | 1. Bấm "marine"<br>2. Bấm "auto"<br>3. Bấm "door"<br>4. Bấm "tools"<br>5. Bấm "All divisions" | 1. Chỉ sản phẩm marine; request `departmentId=marine`<br>2. Chỉ auto<br>3. Chỉ door<br>4. Chỉ tools<br>5. Mọi department; không gửi `departmentId` | Medium | Department: marine, auto, door, tools | Yes | UI | @Regression |
| PARSCA_PLIST_TC_007 | M5: PLIST | 🟡 Medium | Kết hợp lọc department + trạng thái + tìm kiếm | V1 có sản phẩm `AUTO-PLIST-M01` (marine, Draft) và `AUTO-PLIST-A01` (auto, Draft) | 1. Chọn "Draft products"<br>2. Bấm "marine"<br>3. Nhập tìm kiếm `AUTO-PLIST`<br>4. Bấm "auto" | 1-2. Chỉ Draft + marine<br>3. Chỉ `AUTO-PLIST-M01`<br>4. Chỉ `AUTO-PLIST-A01`; từ khoá vẫn giữ | Medium | Search: `AUTO-PLIST` | Yes | UI | @Regression |
| PARSCA_PLIST_TC_008 | M5: PLIST | 🟡 Medium | Tìm kiếm theo SKU | V1 có `AUTO-PLIST-M01` | 1. Nhập `AUTO-PLIST-M01` vào ô "Search by SKU, product name, brand…"<br>2. Xoá từ khoá | 1. Chỉ 1 dòng SKU `AUTO-PLIST-M01`; request có `search=AUTO-PLIST-M01`<br>2. Danh sách trở lại đầy đủ | High | Search: `AUTO-PLIST-M01` | Yes | UI | @Regression |
| PARSCA_PLIST_TC_009 | M5: PLIST | 🟡 Medium | Tìm kiếm theo tên — không phân biệt hoa thường | V1 có sản phẩm tên "Auto Marine Bracket 01" | 1. Tìm `auto marine bracket`<br>2. Tìm `AUTO MARINE BRACKET`<br>3. Tìm `Bracket 01` | 1-3. Mỗi lần đều tìm thấy "Auto Marine Bracket 01" | Medium | `auto marine bracket`, `AUTO MARINE BRACKET`, `Bracket 01` | Yes | UI | @Regression |
| PARSCA_PLIST_TC_010 | M5: PLIST | 🟡 Medium | Tìm kiếm theo brand | V1 có sản phẩm brand "Vevor" (tools) | 1. Tìm `Vevor` | 1. Chỉ các sản phẩm có brand Vevor | Medium | Search: `Vevor` | Yes | UI | @Regression |
| PARSCA_PLIST_TC_011 | M5: PLIST | 🟡 Medium | Tìm kiếm với khoảng trắng, ký tự đặc biệt và XSS | V1 đăng nhập | 1. Tìm `   AUTO-PLIST-M01   `<br>2. Tìm `%_*'"`<br>3. Tìm `<script>alert(1)</script>`<br>4. Tìm `' OR 1=1--` | 1. Ghi nhận: tìm thấy (trim) hoặc rỗng — không lỗi<br>2. "No products." hoặc kết quả hợp lệ; không lỗi 500<br>3. Không popup alert; từ khoá hiển thị dạng text<br>4. "No products."; không lộ lỗi DB | Medium | `   AUTO-PLIST-M01   `, `%_*'"`, `<script>alert(1)</script>`, `' OR 1=1--` | Yes | UI | @Security @Regression |
| PARSCA_PLIST_TC_012 | M5: PLIST | 🟢 Low | Tìm kiếm không có kết quả hiển thị "No products." | V1 đăng nhập | 1. Tìm `zz_not_exist_20261020` | 1. Hiển thị **"No products."** (cùng thông báo với trường hợp chưa có sản phẩm — ghi nhận AMB-24) | Low | `zz_not_exist_20261020` | Yes | UI | @Regression |
| PARSCA_PLIST_TC_013 | M5: PLIST | 🟡 Medium | Sắp xếp phía server: Newest, Price ↑, Price ↓, Name A–Z | V1 có ≥ 10 sản phẩm giá khác nhau; lọc "All statuses" | 1. Quan sát sắp xếp mặc định<br>2. Chọn "Price ↑"<br>3. Chọn "Price ↓"<br>4. Chọn "Name A–Z"<br>5. Bấm vào tiêu đề cột "Price" | 1. "Newest" — sản phẩm tạo gần nhất ở đầu<br>2. Giá tăng dần trên toàn bộ trang (request có `sort` tương ứng)<br>3. Giá giảm dần<br>4. Tên A → Z<br>5. Không sắp xếp (tiêu đề cột không có chức năng) | Medium | – | Yes | UI | @Regression |
| PARSCA_PLIST_TC_014 | M5: PLIST | 🟡 Medium | Bấm dòng mở chi tiết; bấm ô trạng thái / sửa / xoá không mở chi tiết | V1 có sản phẩm `AUTO-PLIST-M01` | 1. Bấm vào ô tên sản phẩm của dòng<br>2. Quay lại; bấm vào ô chọn Status của dòng (không đổi giá trị)<br>3. Bấm nút sửa (✎)<br>4. Quay lại; bấm nút xoá (🗑) rồi đóng hộp thoại<br>5. Tìm checkbox chọn nhiều dòng | 1. Mở `/vendor/products/:id` đúng sản phẩm<br>2. Chỉ mở dropdown, **không** điều hướng<br>3. Mở `/vendor/products/:id/edit`<br>4. Chỉ mở hộp thoại xoá, không điều hướng<br>5. Không có chọn nhiều / thao tác hàng loạt | Medium | – | Yes | UI | @Regression |
| PARSCA_PLIST_TC_015 | M5: PLIST | 🟡 Medium | Phân trang mặc định 10 dòng và chuyển trang | V1 có 25 sản phẩm; lọc "All statuses" | 1. Quan sát số dòng trang 1 và thanh phân trang<br>2. Bấm trang 2<br>3. Bấm trang 3 | 1. 10 dòng; "Rows per page" = 10; có trang 1, 2, 3<br>2. 10 dòng khác trang 1; request `page=2`<br>3. 5 dòng | Medium | 25 sản phẩm | Yes | UI | @Regression |
| PARSCA_PLIST_TC_016 | M5: PLIST | 🟡 Medium | Đổi số dòng mỗi trang 10 / 20 / 30 / 50 | V1 có 25 sản phẩm; "All statuses" | 1. Chọn Rows per page 20<br>2. Chọn 30<br>3. Chọn 50<br>4. API: `GET /products/admin/all?limit=500` | 1. 20 dòng, 2 trang<br>2. 25 dòng; thanh phân trang ẩn (chỉ 1 trang) — ghi nhận không đổi lại được số dòng<br>3. (Nếu còn hiển thị) 25 dòng<br>4. BE trả tối đa **100** dòng | Medium | limit: 20, 30, 50, 500 | Yes | UI | @Regression @Boundary |
| PARSCA_PLIST_TC_017 | M5: PLIST | 🟡 Medium | Đổi bộ lọc / từ khoá khi đang ở trang 2 → về trang 1 | V1 có 25 sản phẩm; đang ở trang 2 | 1. Ở trang 2, đổi lọc "Active products"<br>2. Sang trang 2 lại, chọn "marine"<br>3. Sang trang 2 lại, nhập từ khoá `AUTO`<br>4. Sang trang 2 lại, đổi sort "Price ↑" | 1-4. Mỗi lần đều quay về **trang 1** (request `page=1`) | Medium | – | Yes | UI | @Regression |
| PARSCA_PLIST_TC_018 | M5: PLIST | 🟢 Low | Ẩn thanh phân trang khi tổng ≤ 10 dòng | Lọc cho ra ≤ 10 dòng (vd "Archived products" = 4) | 1. Chọn "Archived products"<br>2. Quan sát cuối bảng | 1. 4 dòng<br>2. Thanh phân trang và ô "Rows per page" **bị ẩn** | Low | 4 Archived | Yes | UI | @Regression @Boundary |
| PARSCA_PLIST_TC_019 | M5: PLIST | 🟡 Medium | Hiển thị giá CAD, tồn kho 0 và sản phẩm không ảnh | Có sản phẩm stockCount 0 (import) và sản phẩm không ảnh (dữ liệu cũ) | 1. Lọc "All statuses", xem cột Price mọi dòng<br>2. Tìm sản phẩm stockCount 0<br>3. Tìm sản phẩm không ảnh<br>4. Xem sản phẩm có tồn kho 12 | 1. Mọi giá có đơn vị **"CAD"**<br>2. Thẻ **"Out of stock · 0 units"**<br>3. Ô ảnh hiển thị **"No image"**<br>4. Thẻ "In stock" + "12 units" | Medium | stockCount: 0, 12 | Partial | UI | @Regression |
| PARSCA_PLIST_TC_020 | M5: PLIST | 🟢 Low | Trạng thái đang tải và lỗi tải danh sách | V1 đăng nhập | 1. DevTools → Network throttling "Slow 3G", tải `/vendor/products`<br>2. DevTools chặn request `/products/admin/all` (Block URL) rồi tải lại | 1. Chỉ hiện biểu tượng quay (không có chữ)<br>2. Hiển thị **"Failed to load products."** | Low | – | Partial | UI | @Regression |

---

### M6: PDTL — Chi tiết sản phẩm (🟢 Low Risk)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_PDTL_TC_001 | M6: PDTL | 🟢 Low | Trang chi tiết hiển thị đầy đủ thông tin sản phẩm | Sản phẩm `AUTO-PDTL-001` của V1: 3 ảnh, giá 129.5, compare at 159, stock 8, có mô tả, thông số, tương thích | 1. Từ danh sách bấm dòng `AUTO-PDTL-001`<br>2. Quan sát phần đầu<br>3. Bấm lần lượt các tab mô tả / thông số / tương thích | 1. Mở `/vendor/products/:id`; Network `GET /products/admin/:id` 200<br>2. Dải 3 ảnh thu nhỏ; SKU `AUTO-PDTL-001`; tên category; tên; mô tả ngắn; giá **"129.5 CAD"** (hoặc 129.50) và **159** gạch ngang; trạng thái tồn kho + 8; nút "Edit product", "Delete"<br>3. Nội dung từng tab đúng dữ liệu đã nhập | Medium | SKU: `AUTO-PDTL-001` | Yes | UI | @Regression |
| PARSCA_PDTL_TC_002 | M6: PDTL | 🟢 Low | Bấm ảnh thu nhỏ để xem ảnh lớn | `AUTO-PDTL-001` có 3 ảnh | 1. Bấm ảnh thu nhỏ thứ 2<br>2. Bấm ảnh thu nhỏ thứ 3 | 1. Ảnh lớn đổi sang ảnh 2<br>2. Ảnh lớn đổi sang ảnh 3 | Low | – | Yes | UI | @Regression |
| PARSCA_PDTL_TC_003 | M6: PDTL | 🟢 Low | Sản phẩm không ảnh và không có giá so sánh | Sản phẩm cũ không ảnh, không compare at | 1. Mở chi tiết sản phẩm đó | 1. Trang không lỗi; khu vực ảnh có placeholder; không hiển thị giá gạch ngang | Low | Sản phẩm dữ liệu cũ | Partial | UI | @Regression |
| PARSCA_PDTL_TC_004 | M6: PDTL | 🟢 Low | Ba huy hiệu đảm bảo cố định viết cứng | Mở chi tiết bất kỳ sản phẩm | 1. Quan sát khu vực huy hiệu<br>2. So sánh với 2 sản phẩm khác (department khác nhau) | 1. Hiển thị **Secure Payment**, **30-day returns**, **2-year warranty**<br>2. Giống hệt nhau mọi sản phẩm<br>⚠️ THEO CODE HIỆN TẠI: nội dung viết cứng, không phải chính sách vendor → ghi **Q-V16** | Low | – | Yes | UI | @CodeHienTai |
| PARSCA_PDTL_TC_005 | M6: PDTL | 🟢 Low | Nút "Edit product" mở đúng sản phẩm | Ở chi tiết `AUTO-PDTL-001` | 1. Bấm "Edit product"<br>2. Kiểm tra dữ liệu form | 1. Mở `/vendor/products/<id AUTO-PDTL-001>/edit`<br>2. Form điền sẵn đúng dữ liệu `AUTO-PDTL-001` | Medium | – | Yes | UI | @Regression |
| PARSCA_PDTL_TC_006 | M6: PDTL | 🟢 Low | Xoá sản phẩm tại trang chi tiết | Sản phẩm `AUTO-PDTL-006` của V1 | 1. Mở chi tiết `AUTO-PDTL-006`, bấm "Delete"<br>2. Xác nhận xoá<br>3. Tìm `AUTO-PDTL-006` ở danh sách (All statuses) | 1. Hộp thoại xác nhận hiện<br>2. Toast **"Product deleted"**, quay về danh sách<br>3. "No products." | Medium | SKU: `AUTO-PDTL-006` | Yes | UI | @Regression |
| PARSCA_PDTL_TC_007 | M6: PDTL | 🟢 Low | Mở chi tiết với id không tồn tại hoặc sai định dạng | V1 đăng nhập | 1. Truy cập `/vendor/products/000000000000000000000000`<br>2. Truy cập `/vendor/products/abc!@#`<br>3. Bấm "Back to products" | 1. "Product not found or you do not have permission to view it."<br>2. Cùng thông báo, không lỗi trắng trang<br>3. Về `/vendor/products` | Low | id: `000000000000000000000000`, `abc!@#` | Yes | UI | @Regression |

---

### M7: PSTAT — Đổi trạng thái & xoá (🔴 High Risk)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_PSTAT_TC_001 | M7: PSTAT | 🔴 High | Đổi Active → Draft: toast, hàng rời bộ lọc, ẩn khỏi website | Sản phẩm `AUTO-PSTAT-001` Active, đang hiện trên website; danh sách lọc "Active products" | 1. Ở dòng `AUTO-PSTAT-001` chọn Status "Draft"<br>2. Quan sát danh sách<br>3. Mở website (tab ẩn danh), tìm `AUTO-PSTAT-001`<br>4. Gọi `GET {API_URL}/products?search=AUTO-PSTAT-001` | 1. `PATCH /products/:id {"status":"draft"}` 200; toast **"Status updated"**; không có hộp thoại xác nhận<br>2. Dòng biến mất khỏi danh sách đang lọc Active<br>3. Không tìm thấy<br>4. Không có trong kết quả | Critical | SKU: `AUTO-PSTAT-001` | Yes | UI | @Smoke @CriticalPath |
| PARSCA_PSTAT_TC_002 | M7: PSTAT | 🔴 High | Đổi Draft → Archived | `AUTO-PSTAT-001` đang Draft; lọc "Draft products" | 1. Chọn Status "Archived"<br>2. Chọn lọc "Archived products"<br>3. Kiểm tra website | 1. Toast "Status updated"; dòng rời bộ lọc Draft<br>2. `AUTO-PSTAT-001` có trong Archived<br>3. Vẫn ẩn (Draft và Archived hiển thị giống nhau) | High | – | Yes | UI | @Regression |
| PARSCA_PSTAT_TC_003 | M7: PSTAT | 🔴 High | Đổi Archived → Active → hiện lại trên website | `AUTO-PSTAT-001` đang Archived | 1. Lọc "Archived products", chọn Status "Active"<br>2. Mở website tìm `AUTO-PSTAT-001` | 1. Toast "Status updated"<br>2. Sản phẩm **hiện lại** (ghi thời điểm nếu có cache) | High | – | Yes | UI | @Regression @CriticalPath |
| PARSCA_PSTAT_TC_004 | M7: PSTAT | 🟡 Medium | Trong lúc đổi trạng thái, ô chọn của mọi hàng bị khoá | Lọc "All statuses"; DevTools throttling "Slow 3G" | 1. Đổi Status dòng 1<br>2. Ngay lập tức thử mở ô Status dòng 2 và dòng 3 | 1. Request PATCH đang chạy<br>2. Ô Status **của tất cả hàng** bị khoá (disabled) đến khi request xong | Medium | – | Partial | UI | @Regression |
| PARSCA_PSTAT_TC_005 | M7: PSTAT | 🟡 Medium | Đổi trạng thái thất bại hiển thị toast lỗi | Lọc "All statuses" | 1. DevTools → Network Offline (hoặc chặn `PATCH /products/*`)<br>2. Đổi Status một dòng Active → Draft<br>3. Bật lại mạng, tải lại trang | 1. –<br>2. Toast **"Update failed"** (hoặc thông báo server)<br>3. Trạng thái vẫn Active | Medium | – | Partial | UI | @Regression |
| PARSCA_PSTAT_TC_006 | M7: PSTAT | 🔴 High | Xoá sản phẩm từ danh sách — xoá vĩnh viễn | Sản phẩm `AUTO-PSTAT-006` (tên "Auto Pstat TC006") của V1, có 1 ảnh riêng | 1. Bấm nút 🗑 ở dòng `AUTO-PSTAT-006`<br>2. Đọc hộp thoại<br>3. Bấm "Delete"<br>4. Gọi `GET /products/admin/<id>` bằng token V1<br>5. Mở URL ảnh cũ (imagePath) | 1. Hộp thoại **"Delete product?"**<br>2. Nội dung: 'This will permanently delete "Auto Pstat TC006". This action cannot be undone.'; có nút "Delete" và X<br>3. `DELETE` **204**; toast **"Deleted 1"**; dòng biến mất<br>4. **404 "Product not found"**<br>5. Ảnh không còn (ảnh không dùng chung bị xoá khỏi kho) | Critical | SKU: `AUTO-PSTAT-006` | Yes | UI | @Smoke @CriticalPath |
| PARSCA_PSTAT_TC_007 | M7: PSTAT | 🟡 Medium | Đóng hộp thoại xoá bằng nút X — không xoá | Có sản phẩm `AUTO-PSTAT-007` | 1. Bấm 🗑<br>2. Bấm X | 1. Hộp thoại hiện<br>2. Hộp thoại đóng; sản phẩm **còn**; không có request DELETE | Medium | – | Yes | UI | @Regression |
| PARSCA_PSTAT_TC_008 | M7: PSTAT | 🟡 Medium | Bấm ra ngoài hộp thoại xoá không đóng được | Có sản phẩm `AUTO-PSTAT-007` | 1. Bấm 🗑<br>2. Bấm vào vùng tối bên ngoài hộp thoại<br>3. Nhấn ESC (ghi nhận) | 1. Hộp thoại hiện<br>2. Hộp thoại **vẫn mở**<br>3. Ghi nhận hành vi ESC; sản phẩm không bị xoá | Low | – | Yes | UI | @Regression |
| PARSCA_PSTAT_TC_009 | M7: PSTAT | 🟡 Medium | Xoá khi lỗi mạng hiển thị "Delete failed" | Có sản phẩm `AUTO-PSTAT-009` | 1. Bấm 🗑<br>2. DevTools Offline<br>3. Bấm "Delete"<br>4. Online, tải lại | 1. –<br>2. –<br>3. Toast **"Delete failed"** (hoặc thông báo server)<br>4. Sản phẩm vẫn còn | Medium | – | Partial | UI | @Regression |
| PARSCA_PSTAT_TC_010 | M7: PSTAT | 🔴 High | Xoá một trong hai sản phẩm dùng chung ảnh — ảnh vẫn còn ở sản phẩm kia | Import `practices/test-data/csv/pstat_shared_image.csv`: 2 sản phẩm `AUTO-PSTAT-010A`, `AUTO-PSTAT-010B` cùng URL ảnh | 1. Xoá `AUTO-PSTAT-010A`<br>2. Mở chi tiết `AUTO-PSTAT-010B`<br>3. Mở `AUTO-PSTAT-010B` trên website | 1. Toast "Deleted 1"<br>2. Ảnh **vẫn hiển thị**<br>3. Ảnh vẫn hiển thị | High | File: `pstat_shared_image.csv` | Partial | UI | @Regression |
| PARSCA_PSTAT_TC_011 | M7: PSTAT | 🟡 Medium | Xoá sản phẩm đã có đơn hàng (Q-V6) | Hiện chưa có đơn thật (Orders là giả lập) | 1. Xác nhận với Dev: có dữ liệu đơn thật tham chiếu sản phẩm không<br>2. Nếu có: xoá sản phẩm đó<br>3. Ghi nhận kết quả | 1. Thường là **không có** → đánh dấu BLOCKED<br>2. Ghi nhận: chặn xoá hay xoá được<br>3. Ghi vào **Q-V6** | Low | – | No | N/A | @CodeHienTai @NeedDevSupport |

---

## TỔNG HỢP AMBIGUITIES ĐÃ GIẢI QUYẾT

| # | Ambiguity | Giải quyết bằng |
|---|-----------|-----------------|
| AMB-04 (Q-V6) | Xoá sản phẩm đã có đơn | PSTAT_TC_011 (BLOCKED đến khi có đơn thật) |
| AMB-16 (Q-V16) | 3 huy hiệu cố định | PDTL_TC_004 `@CodeHienTai` |
| AMB-23 | Không có debounce tìm kiếm | Quan sát Network trong PLIST_TC_008 (ghi số request khi gõ) |
| AMB-24 | "No products." dùng chung | PLIST_TC_012 ghi nhận |
| – | ESC trên hộp thoại xoá | PSTAT_TC_008 bước 3 ghi nhận |
| – | Không đổi lại được số dòng khi chỉ còn 1 trang | PLIST_TC_016 bước 2 ghi nhận |

---

## THỐNG KÊ

| Tiêu chí | Số lượng |
|----------|----------|
| **Tổng TC** | **38** |
| Critical Priority | 2 (PSTAT_001, PSTAT_006) |
| High Priority | 5 (PLIST_001, PLIST_008, PSTAT_002, PSTAT_003, PSTAT_010) |
| Medium Priority | 22 |
| Low Priority | 9 |
| Kỹ thuật EP | Trạng thái lọc (4), department (5), kiểu sắp xếp (4) |
| Kỹ thuật BVA | PLIST_016 (limit 100/500), PLIST_018 (≤ 10 dòng) |
| Kỹ thuật State Transition | PSTAT_001–003 (Active ↔ Draft ↔ Archived), PSTAT_006 (→ Deleted) |
| Kỹ thuật Error Guessing | PLIST_011 (ký tự đặc biệt/XSS), PSTAT_005/009 (mất mạng) |
