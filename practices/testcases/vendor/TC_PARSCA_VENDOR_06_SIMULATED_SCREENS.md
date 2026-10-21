# TEST CASES — PARSCA VENDOR: CÁC MÀN HÌNH GIẢ LẬP (DASHBOARD, ĐƠN HÀNG, ĐÁNH GIÁ, SETTINGS)

| Thông tin | Chi tiết |
|-----------|----------|
| **Dự án** | PARSCA — Role Vendor |
| **Module** | DASH · ORD · ORDD · REV · SET |
| **URL** | `{FE_URL}/vendor`, `/vendor/orders`, `/vendor/orders/:id`, `/orders/:id`, `/vendor/reviews`, `/vendor/settings/*` |
| **Requirements** | `practices/requirements/parsca-vendor/05_requirements_simulated_screens.md` |
| **Doc nguồn** | 13, 14, 15, 16, 18 (đọc kèm 05, 12) |
| **Phương pháp** | AI-RBT (Risk-Based Testing) — FULL 6 bước |
| **Ngày tạo** | 2026-10-20 |
| **Tổng số TC** | 38 |

> **Lưu ý quan trọng:** Đây là màn hình **[GIẢ LẬP]** — dữ liệu viết cứng trong FE. **KHÔNG ghi bug** cho dấu "—", việc không lưu, không gửi server. Ngày test 2026-10-20 → các bộ lọc thời gian tương đối (Yesterday, Last 7 days, Last 30 days, This Month, Last month) trả **rỗng** — **không phải lỗi**.
> Payouts nằm ở file riêng `TC_PARSCA_VENDOR_07_PAYOUTS.md`.

---

## TỔNG HỢP RISK LEVEL

| Module | Risk Level | Số TC |
|--------|-----------|-------|
| M13: ORDD — Chi tiết đơn hàng | 🟡 Medium | 11 |
| M11: DASH — Dashboard | 🟢 Low | 4 |
| M12: ORD — Danh sách đơn hàng | 🟢 Low | 9 |
| M14: REV — Đánh giá | 🟢 Low | 8 |
| M15: SET — Settings Brand & Fitment | 🟢 Low | 6 |

---

## TRACEABILITY MATRIX

| Requirement | Test Cases |
|------------|------------|
| AC-DASH-01, AC-DASH-02, AC-DASH-03 | DASH_TC_001 |
| AC-DASH-04 | DASH_TC_002, DASH_TC_003 |
| AC-DASH-05 | DASH_TC_004 |
| AC-ORD-01 | ORD_TC_001, ORD_TC_007 |
| AC-ORD-02 | ORD_TC_001 |
| AC-ORD-03 | ORD_TC_002 |
| AC-ORD-04 | ORD_TC_003, ORD_TC_004 |
| AC-ORD-05 | ORD_TC_005, ORD_TC_006 |
| AC-ORD-06 | ORD_TC_006, ORD_TC_008 |
| AC-ORD-07 | ORD_TC_009 |
| AC-ORDD-01 | ORDD_TC_001 |
| AC-ORDD-02 | ORDD_TC_007 |
| AC-ORDD-03 | ORDD_TC_001 → ORDD_TC_006 |
| AC-ORDD-04 | ORDD_TC_001, ORDD_TC_003, ORDD_TC_004 |
| AC-ORDD-05 | ORDD_TC_008 |
| AC-ORDD-06 | ORDD_TC_009 |
| AC-ORDD-07 | ORDD_TC_010, ORDD_TC_011 |
| AC-REV-01 | REV_TC_001, REV_TC_008 |
| AC-REV-02 | REV_TC_001, REV_TC_002 |
| AC-REV-03 | REV_TC_002, REV_TC_003, REV_TC_004, REV_TC_005 |
| AC-REV-04 | REV_TC_001, REV_TC_003 |
| AC-REV-05 | REV_TC_006 |
| AC-REV-06 | REV_TC_007, REV_TC_008 |
| AC-SET-01 | SET_TC_001, SET_TC_002 |
| AC-SET-02 | SET_TC_003 |
| AC-SET-03 | SET_TC_005 |
| AC-SET-04 | SET_TC_004, SET_TC_006 |

