# TEST CASES — PARSCA VENDOR: CẤP ROLE, ĐĂNG NHẬP & PHIÊN

| Thông tin | Chi tiết |
|-----------|----------|
| **Dự án** | PARSCA — Role Vendor |
| **Module** | ROLE · LOGIN · SESS |
| **URL** | `{FE_URL}/login`, `{FE_URL}/admin/users`, `{FE_URL}/vendor` |
| **Requirements** | `practices/requirements/parsca-vendor/01_requirements_auth_role_session.md` |
| **Doc nguồn** | 02, 03, 04 |
| **Phương pháp** | AI-RBT (Risk-Based Testing) — FULL 6 bước |
| **Ngày tạo** | 2026-10-20 |
| **Tổng số TC** | 36 |

> **Quy ước Test Data:** tài khoản lấy từ biến môi trường (`${VENDOR1_EMAIL}`, `${VENDOR1_PASSWORD}`, …) — **không** ghi mật khẩu thật vào file. Viewport: 1920×1080, Chrome.

---

## TỔNG HỢP RISK LEVEL

| Module | Risk Level | Số TC |
|--------|-----------|-------|
| M1: ROLE — Cấp / thu hồi role vendor | 🔴 High | 9 |
| M2: LOGIN — Đăng nhập & điều hướng | 🔴 High | 18 |
| M3: SESS — Phiên & đăng xuất | 🔴 High | 9 |

---

## TRACEABILITY MATRIX

| Requirement | Test Cases |
|------------|------------|
| AC-ROLE-01 | ROLE_TC_001, ROLE_TC_007 |
| AC-ROLE-02 | ROLE_TC_002 |
| AC-ROLE-03 | ROLE_TC_003 |
| AC-ROLE-04 | ROLE_TC_004 |
| AC-ROLE-05 | ROLE_TC_009 |
| AC-ROLE-06 | ROLE_TC_005, ROLE_TC_007 |
| AC-ROLE-07 | ROLE_TC_006 |
| AC-ROLE-08 | ROLE_TC_008 |
| AC-ROLE-09 | ROLE_TC_001 |
| AC-LOGIN-01 | LOGIN_TC_001 |
| AC-LOGIN-02 | LOGIN_TC_002 |
| AC-LOGIN-03 | LOGIN_TC_003, LOGIN_TC_004 |
| AC-LOGIN-04 | LOGIN_TC_005, LOGIN_TC_006 |
| AC-LOGIN-05 | LOGIN_TC_007 |
| AC-LOGIN-06 | LOGIN_TC_008 |
| AC-LOGIN-07 | LOGIN_TC_009 |
| AC-LOGIN-08 | LOGIN_TC_010, LOGIN_TC_011, LOGIN_TC_012, LOGIN_TC_013 |
| AC-LOGIN-09 | LOGIN_TC_014, LOGIN_TC_015, LOGIN_TC_016 |
| AC-LOGIN-10 | LOGIN_TC_017 |
| AC-LOGIN-11 | LOGIN_TC_018 |
| AC-SESS-01 | SESS_TC_001 |
| AC-SESS-02 | SESS_TC_002 |
| AC-SESS-03 | SESS_TC_003 |
| AC-SESS-04 | SESS_TC_004, SESS_TC_009 |
| AC-SESS-05 | SESS_TC_005 |
| AC-SESS-06 | SESS_TC_006 |
| AC-SESS-07 | SESS_TC_007 |
| AC-SESS-08 | SESS_TC_008 |

---

## BẢNG TEST CASES

