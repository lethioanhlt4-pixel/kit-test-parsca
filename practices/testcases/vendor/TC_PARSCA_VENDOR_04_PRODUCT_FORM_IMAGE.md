# TEST CASES — PARSCA VENDOR: THÊM / SỬA SẢN PHẨM & UPLOAD ẢNH

| Thông tin | Chi tiết |
|-----------|----------|
| **Dự án** | PARSCA — Role Vendor |
| **Module** | PFORM (Thêm/Sửa sản phẩm) · IMG (Upload ảnh) |
| **URL** | `{FE_URL}/vendor/products/new`, `{FE_URL}/vendor/products/:id/edit` |
| **Requirements** | `practices/requirements/parsca-vendor/03_requirements_product_management.md` (mục 2.3, 2.5, 3) |
| **Doc nguồn** | 09, 11 (đọc kèm 05, 06, 20) |
| **Phương pháp** | AI-RBT (Risk-Based Testing) — FULL 6 bước + Field-Level Validation |
| **Ngày tạo** | 2026-10-20 |
| **Tổng số TC** | 60 |

> **Fixture ảnh:** sinh bằng `python3 practices/scripts/generate_fixtures.py` → thư mục `practices/test-data/generated/` (img_ok_200kb.png, img_ok.jpg, img_ok.webp, img_ok.gif, img_exact_10mib.png, img_10mb_decimal.png, img_11mb.png, img_vector.svg, img_photo.heic, doc_sample.pdf, fake_image_text.png).
> **Dữ liệu tối thiểu hợp lệ (dùng lại nhiều TC):** Name `Auto Pform TC<nn> 20261020` · SKU `AUTO-PFORM<nn>-20261020` · Price `49.99` · Department `marine` · Subcategory: mục đầu tiên của marine · 1 ảnh `img_ok_200kb.png` · Stock count `5`.

---

## TỔNG HỢP RISK LEVEL

| Module | Risk Level | Số TC |
|--------|-----------|-------|
| M8: PFORM — Thêm / sửa sản phẩm | 🔴 High | 52 |
| M9: IMG — Upload ảnh sản phẩm (API) | 🟡 Medium | 8 |

### Danh sách trường (Field Inventory) → TC validation

| # | Trường | Loại | Positive TC | Negative / Boundary TC |
|---|--------|------|-------------|------------------------|
| 1 | Name | Text | PFORM_003, 004 | PFORM_002, 005, 006, 007 |
| 2 | SKU | Text | PFORM_003, 009 | PFORM_002, 008, 010, SCOPE_009 |
| 3 | Price | Number/Currency | PFORM_013 | PFORM_011, 012, 014 |
| 4 | Compare at | Number/Currency | PFORM_004 | PFORM_015, 016 |
| 5 | Brand | Dropdown (API) | PFORM_017, 018 | PFORM_051 |
| 6 | Department | Dropdown | PFORM_001, 019 | PFORM_020, 021 |
| 7 | Subcategory | Dropdown phụ thuộc | PFORM_019 | PFORM_002, 020, 052 |
| 8 | Gallery | File Upload | PFORM_022, 023, 028 | PFORM_024, 025, 026, 027, 029, 030, 031 |
| 9 | Status | Dropdown | PFORM_045 | API_PROD_TC_011 |
| 10 | New | Checkbox | PFORM_049 | PFORM_049 |
| 11 | In stock | Checkbox | PFORM_001 | PFORM_043 |
| 12 | Condition / Availability | Dropdown | PFORM_035 | PFORM_035 |
| 13 | Rating | Range/Number | PFORM_034 | PFORM_034, 044 |
| 14 | Stock count | Number | PFORM_032 | PFORM_002, 032, 033 |
| 15 | Alternate part numbers | Tag input | PFORM_037 | PFORM_037 |
| 16 | Make/Model/Submodel/Engine | Dropdown (API) | PFORM_038 | PFORM_038 |
| 17 | Year start / end | Number / Range | PFORM_038 | PFORM_036, 039 |
| 18 | Detailed Description | Rich Text | PFORM_004 | PFORM_040, 042 |
| 19 | Specifications / Compatibility | Label-Value | PFORM_004 | PFORM_041 |

---

## TRACEABILITY MATRIX

| Requirement | Test Cases |
|------------|------------|
| AC-PFORM-01 | PFORM_TC_001, PFORM_TC_046, PFORM_TC_050 |
| AC-PFORM-02 | PFORM_TC_003, PFORM_TC_004, PFORM_TC_050, PFORM_TC_051 |
| AC-PFORM-03 | PFORM_TC_003 |
| AC-PFORM-04 | PFORM_TC_002, PFORM_TC_005, PFORM_TC_006, PFORM_TC_007 |
| AC-PFORM-05 | PFORM_TC_002, PFORM_TC_008, PFORM_TC_009, PFORM_TC_010 |
| AC-PFORM-06 | PFORM_TC_001, PFORM_TC_011, PFORM_TC_012, PFORM_TC_013, PFORM_TC_014 |
| AC-PFORM-07 | PFORM_TC_015, PFORM_TC_016 |
| AC-PFORM-08 | PFORM_TC_001, PFORM_TC_017, PFORM_TC_018 |
| AC-PFORM-09 | PFORM_TC_001, PFORM_TC_002, PFORM_TC_019, PFORM_TC_020, PFORM_TC_021, PFORM_TC_052 |
| AC-PFORM-10 | PFORM_TC_002, PFORM_TC_022 → PFORM_TC_031, PFORM_TC_047 |
| AC-PFORM-11 | PFORM_TC_001, PFORM_TC_045 |
| AC-PFORM-12 | PFORM_TC_049 |
| AC-PFORM-13 | PFORM_TC_001, PFORM_TC_043 |
| AC-PFORM-14 | PFORM_TC_034, PFORM_TC_035, PFORM_TC_044 |
| AC-PFORM-15 | PFORM_TC_002, PFORM_TC_032, PFORM_TC_033 |
| AC-PFORM-16 | PFORM_TC_004, PFORM_TC_037 |
| AC-PFORM-17 | PFORM_TC_021, PFORM_TC_036, PFORM_TC_038, PFORM_TC_039 |
| AC-PFORM-18 | PFORM_TC_004, PFORM_TC_040, PFORM_TC_041, PFORM_TC_042 |
| AC-PFORM-19 | PFORM_TC_007, PFORM_TC_010, PFORM_TC_048 |
| AC-PFORM-20 | PFORM_TC_014, PFORM_TC_016, PFORM_TC_034, PFORM_TC_039 |
| AC-IMG-01 | IMG_TC_001 |
| AC-IMG-02 | IMG_TC_001, IMG_TC_004, IMG_TC_005, IMG_TC_006 |
| AC-IMG-03 | IMG_TC_002, IMG_TC_003, IMG_TC_004 |
| AC-IMG-04 | IMG_TC_007 |
| AC-IMG-05 | IMG_TC_008 |
| NFR-PROD-01 | PFORM_TC_006, PFORM_TC_042 |
| NFR-PROD-02 | PFORM_TC_050 |