---

## BẢNG TEST CASES

### M11: DASH — Dashboard (🟢 Low Risk)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_DASH_TC_001 | M11: DASH | 🟢 Low | Dashboard vendor hiển thị đúng bố cục giả lập | V1 đăng nhập | 1. Mở `{FE_URL}/vendor`<br>2. Quan sát 5 thẻ số liệu<br>3. Bấm ô "This month" và nút "Export"<br>4. Quan sát khối biểu đồ và bảng | 1. Tiêu đề **"Overview"**<br>2. Thẻ Total orders, Pending fulfillment, Shipped today, Returns open, Revenue (MTD) đều hiển thị **"—"** kèm "Available in Epic 9/10/11"<br>3. Không có chức năng (chỉ là hình), không lỗi console<br>4. "Order Volume (7 Days)" và "Top 5 products - Best sellers": **"No data yet"**; "Recent orders": **"No orders yet — this table fills in once orders start flowing through the marketplace."** | Medium | V1: `${VENDOR1_EMAIL}` | Yes | UI | @GiaLap @Regression |
| PARSCA_DASH_TC_002 | M11: DASH | 🟢 Low | Vendor không thấy khối "Catalogue"; Admin thấy | V1 và Admin có tài khoản | 1. V1 mở `/vendor`, tìm khối "Catalogue"<br>2. Admin mở dashboard admin, tìm khối "Catalogue" | 1. **Không** có khối "Catalogue"<br>2. Khối "Catalogue" hiển thị (số giả cố định, vd "44.312" sản phẩm — không ghi bug) | High | V1, Admin | Yes | UI | @Security @GiaLap @Regression |
| PARSCA_DASH_TC_003 | M11: DASH | 🟢 Low | Dashboard vendor không gọi API /dashboard/stats | V1 đăng nhập; DevTools → Network, bật "Preserve log" | 1. Mở `/vendor`, chờ trang tải xong<br>2. Lọc Network theo `dashboard`<br>3. Tải lại trang, lọc lại | 1. Trang hiển thị<br>2. **Không có** request `GET /dashboard/stats`<br>3. Vẫn không có request; không có response 403 nào trong Network | High | – | Yes | UI | @Security @GiaLap @Regression |
| PARSCA_DASH_TC_004 | M11: DASH | 🟢 Low | Chú thích nội bộ "Available in Epic 9/10/11" hiển thị cho người dùng | V1 đăng nhập | 1. Mở `/vendor`<br>2. Đọc ghi chú dưới mỗi thẻ số liệu | 1. Trang hiển thị<br>2. Hiện chữ **"Available in Epic 9/10/11"**<br>⚠️ **THEO CODE HIỆN TẠI:** chú thích nội bộ lộ ra người dùng → ghi **Q-V9**, không PASS | Low | – | Yes | UI | @CodeHienTai @GiaLap |

