# TÀI LIỆU YÊU CẦU - CÁC MÀN HÌNH GIẢ LẬP (DASHBOARD, ĐƠN HÀNG, ĐÁNH GIÁ, PAYOUTS, SETTINGS)

| Thông tin | Chi tiết |
|-----------|----------|
| Module | DASH · ORD · ORDD · REV · PAY · SET |
| Hệ thống | PARSCA — Marketplace phụ tùng |
| URL | `{FE_URL}/vendor`, `/vendor/orders`, `/vendor/orders/:id`, `/orders/:id`, `/vendor/reviews`, `/vendor/payouts`, `/vendor/settings/*` |
| Endpoint | **Không gọi API** (dữ liệu viết cứng trong FE). Không được gọi: `GET /dashboard/stats`, `POST/PATCH/DELETE /product-brands`, `/fitment-options` |
| Doc nguồn | `13-dashboard.md` (2.12), `14-don-hang.md` (2.13), `15-chi-tiet-don-hang.md` (2.14), `16-danh-gia.md` (2.15), `17-thanh-toan-payouts.md` (2.16), `18-cai-dat-brand-fitment.md` (2.17) |
| Ngày tạo | 2026-10-20 |

---

## 1. TỔNG QUAN

- Các màn hình trong tài liệu này là **[GIẢ LẬP]**: dữ liệu viết cứng, thay đổi chỉ nằm trong bộ nhớ trang, tải lại là mất.
- **KHÔNG ghi bug** cho việc không lưu / không gửi lên server / dấu "—". Mục tiêu test:
  1. Giao diện hiển thị đúng như tài liệu (dữ liệu mẫu, nhãn, trạng thái rỗng).
  2. Không gọi API bị cấm (Network sạch).
  3. Ghi nhận lỗ hổng kiểm tra dữ liệu và rủi ro (PII, dữ liệu dùng chung giữa vendor) để BA đưa vào yêu cầu.
- Ngày test 2026-10-20 → bộ lọc thời gian tương đối (Yesterday, Last 7 days, Last 30 days, This Month, Last month) trả **rỗng** với dữ liệu mẫu (đơn 30/05–08/08/2026). Đây **KHÔNG phải lỗi**.

---

## 2. YÊU CẦU CHỨC NĂNG

### 2.1. Dashboard `/vendor` (DASH)

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-DASH-01 | Tiêu đề "Overview"; ô "This month" và nút "Export" chỉ là hình |
| AC-DASH-02 | 5 thẻ: Total orders, Pending fulfillment, Shipped today, Returns open, Revenue (MTD) — đều "—" kèm "Available in Epic 9/10/11" |
| AC-DASH-03 | "Order Volume (7 Days)", "Top 5 products - Best sellers": "No data yet"; "Recent orders": "No orders yet — this table fills in once orders start flowing through the marketplace." |
| AC-DASH-04 | Khối "Catalogue" **chỉ hiện với admin**; vendor không thấy và **không có request** `GET /dashboard/stats` |
| AC-DASH-05 | Chữ "Epic 9/10/11" là chú thích nội bộ — ⚠️ THEO CODE HIỆN TẠI (**Q-V9**) |

### 2.2. Danh sách đơn hàng `/vendor/orders` (ORD)

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-ORD-01 | 20 đơn mẫu ORD-2134 → ORD-2153 (30/05/2026 → 08/08/2026), dùng chung mọi vendor và admin — ⚠️ THEO CODE HIỆN TẠI (**Q-V8**) |
| AC-ORD-02 | Cột: Order ID, Product (ảnh, tên, SKU), Customer (tên, email), Destination, Total (số lượng), Amount, Payment, Created, Rating, Status. Vendor **không** có cột "Created by" |
| AC-ORD-03 | Ô tìm: mã đơn, tên sản phẩm, SKU, tên và email khách |
| AC-ORD-04 | Status (chọn nhiều: Pending, In production, Shipped, Delivered, Returned, Canceled), Destination, Payment (chọn nhiều: To be invoiced, Invoiced, Pending, Paid, Partially refunded, Refunded, Refused, Canceled) |
| AC-ORD-05 | Thời gian: All, Yesterday, Last 7 days, Last 30 days, This Month, Last month, Specific date. Rate: đúng số sao 5 → 1 |
| AC-ORD-06 | Đổi bộ lọc → về trang 1; phân trang phía trình duyệt 10/20/30/50; bấm dòng mở `/vendor/orders/<id>` |
| AC-ORD-07 | Rỗng: "orders.empty" / "orders.noMatch" (dịch theo ngôn ngữ); một số nhãn lọc tiếng Anh cố định |