---

## BẢNG TEST CASES

### M8: PFORM — Thêm / sửa sản phẩm (🔴 High Risk)

#### M8.1 — Chung & luồng chính

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_PFORM_TC_001 | M8: PFORM | 🔴 High | Form thêm sản phẩm hiển thị đúng giá trị mặc định | V1 đăng nhập | 1. Ở `/vendor/products` bấm "Add product"<br>2. Quan sát phần (a), (b), (d)<br>3. Quan sát nút | 1. Mở `/vendor/products/new`<br>2. Price = 0; Department = **marine**; Brand = **Parsca Marine**; Status = **Active**; "In stock" bật; Availability = **In Stock**; Stock count = 0; **không** có checkbox "New"<br>3. Nút "Cancel" và **"Add Product"** | High | – | Yes | UI | @Regression |
| PARSCA_PFORM_TC_002 | M8: PFORM | 🔴 High | Gửi form rỗng hiển thị đúng các lỗi bắt buộc | Form tạo mới, không nhập gì | 1. Bấm "Add Product" | 1. Không gửi request; hiển thị: **Name required**, **SKU required**, **Subcategory required**, **At least one image is required**, **Stock count must be at least 1**; **không** báo lỗi Price (mặc định 0 hợp lệ) | High | Form rỗng | Yes | UI | @Regression |
| PARSCA_PFORM_TC_003 | M8: PFORM | 🔴 High | Tạo sản phẩm tối thiểu thành công | V1 đăng nhập; có `img_ok_200kb.png` | 1. Mở form tạo<br>2. Nhập Name `Auto Pform TC03 20261020`, SKU `AUTO-PFORM03-20261020`, Price `49.99`<br>3. Department marine, chọn Subcategory đầu tiên<br>4. Upload `img_ok_200kb.png`<br>5. Stock count `5`<br>6. Bấm "Add Product"<br>7. Mở Network response `POST /products` | 1-5. Không có lỗi inline; bộ đếm "1/5 images"<br>6. Nút hiện trạng thái đang lưu; toast **"Saved"**; về `/vendor/products`; sản phẩm ở đầu danh sách (Newest)<br>7. **201**; `createdBy` = V1; `isNew: true`; `inStock: true`; `status: "active"`; `sku: "AUTO-PFORM03-20261020"` | Critical | Name: `Auto Pform TC03 20261020`<br>SKU: `AUTO-PFORM03-20261020`<br>Price: `49.99`<br>Stock: `5` | Yes | UI | @Smoke @CriticalPath |
| PARSCA_PFORM_TC_004 | M8: PFORM | 🔴 High | Tạo sản phẩm đầy đủ mọi trường rồi mở lại đối chiếu | V1; có 3 ảnh hợp lệ | 1. Nhập: Name `Auto Pform TC04 20261020`, SKU `AUTO-PFORM04-20261020`, Price `129.5`, Compare at `159`, Brand khác mặc định, Department auto + Subcategory, 3 ảnh, Status Active, Condition OEM, Availability On Backorder, Rating 4.5, Stock 12, OEM `OEM-4410`, Alternate `ALT-01`, `ALT-02`, Compatible model Make/Model/Submodel/Engine + Year 2015–2020, Material `Stainless 316`, Short Description, 2 khối Detailed Description (có danh sách, gạch chân, căn lề), 2 dòng Specifications, 2 dòng Compatibility (BOAT TYPE, HULL TYPE)<br>2. Bấm "Add Product"<br>3. Mở trang sửa sản phẩm vừa tạo | 1. Không lỗi inline<br>2. Toast "Saved"<br>3. **Mọi giá trị** khớp dữ liệu đã nhập (thứ tự ảnh, alternate part numbers, định dạng rich text, specs, compatibility, material); checkbox "New" hiện và được tick | High | Xem bước 1 | Partial | UI | @Regression @CriticalPath |