### M1: ROLE — Cấp / thu hồi role vendor (🔴 High Risk)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_ROLE_TC_001 | M1: ROLE | 🔴 High | Admin nâng user thành vendor qua màn /admin/users | Đăng nhập Admin; tài khoản `${ROLE_TEST_EMAIL}` đang role user | 1. Mở `{FE_URL}/admin/users`<br>2. Bấm bộ lọc role "user", ghi lại số lượng user/vendor<br>3. Tìm `${ROLE_TEST_EMAIL}`, chọn "vendor" ở ô role<br>4. Quan sát toast và bộ lọc role<br>5. Đăng xuất Admin, đăng nhập bằng `${ROLE_TEST_EMAIL}` | 1. Bảng Users hiển thị kèm bộ lọc role user / vendor / admin có số lượng<br>2. Danh sách chỉ còn user; số lượng hiển thị đúng<br>3. Ô role đổi sang "vendor"<br>4. Toast **"Role updated to vendor"**; số lượng vendor +1, user −1<br>5. Đăng nhập thành công và được chuyển vào **/vendor** | Critical | Admin: `${ADMIN_EMAIL}`<br>Tài khoản: `${ROLE_TEST_EMAIL}` / `${ROLE_TEST_PASSWORD}`<br>Role mới: `vendor` | Yes | UI | @Smoke @CriticalPath @Regression |
| PARSCA_ROLE_TC_002 | M1: ROLE | 🔴 High | API đổi role sang vendor trả role vendor và vendorId null | Có token Admin; biết `id` của `${ROLE_TEST_EMAIL}` (role user) | 1. Gửi `PATCH {API_URL}/users/{id}/role` body `{"role":"vendor"}` bằng token Admin<br>2. Đăng nhập bằng `${ROLE_TEST_EMAIL}`, gọi `GET {API_URL}/auth/me` | 1. **200 OK**; body có `role: "vendor"`, `vendorId: null`; không trả password/hash<br>2. **200 OK**; `role: "vendor"`, `vendorId: null` | Critical | Body: `{"role":"vendor"}` | Yes | API | @CriticalPath @Regression |
| PARSCA_ROLE_TC_003 | M1: ROLE | 🔴 High | API đổi role với giá trị không hợp lệ bị từ chối | Có token Admin | 1. Gửi `PATCH /users/{id}/role` body `{"role":"superadmin"}`<br>2. Gửi lại với `{"role":"VENDOR"}`<br>3. Gửi lại với `{"role":""}`<br>4. Gọi `GET /users` kiểm tra role tài khoản | 1. **400** "Role must be user, vendor, or admin"<br>2. **400** cùng thông báo (phân biệt hoa thường) — nếu 200 thì ghi nhận<br>3. **400** cùng thông báo<br>4. Role tài khoản không thay đổi | High | `superadmin`, `VENDOR`, `""` | Yes | API | @Regression @Boundary |
| PARSCA_ROLE_TC_004 | M1: ROLE | 🔴 High | API đổi role cho user không tồn tại trả 404 | Có token Admin | 1. Gửi `PATCH /users/{id_không_tồn_tại}/role` body `{"role":"vendor"}` | 1. **404** "User not found" | Medium | id: `000000000000000000000000` | Yes | API | @Regression |
| PARSCA_ROLE_TC_005 | M1: ROLE | 🔴 High | Hạ vendor xuống user — mất quyền API ngay lập tức | V-test (`${ROLE_TEST_EMAIL}`) đang role vendor, đang đăng nhập ở trình duyệt A, mở `/vendor/products` | 1. Trình duyệt B: Admin hạ `${ROLE_TEST_EMAIL}` về "user", ghi thời điểm T0<br>2. Trình duyệt A (trong 1 phút sau T0): gọi `GET {API_URL}/products/admin/all` (DevTools Console/fetch hoặc thao tác lọc trên danh sách)<br>3. Trình duyệt A: tiếp tục ở lại trang `/vendor/products`, ghi lại thời điểm UI đổi trạng thái<br>4. Trình duyệt A: tải lại trang (F5) | 1. Toast "Role updated to user"<br>2. **403** "You do not have permission to access this resource" — **không** phải đợi 15 phút<br>3. UI có thể vẫn hiển thị khung vendor đến khi `/auth/me` được tải lại — ghi nhận khoảng thời gian (AMB-22)<br>4. Bị chuyển về "/" (role user không vào /vendor) | Critical | Tài khoản: `${ROLE_TEST_EMAIL}`<br>Role: vendor → user | Partial | API | @Security @CriticalPath @Regression |
| PARSCA_ROLE_TC_006 | M1: ROLE | 🔴 High | Hạ vendor xuống user — vendorId bị xoá (null) | `${ROLE_TEST_EMAIL}` đang role vendor | 1. Admin gọi `PATCH /users/{id}/role` body `{"role":"user"}`<br>2. Admin gọi `GET /users` tìm tài khoản<br>3. Đăng nhập tài khoản đó, gọi `GET /auth/me` | 1. **200**; `role: "user"`, `vendorId: null`<br>2. Tài khoản hiển thị role user, `vendorId: null`<br>3. `role: "user"`, `vendorId: null` | High | Role: vendor → user | Yes | API | @Regression |
| PARSCA_ROLE_TC_007 | M1: ROLE | 🔴 High | Chuyển role liên tiếp vendor → admin → user, kiểm tra từng bước | `${ROLE_TEST_EMAIL}` đang role user; đăng nhập Admin ở trình duyệt B | 1. Admin đổi sang "vendor"; tài khoản test đăng nhập ở trình duyệt A, mở `/vendor` và `/admin`<br>2. Admin đổi sang "admin"; trình duyệt A tải lại `/vendor` và `/admin`<br>3. Admin đổi sang "user"; trình duyệt A tải lại `/vendor`, `/admin`, `/profile`<br>4. Sau mỗi bước gọi `GET /auth/me` | 1. `/vendor` vào được; `/admin` → chuyển `/vendor`<br>2. `/vendor` → chuyển `/admin`; `/admin` vào được<br>3. `/vendor` → "/"; `/admin` → "/"; `/profile` vào được<br>4. `role` đúng từng bước; `vendorId: null` ở mọi bước | High | Chuỗi: user → vendor → admin → user | Partial | UI | @Regression @CriticalPath |
| PARSCA_ROLE_TC_008 | M1: ROLE | 🔴 High | Token user hoặc vendor gọi API đổi role bị 403 (chống leo thang quyền) | Có token User, token Vendor (V1) | 1. Token User gửi `PATCH /users/{id_V1}/role` body `{"role":"admin"}`<br>2. Token V1 gửi `PATCH /users/{id_V1}/role` body `{"role":"admin"}` (tự nâng quyền)<br>3. Token V1 gửi `PATCH /users/{id_user}/role` body `{"role":"vendor"}`<br>4. Không token gửi request bước 2 | 1. **403** "You do not have permission to access this resource"<br>2. **403**; V1 vẫn role vendor<br>3. **403**; user vẫn role user<br>4. **401** | Critical | Token: User, V1, không token | Yes | API | @Security @Regression |
| PARSCA_ROLE_TC_009 | M1: ROLE | 🔴 High | Admin không thể tự bỏ quyền admin của chính mình | Đăng nhập Admin | 1. Mở `/admin/users`, tìm dòng của chính Admin<br>2. Quan sát ô role<br>3. Gửi `PATCH /users/{id_admin}/role` body `{"role":"user"}` bằng token của chính Admin<br>4. Gửi lại với `{"role":"vendor"}` | 1. Dòng của Admin hiển thị<br>2. Ô role bị **khoá**, chú thích "You cannot change your own admin role"<br>3. **400** "You cannot remove your own admin role"<br>4. **400** cùng thông báo; Admin vẫn role admin | High | Admin: `${ADMIN_EMAIL}` | Yes | API | @Security @Regression |

