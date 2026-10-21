# TEST CASES — PARSCA VENDOR: THANH TOÁN (PAYOUTS)

| Thông tin | Chi tiết |
|-----------|----------|
| **Dự án** | PARSCA — Role Vendor |
| **Module** | PAY — Thanh toán (Payouts) |
| **URL** | `{FE_URL}/vendor/payouts` |
| **Requirements** | `practices/requirements/parsca-vendor/05_requirements_simulated_screens.md` (mục 2.5, 3.2, 3.3) |
| **Doc nguồn** | 17 |
| **Phương pháp** | AI-RBT (Risk-Based Testing) — FULL 6 bước |
| **Ngày tạo** | 2026-10-20 |
| **Tổng số TC** | 26 |

> **Lưu ý quan trọng:** Payouts là **[GIẢ LẬP HOÀN TOÀN]** — không gọi API, không lưu localStorage; tải lại là về dữ liệu mẫu. **Đừng ghi bug** cho việc không lưu / không gửi server. Mục tiêu: ghi nhận **mức hoàn thiện giao diện** và **lỗ hổng kiểm tra dữ liệu** để BA đưa vào yêu cầu (dùng nhãn "📝 Ghi nhận cho BA").
> Mỗi TC bắt đầu bằng việc **tải lại trang** `/vendor/payouts` để về dữ liệu mẫu (đảm bảo độc lập).

---

## TỔNG HỢP RISK LEVEL

| Module | Risk Level | Số TC |
|--------|-----------|-------|
| M16: PAY — Thanh toán (Payouts) | 🟡 Medium | 26 |

---

## TRACEABILITY MATRIX

| Requirement | Test Cases |
|------------|------------|
| AC-PAY-01 | PAY_TC_001, PAY_TC_002, PAY_TC_005 |
| AC-PAY-02 | PAY_TC_003, PAY_TC_004 |
| AC-PAY-03 | PAY_TC_006 |
| AC-PAY-04 | PAY_TC_007, PAY_TC_008 |
| AC-PAY-05 | PAY_TC_009, PAY_TC_010, PAY_TC_011, PAY_TC_012 |
| AC-PAY-06 | PAY_TC_013, PAY_TC_014, PAY_TC_015, PAY_TC_016, PAY_TC_017, PAY_TC_018 |
| AC-PAY-07 | PAY_TC_019, PAY_TC_020, PAY_TC_021, PAY_TC_022, PAY_TC_023, PAY_TC_024 |
| AC-PAY-08 | PAY_TC_025 |
| AC-PAY-09 | PAY_TC_025 |
| NFR-SIM-02, NFR-SIM-03, NFR-SIM-04 | PAY_TC_026 |

---

## BẢNG TEST CASES