#### M8.2 — (a) Thông tin nhận diện

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_PFORM_TC_005 | M8: PFORM | 🔴 High | Name chỉ có khoảng trắng bị báo lỗi; khoảng trắng 2 đầu bị cắt khi lưu | Form tạo, các trường khác hợp lệ | 1. Nhập Name `     ` (5 dấu cách)<br>2. Nhập Name `   Auto Pform TC05 20261020   `, gửi form<br>3. Mở lại trang sửa | 1. Lỗi **"Name required"**<br>2. Toast "Saved"<br>3. Name = `Auto Pform TC05 20261020` (không còn khoảng trắng 2 đầu) | High | `     `, `   Auto Pform TC05 20261020   ` | Yes | UI | @Regression @Boundary |
| PARSCA_PFORM_TC_006 | M8: PFORM | 🔴 High | Name chứa HTML/script không bị thực thi | Form tạo | 1. Nhập Name `<script>alert('pform06')</script><b>Bold</b>`, SKU `AUTO-PFORM06-20261020`, các trường khác hợp lệ, Status Active, gửi<br>2. Mở danh sách, chi tiết<br>3. Mở trang sản phẩm trên website | 1. Lưu thành công (hoặc bị từ chối rõ ràng)<br>2. Tên hiển thị dạng **text thuần**; **không** popup alert<br>3. Không popup alert; HTML không render | Critical | Name: `<script>alert('pform06')</script><b>Bold</b>` | Yes | UI | @Security @Regression |
| PARSCA_PFORM_TC_007 | M8: PFORM | 🟡 Medium | Name tiếng Việt, emoji, chỉ ký tự đặc biệt / không Latin — kiểm tra slug | Form tạo | 1. Name `Phụ tùng Ổ khoá Ướt 😀`, SKU `AUTO-PFORM07A-20261020` → gửi<br>2. Name `@@@###`, SKU `AUTO-PFORM07B-20261020` → gửi<br>3. Name `船用支架`, SKU `AUTO-PFORM07C-20261020` → gửi<br>4. Xem slug trong response | 1. Lưu được; tên hiển thị đúng dấu và emoji<br>2-3. **[SUY LUẬN]** slug có thể rỗng → lưu lỗi. Ghi nhận: lưu được với slug hợp lệ / lỗi rõ ràng / lỗi 500 (bug)<br>4. Slug không rỗng, không trùng | Medium | 3 tên như bước 1–3 | Partial | UI | @SuyLuan @Boundary |
| PARSCA_PFORM_TC_008 | M8: PFORM | 🔴 High | SKU không cho gõ dấu cách | Form tạo | 1. Gõ vào SKU: `AUTO PFORM 08`<br>2. Dán (Ctrl+V) chuỗi `AUTO PFORM 08` | 1. Dấu cách không được nhập (ô hiển thị `AUTOPFORM08`)<br>2. Ghi nhận: dấu cách bị loại bỏ hoặc báo lỗi — không lưu SKU có dấu cách | High | `AUTO PFORM 08` | Yes | UI | @Regression @Boundary |
| PARSCA_PFORM_TC_009 | M8: PFORM | 🟡 Medium | SKU chữ thường được lưu thành CHỮ HOA | Form tạo | 1. Nhập SKU `auto-pform09-20261020`, các trường khác hợp lệ, gửi<br>2. Xem danh sách và response | 1. Toast "Saved"<br>2. SKU = **`AUTO-PFORM09-20261020`** | Medium | SKU: `auto-pform09-20261020` | Yes | UI | @Regression |
| PARSCA_PFORM_TC_010 | M8: PFORM | 🔴 High | SKU trùng sản phẩm của chính vendor bị 409 | V1 đã có `AUTO-PFORM03-20261020` | 1. Tạo sản phẩm mới với SKU `auto-pform03-20261020` (chữ thường)<br>2. Bấm "Add Product" | 1. –<br>2. Toast **`Product with SKU "AUTO-PFORM03-20261020" already exists`**; form giữ nguyên dữ liệu đã nhập | High | SKU: `auto-pform03-20261020` | Yes | UI | @Regression |
| PARSCA_PFORM_TC_011 | M8: PFORM | 🟡 Medium | Price không nhận chữ cái / chuỗi dán | Form tạo | 1. Gõ `abc` vào Price<br>2. Dán `12abc`<br>3. Dán `1,000` | 1. Không nhập được chữ<br>2. Chỉ giữ chữ số hoặc báo lỗi<br>3. Dấu phẩy không được chấp nhận | Medium | `abc`, `12abc`, `1,000` | Yes | UI | @Regression @Boundary |
| PARSCA_PFORM_TC_012 | M8: PFORM | 🟡 Medium | Price: hai dấu chấm và số chữ số thập phân (BVA 4/5) | Form tạo | 1. Gõ `12.5.3`<br>2. Gõ `12.1234` (4 thập phân), gửi form hợp lệ<br>3. Gõ `12.12345` (5 thập phân) | 1. Chỉ một dấu chấm được giữ<br>2. Lưu thành công, giá 12.1234<br>3. Chữ số thứ 5 không nhập được hoặc báo lỗi | Medium | `12.5.3`, `12.1234`, `12.12345` | Yes | UI | @Boundary @Regression |
| PARSCA_PFORM_TC_013 | M8: PFORM | 🟡 Medium | Price để trống báo lỗi; Price 0 hợp lệ | Form tạo, trường khác hợp lệ | 1. Xoá Price, rời ô<br>2. Nhập `0`, gửi form (SKU `AUTO-PFORM13-20261020`) | 1. Lỗi **"Price required"**<br>2. Lưu thành công, giá 0 CAD | Medium | `""`, `0` | Yes | UI | @Boundary @Regression |
| PARSCA_PFORM_TC_014 | M8: PFORM | 🟡 Medium | Price âm bị báo lỗi | Form tạo | 1. Dán `-5` vào Price<br>2. API: `POST /products` với `price: -5` | 1. Lỗi **"Price must be 0 or greater"** (hoặc không nhập được dấu "-")<br>2. **400** | Medium | `-5` | Yes | UI | @Boundary @Regression |
| PARSCA_PFORM_TC_015 | M8: PFORM | 🟡 Medium | Compare at nhỏ hơn Price vẫn lưu được | Form tạo | 1. Price `100`, Compare at `50`, SKU `AUTO-PFORM15-20261020`, gửi<br>2. Mở chi tiết và website | 1. Toast "Saved" (không kiểm tra)<br>2. Giá gạch ngang 50 nhỏ hơn giá bán 100<br>⚠️ THEO CODE HIỆN TẠI → ghi **Q-V15**, không PASS | Medium | Price `100`, Compare at `50` | Yes | UI | @CodeHienTai |
| PARSCA_PFORM_TC_016 | M8: PFORM | 🟡 Medium | Compare at âm bị từ chối; để trống hợp lệ | Form tạo | 1. Dán `-1` vào Compare at<br>2. Để trống Compare at, gửi form hợp lệ (SKU `AUTO-PFORM16-20261020`) | 1. Báo lỗi / không nhập được; API `compareAtPrice: -1` → 400<br>2. Lưu thành công, không hiển thị giá gạch | Low | `-1`, `""` | Yes | UI | @Boundary |
| PARSCA_PFORM_TC_017 | M8: PFORM | 🟡 Medium | Brand mặc định theo department và đặt lại khi đổi department | Form tạo | 1. Quan sát Brand khi Department = marine<br>2. Đổi sang auto<br>3. Đổi sang door<br>4. Đổi sang tools<br>5. Chọn Brand khác rồi đổi về marine | 1. **Parsca Marine**<br>2. **Parsca**<br>3. **Parsca**<br>4. **Vevor**<br>5. Brand đặt lại **Parsca Marine** | Medium | Department: marine/auto/door/tools | Yes | UI | @Regression |
| PARSCA_PFORM_TC_018 | M8: PFORM | 🟢 Low | Danh sách Brand lấy từ API công khai; để trống dùng mặc định | Form tạo | 1. Mở ô Brand, đối chiếu với `GET /product-brands`<br>2. Xoá Brand (để trống), Department tools, gửi form hợp lệ (SKU `AUTO-PFORM18-20261020`)<br>3. Xem response | 1. Danh sách khớp API công khai<br>2. Lưu thành công<br>3. `brand: "Vevor"` | Low | – | Yes | UI | @Regression |