### M12: ORD — Danh sách đơn hàng (🟢 Low Risk)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_ORD_TC_001 | M12: ORD | 🟢 Low | Danh sách hiển thị 20 đơn mẫu, đủ cột, không có cột "Created by" | V1 đăng nhập | 1. Mở `/vendor/orders`<br>2. Chọn cỡ trang 50<br>3. Quan sát tiêu đề cột<br>4. Đếm số đơn và mã đơn đầu/cuối | 1. Bảng hiển thị<br>2. Hiển thị toàn bộ trên 1 trang<br>3. Cột: Order ID, Product (ảnh, tên, SKU), Customer (tên, email), Destination, Total, Amount, Payment, Created, Rating, Status; **không có "Created by"**<br>4. Đúng **20** đơn, ORD-2134 → ORD-2153; ngày từ 30/05/2026 đến 08/08/2026 | Medium | – | Yes | UI | @GiaLap @Regression |
| PARSCA_ORD_TC_002 | M12: ORD | 🟢 Low | Tìm kiếm theo mã đơn, sản phẩm, SKU, tên và email khách | V1 ở `/vendor/orders`; ghi lại tên sản phẩm, SKU, tên, email khách của ORD-2140 | 1. Nhập `ORD-2140`<br>2. Nhập tên sản phẩm của ORD-2140<br>3. Nhập SKU của ORD-2140<br>4. Nhập tên khách, rồi email khách<br>5. Nhập `zz_no_order_20261020` | 1. Chỉ các đơn chứa `ORD-2140`<br>2–4. Kết quả chứa ORD-2140, mọi dòng đều khớp từ khoá<br>5. Trạng thái rỗng (văn bản dịch của "orders.noMatch") | Medium | Từ khoá: `ORD-2140`, `zz_no_order_20261020` | Yes | UI | @GiaLap @Regression |
| PARSCA_ORD_TC_003 | M12: ORD | 🟢 Low | Lọc Status chọn nhiều giá trị | V1 ở `/vendor/orders` | 1. Mở bộ lọc Status, chọn "Pending"<br>2. Chọn thêm "Shipped"<br>3. Bỏ chọn tất cả | 1. Chỉ đơn Pending<br>2. Đơn Pending **hoặc** Shipped; số dòng = tổng hai nhóm<br>3. Hiện lại 20 đơn | Medium | Status: Pending, Shipped | Yes | UI | @GiaLap @Regression |
| PARSCA_ORD_TC_004 | M12: ORD | 🟢 Low | Lọc Payment (chọn nhiều) và Destination | V1 ở `/vendor/orders` | 1. Chọn Payment "Paid"<br>2. Chọn thêm "Refunded"<br>3. Chọn một Destination có trong dữ liệu<br>4. Quan sát nhãn "Partially refunded" trong bộ lọc và trong bảng | 1. Chỉ đơn Paid<br>2. Đơn Paid hoặc Refunded<br>3. Kết quả thoả cả Payment và Destination (AND giữa các bộ lọc)<br>4. Ghi nhận khác biệt chữ hoa/thường ("Partially Refunded" vs "Partially refunded") | Low | Payment: Paid, Refunded | Yes | UI | @GiaLap @Regression |
| PARSCA_ORD_TC_005 | M12: ORD | 🟢 Low | Bộ lọc thời gian — tương đối trả rỗng, Specific date có dữ liệu | Ngày hệ thống 2026-10-20 | 1. Lần lượt chọn Yesterday, Last 7 days, Last 30 days, This Month, Last month<br>2. Chọn "All"<br>3. Chọn "Specific date" = ngày tạo của ORD-2134 | 1. Mỗi lựa chọn trả **rỗng** — đúng (dữ liệu mẫu 05–08/2026), **không ghi bug**<br>2. 20 đơn<br>3. Chỉ các đơn tạo đúng ngày đó (có ORD-2134) | Low | Specific date: ngày của ORD-2134 | Yes | UI | @GiaLap @Boundary |
| PARSCA_ORD_TC_006 | M12: ORD | 🟢 Low | Lọc Rate đúng số sao, kết hợp bộ lọc và tự về trang 1 | Cỡ trang 10 | 1. Sang trang 2<br>2. Chọn Rate 5<br>3. Kết hợp Rate 5 + Status "Delivered" + tìm kiếm 1 tên khách<br>4. Xoá từng bộ lọc | 1. Trang 2 hiển thị<br>2. Chỉ đơn **đúng 5 sao**; phân trang **về trang 1**<br>3. Kết quả thoả mọi điều kiện; vẫn ở trang 1<br>4. Kết quả mở rộng tương ứng | Low | Rate 5, Status Delivered | Yes | UI | @GiaLap @Regression |
| PARSCA_ORD_TC_007 | M12: ORD | 🟡 Medium | Mọi vendor và admin thấy cùng 20 đơn (không tách theo vendor) | V1, V2, Admin có tài khoản | 1. V1 mở `/vendor/orders`, ghi danh sách mã đơn<br>2. V2 mở `/vendor/orders`<br>3. Admin mở danh sách đơn của admin | 1. 20 đơn ORD-2134 → ORD-2153<br>2. **Giống hệt** V1<br>3. Cùng 20 đơn, có thêm cột "Created by"<br>⚠️ **THEO CODE HIỆN TẠI:** đơn không tách theo vendor → ghi **Q-V8** (rủi ro khi nối API thật) | Medium | V1, V2, Admin | Yes | UI | @CodeHienTai @DataScope @GiaLap |
| PARSCA_ORD_TC_008 | M12: ORD | 🟢 Low | Phân trang phía trình duyệt và bấm dòng mở chi tiết | V1 ở `/vendor/orders` | 1. Cỡ trang mặc định → đếm trang<br>2. Đổi cỡ 20, 30, 50<br>3. Về cỡ 10, bấm dòng ORD-2134 | 1. Phân trang đúng (20 đơn)<br>2. Cỡ 20/30/50 → 1 trang; không gọi API mới khi đổi trang<br>3. Mở `/vendor/orders/ord-2134` | Low | Cỡ trang 10/20/30/50 | Yes | UI | @GiaLap @Regression |
| PARSCA_ORD_TC_009 | M12: ORD | 🟢 Low | Đổi ngôn ngữ — nhãn cột theo i18n, ghi nhận nhãn cố định | Website có bộ chọn ngôn ngữ | 1. Đổi ngôn ngữ khác tiếng Anh<br>2. Quan sát tiêu đề cột và nhãn bộ lọc<br>3. Tìm chuỗi không có kết quả | 1. Giao diện đổi ngôn ngữ<br>2. Tiêu đề cột dịch; ghi nhận nhãn lọc tiếng Anh cố định<br>3. Hiện văn bản dịch (không phải key thô "orders.noMatch"); nếu hiện key thô → ghi bug | Low | – | Partial | UI | @GiaLap |