### 2.3. Chi tiết đơn hàng `/vendor/orders/:id` (ORDD)

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-ORDD-01 | Admin và vendor thấy cùng trang (biến thể "seller"). Đầu trang: nút quay lại, mã đơn, "Created: ... · Updated: ..." |
| AC-ORDD-02 | "Invoice", "Track package": toast "This is not connected yet — the orders service is still being built."; "Contact" mở email tới khách (chạy thật) |
| AC-ORDD-03 | "Cancel order" khoá với delivered/returned/canceled (chú thích "An order that is &lt;trạng thái&gt; can no longer be cancelled"); trạng thái khác chỉ hiện toast "chưa kết nối" |
| AC-ORDD-04 | Cột trái: Products (ảnh, tên, SKU, "x&lt;qty&gt;", "142.00 CAD"), Order timeline (mới nhất trên), Shipping information (Carrier, Tracking Number + nút sao chép chạy thật, Shipped, Est. Delivery, Delivered) |
| AC-ORDD-05 | Cột phải: Shipping (Currency luôn "CAD"), Payment detail (Subtotal, Shipping = 10, "Volume discount (6%)" khi qty ≥ 3, Total excl. tax, Payment method luôn "Credit card", Status, Transaction ID), Review (nếu có, không trả lời/sửa/xoá) |
| AC-ORDD-06 | Đơn không tồn tại: "Order not found" — "No order matches this link. It may have been removed." + "Back to orders" |
| AC-ORDD-07 | Mọi vendor mở được mọi đơn; khách mở `/orders/:id` thấy PII mẫu — ⚠️ THEO CODE HIỆN TẠI (**Q-V8**) |

### 2.4. Đánh giá `/vendor/reviews` (REV)

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-REV-01 | Không tiêu đề / điểm TB / biểu đồ sao; chữ tiếng Anh cố định |
| AC-REV-02 | 13 đánh giá (5★:5, 4★:4, 3★:2, 2★:1, 1★:1), ngày = ngày đơn + 5, sắp mới nhất trước cố định |
| AC-REV-03 | Ô "Search...": nội dung, mã đơn, tên/email khách, tên sản phẩm, SKU. Lọc thời gian như ORD; "Specific date" chưa chọn ngày → tất cả. Lọc sao khớp đúng. Đổi lọc → trang 1 |
| AC-REV-04 | Cột: Rate, Created, Review (cắt 2 dòng), Customer, Product, Order ID; không sắp xếp. Rỗng: "No reviews match these filters." |
| AC-REV-05 | Bấm dòng mở chi tiết đơn trong cùng cổng; Back quay về trang **đơn hàng** (không phải Reviews) |
| AC-REV-06 | Không có trả lời / xoá / báo cáo / xuất; mọi vendor thấy cùng 13 đánh giá |

### 2.5. Thanh toán `/vendor/payouts` (PAY)

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-PAY-01 | Tiêu đề "Payouts", nút "Set up payouts"; 3 thẻ: Available **$18.6K** "Ready to be paid out", Pending **$183.7** "Orders in production or in transit — not yet delivered", Lifetime paid **$$15.9K** "Total disbursed to you"; hover hiện số chính xác dạng "18,600.00 CAD" |
| AC-PAY-02 | "Recent activity": lọc "All status" (Pending, Paid, Failed); 14 dòng mẫu (Time, Activity, Reference, Amount — âm màu đỏ, Status); phân trang 10/20/30/50 mặc định 10 → 2 trang |
| AC-PAY-03 | Bấm bất kỳ dòng → hộp thoại "Manage payouts" (chỉ đọc) |
| AC-PAY-04 | Wizard 4 bước (Address, Payment Method, Tax Form, Done) luôn điền sẵn; X/ESC/bấm ngoài đóng ngay không hỏi; chấm bước không bấm được; không có Cancel |
| AC-PAY-05 | Bước 1 Address: bắt buộc Contact email, Phone number, First/Last name, Country, Address, City, Postal code — thông báo theo bảng 3.2; lỗi hiện đồng thời khi Next |
| AC-PAY-06 | Bước 2 Payment Method: bắt buộc Name on account, Bank name, Account number, Date of birth (không tương lai), Country of birth, Bank country, đồng ý điều khoản; sửa tên bước 1 → Name on account bị xoá |
| AC-PAY-07 | Bước 3 Tax Form: chỉ W-8BEN dùng được; Back/Continue không kiểm tra; "Submit form" kiểm tra bằng toast (3 thông báo); Enter trong ô gửi cả form |
| AC-PAY-08 | Bước 4 Done: "You are all set. Payments will be made per your selections."; "Done" → toast "Payout details saved for this session." |
| AC-PAY-09 | Manage payouts: số tài khoản che còn 4 số cuối ("********0720"), chuỗi ≤ 4 ký tự hiện đủ; ô trống "--"; "Edit" mở đúng bước; tải lại → về dữ liệu mẫu |