### M16: PAY — Thanh toán (🟡 Medium Risk)

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_PAY_TC_001 | M16: PAY | 🟡 Medium | Trang Payouts hiển thị tiêu đề, nút và 3 thẻ số liệu | V1 đăng nhập; DevTools → Network | 1. Mở `{FE_URL}/vendor/payouts`<br>2. Quan sát 3 thẻ<br>3. Kiểm tra Network | 1. Tiêu đề **"Payouts"**, nút **"Set up payouts"**<br>2. Available **$18.6K** "Ready to be paid out"; Pending **$183.7** "Orders in production or in transit — not yet delivered"; Lifetime paid **$$15.9K** "Total disbursed to you"<br>3. **Không** có request API nào cho payouts | High | V1: `${VENDOR1_EMAIL}` | Yes | UI | @GiaLap @Regression |
| PARSCA_PAY_TC_002 | M16: PAY | 🟡 Medium | Rê chuột vào thẻ hiện số chính xác dạng CAD | Ở `/vendor/payouts` | 1. Rê chuột vào thẻ Available<br>2. Rê chuột vào thẻ Pending, Lifetime paid<br>3. So sánh ký hiệu tiền tệ thẻ và bảng | 1. Hiện **"18,600.00 CAD"**<br>2. Hiện số chính xác dạng "x,xxx.xx CAD"<br>3. 📝 Ghi nhận cho BA: thẻ dùng "$$" (Lifetime "$$15.9K") còn bảng dùng hậu tố "CAD" — không nhất quán | Low | – | Yes | UI | @GiaLap |
| PARSCA_PAY_TC_003 | M16: PAY | 🟡 Medium | Bảng Recent activity: 14 dòng, cột đúng, phân trang 2 trang | Ở `/vendor/payouts` | 1. Quan sát cột và số tiền âm<br>2. Đếm dòng trang 1, sang trang 2<br>3. Đổi cỡ trang 20, 30, 50 | 1. Cột Time, Activity (Earnings / Payout to Tipalti / Refund to customer / Balance adjustment), Reference, Amount, Status; số âm **màu đỏ**<br>2. Mặc định **10** dòng; trang 2 có **4** dòng (tổng 14)<br>3. 1 trang 14 dòng | Medium | Cỡ trang 10/20/30/50 | Yes | UI | @GiaLap @Regression |
| PARSCA_PAY_TC_004 | M16: PAY | 🟡 Medium | Lọc trạng thái hoạt động và đổi bộ lọc khi đang ở trang 2 | Ở trang 2 bảng Recent activity | 1. Chọn "Pending"<br>2. Chọn "Paid"<br>3. Chọn "Failed"<br>4. Chọn "All status" | 1. Chỉ dòng Pending; phân trang về trang 1<br>2. Chỉ dòng Paid<br>3. Chỉ dòng Failed<br>4. Đủ 14 dòng<br>📝 "No activity matches this filter." không thể thấy với dữ liệu mẫu | Low | Status: Pending, Paid, Failed | Yes | UI | @GiaLap @Regression |
| PARSCA_PAY_TC_005 | M16: PAY | 🟡 Medium | Số trên thẻ không khớp với bảng (ghi nhận dữ liệu mẫu) | Ở `/vendor/payouts` | 1. Lọc bảng "Pending", cộng Amount<br>2. So sánh với thẻ Pending (183,67) | 1. Chỉ 1 dòng pending **âm 43,23**<br>2. 📝 Ghi nhận cho BA: thẻ và bảng không khớp — dữ liệu mẫu, không ghi bug chức năng | Low | – | Yes | UI | @GiaLap |
| PARSCA_PAY_TC_006 | M16: PAY | 🟡 Medium | Bấm dòng bất kỳ mở hộp thoại "Manage payouts" (chỉ đọc) | Ở `/vendor/payouts` | 1. Bấm dòng đầu tiên<br>2. Đóng, bấm dòng cuối trang 2<br>3. Quan sát nội dung | 1. Mở **"Manage payouts"** (không phải chi tiết giao dịch)<br>2. Mở cùng hộp thoại<br>3. Hồ sơ thanh toán mẫu có sẵn, 4 bước chỉ đọc | Medium | – | Yes | UI | @GiaLap @Regression |
| PARSCA_PAY_TC_007 | M16: PAY | 🟡 Medium | Wizard Set up payouts luôn mở với dữ liệu điền sẵn; điều hướng chỉ bằng Next/Back | Ở `/vendor/payouts` | 1. Bấm "Set up payouts"<br>2. Bấm vào chấm bước "Tax Form"<br>3. Tìm nút "Cancel"<br>4. Bấm Next, rồi Back | 1. Bước 1 **Address**, mọi ô đã điền sẵn (không bao giờ trống)<br>2. Không chuyển bước (chấm không bấm được)<br>3. **Không** có nút Cancel<br>4. Chuyển bước 2 rồi về bước 1, dữ liệu giữ nguyên | Medium | – | Yes | UI | @GiaLap @Regression |
| PARSCA_PAY_TC_008 | M16: PAY | 🟡 Medium | Đóng wizard bằng X / ESC / bấm ngoài — bỏ thay đổi không hỏi lại | Ở `/vendor/payouts` | 1. Mở wizard, sửa First name thành `AutoPayTC008`<br>2. Bấm X → mở lại<br>3. Sửa lại, nhấn ESC → mở lại<br>4. Sửa lại, bấm ra ngoài hộp thoại → mở lại | 1. Ô đã sửa<br>2. Đóng **ngay, không hỏi**; mở lại First name = **bản đã lưu** (không phải `AutoPayTC008`)<br>3. Giống bước 2<br>4. Giống bước 2<br>📝 Ghi nhận cho BA: mất dữ liệu nhập không cảnh báo | Medium | First name: `AutoPayTC008` | Yes | UI | @GiaLap @Regression |
| PARSCA_PAY_TC_009 | M16: PAY | 🟡 Medium | Bước 1 Address: xoá từng ô bắt buộc hiển thị đúng thông báo, lỗi hiện đồng thời | Wizard ở bước 1 | 1. Xoá trống Contact email, Phone number, First name, Last name, Country, Address, City, Postal code<br>2. Bấm Next<br>3. Quan sát vị trí cuộn<br>4. Để trống Address 2, điền lại các ô khác → Next | 1. –<br>2. Ở lại bước 1; hiện **đồng thời**: "Contact email is required", "Phone number is required", "First name is required", "Last name is required", "Country is required", "Address is required", "City is required", "Postal code is required"<br>3. Không tự cuộn tới ô lỗi (ghi nhận UX)<br>4. Sang bước 2 (Address 2 không bắt buộc) | High | Các ô bắt buộc = rỗng | Yes | UI | @GiaLap @Regression |
| PARSCA_PAY_TC_010 | M16: PAY | 🟡 Medium | Bước 1: kiểm tra định dạng Contact email | Wizard ở bước 1 | 1. Nhập `a@b` → Next<br>2. Nhập `a b@c.com` → Next<br>3. Nhập `  auto.pay010@auto.test  ` (dấu cách đầu cuối) → Next<br>4. Nhập `a@b.c` → Next | 1. "Enter a valid email address" (hoặc thông báo riêng của trình duyệt — ghi nhận cái nào hiện trước)<br>2. "Enter a valid email address"<br>3. Ghi nhận: tự cắt khoảng trắng hay báo lỗi<br>4. **Qua** bước 1 — 📝 Ghi nhận cho BA: kiểm tra rất lỏng | Medium | `a@b`, `a b@c.com`, `  auto.pay010@auto.test  `, `a@b.c` | Yes | UI | @GiaLap @Boundary |
| PARSCA_PAY_TC_011 | M16: PAY | 🟡 Medium | Bước 1: Phone number nhận cả chữ, mã vùng mặc định CA +1 | Wizard ở bước 1 | 1. Quan sát mã vùng mặc định, mở danh sách<br>2. Nhập Phone `abcxyz` → Next | 1. Mặc định **CA +1**; danh sách ~40 nước (ghi nhận chưa đầy đủ)<br>2. **Qua** bước 1 — 📝 Ghi nhận cho BA: không kiểm tra định dạng số điện thoại | Low | Phone: `abcxyz` | Yes | UI | @GiaLap @Boundary |
| PARSCA_PAY_TC_012 | M16: PAY | 🟡 Medium | Bước 1: Postal code không kiểm tra theo nước; P.O. box không bị chặn; không có ô Bang/Tỉnh | Wizard ở bước 1, Country = Canada | 1. Postal code `99999` (định dạng Mỹ) → Next<br>2. Back, Address `P.O. Box 123` → Next<br>3. Tìm ô State/Province | 1. **Qua** bước 1<br>2. **Qua** — dòng "P.O. boxes are not accepted" chỉ là chữ<br>3. **Không** có ô Bang/Tỉnh<br>📝 Ghi nhận cho BA cả 3 điểm | Low | Postal: `99999`; Address: `P.O. Box 123` | Yes | UI | @GiaLap @Boundary |
| PARSCA_PAY_TC_013 | M16: PAY | 🟡 Medium | Bước 2 Payment Method: xoá từng ô bắt buộc hiển thị đúng thông báo | Wizard ở bước 2 | 1. Bỏ chọn Name on account, xoá Bank name, Account number, Date of birth, Country of birth, Bank country, bỏ tick điều khoản<br>2. Bấm Next<br>3. Để trống SWIFT/BIC, điền lại các ô khác → Next | 1. –<br>2. Hiện: "Select the account holder", "Bank name is required", "Account number is required", "Date of birth is required", "Country of birth is required", "Country is required", "You must accept the terms to continue"<br>3. Sang bước 3 (SWIFT không bắt buộc) | High | Các ô bắt buộc = rỗng | Yes | UI | @GiaLap @Regression |
| PARSCA_PAY_TC_014 | M16: PAY | 🟡 Medium | Bước 2: Date of birth — hôm nay, ngày mai, năm 1900 (BVA) | Wizard ở bước 2 | 1. DOB = `2026-10-21` (ngày mai) → Next<br>2. DOB = `2026-10-20` (hôm nay) → Next<br>3. DOB = `1900-01-01` → Next | 1. **"Date of birth cannot be in the future"**<br>2. **Qua** — 📝 Ghi nhận cho BA: không kiểm tra đủ tuổi (người 0 tuổi vẫn qua)<br>3. **Qua** — không giới hạn tuổi tối đa | Medium | DOB: `2026-10-21`, `2026-10-20`, `1900-01-01` | Yes | UI | @GiaLap @Boundary |
| PARSCA_PAY_TC_015 | M16: PAY | 🟡 Medium | Bước 2: Account number nhận chữ, rất dài, không che khi nhập | Wizard ở bước 2 | 1. Account number = `ABCD1234` → Next<br>2. Back, nhập chuỗi 64 ký tự số → Next<br>3. Quan sát ô khi nhập | 1. **Qua**<br>2. **Qua** (không kiểm tra độ dài)<br>3. Số tài khoản hiển thị **rõ** khi nhập<br>📝 Ghi nhận cho BA: thiếu kiểm tra định dạng/độ dài và không che dữ liệu nhạy cảm | Medium | `ABCD1234`; 64 chữ số | Yes | UI | @GiaLap @Boundary @Security |
| PARSCA_PAY_TC_016 | M16: PAY | 🟡 Medium | Sửa tên ở bước 1 làm Name on account bị xoá; tên trống thì ô bị khoá | Wizard ở bước 2 với Name on account đã chọn | 1. Back về bước 1, đổi First name thành `AutoPayTC016` → Next<br>2. Quan sát Name on account, mở danh sách<br>3. Back, xoá First name và Last name; quan sát bước 2 (nếu điều hướng được) | 1. Sang bước 2<br>2. Lựa chọn **bị xoá**, phải chọn lại; chỉ có **1** lựa chọn "AutoPayTC016 &lt;Last name&gt;"<br>3. Không qua được bước 1 (lỗi bắt buộc); nếu tới được bước 2 thì ô khoá kèm "Enter a first and last name on the address step first" | Medium | First name: `AutoPayTC016` | Yes | UI | @GiaLap @Regression |
| PARSCA_PAY_TC_017 | M16: PAY | 🟡 Medium | Chọn PayPal vẫn bắt buộc tên ngân hàng và số tài khoản | Wizard ở bước 2 | 1. Chọn Payment method **PayPal**<br>2. Tìm ô email PayPal<br>3. Xoá Bank name, Account number → Next<br>4. Kiểm tra danh sách Payment currency<br>5. Bấm "View tiers" | 1. Đã chọn<br>2. **Không** có ô email PayPal<br>3. "Bank name is required", "Account number is required"<br>4. USD, CAD, EUR, GBP, VND<br>5. Chỉ hiện toast nhắc "Epic 11"<br>📝 Ghi nhận cho BA: trường bắt buộc không đổi theo phương thức | Medium | Payment method: PayPal | Yes | UI | @GiaLap @Regression |
| PARSCA_PAY_TC_018 | M16: PAY | 🟡 Medium | Tick và bỏ tick đồng ý điều khoản | Wizard ở bước 2, các ô khác hợp lệ | 1. Bỏ tick điều khoản → Next<br>2. Tick lại → Next | 1. "You must accept the terms to continue", ở lại bước 2<br>2. Sang bước 3 | Medium | – | Yes | UI | @GiaLap @Regression |
| PARSCA_PAY_TC_019 | M16: PAY | 🟡 Medium | Bước 3: chỉ W-8BEN dùng được; người Mỹ / Company không hoàn tất được | Wizard ở bước 3; bước 1 Type = Company | 1. Quan sát các loại biểu mẫu<br>2. Bấm "W-8BEN-E", "W-9", "Other"<br>3. Bấm "Take the tax form questionnaire"<br>4. Chọn W-8BEN, Part I quốc tịch **United States**<br>5. Tìm ô SSN/EIN/ITIN | 1. Chỉ "W-8BEN" chọn được<br>2. Bị **khoá**, chữ **"not built yet"**<br>3. Chỉ hiện toast<br>4. Không bị chặn — vẫn đi tiếp được<br>5. **Không** có; chỉ 2 ô mã số thuế thường (không bắt buộc, không che)<br>📝 Ghi nhận cho BA: Company bị ép W-8BEN, người Mỹ không có W-9 | High | Type: Company; quốc tịch: United States | Yes | UI | @GiaLap @Regression |
| PARSCA_PAY_TC_020 | M16: PAY | 🟡 Medium | Back/Continue giữa các mục thuế không kiểm tra gì | Wizard ở bước 3, W-8BEN | 1. Xoá mọi ô ở Part I<br>2. Bấm Continue qua: mã số thuế → Part II → Review → Part III<br>3. Ở Review quan sát nội dung | 1. –<br>2. Đi hết các mục với **mọi ô trống**, không có lỗi<br>3. Review chỉ đọc, **không hiện** mã số thuế và quốc gia hiệp định | Medium | Part I = rỗng | Yes | UI | @GiaLap @Regression |
| PARSCA_PAY_TC_021 | M16: PAY | 🟡 Medium | Submit form kiểm tra bằng toast: loại biểu mẫu, 6 cam đoan, chữ ký | Wizard ở bước 3 | 1. Chưa chọn loại biểu mẫu → "Submit form"<br>2. Chọn W-8BEN, tới Part III, tick 0/6 → Submit<br>3. Tick 5/6 → Submit<br>4. Tick 6/6, để trống chữ ký → Submit<br>5. Điền tên `Auto Pay TC021`, ngày `2026-10-20`, email `auto.pay021@auto.test` → Submit | 1. Toast **"Choose which tax form applies to you first."**<br>2. Toast **"Tick every certification statement before submitting."**<br>3. Cùng toast<br>4. Toast **"Type your name, the date and a contact email to sign the form."**<br>5. Sang bước 4 **Done**<br>(Không có lỗi tại ô — chỉ toast) | High | Tên ký: `Auto Pay TC021`; email: `auto.pay021@auto.test` | Yes | UI | @GiaLap @Regression |
| PARSCA_PAY_TC_022 | M16: PAY | 🟡 Medium | Chữ ký và ngày ký không được kiểm tra nội dung | Wizard Part III, tick đủ 6 | 1. Chữ ký chỉ khoảng trắng `   ` → Submit<br>2. Chữ ký `Totally Different Name`, ngày `2030-01-01` → Submit<br>3. Back, ngày `1900-01-01`, email ký `abc` → Submit<br>4. Chọn ký thay (có / không giấy uỷ quyền) | 1. Ghi nhận: chấp nhận hay toast thiếu chữ ký<br>2. **Qua** — không kiểm tra khớp tên, cho ngày tương lai<br>3. **Qua** — không kiểm tra định dạng email ký<br>4. Không yêu cầu tài liệu / lý do<br>📝 Ghi nhận cho BA | Medium | Chữ ký: `   `, `Totally Different Name`; ngày `2030-01-01`, `1900-01-01` | Yes | UI | @GiaLap @Boundary |
| PARSCA_PAY_TC_023 | M16: PAY | 🟡 Medium | "Same as contact address" chép tại thời điểm tick; ô treaty khoá mã số nhưng không xoá | Wizard bước 3, W-8BEN, Part I | 1. Tick "Same as contact address"<br>2. Back về bước 1, đổi Address thành `100 Auto Street TC023`, điền Address 2 → quay lại Part I<br>3. Ở mục mã số thuế nhập `TAX-023`, tick "I can't claim treaty benefits..."<br>4. Bỏ tick | 1. Địa chỉ cư trú được chép từ bước 1<br>2. Địa chỉ Part I **vẫn là địa chỉ cũ**; Address 2 **không** được chép<br>3. Hai ô mã số **bị khoá** nhưng giá trị `TAX-023` **vẫn còn**<br>4. Ô mở lại với giá trị cũ<br>📝 Ghi nhận cho BA | Low | Address: `100 Auto Street TC023`; mã số: `TAX-023` | Yes | UI | @GiaLap @Regression |
| PARSCA_PAY_TC_024 | M16: PAY | 🟡 Medium | Nhấn Enter trong ô nhập của biểu mẫu thuế gửi cả form | Wizard bước 3, W-8BEN, đang ở Part I (mục 0) | 1. Đặt con trỏ vào ô tên Part I, nhấn **Enter** | 1. Form bị gửi: nhảy tới mục cuối (Part III) kèm toast lỗi (vd "Tick every certification statement before submitting.")<br>📝 Ghi nhận cho BA: Enter gây submit ngoài ý muốn | Low | – | Yes | UI | @GiaLap @Regression |
| PARSCA_PAY_TC_025 | M16: PAY | 🟡 Medium | Hoàn tất wizard, Manage payouts che số tài khoản, Edit mở đúng bước, tải lại về mẫu | Ở `/vendor/payouts` | 1. Set up payouts: Account number `1234560720`, đi hết hợp lệ → Submit → bước Done<br>2. Bấm "Done"<br>3. Bấm 1 dòng Recent activity → Manage payouts → bước thanh toán<br>4. Quan sát ô trống và mục biểu mẫu thuế<br>5. Bấm "Edit" ở bước thanh toán; đóng; bấm Edit ở bước Done → Done<br>6. Lặp bước 1 với Account number `0720` → Manage<br>7. Tải lại trang, mở Manage | 1. "You are all set. Payments will be made per your selections."; có chữ "press the back button" nhưng **không** có nút Back (ghi nhận)<br>2. Hộp thoại đóng; toast **"Payout details saved for this session."**<br>3. Số tài khoản **"********0720"**; DOB, email, phone, SWIFT hiện đủ<br>4. Ô trống hiện **"--"**; "we have your W-8BEN on file, submitted on &lt;ngày UTC&gt;"<br>5. Mở wizard **đúng bước** thanh toán; Edit ở Done mở thẳng Done, bấm Done lưu được không qua kiểm tra (ghi nhận)<br>6. Hiện đủ **"0720"** (≤ 4 ký tự không che)<br>7. Về **dữ liệu mẫu** ban đầu | High | Account: `1234560720`, `0720` | Yes | UI | @GiaLap @Security @Regression |
| PARSCA_PAY_TC_026 | M16: PAY | 🟡 Medium | Rủi ro dữ liệu nhạy cảm trong dữ liệu mẫu và hiển thị màn hình hẹp | Ở `/vendor/payouts` | 1. Mở Manage payouts, đọc họ tên, email, số điện thoại, số tài khoản mẫu<br>2. DevTools → Application: kiểm tra localStorage / sessionStorage sau khi Done<br>3. Thu nhỏ viewport còn 390×844, mở trang và wizard | 1. 📝 Ghi nhận cho BA: dữ liệu mẫu trông như người thật — **phải xác nhận không xuất hiện ở production**<br>2. Không lưu localStorage (đúng mô tả); dữ liệu nhạy cảm chỉ nằm trong bộ nhớ trang dạng thường — ghi nhận rủi ro<br>3. Thẻ, bảng, wizard hiển thị được, không vỡ bố cục / không che nút (ghi lại ảnh chụp nếu lỗi) | High | Viewport: 390×844 | Partial | UI | @GiaLap @Security |