#### M8.3 — (b) Phân loại

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_PFORM_TC_019 | M8: PFORM | 🟡 Medium | Subcategory phụ thuộc department và tự điền category / categorySlug | Form tạo | 1. Department marine, mở Subcategory, ghi danh sách<br>2. Đổi auto, mở Subcategory<br>3. Chọn một subcategory, gửi form hợp lệ (SKU `AUTO-PFORM19-20261020`)<br>4. Xem request body | 1. Danh sách subcategory của marine<br>2. Danh sách khác, của auto<br>3. Lưu thành công<br>4. `category` = tên hiển thị subcategory (theo ngôn ngữ), `categorySlug` = mã subcategory | Medium | – | Yes | UI | @Regression |
| PARSCA_PFORM_TC_020 | M8: PFORM | 🟡 Medium | Đổi department xoá subcategory đã chọn | Form tạo, đã chọn marine + subcategory | 1. Đổi Department sang door<br>2. Bấm "Add Product" | 1. Subcategory bị xoá (trống)<br>2. Lỗi **"Subcategory required"** | Medium | – | Yes | UI | @Regression |
| PARSCA_PFORM_TC_021 | M8: PFORM | 🟡 Medium | Đổi sang department không có xe ẩn ô Compatible model nhưng giá trị cũ vẫn gửi | Form tạo, marine, đã chọn Make/Model + Year 2015–2020 | 1. Đổi Department sang tools<br>2. Chọn subcategory tools, điền đủ, gửi (SKU `AUTO-PFORM21-20261020`)<br>3. Xem request body và mở lại trang sửa | 1. Ô Compatible model **ẩn**<br>2. Lưu thành công<br>3. **[SUY LUẬN]** body vẫn chứa dữ liệu xe cũ. Ghi nhận thực tế | Medium | Make/Model + 2015–2020 | Partial | UI | @SuyLuan |

