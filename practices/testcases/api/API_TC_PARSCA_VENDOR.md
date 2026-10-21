# API Test Cases: PARSCA — Role Vendor (Phân quyền, Phạm vi dữ liệu, Sản phẩm, Import, Phiên)

> **Target API:** PARSCA Marketplace BE (NestJS)
> **Base URL:** `{API_URL}` — ⚠️ xác nhận với Dev có tiền tố `/v1` và bọc `{data, meta}` hay không (Doc 01, D-02). Nếu có, thêm `/v1` vào mọi path và đọc dữ liệu trong `data`.
> **Auth Scheme:** Cookie httpOnly `access_token` / `refresh_token` (ưu tiên) — fallback `Authorization: Bearer <accessToken>` cho client không phải trình duyệt (Doc 04)
> **Source:** `docs/parsca-vendor-test-docs/` 04, 05, 06, 09, 10, 11, 12 (không có Swagger — catalog dựng từ tài liệu BA)
> **Quy chuẩn áp dụng:** ISO/IEC/IEEE 29119, OWASP API Security Top 10 (API1 BOLA, API3 BOPLA/Mass assignment, API5 BFLA), EP, BVA, Error Guessing, `.agent/rules/core.md`.
> **Ngày tạo:** 2026-10-20

---

## 🔑 Biến môi trường (Postman Environment)

| Biến | Nguồn | Ghi chú |
|------|-------|---------|
| `{{API_URL}}` | Dev (D-01) | Không commit |
| `{{TOKEN_VENDOR1}}`, `{{TOKEN_VENDOR2}}`, `{{TOKEN_ADMIN}}`, `{{TOKEN_USER}}` | `POST /auth/login` bằng `${VENDOR1_EMAIL}`/`${VENDOR1_PASSWORD}`… — lấy từ `Set-Cookie: access_token` | Không in ra log/báo cáo |
| `{{V1_PRODUCT_ID}}`, `{{V2_PRODUCT_ID}}`, `{{V2_PRODUCT_SKU}}`, `{{V2_PRODUCT_SLUG}}`, `{{ADMIN_PRODUCT_ID}}`, `{{ADMIN_PRODUCT_SKU}}` | `practices/context/ENV_PREFLIGHT_CHECKLIST.md` | – |
| `{{IMAGE_PATH}}` | Kết quả `POST /products/upload` | Dùng trong body tạo sản phẩm |
| `{{TS}}` | `Date.now()` | Hậu tố SKU unique, traceable |

**Body tạo sản phẩm tối thiểu (`{{MIN_PRODUCT}}`):**
```json
{
  "name": "Auto API Product {{TS}}",
  "sku": "AUTO-API-{{TS}}",
  "price": 10,
  "departmentId": "marine",
  "subcategoryId": "<subcategory hợp lệ của marine>",
  "images": ["{{IMAGE_PATH}}"],
  "stockCount": 1
}
```
> Tên trường chính xác: chụp request `POST /products` khi tạo bằng form ở Pre-flight và cập nhật lại mẫu này (KHÔNG đoán).

---

## 📋 Endpoint Catalog

| # | HTTP Method | Path | Description | Security | Total Test Cases |
|---|---|---|---|---|---|
| 1 | `GET` | `/products/admin/all` | Danh sách quản trị (lọc `createdBy` với vendor) | Vendor / Admin | 7 |
| 2 | `GET` | `/products/admin/:idOrSlug` | Chi tiết quản trị mọi trạng thái | Vendor / Admin | 4 |
| 3 | `POST` | `/products` | Tạo sản phẩm | Vendor / Admin | 14 |
| 4 | `PATCH` | `/products/:id` | Sửa / đổi trạng thái | Vendor / Admin | 8 |
| 5 | `DELETE` | `/products/:id` | Xoá (204) | Vendor / Admin | 4 |
| 6 | `POST` | `/products/upload` | Upload ảnh sản phẩm | Vendor / Admin | 4 |
| 7 | `GET` / `POST` | `/products/import/template`, `/products/import[?dryRun=true]` | Template + Import CSV | Vendor / Admin | 8 |
| 8 | `GET` / `POST` / `DELETE` | `/auth/me`, `/auth/logout`, `/auth/refresh`, `/auth/me/avatar` | Phiên & avatar | Mọi role đã đăng nhập | 9 |
| 9 | `POST` / `PATCH` / `DELETE` / `GET admin/all` | `/product-brands`, `/fitment-options` | Danh mục dùng chung | **Admin only** | 6 |
| 10 | Nhiều | `/users`, `/dashboard/stats`, `/blog-posts`, `/brand-logos`, `/quotes`, `/newsletter-subscriptions` (quản trị) | Quản trị nền tảng | **Admin only** | 9 |
| 11 | `GET` / `POST` | API công khai (Nhóm 3) | Website | Public | 5 |
| **Tổng** | | | | | **78 Test Cases** |

