---
id: 17-thanh-toan-payouts
title: Thanh toán (Payouts)
source_section: "2.16"
routes: [/vendor/payouts]
endpoints: []
roles: [Vendor]
simulated: true
read_with: [00-tong-quan.md]
---

# 2.16. THANH TOÁN (PAYOUTS) (/vendor/payouts) [GIẢ LẬP HOÀN TOÀN]

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

> Mọi thay đổi chỉ nằm trong bộ nhớ trang; tải lại là quay về dữ liệu mẫu. Không gọi API nào, không lưu vào localStorage.

## Trang chính
- Tiêu đề "Payouts", nút "Set up payouts".
- Ba thẻ:
  | Thẻ | Giá trị | Mô tả |
  |---|---|---|
  | Available | $18.6K | "Ready to be paid out" |
  | Pending | $183.7 | "Orders in production or in transit — not yet delivered" |
  | Lifetime paid | $$15.9K | "Total disbursed to you" |
- Rê chuột vào thẻ thấy số chính xác dạng "18,600.00 CAD". Thẻ dùng ký hiệu "$$", còn bảng dùng hậu tố "CAD".
- Khối "Recent activity": bộ lọc "All status" (Pending, Paid, Failed), bảng 14 dòng mẫu: Time, Activity (Earnings, Payout to Tipalti, Refund to customer, Balance adjustment), Reference, Amount (âm màu đỏ), Status (Pending, Paid, Failed).
- Phân trang các mức 10, 20, 30, 50, mặc định 10 (14 dòng nên có 2 trang). Rỗng: "No activity matches this filter." (không thể thấy với dữ liệu mẫu).
- Số trên thẻ không khớp với bảng (ví dụ Pending thẻ 183,67 nhưng bảng chỉ có một dòng pending âm 43,23).
- Bấm bất kỳ dòng nào mở hộp thoại "Manage payouts" (không có xem chi tiết từng giao dịch). Hồ sơ thanh toán mẫu luôn có sẵn khi vào trang (tên và email người thật nằm trong dữ liệu mẫu).

## Quy trình "Set up payouts" (4 bước: Address, Payment Method, Tax Form, Done)

### Chung
- Hộp thoại luôn mở với dữ liệu mẫu điền sẵn (không bao giờ trống).
- Nút đóng X, ESC hoặc bấm ra ngoài đóng ngay, bỏ mọi thay đổi, không hỏi lại.
- Chấm bước không bấm được; chỉ dùng Next, Back. Không có nút Cancel.
- Không có màn hình thất bại hay trạng thái đang tải vì không có yêu cầu mạng.

### Bước 1: Address
| Trường | Quy tắc | Lỗi |
|---|---|---|
| Type | Individual hoặc Company, không ảnh hưởng gì | |
| Contact email | Bắt buộc; kiểm tra rất lỏng ("a@b.c" vẫn qua) | "Contact email is required", "Enter a valid email address" |
| Mã vùng điện thoại | 40 nước, mặc định CA +1; danh sách chưa đầy đủ | |
| Phone number | Bắt buộc, không kiểm tra định dạng, nhận cả chữ | "Phone number is required" |
| First name | Bắt buộc | "First name is required" |
| Last name | Bắt buộc | "Last name is required" |
| Country | Bắt buộc | "Country is required" |
| Address | Bắt buộc | "Address is required" |
| Address 2 | Không bắt buộc | |
| City | Bắt buộc | "City is required" |
| Postal code | Bắt buộc, không kiểm tra theo nước | "Postal code is required" |

- Không có ô Bang/Tỉnh. Dòng "P.O. boxes are not accepted" chỉ là chữ, không được kiểm tra.
- Lỗi hiện đồng thời khi bấm Next, không tự cuộn tới ô lỗi.

### Bước 2: Payment Method
| Trường | Quy tắc | Lỗi |
|---|---|---|
| Payment method | Local Bank Transfer, International Wire, PayPal | |
| Payment currency | USD, CAD, EUR, GBP, VND | |
| Name on account | Bắt buộc; chỉ một lựa chọn là "Họ Tên" từ bước 1 | "Select the account holder" |
| Bank name | Bắt buộc | "Bank name is required" |
| SWIFT/BIC | Không bắt buộc, không kiểm tra | |
| Account number | Bắt buộc, không kiểm tra độ dài, nhận cả chữ | "Account number is required" |
| Date of birth | Bắt buộc; không cho ngày tương lai; không kiểm tra đủ tuổi | "Date of birth is required", "Date of birth cannot be in the future" |
| Country of birth | Bắt buộc | "Country of birth is required" |
| Bank country | Bắt buộc | "Country is required" |
| Đồng ý điều khoản | Bắt buộc | "You must accept the terms to continue" |

- Sửa tên ở bước 1 thì lựa chọn Name on account bị xoá, phải chọn lại. Nếu chưa có tên, ô bị khoá kèm chữ "Enter a first and last name on the address step first".
- Các trường bắt buộc giống nhau cho mọi phương thức: chọn PayPal vẫn bắt buộc tên ngân hàng và số tài khoản, không có ô email PayPal.
- Liên kết "View tiers" chỉ hiện toast nhắc "Epic 11".