#### M8.4 — (c) Gallery ảnh

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_PFORM_TC_022 | M8: PFORM | 🔴 High | Upload 1 ảnh hợp lệ — trở thành ảnh bìa | Form tạo | 1. Chọn `img_ok_200kb.png`<br>2. Quan sát bộ đếm và nhãn | 1. Network `POST /products/upload` 200/201 trả `imagePath`<br>2. "**1/5 images**"; ảnh là cover; có nút "Remove image" | High | `img_ok_200kb.png` | Yes | UI | @Regression |
| PARSCA_PFORM_TC_023 | M8: PFORM | 🔴 High | Upload 5 ảnh cùng lúc (biên trên) | Form tạo | 1. Chọn cùng lúc 5 file: png, jpg, webp, gif, png | 1. Upload **lần lượt** từng ảnh; "5/5 images"; ảnh 1 là cover; ảnh 2–5 có "Make cover image" | High | 5 file hợp lệ | Yes | UI | @Boundary @Regression |
| PARSCA_PFORM_TC_024 | M8: PFORM | 🔴 High | Chọn 6 ảnh cùng lúc — bỏ phần dư | Form tạo | 1. Chọn cùng lúc 6 file hợp lệ<br>2. Đã có 3 ảnh, chọn thêm 3 ảnh | 1. Chỉ 5 ảnh được upload; báo **"A product can have at most 5 images"**; "5/5 images"<br>2. Chỉ 2 ảnh được thêm; cùng thông báo | High | 6 file hợp lệ | Yes | UI | @Boundary @Regression |
| PARSCA_PFORM_TC_025 | M8: PFORM | 🟡 Medium | Ảnh SVG / HEIC bị từ chối | Form tạo | 1. Chọn `img_vector.svg`<br>2. Chọn `img_photo.heic` | 1. Toast **"img_vector.svg: Only image uploads are allowed"**; không thêm vào gallery<br>2. Toast "img_photo.heic: …" tương tự | Medium | `img_vector.svg`, `img_photo.heic` | Yes | UI | @Regression |
| PARSCA_PFORM_TC_026 | M8: PFORM | 🟡 Medium | Ảnh lớn hơn 10 MB báo lỗi sau khi upload | Form tạo | 1. Chọn `img_11mb.png`<br>2. Quan sát thời điểm hiện lỗi | 1. Toast "img_11mb.png: <lỗi dung lượng>"; không thêm vào gallery<br>2. Lỗi chỉ hiện **sau** khi upload (FE không chặn trước) | Medium | `img_11mb.png` | Yes | UI | @Boundary @Regression |
| PARSCA_PFORM_TC_027 | M8: PFORM | 🟡 Medium | Một ảnh lỗi trong nhiều ảnh — các ảnh khác vẫn lên | Form tạo | 1. Chọn cùng lúc `img_ok_200kb.png`, `img_vector.svg`, `img_ok.jpg` | 1. Toast lỗi cho `img_vector.svg`; 2 ảnh hợp lệ lên; "2/5 images" | Medium | 3 file | Yes | UI | @Regression |
| PARSCA_PFORM_TC_028 | M8: PFORM | 🟢 Low | "Make cover image" đưa ảnh lên đầu | Gallery có 3 ảnh A, B, C | 1. Bấm "Make cover image" ở ảnh C<br>2. Lưu, mở lại trang sửa và trang chi tiết | 1. Thứ tự C, A, B; C là cover<br>2. Thứ tự được giữ; ảnh lớn đầu tiên là C | Low | – | Yes | UI | @Regression |
| PARSCA_PFORM_TC_029 | M8: PFORM | 🟡 Medium | Xoá ảnh bìa — ảnh kế tiếp thành bìa | Gallery có A (cover), B | 1. Bấm "Remove image" ở A | 1. Còn B, B là cover; "1/5 images" | Medium | – | Yes | UI | @Regression |
| PARSCA_PFORM_TC_030 | M8: PFORM | 🟡 Medium | Xoá hết ảnh — viền đỏ và lỗi bắt buộc | Gallery có 1 ảnh | 1. Bấm "Remove image"<br>2. Bấm "Add Product" / "Update" | 1. Gallery viền đỏ, "At least one image is required"<br>2. Không gửi request | Medium | – | Yes | UI | @Regression |
| PARSCA_PFORM_TC_031 | M8: PFORM | 🟢 Low | Rời trang khi đang upload ảnh | Form tạo; throttling "Slow 3G" | 1. Chọn `img_ok.jpg`<br>2. Khi đang upload bấm "Cancel" (hoặc menu khác)<br>3. Quay lại danh sách | 1. Đang upload<br>2. **[SUY LUẬN]** rời trang không hỏi; không lỗi JS<br>3. Không có sản phẩm mới; ghi nhận ảnh có thể bị bỏ lại trên kho | Low | `img_ok.jpg` | No | N/A | @SuyLuan |

#### M8.5 — (d) Trạng thái & tồn kho

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_PFORM_TC_032 | M8: PFORM | 🔴 High | Stock count biên 0 và 1 | Form tạo, trường khác hợp lệ | 1. Stock count `0` (mặc định), gửi<br>2. Stock count `1`, gửi (SKU `AUTO-PFORM32-20261020`) | 1. Lỗi **"Stock count must be at least 1"**<br>2. Lưu thành công; danh sách "In stock · 1 units" | High | `0`, `1` | Yes | UI | @Boundary @Regression |
| PARSCA_PFORM_TC_033 | M8: PFORM | 🟡 Medium | Stock count thập phân, âm, để trống | Form tạo | 1. Nhập `1.5`<br>2. Nhập `-1`<br>3. Xoá trống | 1. Lỗi **"Stock count must be a whole number"**<br>2. Lỗi "Stock count must be at least 1"<br>3. Lỗi **"Stock count required"** | Medium | `1.5`, `-1`, `""` | Yes | UI | @Boundary @Regression |
| PARSCA_PFORM_TC_034 | M8: PFORM | 🟡 Medium | Rating biên 0–5, bước 0,1 | Form tạo | 1. Rating `5`, `0` (hợp lệ)<br>2. Rating `5.1`<br>3. Rating `-1`<br>4. Rating `4.55` | 1. Không lỗi<br>2. Báo lỗi; API `rating: 5.1` → 400<br>3. Báo lỗi; API → 400<br>4. Báo lỗi bước hoặc làm tròn — ghi nhận | Medium | `0`, `5`, `5.1`, `-1`, `4.55` | Yes | UI | @Boundary @Regression |
| PARSCA_PFORM_TC_035 | M8: PFORM | 🟢 Low | Condition và Availability đủ lựa chọn và lưu đúng | Form tạo | 1. Mở Condition<br>2. Mở Availability<br>3. Chọn Condition "Refurbished", Availability "Discontinued", gửi (SKU `AUTO-PFORM35-20261020`), mở lại | 1. New, Used, Refurbished, OEM, Aftermarket (có thể để trống)<br>2. In Stock (mặc định), On Backorder, Discontinued<br>3. Giá trị được giữ đúng | Low | – | Yes | UI | @Regression |