> Một số TC kiểm nhiều endpoint (vd API_PERM_TC_003) — catalog đếm theo endpoint chính.

---

## 🧭 Ma Trận Phân Quyền 4 Vai (tham chiếu nhanh)

| Nhóm | Endpoint | Không token | User | Vendor | Admin |
|------|----------|-------------|------|--------|-------|
| 1 | `GET /products/admin/all`, `GET /products/admin/:idOrSlug` | 401 | 403 | 200 (chỉ của mình) | 200 (tất cả) |
| 1 | `POST /products`, `PATCH/DELETE /products/:id` | 401 | 403 | 201/200/204 (của mình) · 404 (người khác) | 201/200/204 |
| 1 | `POST /products/upload`, `GET /products/import/template`, `POST /products/import` | 401 | 403 | 2xx | 2xx |
| 1* | `/auth/me`, `/auth/logout`, `POST/DELETE /auth/me/avatar` | 401 | 2xx | 2xx | 2xx |
| 2 | `GET /users`, `PATCH /users/:id/role`, `GET /dashboard/stats` | 401 | 403 | **403** | 2xx |
| 2 | `POST/PATCH/DELETE /product-brands`, `GET /product-brands/admin/all` | 401 | 403 | **403** | 2xx |
| 2 | `POST/PATCH/DELETE /fitment-options`, `GET /fitment-options/admin/all` | 401 | 403 | **403** | 2xx |
| 2 | Quản trị `blog-posts`, `brand-logos`, `quotes`, `newsletter-subscriptions` | 401 | 403 | **403** | 2xx |
| 3 | `GET /products`, `GET /products/:idOrSlug`, `category-counts`, `filter-summary`, `filter-options`, `GET /product-brands`, `GET /fitment-options`, `GET /brand-logos`, `GET /blog-posts`, `POST /contact`, `POST /quotes`, `POST /newsletter-subscriptions`, `/sitemap*.xml`, `/health`, `/public/uploads/...` | 2xx | 2xx | 2xx | 2xx |

> Thông báo 403 chuẩn: **"You do not have permission to access this resource"**.

---

## 🔍 Test Cases Chi Tiết

### 1. PERM — Ma trận phân quyền (30)