### Bước 3: Tax Form
- Chỉ "W-8BEN (cho cá nhân không phải người Mỹ)" dùng được. "W-8BEN-E", "W-9", "Other" bị khoá và hiện chữ "not built yet".
- Nút "Take the tax form questionnaire" chỉ hiện toast.
- Vì vậy người Mỹ và công ty KHÔNG hoàn tất được; tài khoản loại Company vẫn bị ép dùng W-8BEN.
- Không có ô SSN/EIN/ITIN; chỉ có hai ô mã số thuế thường (không bắt buộc, không che, không kiểm tra định dạng).
- W-8BEN có 5 mục mở dần:
  - Part I: tên, quốc tịch, địa chỉ cư trú và địa chỉ gửi thư. Ô "Same as contact address" chép địa chỉ tại thời điểm tick, không cập nhật khi sửa địa chỉ sau đó, không chép Address 2.
  - Phần mã số thuế: ô "I can't claim treaty benefits..." khoá hai ô mã số nhưng không xoá giá trị.
  - Part II: quốc gia hiệp định.
  - Review: chỉ đọc, không hiện mã số thuế và quốc gia hiệp định.
  - Part III: 6 ô cam đoan, kiểu ký, tên gõ, ngày ký, email liên hệ.
- Chuyển mục bằng Back và Continue KHÔNG kiểm tra gì; có thể đi hết với mọi ô trống.
- Bấm "Submit form" mới kiểm tra, chỉ bằng toast (không có lỗi tại ô):
  - Chưa chọn loại biểu mẫu: "Choose which tax form applies to you first."
  - Chưa tick đủ 6 mục: "Tick every certification statement before submitting."
  - Thiếu chữ ký, ngày hoặc email: "Type your name, the date and a contact email to sign the form."
- Không kiểm tra: chữ ký có khớp tên không, ngày ký có là tương lai không, định dạng email ký, các ô Part I, quốc tịch Mỹ.
- Các lựa chọn ký thay (có hoặc không có giấy uỷ quyền) không yêu cầu thêm tài liệu hay lý do nào.
- Nhấn Enter trong bất kỳ ô nhập nào của biểu mẫu sẽ gửi cả form, nên ở các mục 0 đến 3 sẽ nhảy tới mục 4 kèm toast lỗi.

### Bước 4: Done
- "You are all set. Payments will be made per your selections."
- Có chữ hướng dẫn "press the back button" nhưng bước này không có nút Back.
- Bấm "Done" lưu vào bộ nhớ trang, đóng hộp thoại, toast "Payout details saved for this session."
- Ngày nộp lấy theo giờ UTC (có thể lệch một ngày gần nửa đêm).

## Hộp thoại "Manage payouts" (chỉ đọc)
- 4 bước chỉ đọc:
  - Thông tin địa chỉ.
  - Thông tin thanh toán: số tài khoản che chỉ còn 4 số cuối (ví dụ "********0720"); chuỗi 4 ký tự trở xuống hiện đủ; ngày sinh, email, điện thoại, SWIFT hiện đủ.
  - Tình trạng biểu mẫu thuế: "we have your W-8BEN on file, submitted on <ngày>"; hai liên kết "click here" cùng mở lại hộp thoại thiết lập.
  - Bước hoàn tất.
- Ô trống hiện "--" (hai gạch ngang), trong khi màn thiết lập dùng "—" (gạch dài).
- Nút "Edit" mở hộp thoại thiết lập tại đúng bước đang xem. Bấm Edit ở bước "Done" mở thẳng bước Done, có thể bấm Done lưu lại mà không qua kiểm tra.
- Không có chức năng xoá, huỷ liên kết hay đổi phương thức thanh toán riêng.

## Ghi chú cho tester
Đây là bản mẫu giao diện chờ nối với nhà cung cấp thanh toán (code ghi "Epic 11" và tên Tipalti). Đừng ghi bug cho việc không lưu hay không gửi lên server; hãy ghi nhận mức độ hoàn thiện của giao diện và các lỗ hổng kiểm tra dữ liệu để BA đưa vào yêu cầu.

Test:
- Xoá từng ô điền sẵn để thấy từng thông báo bắt buộc.
- Email sai ("a@b", "a b@c.com", dấu cách đầu cuối); trình duyệt có thể chặn email sai bằng thông báo riêng trước thông báo của hệ thống (cần quan sát).
- Số điện thoại có chữ.
- Ngày sinh hôm nay, ngày mai, năm 1900.
- Số tài khoản có chữ, rất dài, 1 đến 4 ký tự (hiện đủ trong Manage).
- Sửa tên ở bước 1 rồi quay lại bước 2.
- Chọn PayPal; tick và bỏ tick đồng ý.
- Chọn các loại biểu mẫu bị khoá; đi hết mọi mục thuế khi để trống; tick 0 đến 5 trong 6 mục cam đoan.
- Chữ ký chỉ có khoảng trắng; ngày ký tương lai và rất cũ.
- "Same as contact address" rồi quay lại sửa địa chỉ.
- Chọn quốc tịch Mỹ và loại Company.
- Đóng bằng X, ESC, bấm ra ngoài giữa chừng rồi mở lại: dữ liệu quay về bản đã lưu, không phải bản nháp.
- Hoàn tất rồi mở Manage kiểm tra che số; tải lại trang thấy quay về dữ liệu mẫu.
- Bộ lọc trạng thái, các mức cỡ trang, đổi bộ lọc khi ở trang 2.
- Hiển thị trên màn hình hẹp.

Rủi ro dữ liệu cần ghi nhận:
- Dữ liệu nhạy cảm (số tài khoản, ngày sinh, mã số thuế, chữ ký) nằm dạng thường trong bộ nhớ trình duyệt và ô số tài khoản không che khi nhập.
- Dữ liệu mẫu chứa họ tên, email, số điện thoại và số tài khoản trông như dữ liệu thật (cần kiểm tra không xuất hiện ở bản production).