### M13: ORDD — Chi tiết đơn hàng (🟡 Medium Risk)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_ORDD_TC_001 | M13: ORDD | 🟡 Medium | Đơn Pending (ORD-2134): bố cục đầy đủ, Cancel bấm được chỉ hiện toast | V1 đăng nhập | 1. Mở `/vendor/orders/ord-2134`<br>2. Quan sát đầu trang, cột trái, cột phải<br>3. Bấm "Cancel order"<br>4. Tải lại trang | 1. Trang hiển thị (biến thể seller)<br>2. Nút quay lại, "ORD-2134", "Created: ... · Updated: ..."; Products, Order timeline (mới nhất ở trên), Shipping information; Shipping, Payment detail<br>3. Toast **"This is not connected yet — the orders service is still being built."**; trạng thái **không đổi**<br>4. Vẫn Pending | Medium | Đơn: `ord-2134` | Yes | UI | @GiaLap @Regression |
| PARSCA_ORDD_TC_002 | M13: ORDD | 🟡 Medium | Đơn In production (ORD-2135): timeline và Cancel | V1 đăng nhập | 1. Mở `/vendor/orders/ord-2135`<br>2. Kiểm tra timeline<br>3. Bấm "Cancel order" | 1. Trang hiển thị<br>2. Timeline phù hợp trạng thái in_production<br>3. Toast "chưa kết nối"; không huỷ | Low | Đơn: `ord-2135` | Yes | UI | @GiaLap @Regression |
| PARSCA_ORDD_TC_003 | M13: ORDD | 🟡 Medium | Đơn Shipped (ORD-2138): thông tin vận chuyển, Cancel vẫn bấm được | V1 đăng nhập | 1. Mở `/vendor/orders/ord-2138`<br>2. Kiểm tra Shipping information<br>3. Bấm "Cancel order" | 1. Trang hiển thị<br>2. Carrier, Tracking Number (dạng UPS), Shipped, Est. Delivery hiển thị<br>3. Toast "chưa kết nối"<br>📝 Ghi nhận mâu thuẫn dữ liệu mẫu: đơn shipped vẫn cho Cancel (báo PO) | Low | Đơn: `ord-2138` | Yes | UI | @GiaLap @Regression |
| PARSCA_ORDD_TC_004 | M13: ORDD | 🟡 Medium | Đơn Delivered (ORD-2136): Cancel bị khoá kèm chú thích | V1 đăng nhập | 1. Mở `/vendor/orders/ord-2136`<br>2. Quan sát nút "Cancel order" và di chuột vào<br>3. Kiểm tra mục Delivered trong Shipping information | 1. Trang hiển thị<br>2. Nút **bị khoá**; chú thích **"An order that is delivered can no longer be cancelled"**<br>3. Có ngày Delivered | Medium | Đơn: `ord-2136` | Yes | UI | @GiaLap @Regression |
| PARSCA_ORDD_TC_005 | M13: ORDD | 🟡 Medium | Đơn Returned (ORD-2137): Cancel bị khoá | V1 đăng nhập | 1. Mở `/vendor/orders/ord-2137`<br>2. Quan sát nút "Cancel order" | 1. Trang hiển thị, timeline có bước returned<br>2. Khoá; chú thích "An order that is returned can no longer be cancelled" | Low | Đơn: `ord-2137` | Yes | UI | @GiaLap @Regression |
| PARSCA_ORDD_TC_006 | M13: ORDD | 🟡 Medium | Đơn Canceled (ORD-2139): Cancel bị khoá | V1 đăng nhập | 1. Mở `/vendor/orders/ord-2139`<br>2. Quan sát nút "Cancel order" | 1. Trang hiển thị<br>2. Khoá; chú thích "An order that is canceled can no longer be cancelled" | Low | Đơn: `ord-2139` | Yes | UI | @GiaLap @Regression |
| PARSCA_ORDD_TC_007 | M13: ORDD | 🟡 Medium | Nút Invoice, Track package chỉ hiện toast; Contact và Copy tracking chạy thật | V1 mở `/vendor/orders/ord-2138` | 1. Bấm "Invoice"<br>2. Bấm "Track package"<br>3. Bấm nút sao chép cạnh Tracking Number, dán vào ô tìm kiếm<br>4. Bấm "Contact" | 1. Toast **"This is not connected yet — the orders service is still being built."**<br>2. Cùng toast<br>3. Giá trị dán = Tracking Number hiển thị<br>4. Mở ứng dụng email (`mailto:`) tới email khách của đơn | Low | Đơn: `ord-2138` | Partial | UI | @GiaLap @Regression |
| PARSCA_ORDD_TC_008 | M13: ORDD | 🟡 Medium | Payment detail tính đúng theo quy tắc dữ liệu mẫu | Chọn 1 đơn qty ≤ 2 và 1 đơn qty ≥ 3 từ danh sách | 1. Mở đơn qty ≤ 2, đối chiếu Subtotal, Shipping, Total excl. tax<br>2. Mở đơn qty ≥ 3<br>3. Kiểm tra Currency và Payment method | 1. Shipping = **10**; Total = Subtotal + 10; không có giảm giá<br>2. Có dòng **"Volume discount (6%)"**; sản phẩm tách 2 dòng (1 dòng là sản phẩm khác)<br>3. Currency **"CAD"**, Payment method **"Credit card"**; điện thoại/địa chỉ giống mọi đơn — không ghi bug | Medium | Đơn qty ≤ 2, qty ≥ 3 | Yes | UI | @GiaLap @Regression |
| PARSCA_ORDD_TC_009 | M13: ORDD | 🟡 Medium | Đơn không tồn tại hoặc sai định dạng id | V1 đăng nhập | 1. Mở `/vendor/orders/abc`<br>2. Mở `/vendor/orders/ORD-2136` (chữ HOA)<br>3. Bấm "Back to orders" | 1. Panel **"Order not found"** — "No order matches this link. It may have been removed."<br>2. Cũng **"Order not found"** (id thật là `ord-2136`)<br>3. Về `/vendor/orders` | Medium | id: `abc`, `ORD-2136` | Yes | UI | @Boundary @Regression |
| PARSCA_ORDD_TC_010 | M13: ORDD | 🟡 Medium | V2 mở được cùng đơn mà V1 xem | V1 và V2 đăng nhập trên 2 trình duyệt | 1. V1 mở `/vendor/orders/ord-2136`<br>2. V2 mở cùng URL | 1. Hiển thị chi tiết đơn<br>2. V2 thấy **toàn bộ** dữ liệu giống V1<br>⚠️ **THEO CODE HIỆN TẠI:** không tách dữ liệu theo vendor → ghi **Q-V8** | Medium | Đơn: `ord-2136` | Yes | UI | @CodeHienTai @DataScope @GiaLap |
| PARSCA_ORDD_TC_011 | M13: ORDD | 🟡 Medium | Khách hàng mở /orders/:id của đơn mẫu — lộ PII mẫu | Tài khoản user `${USER_EMAIL}` đăng nhập | 1. User mở `{FE_URL}/orders/ord-2136`<br>2. Quan sát thông tin Shipping | 1. Trang chi tiết đơn hiển thị dù không phải đơn của user<br>2. Thấy tên, email, địa chỉ khách mẫu<br>⚠️ **THEO CODE HIỆN TẠI:** khách xem được đơn người khác → ghi **Q-V8** (bắt buộc chặn khi nối API) | High | User: `${USER_EMAIL}`; đơn `ord-2136` | Yes | UI | @CodeHienTai @Security @GiaLap |