| TC ID | Scenario | Request | Expected Response | Priority | Testing Technique / Rule |
|---|---|---|---|---|---|
| `API_PERM_TC_001` | `GET /products/admin/all` theo 4 vai | Lần lượt: không token / `{{TOKEN_USER}}` / `{{TOKEN_VENDOR1}}` / `{{TOKEN_ADMIN}}` | **401** / **403** / **200** (mọi item `creator.id` = V1) / **200** (gồm sản phẩm V1, V2, Admin) | P1 | Decision Table / OWASP API5 |
| `API_PERM_TC_002` | `GET /products/admin/:idOrSlug` theo 4 vai (sản phẩm của V1) | id = `{{V1_PRODUCT_ID}}` với 4 vai | **401** / **403** / **200** / **200** | P1 | Decision Table |
| `API_PERM_TC_003` | `POST /products`, `PATCH /products/:id`, `DELETE /products/:id` bằng không token và token user | Body `{{MIN_PRODUCT}}`; id = `{{V1_PRODUCT_ID}}` | Không token **401**; user **403** "You do not have permission to access this resource"; dữ liệu không đổi | P1 | OWASP API5: BFLA |
| `API_PERM_TC_004` | `POST /products/upload`, `GET /products/import/template`, `POST /products/import` bằng không token / user / vendor | multipart `file` hợp lệ | Không token **401**; user **403**; vendor **2xx** | P1 | Decision Table |
| `API_PERM_TC_005` | Vendor gọi `POST /product-brands` | `{{TOKEN_VENDOR1}}`; Body `{"name":"AutoBrandAPI{{TS}}"}` | **403** "You do not have permission to access this resource"; `GET /product-brands` không có brand mới | P1 | OWASP API5 / Doc 05 điểm chú ý / Q-V5 |
| `API_PERM_TC_006` | Vendor gọi `PATCH /product-brands/:id` | id brand có sẵn; Body `{"name":"Hacked {{TS}}"}` | **403**; tên brand không đổi | P1 | OWASP API5 |
| `API_PERM_TC_007` | Vendor gọi `DELETE /product-brands/:id` và `GET /product-brands/admin/all` | `{{TOKEN_VENDOR1}}` | Cả hai **403**; brand vẫn còn | P1 | OWASP API5 |
| `API_PERM_TC_008` | Vendor gọi `POST /fitment-options` | Body tạo Make `AutoMakeAPI{{TS}}` | **403** | P1 | OWASP API5 |
| `API_PERM_TC_009` | Vendor gọi `PATCH /fitment-options/:id` | id fitment có sẵn | **403**; dữ liệu không đổi | P1 | OWASP API5 / Doc 05 điểm chú ý |
| `API_PERM_TC_010` | Vendor gọi `DELETE /fitment-options/:id` và `GET /fitment-options/admin/all` | `{{TOKEN_VENDOR1}}` | Cả hai **403** | P1 | OWASP API5 |
| `API_PERM_TC_011` | Vendor gọi `GET /users` | `{{TOKEN_VENDOR1}}` | **403**; không lộ danh sách user | P1 | OWASP API5 |
| `API_PERM_TC_012` | Vendor tự nâng quyền: `PATCH /users/<id V1>/role` | Body `{"role":"admin"}` | **403**; `GET /auth/me` vẫn `role: vendor` | P1 | OWASP API5 / Privilege Escalation |
| `API_PERM_TC_013` | Vendor gọi `GET /dashboard/stats` | `{{TOKEN_VENDOR1}}` | **403** | P2 | OWASP API5 |
| `API_PERM_TC_014` | Vendor gọi API quản trị blog | `POST /blog-posts` body tối thiểu; `PATCH`/`DELETE /blog-posts/:id` | **403** cho mọi phương thức | P2 | OWASP API5 |
| `API_PERM_TC_015` | Vendor gọi API quản trị brand-logos | `POST /brand-logos`; `PATCH`/`DELETE /brand-logos/:id` | **403** | P2 | OWASP API5 |
| `API_PERM_TC_016` | Vendor gọi API quản trị quotes | `GET /quotes` (danh sách quản trị), `PATCH`/`DELETE /quotes/:id` | **403**; không lộ báo giá | P2 | OWASP API5 / Data exposure |
| `API_PERM_TC_017` | Vendor gọi API quản trị newsletter | `GET /newsletter-subscriptions` (quản trị), `DELETE /newsletter-subscriptions/:id` | **403**; không lộ email người đăng ký | P2 | OWASP API5 / PII |
| `API_PERM_TC_018` | `GET /auth/me` theo 4 vai | Không token / user / vendor / admin | **401** / 200 `role:user` / 200 `role:vendor`, `vendorId:null` / 200 `role:admin` | P1 | Decision Table |
| `API_PERM_TC_019` | `POST /auth/logout` bằng vendor | `{{TOKEN_VENDOR1}}` (cookie) | **2xx**; cookie bị xoá; gọi `GET /auth/me` bằng cookie cũ → **401** | P1 | Session Management |
| `API_PERM_TC_020` | `POST /auth/me/avatar` theo vai | multipart `file` = `avatar_ok_200kb.png`; không token / user / vendor | **401** / **2xx** / **2xx** (URL avatar mới trong `/auth/me`) | P2 | Decision Table |
| `API_PERM_TC_021` | `DELETE /auth/me/avatar` bằng vendor | `{{TOKEN_VENDOR1}}` | **2xx**; `/auth/me` avatar = null; không token → **401** | P3 | Functional |
| `API_PERM_TC_022` | API công khai sản phẩm không token | `GET /products`, `GET /products/:idOrSlug` (Active), `/products/category-counts`, `/products/filter-summary`, `/products/filter-options` | **200** cho tất cả | P2 | Baseline / Nhóm 3 |
| `API_PERM_TC_023` | API công khai danh mục không token | `GET /product-brands`, `GET /fitment-options`, `GET /brand-logos`, `GET /blog-posts` | **200** | P3 | Baseline / Nhóm 3 |
| `API_PERM_TC_024` | API công khai POST không token | `POST /contact`, `POST /quotes`, `POST /newsletter-subscriptions` với body hợp lệ, email `auto.api024.{{TS}}@auto.test` | **2xx** | P3 | Baseline / Nhóm 3 |
| `API_PERM_TC_025` | Sitemap, health, uploads không token | `GET /sitemap.xml`, `GET /health`, `GET {{IMAGE_PATH}}` | **200** | P3 | Baseline / Nhóm 3 |
| `API_PERM_TC_026` | API công khai với token vendor không bị chặn | Gọi lại TC_022 bằng `{{TOKEN_VENDOR1}}` | **200**; kết quả giống không token (không lọc createdBy ở API công khai) | P3 | EP |
| `API_PERM_TC_027` | Bearer fallback khi không có cookie | Header `Authorization: Bearer {{TOKEN_VENDOR1}}`, không gửi cookie; `GET /products/admin/all` | **200**, chỉ sản phẩm V1 | P2 | Doc 04 — đọc cookie trước, rồi Bearer |
| `API_PERM_TC_028` | Token hết hạn / sai chữ ký / rỗng | Bearer `invalid_token_123`; Bearer JWT V1 đã quá 15 phút; Bearer rỗng | **401** cho cả ba | P1 | OWASP API2: Broken Authentication |
| `API_PERM_TC_029` | Hạ quyền vendor → mất quyền API **ngay** | Admin `PATCH /users/<ROLE_TEST id>/role` `{"role":"user"}`; ngay sau đó dùng token cũ của ROLE_TEST gọi `GET /products/admin/all` | **403** ngay (không chờ 15 phút); `/auth/me` → `role:user`, `vendorId:null` | P1 | AC-ROLE-06/07 / State Transition |
| `API_PERM_TC_030` | Nâng quyền user → vendor có hiệu lực ngay | Admin đổi ROLE_TEST `user` → `vendor`; dùng token đang có gọi `GET /products/admin/all` | **200** (hoặc cần đăng nhập lại — ghi nhận) [SUY LUẬN] | P2 | State Transition / @SuyLuan |

