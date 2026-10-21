# Bước 2: Phân tích yêu cầu và Q&A (Requirement Analysis) — PARSCA Vendor

---

## Mục đích

Yêu cầu AI phân tích doc BA đã nạp ở Bước 1 để tìm điểm thiếu sót, mâu thuẫn, chưa rõ ràng **trước khi** viết kịch bản. Với PARSCA, AI phải **đối chiếu câu hỏi PO đã có trong doc (Q-Vx)** trước, rồi mới đề xuất câu hỏi mới — tránh hỏi trùng.

## Cách sử dụng

1. Copy nội dung `prompt.txt` và gửi ngay sau khi AI đã xác nhận ở Bước 1.
2. AI sẽ trả về:
   - Danh sách **luồng** (Happy / Alternate / Exception) theo từng module trong scope
   - Danh sách **Ambiguities**, phân loại theo nhãn doc (THEO CODE HIỆN TẠI / SUY LUẬN / GIẢ LẬP)
   - Bảng **Q-Vx đã có** (trạng thái) + **câu hỏi mới** đánh số `Q-NEW-01`…
3. **Đọc kỹ** và trả lời; câu chưa có trả lời → ghi "Chưa xác định, giả định là …".
4. Khi đã giải đáp hết → sang Bước 3.

## ⚠️ Lưu ý quan trọng

- **Đây là bước quan trọng nhất.** Các Q-Vx còn mở quyết định Expected Result của nhiều TC (vd Q-V4 SKU unique, Q-V8 orders chung mọi vendor).
- Câu hỏi chưa có câu trả lời → TC tương ứng gắn `@CodeHienTai`, trạng thái **OBSERVED**, không PASS.
- Câu hỏi mới nên gửi PO kèm tham chiếu doc + dòng.

## Câu hỏi PO đang mở (tham khảo)

| Mã | Chủ đề | Module |
|----|--------|--------|
| Q-V2 | Hai tài khoản vendor cùng công ty KHÔNG thấy sản phẩm của nhau (scope theo `createdBy`, không theo công ty) — có chấp nhận? | SCOPE (doc 06) |
| Q-V4 | Rò rỉ thông tin: 409 SKU trùng với sản phẩm vendor khác / admin; lỗi slug trùng khi import lộ SKU sản phẩm khác | SCOPE, PFORM, CSV (doc 06) |
| Q-V5 | Brand / giá trị xe mới từ CSV vào danh mục dùng chung (bộ lọc website) | CSV (doc 12), SET (doc 18) |
| Q-V6 | BE có chặn xoá sản phẩm đã có đơn hàng không | PSTAT (doc 10) |
| Q-V8 | Đơn mẫu không tách theo vendor; khách mở `/orders/:id` thấy PII mẫu | ORD, ORDD (doc 15) |
| Q-V9 | Chữ "Epic 9/10/11" (chú thích nội bộ) hiện cho người dùng | DASH (doc 13) |

> Q-V2…Q-V9 có trong doc BA (`docs/parsca-vendor-test-docs/README.md`). Q-V10 trở đi là câu hỏi **QA đề xuất** dùng trong kit (vd Q-V11 Rating, Q-V14 ngưỡng 10 MB, Q-V15 Compare at / Year) — xem `.agent/rules/test-data.md`; câu mới ở Bước 2 đánh số tiếp `Q-NEW-01`… cho tới khi được gán mã chính thức.
