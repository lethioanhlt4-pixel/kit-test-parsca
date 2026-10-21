# TEST CASES — PARSCA VENDOR: HỒ SƠ (PROFILE) & VENDOR TRÊN WEBSITE

| Thông tin | Chi tiết |
|-----------|----------|
| **Dự án** | PARSCA — Role Vendor |
| **Module** | PROF — Hồ sơ vendor · WEB — Vendor trên website bán hàng |
| **URL** | `{FE_URL}/vendor/profile`, `/profile`, `/orders`, `/forgot-password`, `/reset-password`, website storefront |
| **Requirements** | `practices/requirements/parsca-vendor/06_requirements_profile_storefront.md` |
| **Doc nguồn** | 19, 20 (đọc kèm 03, 04, 09, 10, 12) |
| **Phương pháp** | AI-RBT (Risk-Based Testing) — FULL 6 bước |
| **Ngày tạo** | 2026-10-20 |
| **Tổng số TC** | 22 |

> **Chuẩn bị:** Chạy `python3 practices/scripts/generate_fixtures.py` để sinh ảnh test vào `practices/test-data/generated/`. Luồng Forgot password cần hộp thư nhận email của tài khoản `${ROLE_TEST_EMAIL}` (D-05) — **không** dùng V1 chính để tránh đăng xuất các suite khác.
> Kiểm tra website bằng **cửa sổ ẩn danh (khách)**. Nếu môi trường có Redis (D-04), thay đổi chỉ hiện sau khi cache được làm mới bởi thao tác tạo/sửa/xoá/import thành công.

---

## TỔNG HỢP RISK LEVEL

| Module | Risk Level | Số TC |
|--------|-----------|-------|
| M18: WEB — Vendor trên website | 🔴 High | 9 |
| M17: PROF — Hồ sơ vendor | 🟡 Medium | 13 |

---

## TRACEABILITY MATRIX

| Requirement | Test Cases |
|------------|------------|
| AC-PROF-01 | PROF_TC_001 |
| AC-PROF-02 | PROF_TC_001, PROF_TC_002, PROF_TC_006 |
| AC-PROF-03 | PROF_TC_004, PROF_TC_005 |
| AC-PROF-04 | PROF_TC_003 |
| AC-PROF-05 | (xem SESS — hết phiên khi upload; ghi chú trong PROF_TC_006) |
| AC-PROF-06 | PROF_TC_007 |
| AC-PROF-07, AC-PROF-08 | PROF_TC_008 |
| AC-PROF-09 | PROF_TC_009 |
| AC-PROF-10 | PROF_TC_010 |
| AC-PROF-11 | PROF_TC_011 |
| AC-PROF-12 | PROF_TC_012, PROF_TC_013 |
| AC-WEB-01, AC-WEB-02 | WEB_TC_008 |
| AC-WEB-03 | WEB_TC_001 |
| AC-WEB-04 | WEB_TC_002, WEB_TC_003, WEB_TC_009 |
| AC-WEB-05 | WEB_TC_004, WEB_TC_005 |
| AC-WEB-06 | WEB_TC_006 |
| AC-WEB-07 | WEB_TC_007 |

---

## BẢNG TEST CASES