### M14: REV — Đánh giá (🟢 Low Risk)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_REV_TC_001 | M14: REV | 🟢 Low | Trang Reviews hiển thị 13 đánh giá, đúng cột, sắp mới nhất trước | V1 đăng nhập | 1. Mở `/vendor/reviews`<br>2. Quan sát bố cục<br>3. Chọn cỡ trang lớn nhất, đếm số dòng<br>4. Đối chiếu ngày đánh giá với ngày đơn | 1. Trang hiển thị<br>2. **Không** tiêu đề / điểm trung bình / biểu đồ sao; cột Rate, Created, Review (cắt 2 dòng), Customer, Product, Order ID; cột không sắp xếp được<br>3. **13** đánh giá, mới nhất ở trên<br>4. Ngày đánh giá = ngày đơn **+ 5 ngày** | Medium | – | Yes | UI | @GiaLap @Regression |
| PARSCA_REV_TC_002 | M14: REV | 🟢 Low | Lọc theo từng mức sao khớp đúng phân bố | V1 ở `/vendor/reviews` | 1. Chọn 5 ★<br>2. Chọn 4 ★<br>3. Chọn 3 ★<br>4. Chọn 2 ★<br>5. Chọn 1 ★<br>6. Chọn All | 1. **5** đánh giá<br>2. **4**<br>3. **2**<br>4. **1**<br>5. **1**<br>6. 13 | Medium | Sao: 5 → 1 | Yes | UI | @GiaLap @Regression |
| PARSCA_REV_TC_003 | M14: REV | 🟢 Low | Tìm kiếm theo từng loại trường và chuỗi không kết quả | Ghi lại nội dung, mã đơn, tên/email khách, tên sản phẩm, SKU của 1 đánh giá | 1. Tìm theo 1 từ trong nội dung<br>2. Theo mã đơn<br>3. Theo tên khách, email khách<br>4. Theo tên sản phẩm, SKU<br>5. Tìm `zz_no_review_20261020` | 1–4. Kết quả chứa đánh giá đã chọn, mọi dòng khớp<br>5. **"No reviews match these filters."** | Low | `zz_no_review_20261020` | Yes | UI | @GiaLap @Regression |
| PARSCA_REV_TC_004 | M14: REV | 🟢 Low | Bộ lọc thời gian: Specific date chưa chọn ngày và các mức tương đối | Ngày hệ thống 2026-10-20 | 1. Chọn "Specific date" nhưng không chọn ngày<br>2. Chọn ngày = ngày đánh giá mới nhất<br>3. Chọn Last 7 days, Last 30 days, This Month | 1. Trả về **tất cả** 13<br>2. Chỉ đánh giá của ngày đó<br>3. **"No reviews match these filters."** — đúng với dữ liệu mẫu, không ghi bug | Low | – | Yes | UI | @GiaLap @Boundary |
| PARSCA_REV_TC_005 | M14: REV | 🟢 Low | Kết hợp bộ lọc, phân trang và đổi cỡ trang | Cỡ trang 10 | 1. Sang trang 2<br>2. Chọn 5 ★<br>3. Thêm từ khoá tìm kiếm khớp 1 đánh giá 5 ★<br>4. Đổi cỡ trang 20 | 1. Trang 2 có 3 dòng<br>2. Về **trang 1**, 5 dòng<br>3. Kết quả thoả cả hai<br>4. Hiển thị đúng, ở trang 1 | Low | – | Yes | UI | @GiaLap @Regression |
| PARSCA_REV_TC_006 | M14: REV | 🟢 Low | Bấm dòng mở chi tiết đơn; Back quay về trang đơn hàng | V1 ở `/vendor/reviews` | 1. Bấm dòng đánh giá đầu tiên<br>2. Quan sát khối Review trên trang đơn<br>3. Bấm nút Back trên trang | 1. Mở `/vendor/orders/<id>` trong cổng vendor<br>2. Khối Review hiển thị, **không** có nút trả lời/sửa/xoá<br>3. Về **`/vendor/orders`** (không phải `/vendor/reviews`) — đúng mô tả; ghi nhận UX | Low | – | Yes | UI | @GiaLap @Regression |
| PARSCA_REV_TC_007 | M14: REV | 🟢 Low | Mọi vendor thấy cùng 13 đánh giá | V1, V2 | 1. V1 mở `/vendor/reviews`, ghi danh sách mã đơn<br>2. V2 mở `/vendor/reviews` | 1. 13 đánh giá<br>2. **Giống hệt** V1<br>⚠️ THEO CODE HIỆN TẠI: không tách theo vendor → ghi chung **Q-V8** | Low | V1, V2 | Yes | UI | @CodeHienTai @GiaLap |
| PARSCA_REV_TC_008 | M14: REV | 🟢 Low | Không có trả lời/xoá/báo cáo/xuất; chữ tiếng Anh cố định | V1 ở `/vendor/reviews` | 1. Tìm các nút Reply, Delete, Report, Export trên trang và mỗi dòng<br>2. Đổi ngôn ngữ website | 1. **Không** có các chức năng này<br>2. Chữ trên trang Reviews **vẫn tiếng Anh** — đúng mô tả, ghi nhận i18n | Low | – | Yes | UI | @GiaLap |

