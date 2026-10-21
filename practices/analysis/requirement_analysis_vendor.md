# 📋 Phân Tích Requirement: PARSCA-VENDOR
## Role Vendor — Cổng /vendor và tác động lên website bán hàng

> Theo workflow `/analyze_requirement_document` (kit gốc) — **KHÔNG chứa test cases**. Test cases nằm ở `practices/testcases/vendor/` và `practices/testcases/api/`.

---

## 1. Tổng Quan Ticket

| Thuộc tính | Giá trị |
|------------|---------|
| **ID** | PARSCA-VENDOR (bộ tài liệu `parsca-vendor-test-docs`) |
| **Type** | Business Requirement / Test Basis |
| **Nguồn** | Tài liệu BA viết từ đọc code BE + FE (chưa chạy hệ thống) |
| **Số file** | 22 (00 → 20 + README) |
| **Mục gốc** | 1.1 → 1.5, 2.1 → 2.19 |
| **Câu hỏi PO có sẵn** | Q-V2, Q-V4, Q-V5, Q-V6, Q-V8, Q-V9 |
| **Ngày phân tích** | 2026-10-20 |
| **Trạng thái** | Chờ xác nhận môi trường + câu trả lời PO |

---

## 2. User Story

> **As a** nhân sự bên bán (vendor) trên marketplace PARSCA,
> **I want** đăng nhập cổng `/vendor` để tạo, nhập hàng loạt, cập nhật trạng thái và quản lý sản phẩm của chính mình,
> **So that** sản phẩm của tôi xuất hiện trên website bán hàng cho khách, mà không ai khác (vendor khác) xem hay sửa được sản phẩm của tôi.

> **As an** admin PARSCA,
> **I want** cấp / thu hồi role vendor cho tài khoản,
> **So that** chỉ tài khoản được phép mới quản lý được sản phẩm và việc thu hồi có hiệu lực ngay.

---

## 3. Phạm Vi Áp Dụng (Scope)