### M18: WEB — Vendor trên website (🔴 High Risk)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_WEB_TC_001 | M18: WEB | 🔴 High | Sản phẩm vendor tạo với trạng thái Active hiển thị ngay trên website | V1 đăng nhập; cửa sổ ẩn danh (khách) mở website | 1. V1 tạo sản phẩm SKU `AUTO-WEB01-20261020`, name `Auto Web TC001 20261020`, Status **Active**, Department có sẵn → "Add Product"<br>2. Khách tìm kiếm `Auto Web TC001 20261020` trên website<br>3. Khách mở trang chi tiết<br>4. Gọi `GET {API_URL}/products?search=Auto%20Web%20TC001` (không token) | 1. Toast "Saved"<br>2. Sản phẩm **xuất hiện ngay** trong kết quả (không có bước duyệt)<br>3. Trang chi tiết công khai 200, đúng tên/giá<br>4. Có sản phẩm trong danh sách<br>📝 Đúng code; ghi nhận **Q-V10** (vendor tự xuất bản không duyệt) | Critical | SKU: `AUTO-WEB01-20261020` | Yes | E2E | @Smoke @CriticalPath @CodeHienTai |
| PARSCA_WEB_TC_002 | M18: WEB | 🔴 High | Đổi sang Draft — sản phẩm biến mất khỏi website | V1 có sản phẩm Active `AUTO-WEB02-20261020` hiển thị trên website | 1. V1 đổi Status sang **Draft** (từ danh sách hoặc form)<br>2. Khách tìm kiếm tên sản phẩm<br>3. Khách duyệt danh mục chứa sản phẩm | 1. Toast thành công, badge Draft<br>2. **Không** còn trong kết quả<br>3. **Không** còn trong danh mục | High | SKU: `AUTO-WEB02-20261020` | Yes | E2E | @Regression @CriticalPath |
| PARSCA_WEB_TC_003 | M18: WEB | 🔴 High | Mở lại link chi tiết công khai của sản phẩm Draft trả 404 | Đã lưu URL chi tiết công khai (slug) của `AUTO-WEB03-20261020` khi còn Active; V1 đổi sang Draft | 1. Khách mở URL chi tiết đã lưu<br>2. Gọi `GET {API_URL}/products/<slug>` (không token) | 1. Trang **404** / không tìm thấy, không lộ nội dung sản phẩm<br>2. **404** | High | SKU: `AUTO-WEB03-20261020` | Yes | E2E | @Regression @Security |
| PARSCA_WEB_TC_004 | M18: WEB | 🔴 High | Đổi lại Active — sản phẩm hiện lại trên website | V1 có sản phẩm Draft `AUTO-WEB04-20261020` | 1. V1 đổi Status sang **Active**<br>2. Khách tìm kiếm tên sản phẩm<br>3. Khách mở URL chi tiết (slug không đổi) | 1. Toast thành công<br>2. Sản phẩm **hiện lại**<br>3. 200, đúng nội dung | High | SKU: `AUTO-WEB04-20261020` | Yes | E2E | @Regression |
| PARSCA_WEB_TC_005 | M18: WEB | 🔴 High | Xoá sản phẩm — mất hẳn khỏi website | V1 có sản phẩm Active `AUTO-WEB05-20261020`; đã lưu URL chi tiết | 1. V1 xoá sản phẩm (xác nhận)<br>2. Khách tìm kiếm tên<br>3. Khách mở URL chi tiết đã lưu | 1. Toast xoá thành công; biến mất khỏi danh sách vendor<br>2. **Không** còn<br>3. **404** | High | SKU: `AUTO-WEB05-20261020` | Yes | E2E | @Regression @CriticalPath |
| PARSCA_WEB_TC_006 | M18: WEB | 🔴 High | category-counts và bộ lọc website cập nhật theo thay đổi của vendor (kèm cache) | Ghi lại số đếm của 1 subcategory X (`GET /products/category-counts`) và giá trị bộ lọc brand | 1. V1 tạo sản phẩm Active `AUTO-WEB06-20261020` thuộc subcategory X, brand có sẵn B<br>2. Gọi lại `category-counts`; khách mở bộ lọc subcategory X<br>3. V1 đổi sản phẩm sang Draft → gọi lại `category-counts`<br>4. Kiểm tra `GET /products/filter-options` / `filter-summary` | 1. Tạo thành công<br>2. Số đếm X **tăng 1**; lọc X thấy sản phẩm<br>3. Số đếm X **về giá trị ban đầu**<br>4. Phản ánh đúng trạng thái hiện tại<br>📝 Nếu có Redis (D-04): ghi nhận số đếm cập nhật ngay sau thao tác (cache được làm mới) | High | SKU: `AUTO-WEB06-20261020` | Yes | API | @Regression @NeedDevSupport |
| PARSCA_WEB_TC_007 | M18: WEB | 🔴 High | API công khai trả creator (tên vendor) trong dữ liệu sản phẩm | Sản phẩm Active `AUTO-WEB07-20261020` do V1 tạo | 1. Gọi `GET {API_URL}/products/<slug>` (không token)<br>2. Kiểm tra trường `creator`<br>3. Khách xem trang chi tiết website | 1. 200<br>2. `creator.id` = id V1; `creator.name` = tên tài khoản V1<br>3. Ghi nhận website có/không hiển thị tên vendor (thông tin chỉ có trong API)<br>📝 Ghi nhận: API công khai lộ id/tên tài khoản vendor — báo PO xem có chấp nhận | Medium | SKU: `AUTO-WEB07-20261020` | Yes | API | @Security @Regression |
| PARSCA_WEB_TC_008 | M18: WEB | 🔴 High | Vendor dùng website như khách: /profile, /orders không bị chuyển; menu có mục "Vendor" | V1 đăng nhập | 1. Mở trang chủ website, mở menu tài khoản<br>2. Bấm mục "Vendor"<br>3. Mở `{FE_URL}/profile`<br>4. Mở `{FE_URL}/orders`<br>5. Thêm 1 sản phẩm vào giỏ, mở trang giỏ hàng | 1. Menu có mục **"Vendor"**<br>2. Mở `/vendor`<br>3. Trang tài khoản khách hiển thị, **không** bị chuyển sang `/vendor`<br>4. Trang đơn hàng khách hiển thị, không bị chuyển<br>5. Giỏ hàng hoạt động như khách | High | V1: `${VENDOR1_EMAIL}` | Yes | UI | @Regression |
| PARSCA_WEB_TC_009 | M18: WEB | 🔴 High | Sản phẩm Archived ẩn khỏi website và chi tiết công khai 404 | V1 có sản phẩm Active `AUTO-WEB09-20261020`; đã lưu URL chi tiết | 1. V1 đổi Status sang **Archived**<br>2. Khách tìm kiếm tên<br>3. Khách mở URL chi tiết đã lưu<br>4. V1 lọc "Archived" trong danh sách vendor | 1. Toast thành công, badge Archived<br>2. **Không** còn<br>3. **404**<br>4. Sản phẩm vẫn còn trong cổng vendor | High | SKU: `AUTO-WEB09-20261020` | Yes | E2E | @Regression |