### M15: SET — Settings Brand & Fitment (🟢 Low Risk)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_SET_TC_001 | M15: SET | 🟢 Low | Menu Settings của vendor chỉ có Brand và Vehicle fitment | V1 đăng nhập | 1. Bấm biểu tượng bánh răng trên thanh tiêu đề<br>2. Đếm các mục<br>3. Mở `{FE_URL}/vendor/settings` | 1. Menu mở<br>2. Đúng 2 mục **"Brand"**, **"Vehicle fitment"** (không có Logo, Blog)<br>3. Chuyển tới `/vendor/settings/brand` | Medium | – | Yes | UI | @Security @GiaLap @Regression |
| PARSCA_SET_TC_002 | M15: SET | 🟢 Low | Gõ URL mục chỉ dành cho admin bị chuyển về Brand | V1 đăng nhập | 1. Mở `/vendor/settings/logo`<br>2. Mở `/vendor/settings/blog` | 1. Tự chuyển sang `/vendor/settings/brand`<br>2. Tự chuyển sang `/vendor/settings/brand` | Medium | – | Yes | UI | @Security @GiaLap @Regression |
| PARSCA_SET_TC_003 | M15: SET | 🟢 Low | Brand: thêm, sửa, xoá, kiểm tra tên bắt buộc và mô tả 500 ký tự | V1 ở `/vendor/settings/brand` | 1. Thêm brand để trống tên → lưu<br>2. Thêm `AutoBrandSET20261020`, mô tả 500 ký tự, ẩn → lưu<br>3. Sửa mô tả thành 501 ký tự → lưu<br>4. Tìm kiếm `AutoBrandSET20261020`; thử lọc ngày, phân trang<br>5. Xoá brand → xác nhận | 1. Báo lỗi tên bắt buộc, không lưu<br>2. Thêm thành công; dòng có nhãn **"Hidden"**<br>3. Báo lỗi / chặn quá 500 ký tự<br>4. Tìm thấy; lọc và phân trang hoạt động<br>5. Có hộp xác nhận; brand biến mất | Low | Tên: `AutoBrandSET20261020`<br>Mô tả: 500 / 501 ký tự | Yes | UI | @GiaLap @Boundary |
| PARSCA_SET_TC_004 | M15: SET | 🟢 Low | Dữ liệu Settings giả lập — tải lại là mất | V1 ở `/vendor/settings/brand` | 1. Thêm brand `AutoBrandSET20261020b` → lưu<br>2. Tải lại trang (F5)<br>3. Tìm `AutoBrandSET20261020b` | 1. Brand hiển thị trong bảng<br>2. Trang tải lại<br>3. **Không còn** — đúng mô tả giả lập, không ghi bug | Low | `AutoBrandSET20261020b` | Yes | UI | @GiaLap |
| PARSCA_SET_TC_005 | M15: SET | 🟢 Low | Vehicle fitment quản lý theo cấp bậc | V1 ở `/vendor/settings/fitment` | 1. Xem các cấp Vehicle type → Make → Model → Submodel → Engine<br>2. Thêm Make `AutoMakeSET20261020` dưới 1 Vehicle type<br>3. Thêm Model dưới Make vừa tạo<br>4. Thử thêm Model khi chưa chọn Make | 1. Đủ 5 cấp, mỗi cấp thuộc cấp trước<br>2. Thêm thành công<br>3. Model gắn đúng Make cha<br>4. Không cho thêm / yêu cầu chọn cấp cha | Low | Make: `AutoMakeSET20261020` | Yes | UI | @GiaLap |
| PARSCA_SET_TC_006 | M15: SET | 🟢 Low | Brand thêm ở Settings không vào form sản phẩm và không gọi API quản lý | V1; DevTools → Network bật | 1. Thêm brand `AutoBrandSET20261020c` ở Settings<br>2. Kiểm tra Network<br>3. Mở `/vendor/products/new` (cùng tab, không tải lại), mở ô Brand<br>4. Khách mở website → bộ lọc Brand | 1. Hiển thị trong bảng Settings<br>2. **Không có** `POST /product-brands` (và không có 403)<br>3. **Không** có `AutoBrandSET20261020c`<br>4. Không có brand này<br>📝 Ghi nhận cho **Q-V5**: vendor không sửa được danh mục qua Settings nhưng lại thêm được qua Import CSV (CSV_TC_027) | Medium | Brand: `AutoBrandSET20261020c` | Yes | E2E | @CodeHienTai @GiaLap @Security |