---

## TỔNG HỢP AMBIGUITIES ĐÃ GIẢI QUYẾT

| # | Ambiguity | Giải quyết bằng |
|---|-----------|-----------------|
| AMB | Màn hình giả lập hoàn toàn — tiêu chí PASS là gì? | Hiển thị đúng doc = PASS; lỗ hổng kiểm tra → "📝 Ghi nhận cho BA" (không ghi bug chức năng) |
| AMB | Thông báo email của trình duyệt vs hệ thống | PAY_TC_010 ghi nhận cái nào hiện trước |
| AMB | Chữ ký chỉ khoảng trắng | PAY_TC_022 ghi nhận thực tế |
| AMB | Ngày nộp UTC lệch gần nửa đêm | PAY_TC_025 bước 4 ghi nhận ngày hiển thị |

---

## THỐNG KÊ

| Tiêu chí | Số lượng |
|----------|----------|
| **Tổng TC** | **26** |
| Critical Priority | 0 |
| High Priority | 7 |
| Medium Priority | 12 |
| Low Priority | 7 |
| Automatable Yes / Partial / No | 25 / 1 / 0 |
| Kỹ thuật BVA | DOB (mai/hôm nay/1900), số tài khoản (≤ 4 / dài), 0–6 cam đoan |
| Kỹ thuật EP | Email hợp lệ/không hợp lệ, phương thức thanh toán, loại biểu mẫu thuế |
| Kỹ thuật State Transition | Address → Payment → Tax (5 mục) → Done → Manage → Edit |
| Kỹ thuật Error Guessing | Enter submit, Same as contact, treaty checkbox, đóng giữa chừng |