---

### M2: LOGIN — Đăng nhập & điều hướng (🔴 High Risk)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_LOGIN_TC_001 | M2: LOGIN | 🔴 High | Vendor đăng nhập thành công và được chuyển vào /vendor | Tài khoản V1 role vendor; chưa đăng nhập | 1. Mở `{FE_URL}/login`<br>2. Nhập Email `${VENDOR1_EMAIL}`<br>3. Nhập Password `${VENDOR1_PASSWORD}`<br>4. Bấm Đăng nhập<br>5. Quan sát menu trái và thanh trên | 1. Form đăng nhập hiển thị Email, Password, nút đăng nhập, link Quên mật khẩu<br>2-3. Dữ liệu được nhập, mật khẩu masked<br>4. Chuyển tới **/vendor** (Dashboard "Overview")<br>5. Menu trái: Dashboard, Product Catalog, Orders, Review, Payouts; thanh trên: chuông, bánh răng, avatar | Critical | Email: `${VENDOR1_EMAIL}`<br>Password: `${VENDOR1_PASSWORD}` | Yes | UI | @Smoke @CriticalPath |
| PARSCA_LOGIN_TC_002 | M2: LOGIN | 🔴 High | Mật khẩu được mã hoá RSA, không gửi plaintext | Chưa đăng nhập; mở DevTools → Network | 1. Mở `/login`, nhập `${VENDOR1_EMAIL}` / `${VENDOR1_PASSWORD}`<br>2. Bấm Đăng nhập<br>3. Mở request `POST /auth/login` → Payload | 1. Dữ liệu được nhập<br>2. Đăng nhập thành công<br>3. Body có trường `passwordCiphertext` (chuỗi mã hoá); **không** có trường `password` hay giá trị mật khẩu gốc | High | Email: `${VENDOR1_EMAIL}` | Yes | UI | @Security @Regression |
| PARSCA_LOGIN_TC_003 | M2: LOGIN | 🔴 High | Đăng nhập sai mật khẩu với email vendor tồn tại | V1 tồn tại | 1. Mở `/login`<br>2. Nhập Email `${VENDOR1_EMAIL}`<br>3. Nhập Password `SaiMatKhau@2026`<br>4. Bấm Đăng nhập | 1. Form hiển thị<br>2-3. Dữ liệu được nhập<br>4. **401**; thông báo **"Invalid email or password"**; vẫn ở /login | High | Password: `SaiMatKhau@2026` | Yes | UI | @Security @Regression |
| PARSCA_LOGIN_TC_004 | M2: LOGIN | 🔴 High | Thông báo lỗi không tiết lộ email có tồn tại hay không | – | 1. Đăng nhập `${VENDOR1_EMAIL}` + `WrongPass@001` → ghi thông báo A<br>2. Đăng nhập `notexist_login_20261020@auto.test` + `WrongPass@001` → ghi thông báo B<br>3. So sánh A, B và status code | 1. Thông báo A: "Invalid email or password" (401)<br>2. Thông báo B: "Invalid email or password" (401)<br>3. A = B, cùng status 401 — không phân biệt email sai hay mật khẩu sai | High | Email không tồn tại: `notexist_login_20261020@auto.test`<br>Password: `WrongPass@001` | Yes | UI | @Security @Regression |
| PARSCA_LOGIN_TC_005 | M2: LOGIN | 🔴 High | Validation trường Email (trống, sai định dạng) | – | 1. Để trống Email, nhập Password `Test@12345`, bấm Đăng nhập<br>2. Nhập Email `vendor.parsca`, bấm Đăng nhập<br>3. Nhập Email `vendor@`, bấm Đăng nhập<br>4. Nhập Email `  ${VENDOR1_EMAIL}  ` (khoảng trắng 2 đầu) + mật khẩu đúng | 1. Lỗi bắt buộc nhập Email; không gửi request<br>2. Lỗi định dạng email; không gửi request<br>3. Lỗi định dạng email<br>4. Ghi nhận: hệ thống trim và đăng nhập được, hoặc báo lỗi rõ ràng (không lỗi 500) | High | `""`, `vendor.parsca`, `vendor@`, email có khoảng trắng | Yes | UI | @Regression @Boundary |
| PARSCA_LOGIN_TC_006 | M2: LOGIN | 🔴 High | Validation Password tối thiểu 8 ký tự (BVA) | – | 1. Email `${VENDOR1_EMAIL}`, Password trống, bấm Đăng nhập<br>2. Password 7 ký tự `Abc@123`, bấm Đăng nhập<br>3. Password 8 ký tự `Abc@1234` (sai), bấm Đăng nhập | 1. Lỗi bắt buộc nhập mật khẩu<br>2. Lỗi tối thiểu 8 ký tự; không gửi request<br>3. Form cho gửi; nhận 401 "Invalid email or password" | High | `""`, `Abc@123` (7), `Abc@1234` (8) | Yes | UI | @Regression @Boundary |
| PARSCA_LOGIN_TC_007 | M2: LOGIN | 🟡 Medium | Quên mật khẩu luôn báo thành công dù email tồn tại hay không | – | 1. Ở `/login` bấm "Quên mật khẩu"<br>2. Nhập `${VENDOR1_EMAIL}`, gửi → ghi thông báo A<br>3. Nhập `notexist_forgot_20261020@auto.test`, gửi → ghi thông báo B | 1. Chuyển tới **/forgot-password**<br>2. Thông báo thành công<br>3. Thông báo thành công **giống A** (không tiết lộ email tồn tại) | Medium | Email không tồn tại: `notexist_forgot_20261020@auto.test` | Yes | UI | @Security @Regression |
| PARSCA_LOGIN_TC_008 | M2: LOGIN | 🔴 High | Rate limit — 6 lần đăng nhập trong 60 giây bị 429 | Chạy cuối phiên test (ảnh hưởng IP chung) | 1. Gửi `POST /auth/login` sai mật khẩu lần 1 → 5 trong vòng 60 giây<br>2. Gửi lần thứ 6 ngay sau đó<br>3. Đợi 60 giây, đăng nhập đúng | 1. Lần 1–5: 401 "Invalid email or password"<br>2. Lần 6: **429** Too Many Requests; UI hiển thị thông báo, không crash<br>3. Đăng nhập thành công | High | Password sai: `WrongPass@001` → `WrongPass@006` | Yes | API | @Security @Regression @NeedDevSupport |
| PARSCA_LOGIN_TC_009 | M2: LOGIN | 🔴 High | Token nằm trong cookie httpOnly, FE chỉ lưu cờ parsca_session | V1 vừa đăng nhập | 1. DevTools → Application → Cookies<br>2. DevTools → Console: `document.cookie`<br>3. DevTools → Application → Local Storage | 1. Có `access_token`, `refresh_token` với cờ **HttpOnly** ✔, SameSite=Lax<br>2. Kết quả **không** chứa `access_token` / `refresh_token`<br>3. Có `parsca_session = "1"`; không có token nào trong localStorage | High | – | Yes | UI | @Security @Regression |
| PARSCA_LOGIN_TC_010 | M2: LOGIN | 🔴 High | Ma trận chặn truy cập — Vendor | V1 đã đăng nhập | 1. Truy cập `{FE_URL}/vendor/products`<br>2. Truy cập `{FE_URL}/admin`<br>3. Truy cập `{FE_URL}/admin/users`<br>4. Truy cập `{FE_URL}/profile` và `{FE_URL}/orders` | 1. Vào được<br>2. Chuyển tới **/vendor**<br>3. Chuyển tới **/vendor**<br>4. Vào được, **không** bị chuyển sang /vendor | Critical | Tài khoản: V1 | Yes | UI | @Smoke @Security @CriticalPath |
| PARSCA_LOGIN_TC_011 | M2: LOGIN | 🔴 High | Ma trận chặn truy cập — Chưa đăng nhập | Đã đăng xuất; xoá cookie | 1. Truy cập `{FE_URL}/vendor`<br>2. Truy cập `{FE_URL}/vendor/products/new`<br>3. Truy cập `{FE_URL}/admin`<br>4. Truy cập `{FE_URL}/profile` | 1-4. Mỗi trường hợp đều chuyển tới **/login** (kèm `?redirect=` về trang gốc nếu có) | Critical | – | Yes | UI | @Security @Regression |
| PARSCA_LOGIN_TC_012 | M2: LOGIN | 🔴 High | Ma trận chặn truy cập — User thường | User đã đăng nhập | 1. Truy cập `{FE_URL}/vendor`<br>2. Truy cập `{FE_URL}/vendor/products`<br>3. Truy cập `{FE_URL}/admin`<br>4. Truy cập `{FE_URL}/profile` | 1. Chuyển về **"/"**<br>2. Chuyển về **"/"**<br>3. Chuyển về **"/"**<br>4. Vào được | Critical | Tài khoản: `${USER_EMAIL}` | Yes | UI | @Security @Regression |
| PARSCA_LOGIN_TC_013 | M2: LOGIN | 🔴 High | Ma trận chặn truy cập — Admin | Admin đã đăng nhập | 1. Truy cập `{FE_URL}/vendor`<br>2. Truy cập `{FE_URL}/vendor/products`<br>3. Truy cập `{FE_URL}/admin`<br>4. Truy cập `{FE_URL}/profile` | 1. Chuyển tới **/admin**<br>2. Chuyển tới **/admin**<br>3. Vào được<br>4. Vào được | High | Tài khoản: `${ADMIN_EMAIL}` | Yes | UI | @Security @Regression |
| PARSCA_LOGIN_TC_014 | M2: LOGIN | 🔴 High | Redirect hợp lệ sau đăng nhập tới /vendor/products | Chưa đăng nhập | 1. Mở `{FE_URL}/login?redirect=/vendor/products`<br>2. Đăng nhập V1 | 1. Form đăng nhập hiển thị<br>2. Chuyển thẳng tới **/vendor/products** | High | redirect: `/vendor/products` | Yes | UI | @Regression |
| PARSCA_LOGIN_TC_015 | M2: LOGIN | 🔴 High | Redirect tới khu vực admin bằng tài khoản vendor bị chặn | Chưa đăng nhập | 1. Mở `{FE_URL}/login?redirect=/admin`<br>2. Đăng nhập V1<br>3. Lặp lại với `?redirect=/admin/users` | 1. Form hiển thị<br>2. Cuối cùng ở **/vendor** (không hiển thị nội dung admin)<br>3. Cuối cùng ở **/vendor** | High | redirect: `/admin`, `/admin/users` | Yes | UI | @Security @Regression |
| PARSCA_LOGIN_TC_016 | M2: LOGIN | 🔴 High | Chặn open redirect ra domain ngoài | Chưa đăng nhập | 1. Mở `{FE_URL}/login?redirect=//evil.com`, đăng nhập V1<br>2. Đăng xuất; mở `?redirect=https://evil.com`, đăng nhập V1<br>3. Đăng xuất; mở `?redirect=/\evil.com`, đăng nhập V1<br>4. Đăng xuất; mở `?redirect=%2F%2Fevil.com`, đăng nhập V1 | 1. Tham số bị bỏ qua → **/vendor**; không rời domain PARSCA<br>2. Bị bỏ qua → /vendor<br>3. Không rời domain (ghi nhận hành vi)<br>4. Không rời domain (ghi nhận hành vi) | Critical | `//evil.com`, `https://evil.com`, `/\evil.com`, `%2F%2Fevil.com` | Yes | UI | @Security @Regression |
| PARSCA_LOGIN_TC_017 | M2: LOGIN | 🟡 Medium | /auth/me lỗi tạm thời — hiện "không khả dụng", không đá ra /login | V1 đã đăng nhập; Dev hỗ trợ tắt BE (hoặc DevTools chặn request `/auth/me` trả 503) | 1. Tắt BE / chặn `/auth/me` trả 503<br>2. Mở `{FE_URL}/vendor`<br>3. DevTools → Network: chuyển "Offline", tải lại trang<br>4. Bật lại BE / Online, tải lại | 1. –<br>2. Hiển thị trạng thái **"không khả dụng"**; **không** chuyển /login; cờ `parsca_session` còn<br>3. Hiển thị trạng thái không khả dụng, không chuyển /login<br>4. Vào /vendor bình thường, không cần đăng nhập lại | Medium | Lỗi giả lập: 503 / Offline | Partial | UI | @Regression @NeedDevSupport |
| PARSCA_LOGIN_TC_018 | M2: LOGIN | 🔴 High | Sau đăng xuất, nút Back không hiển thị khung vendor | V1 đang ở `/vendor/products` | 1. Avatar → Log out<br>2. Bấm nút **Back** của trình duyệt<br>3. Quan sát trang | 1. Về trang chủ, toast thành công<br>2-3. **Không** thấy khung vendor/dữ liệu sản phẩm; bị chuyển tới /login | High | Tài khoản: V1 | Yes | UI | @Security @Regression |