### M17: PROF — Hồ sơ vendor (🟡 Medium Risk)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_PROF_TC_001 | M17: PROF | 🟡 Medium | Đổi ảnh đại diện bằng PNG hợp lệ — upload ngay, avatar header cập nhật | V1 đăng nhập; ảnh `avatar_ok_200kb.png` | 1. Mở `/vendor/profile`, đọc gợi ý dưới nút<br>2. Bấm "Add image" / "Change image", chọn file<br>3. Quan sát Network, toast<br>4. Quan sát avatar trên thanh tiêu đề và menu<br>5. Tải lại trang | 1. Gợi ý **"Maximum file size: 10 MB · Formats: JPEG, PNG, WEBP, GIF"**<br>2. Upload **ngay**, không cần Save<br>3. `POST /auth/me/avatar` → 2xx; toast **"Profile picture updated."**<br>4. Avatar đổi theo ảnh mới<br>5. Ảnh mới vẫn còn (lưu thật) | High | File: `practices/test-data/generated/avatar_ok_200kb.png` | Yes | UI | @Regression @CriticalPath |
| PARSCA_PROF_TC_002 | M17: PROF | 🟡 Medium | Upload avatar định dạng JPEG, WebP, GIF | V1 ở `/vendor/profile` | 1. Chọn `img_ok.jpg`<br>2. Chọn `img_ok.webp`<br>3. Chọn `img_ok.gif` | 1–3. Mỗi lần: toast "Profile picture updated."; avatar header đổi | Medium | `practices/test-data/generated/img_ok.{jpg,webp,gif}` | Yes | UI | @Regression |
| PARSCA_PROF_TC_003 | M17: PROF | 🟡 Medium | Giới hạn dung lượng avatar 10 MB (BVA) | Đã sinh fixture ảnh | 1. Chọn `img_10mb_decimal.png` (10.000.000 B)<br>2. Chọn `img_exact_10mib.png` (10.485.760 B)<br>3. Chọn `img_11mb.png` (11.534.336 B) | 1. Thành công "Profile picture updated."<br>2. Ghi nhận: thành công hay toast "That image is 10.0 MB — the limit is 10 MB." → xác định định nghĩa 10 MB (**Q-V14**)<br>3. Toast **"That image is 11.0 MB — the limit is 10 MB."** (X.X theo cách FE tính — ghi lại số hiển thị); không gửi request upload | Medium | `img_10mb_decimal.png`, `img_exact_10mib.png`, `img_11mb.png` | Yes | UI | @Boundary @Regression |
| PARSCA_PROF_TC_004 | M17: PROF | 🟡 Medium | Upload avatar sai định dạng (PDF, SVG, HEIC) bị từ chối | V1 ở `/vendor/profile` | 1. Chuyển bộ lọc hộp chọn file "All files", chọn `doc_sample.pdf`<br>2. Chọn `img_vector.svg`<br>3. Chọn `img_photo.heic` | 1. Toast **"Choose a JPEG, PNG, WebP or GIF image."**; avatar không đổi<br>2. Cùng toast (SVG bị chặn — tránh XSS)<br>3. Cùng toast | Medium | `doc_sample.pdf`, `img_vector.svg`, `img_photo.heic` | Yes | UI | @Security @Regression |
| PARSCA_PROF_TC_005 | M17: PROF | 🟡 Medium | File text đổi đuôi thành .png | V1 ở `/vendor/profile` | 1. Chọn `fake_image_text.png` (nội dung text)<br>2. Quan sát Network và toast | 1. FE có thể cho qua (dựa MIME theo đuôi)<br>2. BE phải từ chối (4xx) → toast lỗi; nếu BE nhận và lưu file → ghi bug bảo mật (kiểm tra nội dung file phía BE) | Medium | `practices/test-data/generated/fake_image_text.png` | Yes | UI | @Security @SuyLuan |
| PARSCA_PROF_TC_006 | M17: PROF | 🟡 Medium | Chọn lại cùng một file và huỷ hộp chọn file | V1 đã có avatar `avatar_ok_200kb.png` | 1. Bấm "Change image", chọn lại đúng `avatar_ok_200kb.png`<br>2. Bấm "Change image", bấm **Cancel** ở hộp chọn file<br>3. (Tuỳ chọn) Làm hết hạn access token rồi chọn ảnh | 1. Ghi nhận: có upload lại (toast) hay không phản hồi (input không đổi value) — nếu không phản hồi → ghi bug UX nhẹ<br>2. Không có request, không toast lỗi, avatar giữ nguyên<br>3. Toast **"Your session was renewed. Please choose the image again."** | Low | `avatar_ok_200kb.png` | Partial | UI | @Regression |
| PARSCA_PROF_TC_007 | M17: PROF | 🟡 Medium | Không có nút xoá ảnh đại diện trên giao diện | V1 có avatar | 1. Tìm nút "Remove"/"Delete" ảnh trên `/vendor/profile`<br>2. Gọi `DELETE {API_URL}/auth/me/avatar` bằng token V1 (xem API_PERM_TC_021)<br>3. Tải lại trang | 1. **Không** có nút xoá ảnh<br>2. API trả 2xx<br>3. Avatar về mặc định; nút đổi thành "Add image"<br>📝 Ghi nhận: ảnh cũ không bị xoá khỏi storage (D-07) | Low | – | Yes | API | @Regression |
| PARSCA_PROF_TC_008 | M17: PROF | 🟡 Medium | Thông tin cá nhân giả lập — Save chỉ hiện toast, tải lại là mất | V1 ở `/vendor/profile` | 1. Quan sát First name, Last name, Email, Phone, Status<br>2. Sửa First name `AutoProf008`, Phone `0900000008`, Status Inactive<br>3. Bấm "Save"<br>4. Tìm nút Cancel<br>5. Tải lại trang | 1. Họ tên tách từ tên tài khoản; Email **chỉ đọc**; Phone trống<br>2. Sửa được<br>3. Toast **"Your picture saves straight away. The other fields need the profile endpoint, which is not built yet."**; không có request lưu<br>4. **Không** có Cancel<br>5. Giá trị **quay về cũ**; tài khoản vẫn đăng nhập được (Status không phải khoá tài khoản — không ghi bug) | Low | First name: `AutoProf008`; Phone: `0900000008` | Yes | UI | @GiaLap @Regression |
| PARSCA_PROF_TC_009 | M17: PROF | 🟡 Medium | Devices giả lập — Sign out thiết bị khác chỉ hiện toast | V1 ở `/vendor/profile` | 1. Quan sát danh sách Devices<br>2. Bấm "Sign out" ở thiết bị khác | 1. Danh sách viết cứng; thiết bị hiện tại có nhãn **"This device"**<br>2. Toast **"Session management arrives with the sessions API."**; không thiết bị nào bị đăng xuất | Low | – | Yes | UI | @GiaLap |
| PARSCA_PROF_TC_010 | M17: PROF | 🟡 Medium | Vendor không có đổi mật khẩu; hộp thoại ở /profile chỉ báo lỗi | V1 đăng nhập | 1. Tìm mục đổi mật khẩu ở `/vendor/profile`<br>2. Mở `{FE_URL}/profile`, mở hộp thoại đổi mật khẩu, nhập dữ liệu bất kỳ → Confirm | 1. **Không** có mục đổi mật khẩu<br>2. Lỗi **"Changing your password needs an API endpoint that does not exist yet. Use “Forgot password?” on the sign-in page for now."**; mật khẩu không đổi | Medium | – | Yes | UI | @Regression |
| PARSCA_PROF_TC_011 | M17: PROF | 🟡 Medium | Forgot password với tài khoản vendor — link 1 giờ, đặt lại huỷ mọi phiên | `${ROLE_TEST_EMAIL}` có role vendor; đăng nhập sẵn trên 2 trình duyệt A, B; truy cập được hộp thư | 1. Trình duyệt C mở `/forgot-password`, nhập `${ROLE_TEST_EMAIL}` → gửi<br>2. Mở email, kiểm tra link và thời hạn<br>3. Mở link, đặt mật khẩu mới `${ROLE_TEST_NEW_PASSWORD}`<br>4. Ở A và B thao tác bất kỳ cần đăng nhập (tải lại `/vendor`)<br>5. Đăng nhập bằng mật khẩu mới | 1. Thông báo đã gửi email<br>2. Link dạng `/reset-password?token=...`, ghi hiệu lực **1 giờ**<br>3. Đặt lại thành công<br>4. A và B **bị đăng xuất** (chuyển `/login`)<br>5. Đăng nhập thành công, vào `/vendor` | High | Email: `${ROLE_TEST_EMAIL}` | Partial | E2E | @Security @NeedDevSupport |
| PARSCA_PROF_TC_012 | M17: PROF | 🟡 Medium | Link reset đã dùng hoặc hết hạn bị từ chối | Đã hoàn tất PROF_TC_011 (giữ link cũ); có link > 1 giờ (hoặc Dev rút TTL) | 1. Mở lại link reset đã dùng<br>2. Mở link đã quá 1 giờ | 1. **"This reset link is invalid or has expired."**<br>2. **"This reset link is invalid or has expired."** | Medium | Link cũ của PROF_TC_011 | Partial | E2E | @Security @NeedDevSupport |
| PARSCA_PROF_TC_013 | M17: PROF | 🟡 Medium | Trang /reset-password thiếu tham số token không hiện form | – | 1. Mở `{FE_URL}/reset-password`<br>2. Mở `{FE_URL}/reset-password?token=` (rỗng) | 1. **Không** hiện form đặt mật khẩu<br>2. Không hiện form, hoặc báo link không hợp lệ (ghi nhận) | Low | – | Yes | UI | @Security @Boundary |