### 2. SCOPE — Phạm vi dữ liệu `createdBy` (10)

| TC ID | Scenario | Request | Expected Response | Priority | Testing Technique / Rule |
|---|---|---|---|---|---|
| `API_SCOPE_TC_001` | V1 GET chi tiết sản phẩm của V2 bằng id | `GET /products/admin/{{V2_PRODUCT_ID}}` — `{{TOKEN_VENDOR1}}` | **404** "Product not found" (không phải 403); không có dữ liệu V2 trong body | P1 | OWASP API1: BOLA |
| `API_SCOPE_TC_002` | V1 GET chi tiết sản phẩm của V2 bằng slug | `GET /products/admin/{{V2_PRODUCT_SLUG}}` | **404** "Product not found" | P1 | OWASP API1 |
| `API_SCOPE_TC_003` | V1 PATCH sản phẩm của V2 | `PATCH /products/{{V2_PRODUCT_ID}}` body `{"price":1}` | **404**; Admin xác nhận giá V2 không đổi | P1 | OWASP API1 |
| `API_SCOPE_TC_004` | V1 DELETE sản phẩm của V2 | `DELETE /products/{{V2_PRODUCT_ID}}` | **404**; sản phẩm V2 còn | P1 | OWASP API1 |
| `API_SCOPE_TC_005` | V1 truy cập sản phẩm của Admin | GET / PATCH / DELETE `{{ADMIN_PRODUCT_ID}}` | **404** cho cả ba | P1 | OWASP API1 |
| `API_SCOPE_TC_006` | Tham số `vendorName` bị bỏ qua với vendor | `GET /products/admin/all?vendorName={{VENDOR2_EMAIL}}` — V1 | **200**, chỉ sản phẩm V1; `meta.total` = khi không có tham số | P1 | Parameter tampering |
| `API_SCOPE_TC_007` | Admin lọc `vendorName` không phân biệt hoa thường | Admin: `?vendorName=<TÊN V1 VIẾT HOA>`; `?vendorName={{VENDOR2_EMAIL}}` | Chỉ sản phẩm V1 / chỉ sản phẩm V2 | P2 | EP |
| `API_SCOPE_TC_008` | Mass assignment `createdBy` khi tạo | `POST /products` body `{{MIN_PRODUCT}}` + `"createdBy":"<id V2>"` — V1 | **400** (property createdBy should not exist); không tạo sản phẩm | P1 | OWASP API3: Mass Assignment |
| `API_SCOPE_TC_009` | Mass assignment `createdBy` / `creator` khi sửa | `PATCH /products/{{V1_PRODUCT_ID}}` body `{"createdBy":"<id V2>"}`; body `{"creator":{"id":"<id V2>"}}` | **400** cả hai; chủ sở hữu không đổi | P1 | OWASP API3 |
| `API_SCOPE_TC_010` | Sản phẩm tạo mới gán `createdBy` = người gọi; `creator.name` theo quy tắc | V1 `POST /products` `{{MIN_PRODUCT}}` → Admin `GET /products/admin/<id mới>` | **201**; `createdBy` = id V1; `creator.name` = tên tài khoản V1 (rỗng → email; không tìm thấy → "Unknown vendor") | P1 | AC-SCOPE-01/05 |