---

## TỔNG HỢP AMBIGUITIES ĐÃ GIẢI QUYẾT

| # | Ambiguity | Giải quyết bằng |
|---|-----------|-----------------|
| Q-V8 | Đơn hàng / đánh giá không tách theo vendor; khách mở được đơn mẫu | ORD_TC_007, ORDD_TC_010, ORDD_TC_011, REV_TC_007 |
| Q-V9 | Chữ "Epic 9/10/11" hiển thị cho người dùng | DASH_TC_004 |
| Q-V5 | Settings không ảnh hưởng danh mục, nhưng import thì có | SET_TC_006 (đối chiếu CSV_TC_027) |
| AMB | Bộ lọc thời gian tương đối rỗng vì ngày test | ORD_TC_005, REV_TC_004 ghi rõ "không ghi bug" |
| AMB | Mâu thuẫn dữ liệu mẫu (shipped vẫn Cancel, "Payment confirmed" luôn có, 2147 refund một phần) | ORDD_TC_003 ghi nhận báo PO |

---

## THỐNG KÊ

| Tiêu chí | Số lượng |
|----------|----------|
| **Tổng TC** | **38** |
| Critical Priority | 0 |
| High Priority | 3 (DASH_002, DASH_003, ORDD_011) |
| Medium Priority | 15 |
| Low Priority | 20 |
| Automatable Yes / Partial / No | 36 / 2 / 0 |
| Kỹ thuật EP | Trạng thái đơn (6 đơn đại diện), mức sao (5 → 1) |
| Kỹ thuật Decision Table | Trạng thái đơn × nút Cancel (khoá / toast) |
| Kỹ thuật Error Guessing | id sai / chữ HOA, ngôn ngữ, URL settings bị cấm, Network gọi API cấm |