### 2.6. Cài đặt `/vendor/settings` (SET)

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-SET-01 | Bánh răng mở menu đúng 2 mục: "Brand", "Vehicle fitment". `/vendor/settings/logo`, `/vendor/settings/blog` tự chuyển sang Brand |
| AC-SET-02 | Brand: bảng (ngày tạo, tên, mô tả, nhãn "Hidden"), tìm kiếm, lọc ngày, phân trang; thêm/sửa (tên bắt buộc, mô tả ≤ 500 ký tự, thứ tự, hiển thị); xoá có xác nhận |
| AC-SET-03 | Vehicle fitment: Vehicle type → Make → Model → Submodel → Engine (mỗi cấp thuộc cấp trước) |
| AC-SET-04 | Dữ liệu giả trong bộ nhớ: tải lại là mất; **không** ảnh hưởng form sản phẩm / bộ lọc website; không gọi API quản lý brand/fitment |

---

## 3. ĐẶC TẢ TRƯỜNG DỮ LIỆU

### 3.1. Đơn mẫu đại diện theo trạng thái (ORDD)

| Đơn | Trạng thái | Cancel order |
|-----|-----------|--------------|
| ORD-2134 | pending | Bấm được → toast "chưa kết nối" |
| ORD-2135 | in_production | Bấm được → toast |
| ORD-2138 | shipped | Bấm được → toast (mâu thuẫn dữ liệu mẫu — ghi nhận) |
| ORD-2136 | delivered | **Khoá** |
| ORD-2137 | returned | **Khoá** |
| ORD-2139 | canceled | **Khoá** |

> Route id dạng chữ thường `ord-2136`; `/vendor/orders/ORD-2136` → "Order not found".

### 3.2. Wizard Payouts — Bước 1 & 2

| Trường | Bắt buộc | Quy tắc | Thông báo lỗi |
|--------|----------|---------|----------------|
| Type | – | Individual / Company | – |
| Contact email | ✅ | Kiểm tra rất lỏng ("a@b.c" qua) | "Contact email is required", "Enter a valid email address" |
| Phone number | ✅ | Không kiểm tra định dạng (nhận chữ); mã vùng 40 nước, mặc định CA +1 | "Phone number is required" |
| First name / Last name | ✅ | – | "First name is required" / "Last name is required" |
| Country | ✅ | – | "Country is required" |
| Address / City | ✅ | "P.O. boxes are not accepted" chỉ là chữ | "Address is required" / "City is required" |
| Postal code | ✅ | Không kiểm tra theo nước | "Postal code is required" |
| Payment method | – | Local Bank Transfer, International Wire, PayPal | – |
| Payment currency | – | USD, CAD, EUR, GBP, VND | – |
| Name on account | ✅ | Một lựa chọn "Họ Tên" từ bước 1 | "Select the account holder" / khoá: "Enter a first and last name on the address step first" |
| Bank name | ✅ | Bắt buộc cả khi PayPal | "Bank name is required" |
| SWIFT/BIC | – | Không kiểm tra | – |
| Account number | ✅ | Không kiểm tra độ dài, nhận chữ, không che khi nhập | "Account number is required" |
| Date of birth | ✅ | Không cho tương lai; không kiểm tra đủ tuổi | "Date of birth is required", "Date of birth cannot be in the future" |
| Country of birth / Bank country | ✅ | – | "Country of birth is required" / "Country is required" |
| Terms | ✅ | – | "You must accept the terms to continue" |

### 3.3. Wizard Payouts — Bước 3 (toast khi Submit form)

| Điều kiện | Toast |
|-----------|-------|
| Chưa chọn loại biểu mẫu | "Choose which tax form applies to you first." |
| Chưa tick đủ 6 mục cam đoan | "Tick every certification statement before submitting." |
| Thiếu chữ ký / ngày / email | "Type your name, the date and a contact email to sign the form." |