### 3. PROD — Validation sản phẩm (22)

| TC ID | Scenario | Request | Expected Response | Priority | Testing Technique / Rule |
|---|---|---|---|---|---|
| `API_PROD_TC_001` | Happy path — tạo sản phẩm tối thiểu | V1 `POST /products` `{{MIN_PRODUCT}}` | **201**; `status` = active (mặc định); `sku` = CHỮ HOA; có `slug` | P1 | Happy Path |
| `API_PROD_TC_002` | Thiếu trường bắt buộc | Lần lượt bỏ `name`, `sku`, `price`, `departmentId`, `subcategoryId`, `images`, `stockCount` | **400** cho từng trường | P1 | Field-Level Validation |
| `API_PROD_TC_003` | SKU chữ thường được đổi HOA | `"sku":"auto-api-lower-{{TS}}"` | **201**; `sku` = `AUTO-API-LOWER-{{TS}}` | P2 | EP |
| `API_PROD_TC_004` | SKU có dấu cách | `"sku":"AUTO API {{TS}}"` | **400** (hoặc ghi nhận nếu BE nhận — FE chặn) | P2 | Error Guessing |
| `API_PROD_TC_005` | SKU trùng sản phẩm của chính V1 | `"sku":"<SKU V1 có sẵn>"` | **409** `Product with SKU "<SKU>" already exists` | P1 | Business Logic |
| `API_PROD_TC_006` | SKU trùng sản phẩm V2 / Admin (lộ thông tin) | `"sku":"{{V2_PRODUCT_SKU}}"`; `"sku":"{{ADMIN_PRODUCT_SKU}}"` | **409** cùng dạng — ⚠️ THEO CODE HIỆN TẠI → Q-V4 | P1 | OWASP API3: Excessive Data Exposure |
| `API_PROD_TC_007` | Slug trùng | Tạo 2 sản phẩm cùng `name` "Auto Slug Dup {{TS}}" khác SKU | Lần 2: **409** `Product with slug "auto-slug-dup-{{TS}}" already exists` (hoặc slug khác — ghi nhận) | P2 | Business Logic |
| `API_PROD_TC_008` | Price biên | `price`: `-0.01`; `0`; `0.0001`; `0.00001`; `"abc"` | **400** / **201** / **201** / ghi nhận (FE ≤ 4 thập phân) / **400** | P1 | BVA |
| `API_PROD_TC_009` | stockCount biên | `stockCount`: `0`; `1`; `1.5`; `-1` | **400** / **201** / **400** / **400** | P1 | BVA |
| `API_PROD_TC_010` | Số ảnh biên | `images`: `[]`; 1 ảnh; 5 ảnh; 6 ảnh | **400** / **201** / **201** / **400** | P1 | BVA |
| `API_PROD_TC_011` | Status lạ | `"status":"published"`; `"status":"ACTIVE"`; `"status":""` | **400** cho cả ba | P1 | EP / Doc 09 mục 14 |
| `API_PROD_TC_012` | Subcategory lạ / không thuộc department | `"subcategoryId":"zz-not-exist"`; subcategory của `auto` khi `departmentId`=`marine` | Lạ: **400**; không thuộc department: ghi nhận (BE không kiểm tra) — ⚠️ Q-V15 | P2 | EP / Q-V15 |
| `API_PROD_TC_013` | Department ngoài 4 giá trị | `"departmentId":"food"` | **400** | P2 | EP |
| `API_PROD_TC_014` | Trường không khai báo | `{{MIN_PRODUCT}}` + `"isFeatured":true` | **400** (property isFeatured should not exist) | P1 | Whitelist validation / Doc 05 |
| `API_PROD_TC_015` | Rating biên | `rating`: `0`; `5`; `5.1`; `-0.1` | **201** / **201** / **400** / **400** — ghi nhận Q-V11 | P3 | BVA / Q-V11 |
| `API_PROD_TC_016` | PATCH đổi trạng thái hợp lệ | `PATCH /products/<id V1>` `{"status":"draft"}` → `"archived"` → `"active"` | **200** mỗi lần; `GET /products/<slug>` công khai: 404 / 404 / 200 | P1 | State Transition |
| `API_PROD_TC_017` | DELETE id sai định dạng / không tồn tại / xoá 2 lần | `DELETE /products/abc`; id đúng định dạng không tồn tại; xoá sản phẩm V1 → **204** rồi xoá lại | **400** (id sai định dạng) / **404** / **204** rồi **404** | P1 | Error Guessing / Doc 05 |
| `API_PROD_TC_018` | PATCH id sai định dạng | `PATCH /products/abc` `{"price":1}` | **400** | P2 | Input Validation |
| `API_PROD_TC_019` | PATCH sửa SKU trùng với sản phẩm khác; sửa giữ nguyên SKU của chính nó | `{"sku":"<SKU V1 khác>"}`; `{"sku":"<SKU hiện tại>"}` | **409**; **200** (loại trừ chính sản phẩm) | P1 | Business Logic |
| `API_PROD_TC_020` | `limit` vượt 100 | `GET /products/admin/all?limit=500` — V1 (≥ 101 sản phẩm hoặc Admin) | **200**; số item ≤ **100** | P2 | BVA / NFR-PROD-03 |
| `API_PROD_TC_021` | XSS trong name / mô tả | `"name":"<script>alert('AUTO-XSS-{{TS}}')</script>"` | **201** lưu dạng text; khi hiển thị website/FE không thực thi script | P2 | OWASP / NFR-PROD-01 |
| `API_PROD_TC_022` | Year start > Year end; Compare at < Price | `yearStart`=2025, `yearEnd`=2020; `compareAtPrice`=5, `price`=10 | **201** — ⚠️ BE không kiểm tra → ghi Q-V15 | P3 | Business Rule / Q-V15 |