#### M8.6 — (e) Số part & xe tương thích

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_PFORM_TC_036 | M8: PFORM | 🟡 Medium | Year start lớn hơn Year end vẫn lưu được | Form tạo, department marine | 1. Chọn Make, Year start `2025`, Year end `2010`, gửi (SKU `AUTO-PFORM36-20261020`) | 1. Lưu thành công (không kiểm tra)<br>⚠️ THEO CODE HIỆN TẠI → ghi **Q-V15**, không PASS | Medium | 2025 → 2010 | Yes | UI | @CodeHienTai @Boundary |
| PARSCA_PFORM_TC_037 | M8: PFORM | 🟡 Medium | Alternate part numbers: thêm, cắt khoảng trắng, chống trùng, xoá | Form tạo | 1. Gõ `  ALT-37A  ` rồi Enter<br>2. Gõ `ALT-37B`, bấm nút thêm<br>3. Gõ `ALT-37A`, Enter<br>4. Xoá `ALT-37B`<br>5. Kiểm tra Enter không gửi form | 1. Thêm tag `ALT-37A` (đã trim)<br>2. Thêm `ALT-37B`<br>3. Lỗi **"Part number already exists"**<br>4. Chỉ còn `ALT-37A`<br>5. Không có request `POST /products` khi nhấn Enter | Medium | `  ALT-37A  `, `ALT-37B` | Yes | UI | @Regression |
| PARSCA_PFORM_TC_038 | M8: PFORM | 🟡 Medium | Compatible model: chọn từ fitment-options, xoá, bỏ dòng trống | Form tạo, department auto | 1. Mở Make/Model/Submodel/Engine, đối chiếu `GET /fitment-options`<br>2. Chỉ chọn Make, gửi (SKU `AUTO-PFORM38A-20261020`)<br>3. Tạo sản phẩm khác để trống mọi ô xe (SKU `AUTO-PFORM38B-20261020`)<br>4. Ở department door, quan sát | 1. Danh sách khớp API; mỗi ô có thể xoá<br>2. Lưu được; dòng xe chỉ có Make<br>3. Lưu được; **không** có dòng xe nào (bỏ dòng)<br>4. Ô Compatible model **ẩn** (chỉ marine, auto) | Medium | – | Yes | UI | @Regression |
| PARSCA_PFORM_TC_039 | M8: PFORM | 🟢 Low | Year không phải số / âm bị từ chối | Form tạo, marine | 1. Gõ `abcd` vào Year start<br>2. Gõ `-1990` vào Year end<br>3. API `yearStart: -1` | 1. Không nhập được chữ<br>2. Báo lỗi / không nhận dấu âm<br>3. **400** | Low | `abcd`, `-1990` | Yes | UI | @Boundary |

#### M8.7 — (f) Mô tả

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_PFORM_TC_040 | M8: PFORM | 🟡 Medium | Detailed Description: khối thiếu Title / Body / rich text trống | Form tạo | 1. "Add description section", chỉ nhập Title `Install guide`, gửi<br>2. Xoá Title, chỉ nhập Body, gửi<br>3. Nhập Title, Body chỉ có định dạng rỗng (danh sách trống), gửi<br>4. Xoá khối | 1. Lỗi **"Body required"**<br>2. Lỗi **"Title required"**<br>3. Ghi nhận: báo "Body required" hay lưu khối rỗng<br>4. Khối biến mất; không có nút sắp xếp lại khối | Medium | Title: `Install guide` | Yes | UI | @Regression |
| PARSCA_PFORM_TC_041 | M8: PFORM | 🟢 Low | Specifications & Compatibility: Label/Value bắt buộc, nhiều dòng | Form tạo | 1. Thêm dòng Specifications chỉ nhập Label `Weight`, gửi<br>2. Chỉ nhập Value `2kg`, gửi<br>3. Thêm 10 dòng Compatibility hợp lệ, gửi (SKU `AUTO-PFORM41-20261020`) | 1. Lỗi **"Value required"**<br>2. Lỗi **"Label required"**<br>3. Lưu đủ 10 dòng (không giới hạn) | Low | `Weight` / `2kg`; 10 dòng BOAT TYPE… | Yes | UI | @Regression |
| PARSCA_PFORM_TC_042 | M8: PFORM | 🔴 High | HTML/script trong Title mô tả và Specifications không bị thực thi | Form tạo | 1. Khối mô tả Title `<img src=x onerror=alert('pf42')>`, Body có text; Spec Label `<script>alert(42)</script>`; Status Active; gửi (SKU `AUTO-PFORM42-20261020`)<br>2. Mở chi tiết vendor, các tab<br>3. Mở trang sản phẩm trên website | 1. Lưu thành công hoặc bị từ chối rõ ràng<br>2. **Không** popup alert; hiển thị text đã escape<br>3. **Không** popup alert | Critical | Payload XSS như bước 1 | Yes | UI | @Security @Regression |

#### M8.8 — Hành vi THEO CODE HIỆN TẠI (ghi Bug / Q, không PASS)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_PFORM_TC_043 | M8: PFORM | 🟡 Medium | Bỏ tick "In stock" vẫn lưu inStock = true | Form tạo | 1. Bỏ tick "In stock", Stock count `3`, gửi (SKU `AUTO-PFORM43-20261020`)<br>2. Xem response và danh sách | 1. Toast "Saved"<br>2. `inStock: true`; danh sách "In stock · 3 units"<br>⚠️ THEO CODE HIỆN TẠI: ô "In stock" bị bỏ qua → ghi **Q-V12** | Medium | Stock `3`, In stock ☐ | Yes | UI | @CodeHienTai |
| PARSCA_PFORM_TC_044 | M8: PFORM | 🔴 High | Vendor tự nhập được Rating sản phẩm | Form tạo | 1. Rating `5`, Status Active, gửi (SKU `AUTO-PFORM44-20261020`)<br>2. Xem sản phẩm trên website | 1. Lưu thành công<br>2. Website hiển thị điểm 5 sao do vendor tự nhập<br>⚠️ THEO CODE HIỆN TẠI: rủi ro gian lận đánh giá → ghi **Q-V11** | High | Rating `5` | Yes | UI | @CodeHienTai @Security |
| PARSCA_PFORM_TC_045 | M8: PFORM | 🔴 High | Vendor tự xuất bản — Active hiện website ngay; Draft / Archived không hiện | V1 | 1. Tạo `AUTO-PFORM45A-20261020` Status Active<br>2. Tạo `AUTO-PFORM45D-20261020` Status Draft<br>3. Tạo `AUTO-PFORM45R-20261020` Status Archived<br>4. `GET {API_URL}/products?search=AUTO-PFORM45` (không token) | 1-3. Cả 3 lưu thành công, không có bước duyệt<br>4. Chỉ `AUTO-PFORM45A-20261020` xuất hiện<br>⚠️ THEO CODE HIỆN TẠI: không qua duyệt → ghi **Q-V10** | High | 3 SKU như bước 1–3 | Yes | API | @CodeHienTai @CriticalPath |
| PARSCA_PFORM_TC_046 | M8: PFORM | 🟡 Medium | Cancel không cảnh báo khi có thay đổi chưa lưu | Mở trang sửa sản phẩm `AUTO-PFORM03-20261020` | 1. Đổi Name thành `Changed but not saved`<br>2. Bấm "Cancel"<br>3. Mở lại trang sửa | 1. –<br>2. Về danh sách **ngay**, không hỏi xác nhận<br>3. Name cũ (thay đổi bị mất)<br>⚠️ THEO CODE HIỆN TẠI → ghi **Q-V13** | Medium | Name: `Changed but not saved` | Yes | UI | @CodeHienTai |
| PARSCA_PFORM_TC_047 | M8: PFORM | 🟢 Low | Ảnh đã upload bị bỏ lại trên kho nếu không lưu sản phẩm | Form tạo | 1. Upload `img_ok.jpg`, ghi `imagePath` từ Network<br>2. Bấm "Cancel"<br>3. Mở trực tiếp URL `imagePath` | 1. 200/201 + `imagePath`<br>2. Về danh sách<br>3. Ảnh **vẫn truy cập được** (ảnh mồ côi)<br>⚠️ THEO CODE HIỆN TẠI → ghi **Q-V13** | Low | `img_ok.jpg` | Partial | UI | @CodeHienTai |