---

### M3: SESS — Phiên & đăng xuất (🔴 High Risk)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_SESS_TC_001 | M3: SESS | 🔴 High | Refresh tự động khi access token hết hạn | Dev rút TTL access token (vd 1 phút) hoặc chờ 15 phút; V1 đăng nhập; DevTools Network mở | 1. Đợi access token hết hạn<br>2. Ở `/vendor/products`, đổi bộ lọc trạng thái sang "Draft products"<br>3. Quan sát Network | 1. –<br>2. Danh sách tải bình thường, không bị đá ra /login<br>3. Thứ tự: `GET /products/admin/all` **401** → `POST /auth/refresh` **200** → `GET /products/admin/all` **200** (gửi lại 1 lần) | High | TTL rút: 1 phút | Partial | UI | @Regression @NeedDevSupport |
| PARSCA_SESS_TC_002 | M3: SESS | 🟡 Medium | Nhiều request 401 cùng lúc dùng chung một lần refresh | Access token đã hết hạn (như SESS_TC_001) | 1. Mở `/vendor/products/new` (form gọi đồng thời `/product-brands`, `/fitment-options`, …)<br>2. Quan sát Network | 1. Form tải đủ dữ liệu<br>2. Chỉ có **1** request `POST /auth/refresh`; các request 401 đều được gửi lại sau refresh | Medium | – | Partial | UI | @Regression @NeedDevSupport |
| PARSCA_SESS_TC_003 | M3: SESS | 🔴 High | Refresh thất bại → chuyển /login?redirect và xoá cờ phiên | V1 đăng nhập; access token đã hết hạn | 1. DevTools → Cookies: xoá `refresh_token`<br>2. Ở `/vendor/products?page=2` thao tác đổi trang<br>3. Kiểm tra URL và localStorage | 1. –<br>2. `/auth/refresh` thất bại (401)<br>3. Chuyển tới **/login?redirect=/vendor/products...**; `parsca_session` bị xoá; đăng nhập lại → quay về đúng trang | High | – | Partial | UI | @Regression |
| PARSCA_SESS_TC_004 | M3: SESS | 🔴 High | Đăng xuất — cookie cũ gọi API bị 401 | V1 đăng nhập; copy giá trị cookie `access_token` trước khi logout | 1. Avatar → Log out<br>2. Quan sát trang và toast<br>3. Postman gửi `GET {API_URL}/products/admin/all` với header `Cookie: access_token=<giá trị cũ>`<br>4. Postman gửi `POST {API_URL}/auth/refresh` với `refresh_token` cũ | 1. `POST /auth/logout` 200<br>2. Về **trang chủ ngay** + toast thành công; cookie bị xoá<br>3. **401** (nếu 200 trong thời hạn 15 phút → ghi nhận: access token không bị thu hồi)<br>4. **401** — refresh token đã bị xoá phía server | Critical | Cookie cũ của V1 | Yes | API | @Smoke @Security @CriticalPath |
| PARSCA_SESS_TC_005 | M3: SESS | 🔴 High | Dùng lại refresh token cũ huỷ cả phiên | V1 đăng nhập; copy `refresh_token` hiện tại (RT1) | 1. Gọi `POST /auth/refresh` với RT1 → nhận RT2<br>2. Gọi lại `POST /auth/refresh` với **RT1**<br>3. Gọi `POST /auth/refresh` với RT2<br>4. Trên trình duyệt, thao tác bất kỳ ở /vendor | 1. **200**, cookie mới RT2<br>2. **401 "Invalid session"**<br>3. **401** — cả phiên đã bị huỷ<br>4. Bị chuyển /login, phải đăng nhập lại | Critical | RT1, RT2 | Yes | API | @Security @Regression |
| PARSCA_SESS_TC_006 | M3: SESS | 🔴 High | Đăng xuất ở tab A → tab B mất phiên | V1 đăng nhập, mở 2 tab cùng `/vendor/products` | 1. Tab A: Log out<br>2. Tab B: bấm "Add product" hoặc đổi bộ lọc<br>3. Tab B: tải lại trang | 1. Tab A về trang chủ<br>2. Tab B: request 401 → refresh thất bại → chuyển /login<br>3. Tab B ở /login, không thấy khung vendor | High | – | Yes | UI | @Security @Regression |
| PARSCA_SESS_TC_007 | M3: SESS | 🔴 High | Upload ảnh khi access token hết hạn — không tự gửi lại | Access token đã hết hạn; refresh token còn hạn | 1. Mở `/vendor/profile`, bấm "Change image", chọn `avatar_ok_200kb.png`<br>2. Quan sát Network và toast<br>3. Chọn lại cùng file | 1. Request upload 401 → `/auth/refresh` 200 → **không** gửi lại upload<br>2. Toast "Your session was renewed. Please choose the image again."<br>3. Upload thành công, toast "Profile picture updated." | High | File: `avatar_ok_200kb.png` | Partial | UI | @Regression @NeedDevSupport |
| PARSCA_SESS_TC_008 | M3: SESS | 🟡 Medium | Vendor đăng nhập 2 trình duyệt cùng lúc (mỗi tài khoản 1 refresh token) | V1; TTL rút ngắn | 1. Chrome: đăng nhập V1<br>2. Firefox: đăng nhập V1<br>3. Đợi access token hết hạn ở cả hai<br>4. Chrome thao tác → refresh; sau đó Firefox thao tác | 1-2. Cả hai vào /vendor<br>3. –<br>4. **[SUY LUẬN]** Firefox có thể mất phiên khi refresh. Ghi nhận hành vi thực tế (AMB-17) | Medium | Trình duyệt: Chrome + Firefox | No | N/A | @SuyLuan @Regression @NeedDevSupport |
| PARSCA_SESS_TC_009 | M3: SESS | 🟡 Medium | Đăng xuất khi API logout lỗi — hiện cảnh báo | V1 đăng nhập | 1. DevTools → Network: chặn `POST /auth/logout` (Block request URL) hoặc Offline<br>2. Avatar → Log out<br>3. Bỏ chặn, truy cập `/vendor` | 1. –<br>2. FE vẫn về trang chủ ngay + toast **cảnh báo** (không phải toast thành công)<br>3. Ghi nhận: cookie còn → có thể vào lại /vendor (phiên chưa bị huỷ phía server) | Medium | – | Partial | UI | @Regression |