---

## 4. LUỒNG XỬ LÝ

### 4.1. Set up payouts
1. Vendor mở `/vendor/payouts` → bấm "Set up payouts"
2. Bước 1 Address (điền sẵn) → Next (kiểm tra bắt buộc)
3. Bước 2 Payment Method → Next
4. Bước 3 Tax Form → chọn W-8BEN → Part I → mã số thuế → Part II → Review → Part III → "Submit form"
5. Bước 4 Done → "Done" → toast "Payout details saved for this session."
6. Bấm dòng Recent activity → Manage payouts hiển thị dữ liệu vừa lưu (che số tài khoản)
7. Tải lại trang → quay về dữ liệu mẫu

### 4.2. Đơn hàng → Chi tiết → Đánh giá
1. `/vendor/orders` → lọc / tìm → bấm dòng → `/vendor/orders/ord-xxxx`
2. `/vendor/reviews` → bấm dòng → chi tiết đơn → Back → về `/vendor/orders`

---

## 5. TỔNG HỢP THÔNG BÁO

| # | Thông báo | Loại | Màn hình |
|---|-----------|------|----------|
| 1 | Available in Epic 9/10/11 | Ghi chú thẻ | DASH |
| 2 | No data yet | Trạng thái rỗng | DASH |
| 3 | No orders yet — this table fills in once orders start flowing through the marketplace. | Trạng thái rỗng | DASH |
| 4 | This is not connected yet — the orders service is still being built. | Toast | ORDD |
| 5 | An order that is &lt;status&gt; can no longer be cancelled | Chú thích | ORDD |
| 6 | Order not found / No order matches this link. It may have been removed. | Panel | ORDD |
| 7 | No reviews match these filters. | Trạng thái rỗng | REV |
| 8 | No activity matches this filter. | Trạng thái rỗng | PAY |
| 9 | Payout details saved for this session. | Toast | PAY |
| 10 | Thông báo bắt buộc bước 1/2 (bảng 3.2) + 3 toast bước 3 (bảng 3.3) | Inline / Toast | PAY |

---

## 6. CẤU TRÚC GIAO DIỆN

```
/vendor/payouts
+----------------------------------------------------------------+
| Payouts                                      [Set up payouts]  |
| +------------------+ +------------------+ +------------------+ |
| | Available $18.6K | | Pending $183.7   | | Lifetime $$15.9K | |
| +------------------+ +------------------+ +------------------+ |
| Recent activity                         [All status ▼]         |
| | Time | Activity | Reference | Amount | Status |              |
| ... 10 dòng / trang (14 dòng → 2 trang)  [10 ▼] < 1 2 >        |
+----------------------------------------------------------------+

/vendor/orders/ord-2134
+--------------------------------------+-------------------------+
| ← ORD-2134  Created · Updated  [Invoice][Contact][Cancel order]|
| Products (x qty, 142.00 CAD)         | Shipping (CAD)          |
| Order timeline                       | Payment detail          |
| Shipping information [Copy][Track]   | Review (nếu có)         |
+--------------------------------------+-------------------------+
```

---

## 7. YÊU CẦU PHI CHỨC NĂNG

| ID | Nội dung |
|----|----------|
| NFR-SIM-01 | Bảo mật: màn hình giả lập không gọi API quản trị (`/dashboard/stats`, brand/fitment) |
| NFR-SIM-02 | Quyền riêng tư: dữ liệu mẫu (tên, email, số tài khoản trông như thật) không được xuất hiện ở production |
| NFR-SIM-03 | Bảo mật: dữ liệu nhạy cảm Payouts nằm dạng thường trong bộ nhớ, ô số tài khoản không che khi nhập — ghi nhận rủi ro |
| NFR-SIM-04 | Responsive: Payouts / Orders hiển thị được trên màn hình hẹp |
| NFR-SIM-05 | i18n: ghi nhận nhãn không dịch / viết khác nhau ("Partially Refunded" vs "Partially refunded") |

---

## 8. CÂU HỎI CẦN LÀM RÕ VỚI PO/USER

| ID | Câu hỏi |
|----|---------|
| Q-V5 | Vendor có quyền sửa danh mục dùng chung (brand, fitment)? |
| Q-V8 | Khi nối API đơn thật, đơn có tách theo vendor? Khách có mở được đơn người khác? |
| Q-V9 | Chữ "Available in Epic 9/10/11" có được hiển thị cho người dùng? |
