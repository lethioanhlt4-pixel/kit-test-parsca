# ❓ Q&A TRACKER — Câu Hỏi PO / BA / Dev (PARSCA Vendor)

> Theo dõi câu hỏi phát sinh trong quá trình phân tích. Q-V2 → Q-V9 có sẵn trong tài liệu BA; Q-V10 trở đi là câu hỏi mới phát sinh khi sinh kit (xem `requirement_analysis_vendor.md` mục 7.1).
>
> **Quy tắc:** TC liên quan một câu hỏi **chưa có câu trả lời** → chạy để **ghi nhận hiện trạng** (OBSERVED), không PASS. Khi PO trả lời → cập nhật cột "Trả lời" và chạy `/gen-testcase` (kèm câu trả lời PO) để cập nhật TC.

---

## 1. Câu Hỏi PO

| Mã | Câu hỏi | Bối cảnh / Hiện trạng theo code | Assumption nếu chưa trả lời | TC liên quan | Người hỏi | Trả lời | Trạng thái |
|----|---------|----------------------------------|-----------------------------|--------------|-----------|---------|-----------|
| Q-V2 | Hai tài khoản vendor cùng công ty có cần chia sẻ sản phẩm không? | Phạm vi theo `createdBy` (ID tài khoản), `vendorId` luôn null, không có module Vendor/công ty | Không chia sẻ (đúng code) | SCOPE_TC_012 | QA | | 🟡 Open |
| Q-V4 | Có chấp nhận rò rỉ thông tin SKU/slug của người khác qua 409 và lỗi import? | 409 `Product with SKU "..." already exists`; import "sku: this product belongs to another vendor"; lỗi slug lộ SKU sản phẩm kia | Ghi nhận như rò rỉ thông tin | SCOPE_TC_009, SCOPE_TC_010, SCOPE_TC_011, CSV_TC_017, CSV_TC_018 | BA | | 🟡 Open |
| Q-V5 | Vendor có quyền sửa danh mục dùng chung (brand, giá trị xe)? | API quản lý chỉ admin (403), nhưng Import CSV tự thêm brand/xe mới vào danh mục | Vendor KHÔNG được sửa danh mục chung → import thêm brand là bug | CSV_TC_027, SET_TC_006, API_PERM_TC_005..010 | BA | | 🟡 Open |
| Q-V6 | BE có chặn xoá sản phẩm đã có đơn hàng? | Chưa có đơn thật, không xác minh được | Không chặn (chưa kiểm chứng) | PSTAT_TC_011 | BA | | 🟡 Open |
| Q-V8 | Khi nối API đơn thật, đơn có tách theo vendor? Khách có mở được đơn người khác? | Mọi vendor thấy cùng 20 đơn; khách mở `/orders/:id` mẫu lộ tên/email/địa chỉ mẫu | Phải tách theo vendor/khách khi go-live | ORD_TC_007, ORDD_TC_010, ORDD_TC_011 | BA | | 🟡 Open |
| Q-V9 | Chữ "Available in Epic 9/10/11" có được hiển thị cho người dùng? | Chú thích nội bộ hiện trên Dashboard | Phải đổi chữ trước go-live | DASH_TC_004 | BA | | 🟡 Open |
| Q-V10 | Vendor tự xuất bản sản phẩm Active không qua duyệt — có chấp nhận? | Status vendor chọn được cả 3; Import luôn active | Chấp nhận tạm, ghi nhận | PFORM_TC_045, CSV_TC_016, WEB_TC_001 | QA | | 🆕 New |
| Q-V11 | Vendor có được tự nhập Rating (0–5) cho sản phẩm? | Ô Rating trong form + cột rating/ratingCount trong CSV | Không được → bug | PFORM_TC_044 | QA | | 🆕 New |
| Q-V12 | Ô "In stock" luôn bị bỏ qua (inStock = stockCount > 0, stockCount ≥ 1) — có bỏ ô này? | BE tính lại inStock | Ghi bug UX | PFORM_TC_043 | QA | | 🆕 New |
| Q-V13 | Có cần cảnh báo khi rời form chưa lưu và dọn ảnh mồ côi trên storage? | Cancel không hỏi; ảnh upload không xoá nếu không lưu | Cần cảnh báo → bug | PFORM_TC_046, PFORM_TC_047 | QA | | 🆕 New |
| Q-V14 | Giới hạn "10 MB" được tính là 10.000.000 hay 10.485.760 byte? | Doc ghi "10 MB" | 10 MB = 10.485.760 byte (multer thường dùng 1024²) | IMG_TC_005, IMG_TC_006, PROF_TC_003 | QA → Dev | | 🆕 New |
| Q-V15 | Có cần chặn: Compare at < Price; Year start > Year end; Subcategory không thuộc Department? | BE không kiểm tra | Cần chặn → ghi bug | PFORM_TC_015, PFORM_TC_036, PFORM_TC_052 | QA | | 🆕 New |
| Q-V16 | Ba huy hiệu cố định (Secure Payment, 30-day returns, 2-year warranty) ở trang chi tiết có giữ? | Viết cứng, không phải chính sách vendor | Ghi nhận | PDTL_TC_004 | BA | | 🆕 New |
| Q-V17 | Import CSV cập nhật một sản phẩm đang Draft/Archived → có tự chuyển Active? | "MỌI dòng đều thành trạng thái active (cột status bị bỏ qua)" | Có chuyển Active [SUY LUẬN] — rủi ro công khai ngoài ý muốn | CSV_TC_016 | QA | | 🆕 New |

---

## 2. Câu Hỏi Dev (Môi trường / Kỹ thuật)

| Mã | Câu hỏi | Lý do | Trả lời | Trạng thái |
|----|---------|-------|---------|-----------|
| D-01 | URL FE / API môi trường test? | Pre-flight | | 🟡 Open |
| D-02 | Môi trường có `/v1` và `{data, meta}`? Có proxy? | Doc 01 | | 🟡 Open |
| D-03 | Có thể rút TTL access token để test refresh? | Doc 04 | | 🟡 Open |
| D-04 | Có Redis cache ở môi trường test? | Doc 20 | | 🟡 Open |
| D-05 | Hộp thư nhận email reset password? | Doc 19 | | 🟡 Open |
| D-06 | Có thể tắt BE tạm để test "không khả dụng"? | Doc 03 | | 🟡 Open |
| D-07 | Có giữ ảnh cũ trên storage khi đổi avatar / xoá sản phẩm (kiểm tra bằng cách nào)? | Doc 10, 19 | | 🟡 Open |
| D-08 | Slug sinh từ tên chỉ chứa ký tự không Latin xử lý thế nào? | AMB-15 | | 🟡 Open |

---

## 3. Lịch Sử Cập Nhật

| Ngày | Người cập nhật | Nội dung |
|------|----------------|----------|
| 2026-10-20 | Antigravity | Khởi tạo tracker từ tài liệu BA + phân tích kit |