| # | Khu vực | Route / Endpoint | Chạy thật | Doc |
|---|---------|------------------|-----------|-----|
| 1 | Quản trị role | /admin/users · `PATCH /users/:id/role` | ✅ | 02 |
| 2 | Xác thực | /login, /forgot-password, /reset-password · `/auth/*` | ✅ | 03, 04, 19 |
| 3 | Guard FE | /vendor/*, /admin/*, /profile, /orders | ✅ | 03 |
| 4 | Ma trận API | Nhóm 1 / 2 / 3 | ✅ | 05 |
| 5 | Sản phẩm | /vendor/products/* · `/products/admin/*`, `POST/PATCH/DELETE /products` | ✅ | 06 → 10 |
| 6 | Upload ảnh | `POST /products/upload` | ✅ | 11 |
| 7 | Import CSV | `GET /products/import/template`, `POST /products/import[?dryRun=true]` | ✅ | 12 |
| 8 | Dashboard | /vendor | ❌ Giả lập | 13 |
| 9 | Orders | /vendor/orders, /vendor/orders/:id | ❌ Giả lập | 14, 15 |
| 10 | Reviews | /vendor/reviews | ❌ Giả lập | 16 |
| 11 | Payouts | /vendor/payouts | ❌ Giả lập hoàn toàn | 17 |
| 12 | Settings | /vendor/settings/brand, /fitment | ❌ Giả lập | 18 |
| 13 | Profile | /vendor/profile · `POST /auth/me/avatar` | ⚠️ Một phần | 19 |
| 14 | Website | Storefront · `GET /products`, `/products/:idOrSlug` | ✅ | 20 |

---

## 4. Acceptance Criteria — Phân Tích Chi Tiết

> Mã AC chi tiết được định nghĩa trong `practices/requirements/parsca-vendor/0*.md`. Bảng dưới tóm tắt nhóm logic.

### 4.1. Cấp quyền & xác thực (ROLE, LOGIN, SESS)

| Nhóm | Quy tắc cốt lõi | Mặc định / Tuỳ chọn |
|------|-----------------|---------------------|
| Cấp role | Chỉ admin; role ∈ {user, vendor, admin}; vendorId luôn null | Không có tự đăng ký vendor |
| Thu hồi | Kiểm tra role từ DB mỗi request → mất quyền **ngay** | UI chỉ cập nhật khi /auth/me reload |
| Đăng nhập | Email hợp lệ + mật khẩu ≥ 8 ký tự; RSA `passwordCiphertext`; 401 chung | 5 lần/phút/IP → 429 |
| Điều hướng | vendor → /vendor; `?redirect=` chỉ nhận `/…` không `//…` | – |
| Phiên | Access 15 phút, refresh 7 ngày; refresh tự động 1 lần; upload không gửi lại | Reuse refresh token → huỷ phiên |

### 4.2. Phân quyền API & phạm vi dữ liệu (API, SCOPE)

| Quy tắc | Chi tiết |
|---------|----------|
| Nhóm 1 (vendor được gọi) | 8 endpoint sản phẩm + `/auth/me`, `/auth/logout`, avatar |
| Nhóm 2 (vendor bị cấm → 403) | users, dashboard/stats, blog admin, brand-logos, product-brands (ghi), fitment-options (ghi), quotes, newsletter |
| Nhóm 3 (công khai) | GET products/brands/fitment/blog…, POST contact/quotes/newsletter, sitemap, health, uploads |
| createdBy | BE tự thêm điều kiện `createdBy = vendorId` cho list/detail/sửa/xoá; người khác → **404** |
| vendorName | Admin lọc được; vendor bị bỏ qua |
| Duy nhất | SKU, slug duy nhất **toàn hệ thống** |

### 4.3. Quản lý sản phẩm (PLIST, PDTL, PFORM, PSTAT, IMG)

| So sánh | Tạo | Sửa |
|---------|-----|-----|
| Endpoint | `POST /products` | `PATCH /products/:id` (gửi toàn bộ form) |
| Nút | "Add Product" | "Update" |
| Checkbox "New" | Ẩn, luôn true | Hiện; false → true đặt lại thời điểm huy hiệu |
| createdBy | Gán = tài khoản đăng nhập | Không đổi |
| Kiểm tra trùng SKU/slug | Có | Có (loại trừ chính nó) |

### 4.4. Import CSV (CSV)

| Bước | Hành vi |
|------|---------|
| Template | `parsca-products-template.csv` — header + 1 dòng mẫu |
| Check file | `dryRun=true` → Rows / To create / To update / Skipped, không ghi |
| Import | Upsert theo SKU; dòng lỗi bỏ qua; mọi dòng → active |
| Giới hạn | .csv, ≤ 20 MB, ≤ 50.000 dòng, có dòng dữ liệu, đủ cột bắt buộc |
| Vendor | SKU của người khác → "sku: this product belongs to another vendor" |

### 4.5. Màn giả lập (DASH, ORD, ORDD, REV, PAY, SET, PROF một phần)

| Màn | Dữ liệu | Hành vi cần đảm bảo |
|-----|---------|---------------------|
| Dashboard | "—" + "Available in Epic 9/10/11" | Vendor không thấy khối Catalogue, không gọi `/dashboard/stats` |
| Orders | 20 đơn mẫu, chung mọi vendor | Lọc / tìm / phân trang phía trình duyệt |
| Order detail | Biến thể seller | Nút Invoice / Cancel / Track chỉ toast |
| Reviews | 13 đánh giá | Lọc sao, tìm, click → chi tiết đơn |
| Payouts | Thẻ số dư, 14 giao dịch, wizard 4 bước | Validation bước 1–2, Submit bước 3, che số TK |
| Settings | Brand, Fitment trong bộ nhớ | Reload mất; không ảnh hưởng form/website |
| Profile | Avatar thật; thông tin + Devices giả | Avatar upload ngay; Save chỉ toast |

---

## 5. Phụ Thuộc (Dependencies)

### 5.1. Phụ thuộc giữa modules

| Module đích | Phụ thuộc vào | Loại phụ thuộc |
|-------------|---------------|----------------|
| Mọi module vendor | LOGIN, SESS | Cần phiên hợp lệ |
| Mọi module vendor | ROLE | Tài khoản phải có role vendor |
| PLIST, PDTL, PFORM, PSTAT | SCOPE | Lọc createdBy |
| PFORM | IMG | 1–5 ảnh bắt buộc |
| PFORM | API công khai `/product-brands`, `/fitment-options` | Dữ liệu dropdown |
| WEB | PFORM, PSTAT, CSV | Trạng thái Active quyết định hiển thị |
| WEB (bộ lọc brand / xe) | CSV | Import thêm brand / giá trị xe vào danh mục chung |
| CSV | SESS | Hết phiên giữa chừng — không tự gửi lại |
| REV | ORD, ORDD | Click review mở chi tiết đơn |
| SET | API | Nếu đổi sang API thật → vendor 403 |

### 5.2. Business Rules tổng hợp (BR)

| Mã | Business Rule | Nguồn |
|----|---------------|-------|
| BR-01 | Chỉ admin cấp role vendor; role ∈ {user, vendor, admin} | 00, 02 |
| BR-02 | vendorId luôn null, không dùng phân quyền | 00, 02 |
| BR-03 | Thu hồi role có hiệu lực API ngay (kiểm tra DB mỗi request) | 02 |
| BR-04 | Sai email/mật khẩu → cùng 401 "Invalid email or password" | 03 |
| BR-05 | Redirect chỉ nhận đường dẫn bắt đầu "/" và không bắt đầu "//" | 03 |
| BR-06 | Reuse refresh token → huỷ cả phiên (401 "Invalid session") | 04 |
| BR-07 | Upload file không được tự gửi lại sau refresh | 04, 12, 19 |
| BR-08 | Vendor chỉ thấy/sửa/xoá sản phẩm có createdBy = mình; khác → 404 | 06 |
| BR-09 | SKU và slug duy nhất toàn hệ thống; SKU tự đổi CHỮ HOA | 06, 09 |
| BR-10 | Sản phẩm Active hiển thị website ngay; Draft/Archived ẩn | 06, 10, 20 |
| BR-11 | Sản phẩm phải có 1–5 ảnh; jpeg/png/webp/gif ≤ 10 MB | 09, 11 |
| BR-12 | stockCount nguyên ≥ 1 (form); inStock = stockCount > 0 | 09 |
| BR-13 | Xoá vĩnh viễn (204); ảnh chỉ xoá khi không sản phẩm nào khác dùng | 10 |
| BR-14 | Import: upsert theo SKU, ô trống không ghi đè, mọi dòng active | 12 |
| BR-15 | Import: slug = tên + SKU, nhập lại không đổi URL | 12 |
| BR-16 | Import (vendor): SKU người khác bị loại | 12 |

---

## 6. Phân Tích Mockup/Screenshot

> Không có mockup / screenshot trong bộ tài liệu. Mọi mô tả UI lấy từ đọc code FE. **Khi có môi trường**, chạy `/generate_requirements_from_website` (kit gốc) hoặc `ui_debug_agent` để đối chiếu nhãn, thông báo, locator thực tế trước khi automation.

---

## 7. Các Điểm Mơ Hồ & Rủi Ro

### 7.1. Điểm Mơ Hồ (Ambiguities)

| # | Câu hỏi | Nguy cơ | Mức độ | Liên kết |
|---|---------|---------|--------|----------|
| AMB-01 | Hai vendor cùng công ty có cần chia sẻ sản phẩm không? | Vận hành thực tế bất tiện, phải dùng chung tài khoản | 🔴 High | Q-V2 |
| AMB-02 | Có chấp nhận lộ thông tin SKU/slug của người khác qua 409 và lỗi import? | Rò rỉ dữ liệu cạnh tranh giữa vendor | 🔴 High | Q-V4 |
| AMB-03 | Vendor có được thay đổi danh mục dùng chung (brand, giá trị xe) gián tiếp qua import? | Danh mục website bị "rác", không có đường dọn cho vendor | 🔴 High | Q-V5 |
| AMB-04 | Có chặn xoá sản phẩm đã có đơn hàng? | Mất tham chiếu đơn hàng khi có API đơn thật | 🟡 Medium | Q-V6 |
| AMB-05 | Khi nối API đơn thật, đơn có tách theo vendor? Khách mở `/orders/:id` mẫu lộ PII mẫu | Rò rỉ PII khi go-live | 🔴 High | Q-V8 |
| AMB-06 | Chú thích "Available in Epic 9/10/11" có được hiển thị cho người dùng? | UX thiếu chuyên nghiệp | 🟢 Low | Q-V9 |
| AMB-07 | Vendor tự xuất bản Active, không qua duyệt — có chấp nhận? | Nội dung sai/vi phạm lên website ngay | 🔴 High | Q-V10 (mới) |
| AMB-08 | Vendor có được tự nhập Rating sản phẩm? | Gian lận điểm đánh giá | 🔴 High | Q-V11 (mới) |
| AMB-09 | Ô "In stock" bị bỏ qua (luôn true khi lưu qua form) — giữ ô này làm gì? | Người dùng hiểu nhầm | 🟡 Medium | Q-V12 (mới) |
| AMB-10 | Không cảnh báo rời form chưa lưu; ảnh đã upload bị bỏ lại trên storage | Mất dữ liệu nhập; tốn dung lượng | 🟡 Medium | Q-V13 (mới) |
| AMB-11 | "10 MB" = 10.000.000 hay 10.485.760 byte? | Kết quả test biên không thống nhất | 🟡 Medium | Q-V14 (mới) |
| AMB-12 | Compare at < Price có cần chặn? | Hiển thị giá gạch ngang vô lý | 🟡 Medium | Q-V15 (mới) |
| AMB-13 | Year start > Year end có cần chặn? | Dữ liệu tương thích xe sai, bộ lọc sai | 🟡 Medium | Q-V15 (mới) |
| AMB-14 | Subcategory không thuộc department vẫn lưu qua API — có cần chặn? | Sản phẩm hiện sai danh mục | 🟡 Medium | Q-V15 (mới) |
| AMB-15 | Tên chỉ có ký tự đặc biệt / không Latin → slug rỗng? [SUY LUẬN] | Lưu lỗi 500 hoặc URL hỏng | 🟡 Medium | – |
| AMB-16 | 3 huy hiệu cố định (Secure Payment, 30-day returns, 2-year warranty) có giữ? | Cam kết chính sách sai cho vendor | 🟡 Medium | Q-V16 (mới) |
| AMB-17 | Một tài khoản chỉ lưu 1 refresh token → mở 2 trình duyệt mất phiên cũ? [SUY LUẬN] | Vendor bị đăng xuất bất ngờ | 🟡 Medium | – |
| AMB-18 | Đơn vị "CAD" viết cứng; Payouts thẻ dùng "$$" bảng dùng "CAD" | Sai tiền tệ cho vendor ngoài Canada | 🟢 Low | – |
| AMB-19 | Import cập nhật sản phẩm đang Draft/Archived có chuyển thành Active? ("MỌI dòng đều thành active") | Sản phẩm vendor cố ý ẩn bị công khai lại | 🔴 High | Q-V17 (mới) |
| AMB-20 | Payouts: PayPal vẫn bắt buộc ngân hàng + số TK; Company bị ép W-8BEN; người Mỹ không hoàn tất | Yêu cầu thật khi nối Tipalti chưa rõ | 🟡 Medium | – |
| AMB-21 | Profile "Status Active/Inactive" chỉ là ô giả — có ẩn đi? | Vendor tưởng khoá được tài khoản | 🟢 Low | – |
| AMB-22 | Sau khi hạ quyền, UI cần cập nhật trong bao lâu? | Vendor vẫn thấy khung vendor dù API 403 | 🟡 Medium | – |
| AMB-23 | Ô tìm kiếm không có debounce rõ ràng | Gọi API mỗi phím, giật danh sách | 🟢 Low | – |
| AMB-24 | Empty state "No products." chung cho "chưa có" và "không khớp lọc" | UX khó hiểu | 🟢 Low | – |
| AMB-25 | Bước Done của Payouts ghi "press the back button" nhưng không có nút Back | Hướng dẫn sai | 🟢 Low | – |
| AMB-26 | Dữ liệu mẫu Payouts chứa họ tên, email, SĐT, số TK trông như thật | Lộ PII nếu lên production | 🔴 High | – |

### 7.2. Rủi Ro Kiểm Thử

| # | Rủi ro | Mô tả | Mitigation |
|---|--------|-------|------------|
| RISK-01 | Lệch FE/BE `/v1`, `{data, meta}` | Mọi chức năng gọi API có thể lỗi | Pre-flight bắt buộc; mọi API lỗi → BLOCKED, không log bug từng màn |
| RISK-02 | Tài liệu viết từ code, chưa chạy | Nhãn, thông báo có thể khác thực tế | Đối chiếu khi chạy; cập nhật TC; inspect DOM trước automation |
| RISK-03 | TTL access token 15 phút | Test refresh tốn thời gian | Nhờ Dev rút TTL (`@NeedDevSupport`) |
| RISK-04 | Rate limit 5 lần/phút/IP | Cả team dùng chung IP bị 429 | Chạy TC rate limit riêng, cuối phiên; chờ 60 giây |
| RISK-05 | Import làm bẩn danh mục dùng chung | Brand / giá trị xe test không thể xoá bằng vendor | Dùng tiền tố `AUTO` cho brand test; nhờ admin dọn |
| RISK-06 | Cache Redis | Website cập nhật trễ → kết luận sai | Hỏi Dev có Redis; ghi thời điểm; chỉ kết luận sau khi tạo/sửa/xoá thành công |
| RISK-07 | Dữ liệu giả lập phụ thuộc ngày | Bộ lọc thời gian tương đối rỗng vào 10/2026 | Ghi rõ trong TC — không phải lỗi |
| RISK-08 | File lớn (20 MB, 50.000 dòng) | Import chạy vài phút, có thể timeout proxy | Chạy ngoài giờ cao điểm; ghi thời gian |
| RISK-09 | Email forgot password | Môi trường test có thể không gửi mail | Hỏi Dev hộp thư test / log mail |
| RISK-10 | Dữ liệu test bị xoá chéo | Tester khác dùng chung V1 | Mỗi tester dùng SKU tiền tố riêng `AUTO-<initials>-` |

---

## 8. Ma Trận Trạng Thái

### 8.1. Trạng thái sản phẩm → Hiển thị

| Trạng thái | DS vendor (lọc mặc định "Active products") | DS vendor ("All statuses") | Website `GET /products` | Link công khai `/products/:slug` | Admin |
|------------|-----------|-----------|-----------|-----------|-------|
| Active | ✅ Hiện | ✅ | ✅ Hiện ngay | ✅ 200 | ✅ |
| Draft | ❌ Ẩn | ✅ | ❌ Ẩn | ❌ 404 | ✅ |
| Archived | ❌ Ẩn | ✅ | ❌ Ẩn | ❌ 404 | ✅ |
| Đã xoá | ❌ | ❌ | ❌ | ❌ 404 | ❌ (404) |

### 8.2. Chuyển trạng thái sản phẩm hợp lệ

| Từ \ Sang | Active | Draft | Archived | Xoá |
|-----------|--------|-------|----------|-----|
| Active | – | ✅ | ✅ | ✅ |
| Draft | ✅ | – | ✅ | ✅ |
| Archived | ✅ | ✅ | – | ✅ |
| Đã xoá | ❌ (404) | ❌ | ❌ | ❌ (404) |

### 8.3. Role → Khu vực (FE guard)

| Role \ Khu vực | /vendor/* | /admin/* | /profile, /orders |
|----------------|-----------|----------|-------------------|
| Chưa đăng nhập | → /login | → /login | → /login |
| User | → "/" | → "/" | ✅ |
| Vendor | ✅ | → /vendor | ✅ |
| Admin | → /admin | ✅ | ✅ |

### 8.4. Vòng đời phiên

| Trạng thái | Sự kiện | Trạng thái kế tiếp |
|------------|---------|--------------------|
| Chưa đăng nhập | Login OK | Phiên hợp lệ (access 15', refresh 7 ngày) |
| Phiên hợp lệ | Access hết hạn + gọi API | FE tự refresh 1 lần → Phiên hợp lệ |
| Phiên hợp lệ | Refresh thất bại | Xoá cờ `parsca_session` → `/login?redirect=…` |
| Phiên hợp lệ | Reuse refresh token cũ | Huỷ phiên (401 "Invalid session") |
| Phiên hợp lệ | Logout | Xoá cookie + refresh token server → trang chủ |
| Phiên hợp lệ | Reset mật khẩu thành công | Mọi phiên bị huỷ |

---

## 9. Tóm Tắt Acceptance Criteria (Checklist)

**Xác thực & phân quyền**
- [ ] Chỉ admin cấp/thu hồi role; role sai 400; user không tồn tại 404; admin không tự hạ quyền
- [ ] Hạ quyền vendor có hiệu lực API ngay
- [ ] Điều hướng sau login đúng role; redirect an toàn
- [ ] Guard FE đúng ma trận 4 × 3
- [ ] Refresh tự động, reuse token huỷ phiên, logout huỷ cookie, đa tab mất phiên
- [ ] 3 nhóm API trả đúng 401/403/200 cho 4 vai

**Phạm vi dữ liệu**
- [ ] Vendor chỉ thấy sản phẩm của mình; truy cập người khác 404; `vendorName` bị bỏ qua
- [ ] SKU/slug duy nhất toàn hệ thống (ghi nhận rò rỉ Q-V4)

**Sản phẩm**
- [ ] Danh sách: search, lọc department/status, sort, phân trang 10/20/30/50, max 100
- [ ] Form: validate từng trường, 1–5 ảnh, brand mặc định theo department, slug theo tên
- [ ] Đổi trạng thái khoá ô chọn mọi hàng khi đang chạy; xoá vĩnh viễn, hộp thoại không đóng khi click ngoài
- [ ] Upload ảnh: định dạng + 10 MB

**Import CSV**
- [ ] Template, dry run, import thật, upsert theo SKU, lỗi dòng, giới hạn file
- [ ] Mất kết nối / hết phiên không import hai lần

**Giả lập**
- [ ] Không gọi API sai (`/dashboard/stats`), không có khối admin
- [ ] Lọc / tìm / phân trang dữ liệu mẫu đúng
- [ ] Payouts: validation từng ô, che số TK, reload về dữ liệu mẫu

**Website**
- [ ] Active hiện ngay, Draft/Archived/xoá biến mất, link công khai Draft 404

---

## 10. Khuyến Nghị Cho Kiểm Thử

1. **Ưu tiên tuyệt đối** quy tắc createdBy (SCOPE) qua **API** — UI ẩn không có nghĩa là API chặn.
2. Chạy **ma trận 4 vai** cho mọi endpoint (file API đã data-driven sẵn).
3. Test **hạ quyền vendor** khi vendor đang mở trang — đo thời gian UI cập nhật.
4. **Open redirect** `?redirect=//evil.com` và `?redirect=/admin` là TC bảo mật bắt buộc.
5. Import CSV: luôn **Check file trước**, đối chiếu To create / To update với kết quả thật; import lại cùng file để chứng minh **không nhân đôi**.
6. Kiểm tra **website** ngay sau mỗi đổi trạng thái (ghi nhận cache nếu có).
7. Mọi TC `@CodeHienTai` phải kết thúc bằng **Bug hoặc Q-V**, không PASS.
8. Chuẩn bị fixture file (ảnh 10/11 MB, CSV lớn) **trước** khi bắt đầu đợt test.
9. Với màn giả lập: tập trung **lỗ hổng validation** và **rò rỉ PII mẫu**, không log bug "không lưu".
10. Ghi lại **request/response** cho mọi lỗi phân quyền để Dev tái hiện nhanh.
