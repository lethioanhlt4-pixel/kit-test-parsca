---
id: 01-canh-bao-moi-truong
title: Cảnh báo quan trọng về môi trường test
source_section: "1.4"
applies_to: Mọi API và mọi màn gọi API
priority: Đọc trước khi chạy bất kỳ test nào
---

# 1.4. CẢNH BÁO QUAN TRỌNG VỀ MÔI TRƯỜNG TEST

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

## Vấn đề
- FE gọi mọi API với tiền tố `/v1` (ví dụ `/v1/products`) và đọc dữ liệu dạng `{data, meta}`.
- BE trong file zip KHÔNG có tiền tố `/v1` và trả dữ liệu trực tiếp, không bọc `{data, meta}`.
- Mẫu hợp đồng API mà FE bám theo (file `api-schema.ts`) cũng dùng `/v1` và có bọc.
- Nghĩa là FE và BE trong hai file zip này không khớp nhau. Có thể BE đang chạy ở môi trường test là phiên bản khác (ghi chú trong code FE nhắc "API đang được viết lại"). Cần hỏi Dev: môi trường test dùng bản BE nào, và có lớp proxy nào thêm `/v1` và bọc dữ liệu không.

## Hệ quả
- Nếu ghép nguyên hai bản zip: các chức năng gọi API (sản phẩm, đăng nhập) có thể lỗi 404 hoặc đọc sai dữ liệu.
- Các màn hình giả lập (xem `00-tong-quan.md` mục 1.3) vẫn chạy được.
- Tài liệu này mô tả logic nghiệp vụ theo code BE (phân quyền, phạm vi dữ liệu, validate) và code FE (màn hình). Tester đối chiếu với môi trường thật.

## Ghi chú cho tester
Trước khi test, xác nhận với Dev:
1. URL API và FE của môi trường test.
2. Môi trường có đang trả dữ liệu dạng `{data, meta}` và có tiền tố `/v1` không.
3. Tài khoản vendor và admin test.

Nếu mọi API đều lỗi, báo ngay cho BA/Dev, KHÔNG ghi từng màn hình là bug.