---

## TỔNG HỢP AMBIGUITIES ĐÃ GIẢI QUYẾT

| # | Ambiguity | Giải quyết bằng |
|---|-----------|-----------------|
| Q-V10 | Vendor tự xuất bản sản phẩm Active | WEB_TC_001 ghi nhận |
| Q-V14 | 10 MB = 10.000.000 hay 10.485.760 byte | PROF_TC_003 kiểm cả hai biên |
| D-04 | Có Redis cache? | WEB_TC_006 ghi nhận độ trễ |
| D-05 | Hộp thư nhận email reset | PROF_TC_011 dùng `${ROLE_TEST_EMAIL}` riêng |
| D-07 | Ảnh cũ trên storage | PROF_TC_007 ghi nhận |
| AMB | API công khai trả `creator` (id + tên) | WEB_TC_007 báo PO |
| AMB | Chọn lại cùng file có upload lại? | PROF_TC_006 ghi nhận thực tế |

---

## THỐNG KÊ

| Tiêu chí | Số lượng |
|----------|----------|
| **Tổng TC** | **22** |
| Critical Priority | 1 (WEB_TC_001) |
| High Priority | 9 |
| Medium Priority | 7 |
| Low Priority | 5 |
| Automatable Yes / Partial / No | 19 / 3 / 0 |
| Kỹ thuật State Transition | Active → Draft → Active → Archived → Xoá (WEB_TC_001–005, 009) |
| Kỹ thuật BVA | Avatar 10.000.000 / 10.485.760 / 11.534.336 byte |
| Kỹ thuật EP | Định dạng ảnh hợp lệ / không hợp lệ / đổi đuôi |
| Kỹ thuật Error Guessing | Link reset dùng lại, thiếu token, chọn lại cùng file |