### 4. FILE — Upload ảnh & Import CSV (8)

| TC ID | Scenario | Request | Expected Response | Priority | Testing Technique / Rule |
|---|---|---|---|---|---|
| `API_FILE_TC_001` | Upload ảnh hợp lệ | V1 `POST /products/upload` multipart `file` = `img_ok_200kb.png` | **2xx** `{imagePath: <URL công khai>}`; GET URL → 200 | P1 | Happy Path |
| `API_FILE_TC_002` | Upload thiếu file / sai trường | Không gửi `file`; gửi trường `image` thay vì `file` | **400** "Image file is required" | P1 | Field Validation |
| `API_FILE_TC_003` | Upload sai loại | `doc_sample.pdf`; `img_vector.svg` | **400** "Only image uploads are allowed" | P1 | EP / Security |
| `API_FILE_TC_004` | Upload biên 10 MB | `img_10mb_decimal.png`; `img_exact_10mib.png`; `img_11mb.png` | 2xx / ghi nhận (Q-V14) / **413** hoặc 400 | P2 | BVA / Q-V14 |
| `API_FILE_TC_005` | Template CSV | `GET /products/import/template` — V1 | **200**; `Content-Type` text/csv; `Content-Disposition` chứa `parsca-products-template.csv` | P2 | Functional |
| `API_FILE_TC_006` | Import dryRun không ghi | `POST /products/import?dryRun=true` file `csv_valid_5_rows.csv` | **2xx** `{rows:5, toCreate:5, toUpdate:0, skipped:0}` (tên trường theo response thực tế); `GET /products/admin/all?search=AUTO-CSV-000` → 0 | P1 | Functional |
| `API_FILE_TC_007` | Import file sai định dạng / thiếu cột / quá dòng | `.txt`; thiếu `sku`; 50.001 dòng | **400** "Only .csv files are accepted" / "Missing required column(s): sku" / "The file has 50001 rows; the limit is 50000 per import. Please split it." | P1 | EP / BVA |
| `API_FILE_TC_008` | Import ghi đè SKU người khác | File có `{{V2_PRODUCT_SKU}}` và `{{ADMIN_PRODUCT_SKU}}` — V1 | **2xx**; 2 dòng lỗi "sku: this product belongs to another vendor"; sản phẩm V2/Admin không đổi — ⚠️ Q-V4 | P1 | OWASP API1 / Q-V4 |