#### M8.9 — Sửa sản phẩm

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_PFORM_TC_048 | M8: PFORM | 🔴 High | Đổi tên đổi slug; sản phẩm import giữ đuôi "-<sku>" | `AUTO-PFORM03-20261020` (tạo bằng form); `AUTO-CSV-0001` (tạo bằng import) | 1. Sửa `AUTO-PFORM03-20261020`: Name `Auto Pform TC48 Renamed`, bấm "Update"<br>2. Xem slug mới (response / website)<br>3. Sửa `AUTO-CSV-0001`: Name `Imported Renamed`, bấm "Update"<br>4. Xem slug | 1. Toast "Saved"; request là `PATCH` gửi toàn bộ form<br>2. Slug đổi theo tên mới (vd `auto-pform-tc48-renamed`); link slug cũ trên website → 404<br>3. Toast "Saved"<br>4. Slug = `imported-renamed-auto-csv-0001` (giữ đuôi "-<sku>") | High | Name mới: `Auto Pform TC48 Renamed`, `Imported Renamed` | Yes | UI | @Regression |
| PARSCA_PFORM_TC_049 | M8: PFORM | 🟡 Medium | Checkbox "New" khi sửa: bật lại đặt lại thời gian huy hiệu; bật sẵn không kéo dài | Sản phẩm có `isNew = true` (thời điểm T1) | 1. Mở trang sửa: quan sát checkbox "New" + gợi ý thời hạn<br>2. Bấm "Update" giữ nguyên New = true → xem thời điểm huy hiệu<br>3. Bỏ tick New, Update → tick lại New, Update → xem thời điểm | 1. Checkbox "New" hiện, đang tick, có gợi ý thời hạn<br>2. Thời điểm vẫn = **T1** (không kéo dài)<br>3. Thời điểm mới = lúc Update lần cuối (đặt lại) | Medium | – | Partial | API | @Regression |
| PARSCA_PFORM_TC_050 | M8: PFORM | 🔴 High | Bấm Update hai lần liên tiếp và hết phiên khi lưu | Trang sửa sản phẩm; throttling "Slow 3G" | 1. Đổi Price `55`, double click "Update"<br>2. Kiểm tra Network<br>3. Mở lại trang sửa; xoá cookie `access_token` + `refresh_token`; đổi Price `66`, bấm "Update" | 1. Nút **bị khoá** khi đang lưu<br>2. Chỉ **1** request `PATCH`<br>3. Toast lỗi; **[SUY LUẬN]** dữ liệu đã nhập không mất (hoặc chuyển /login) — ghi nhận | High | Price `55`, `66` | Partial | UI | @Regression @SuyLuan |
| PARSCA_PFORM_TC_051 | M8: PFORM | 🟡 Medium | Mở sửa sản phẩm cũ chỉ có trường "image" hoặc brand đã bị xoá khỏi danh mục | Dev cung cấp sản phẩm cũ: chỉ có `image` (không `images`); sản phẩm có brand không còn trong `/product-brands` | 1. Mở trang sửa sản phẩm chỉ có `image`<br>2. Mở trang sửa sản phẩm có brand đã bị xoá<br>3. Bấm "Update" không đổi gì | 1. Form mở được; gallery hiển thị ảnh từ `image`<br>2. Form mở được; ô Brand hiển thị giá trị cũ / trống, không lỗi<br>3. Ghi nhận kết quả lưu | Medium | Dữ liệu cũ từ Dev | No | N/A | @Regression @NeedDevSupport |
| PARSCA_PFORM_TC_052 | M8: PFORM | 🟡 Medium | API: subcategory không thuộc department vẫn lưu được | Token V1; biết mã subcategory của tools | 1. `POST /products` với `departmentId: "marine"`, `subcategoryId: <mã của tools>`, các trường khác hợp lệ (SKU `AUTO-PFORM52-20261020`)<br>2. Mở sản phẩm trên website | 1. **201** (không kiểm tra)<br>2. Sản phẩm hiện ở danh mục lệch<br>⚠️ THEO CODE HIỆN TẠI → ghi **Q-V15** | Medium | departmentId `marine` + subcategory của tools | Yes | API | @CodeHienTai |

---