---

## TỔNG HỢP AMBIGUITIES ĐÃ GIẢI QUYẾT

| # | Ambiguity | Giải quyết bằng |
|---|-----------|-----------------|
| AMB-17 | 1 refresh token / tài khoản — mất phiên khi dùng 2 trình duyệt | SESS_TC_008 ghi nhận hiện trạng [SUY LUẬN] |
| AMB-22 | Thời gian UI cập nhật sau hạ quyền | ROLE_TC_005 ghi nhận khoảng thời gian |
| – | Phân biệt hoa thường của role ("VENDOR") | ROLE_TC_003 bước 2 ghi nhận |
| – | Biến thể open redirect (`/\`, encode) | LOGIN_TC_016 ghi nhận hành vi |
| – | Access token cũ còn hiệu lực sau logout (JWT stateless) | SESS_TC_004 bước 3 ghi nhận |

---

## THỐNG KÊ

| Tiêu chí | Số lượng |
|----------|----------|
| **Tổng TC** | **36** |
| Critical Priority | 11 (ROLE_001, 002, 005, 008 · LOGIN_001, 010, 011, 012, 016 · SESS_004, 005) |
| High Priority | 19 |
| Medium Priority | 6 |
| Automatable Yes / Partial / No | 27 / 8 / 1 |
| Kỹ thuật EP | LOGIN_003–006 (đúng/sai/trống), ROLE_003 |
| Kỹ thuật BVA | LOGIN_006 (7/8 ký tự), LOGIN_008 (5/6 lần) |
| Kỹ thuật Decision Table | LOGIN_010–013 (4 role × 3 khu vực), LOGIN_014–016 (redirect) |
| Kỹ thuật State Transition | ROLE_005, ROLE_007 (role), SESS_001–006 (vòng đời phiên) |