### 5. AUTH — Phiên làm việc (5)

| TC ID | Scenario | Request | Expected Response | Priority | Testing Technique / Rule |
|---|---|---|---|---|---|
| `API_AUTH_TC_001` | Đăng nhập vendor đặt cookie đúng thuộc tính | `POST /auth/login` `{"email":"${VENDOR1_EMAIL}","password":"${VENDOR1_PASSWORD}"}` | **2xx**; `Set-Cookie` `access_token`, `refresh_token`: **HttpOnly**, **SameSite=Lax**, Secure (nếu HTTPS); Max-Age ≈ 7 ngày | P1 | Security Headers / Doc 04 |
| `API_AUTH_TC_002` | Refresh token hợp lệ | `POST /auth/refresh` với cookie refresh hợp lệ | **2xx**; cấp access token mới; refresh token **xoay vòng** (giá trị mới) | P1 | Session Management |
| `API_AUTH_TC_003` | Dùng lại refresh token cũ | Gửi lại refresh token đã dùng ở TC_002 | **401** "Invalid session"; refresh token mới cũng bị huỷ → phải đăng nhập lại | P1 | Token Reuse Detection |
| `API_AUTH_TC_004` | Gọi API bằng cookie cũ sau logout | Lưu cookie → `POST /auth/logout` → `GET /products/admin/all` bằng cookie cũ | **401** (JWT bị từ chối hoặc phiên huỷ — ghi nhận nếu access token còn hạn vẫn 200) | P1 | Session Invalidation |
| `API_AUTH_TC_005` | Rate limit đăng nhập 5 lần/phút/IP | 6 lần `POST /auth/login` sai mật khẩu trong 60 giây (email `auto.rl.{{TS}}@auto.test`) | Lần 1–5: **401**; lần 6: **429** | P2 | OWASP API4: Rate Limiting |

### 6. SEC — Bảo mật & độ bền (3)

| TC ID | Scenario | Request | Expected Response | Priority | Testing Technique / Rule |
|---|---|---|---|---|---|
| `API_SEC_TC_001` | JSON hỏng | `POST /products` body `{"name": "x",` (thiếu đóng) | **400**; không lộ stack trace | P2 | Error Handling |
| `API_SEC_TC_002` | Sai Content-Type | `POST /products` body JSON hợp lệ nhưng `Content-Type: text/plain` | **400** / **415**; không tạo sản phẩm | P3 | Protocol Standard |
| `API_SEC_TC_003` | Race condition SKU | Gửi song song 5 request `POST /products` cùng `sku` `AUTO-RACE-{{TS}}` | Đúng **1** request 201, còn lại **409**; DB chỉ 1 sản phẩm | P2 | Concurrency / Data Integrity |

---

## 📊 Thống Kê

| Nhóm | Số TC | P1 | P2 | P3 |
|------|-------|----|----|----|
| PERM | 30 | 16 | 9 | 5 |
| SCOPE | 10 | 9 | 1 | 0 |
| PROD | 22 | 12 | 8 | 2 |
| FILE | 8 | 6 | 2 | 0 |
| AUTH | 5 | 4 | 1 | 0 |
| SEC | 3 | 0 | 2 | 1 |
| **Tổng** | **78** | **47** | **23** | **8** |

> Hướng dẫn chạy: import vào Postman (Collection "PARSCA Vendor API"), tạo Environment theo bảng biến ở đầu file; sinh automation bằng `/gen-script` (spec trong `tests/api/`, xem `plans/automation/`); nếu Dev cung cấp OpenAPI spec có thể dùng thêm `/generate_api_tests_from_swagger` của kit gốc.