### M9: IMG — Upload ảnh sản phẩm (🟡 Medium Risk)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_IMG_TC_001 | M9: IMG | 🟡 Medium | Upload từng định dạng hợp lệ trả imagePath công khai | Token V1 | 1. `POST {API_URL}/products/upload` multipart `file=img_ok_200kb.png`<br>2. Lặp lại với `img_ok.jpg`, `img_ok.webp`, `img_ok.gif`<br>3. Mở `imagePath` trả về (không token) | 1. **200/201**; body `{ "imagePath": "https://…" }`<br>2. Cùng kết quả cho mỗi định dạng<br>3. Ảnh truy cập được công khai | High | 4 file hợp lệ | Yes | API | @Regression |
| PARSCA_IMG_TC_002 | M9: IMG | 🟡 Medium | Thiếu file trả 400 | Token V1 | 1. `POST /products/upload` multipart không có trường `file`<br>2. Gửi trường tên khác `image=img_ok.jpg` | 1. **400 "Image file is required"**<br>2. **400 "Image file is required"** | Medium | – | Yes | API | @Regression |
| PARSCA_IMG_TC_003 | M9: IMG | 🟡 Medium | File PDF bị từ chối | Token V1 | 1. Upload `doc_sample.pdf` (MIME application/pdf) | 1. **400 "Only image uploads are allowed"** | Medium | `doc_sample.pdf` | Yes | API | @Regression |
| PARSCA_IMG_TC_004 | M9: IMG | 🟡 Medium | File SVG bị từ chối | Token V1 | 1. Upload `img_vector.svg` (MIME image/svg+xml) | 1. **400 "Only image uploads are allowed"** (SVG không thuộc jpeg/png/webp/gif) | Medium | `img_vector.svg` | Yes | API | @Security @Regression |
| PARSCA_IMG_TC_005 | M9: IMG | 🟡 Medium | File đúng 10 MB được chấp nhận (biên trên) | Token V1 | 1. Upload `img_exact_10mib.png` (10.485.760 byte)<br>2. Upload `img_10mb_decimal.png` (10.000.000 byte) | 1. Ghi nhận: **200/201** nếu giới hạn tính theo MiB<br>2. **200/201**<br>📝 Đối chiếu **Q-V14** để kết luận đơn vị | Medium | 10.485.760 B, 10.000.000 B | Yes | API | @Boundary |
| PARSCA_IMG_TC_006 | M9: IMG | 🟡 Medium | File 11 MB bị từ chối | Token V1 | 1. Upload `img_11mb.png` (11.534.336 byte) | 1. **400 / 413** với thông báo vượt dung lượng; không trả `imagePath` | Medium | `img_11mb.png` | Yes | API | @Boundary @Regression |
| PARSCA_IMG_TC_007 | M9: IMG | 🟡 Medium | File đổi đuôi (nội dung text, khai báo image/png) | Token V1 | 1. Upload `fake_image_text.png` với `Content-Type: image/png`<br>2. Mở `imagePath` (nếu có) | 1. **[SUY LUẬN]** có thể lọt qua (BE chỉ kiểm tra MIME khai báo). Ghi nhận: 400 = tốt; 200 = ghi bug bảo mật<br>2. Ghi nhận nội dung trả về | Medium | `fake_image_text.png` | Yes | API | @Security @SuyLuan |
| PARSCA_IMG_TC_008 | M9: IMG | 🟡 Medium | User thường và không token gọi API upload | Token User | 1. Token User upload `img_ok.jpg`<br>2. Không token upload `img_ok.jpg`<br>3. Token Admin upload `img_ok.jpg` | 1. **403** "You do not have permission to access this resource"<br>2. **401**<br>3. **200/201** | High | `img_ok.jpg` | Yes | API | @Security @Regression |

---

## TỔNG HỢP AMBIGUITIES ĐÃ GIẢI QUYẾT

| # | Ambiguity | Giải quyết bằng |
|---|-----------|-----------------|
| AMB-07 (Q-V10) | Vendor tự xuất bản | PFORM_TC_045 `@CodeHienTai` |
| AMB-08 (Q-V11) | Vendor nhập Rating | PFORM_TC_044 `@CodeHienTai` |
| AMB-09 (Q-V12) | Ô "In stock" bị bỏ qua | PFORM_TC_043 `@CodeHienTai` |
| AMB-10 (Q-V13) | Không cảnh báo rời form, ảnh mồ côi | PFORM_TC_046, PFORM_TC_047 |
| AMB-11 (Q-V14) | Đơn vị "10 MB" | IMG_TC_005 test cả 2 giá trị |
| AMB-12/13/14 (Q-V15) | Compare at < Price, Year start > end, Subcategory lệch department | PFORM_TC_015, 036, 052 |
| AMB-15 | Slug rỗng với tên đặc biệt | PFORM_TC_007 `@SuyLuan` |
| – | Rich text Body chỉ có định dạng rỗng | PFORM_TC_040 bước 3 ghi nhận |
| – | Rating 4.55 (sai bước 0,1) | PFORM_TC_034 bước 4 ghi nhận |

---

## THỐNG KÊ

| Tiêu chí | Số lượng |
|----------|----------|
| **Tổng TC** | **60** (PFORM 52 + IMG 8) |
| Critical Priority | 3 (PFORM_003, 006, 042) |
| High Priority | 16 |
| Medium Priority | 33 |
| Low Priority | 8 |
| Kỹ thuật EP | Định dạng ảnh, department, status, condition/availability |
| Kỹ thuật BVA | Ảnh 1/5/6; 10 MB/11 MB; stock 0/1; rating 0/5/5.1; price 4/5 thập phân |
| Kỹ thuật Decision Table | Department × Brand mặc định (PFORM_017); Department × ô xe (PFORM_021, 038) |
| Kỹ thuật State Transition | Checkbox New false ↔ true (PFORM_049) |
| Error Guessing / Security | XSS (PFORM_006, 042), double submit (PFORM_050), file đổi đuôi (IMG_007) |
