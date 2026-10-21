# Bước 1: Khởi tạo ngữ cảnh (Context & Role-play) — PARSCA Vendor

---

## Mục đích

Thiết lập vai trò **Senior QA Engineer** và nạp bối cảnh **marketplace PARSCA — role Vendor** để AI định hình tư duy kiểm thử đúng nghiệp vụ: phạm vi dữ liệu theo `createdBy`, vendor tự xuất bản sản phẩm, Import CSV, và các màn giả lập không gọi API.

## Cách sử dụng

1. Mở file `prompt.txt` trong thư mục này.
2. Copy nội dung bên dưới dòng `---START---`.
3. Bối cảnh PARSCA đã điền sẵn; chỉ cần thay các phần trong `[...]`:
   - **Module / doc** cần test đợt này (VD: `12-import-csv.md`)
   - **Mục tiêu đợt** (Sprint / Release)
   - **Câu trả lời PO đã có** (nếu có)
4. **Đính kèm tài liệu** (bắt buộc): `README.md`, `00-tong-quan.md`, `01-canh-bao-moi-truong.md` + doc của module.
5. Paste vào AI chat và gửi.
6. Chờ AI xác nhận **"Tôi đã hiểu bối cảnh và sẵn sàng"** rồi mới sang Bước 2.

## Lưu ý

- Doc `00`, `01` là nền — thiếu sẽ khiến AI ghi bug sai cho màn giả lập hoặc sai prefix `/v1`.
- Không dán mật khẩu / token thật; dùng tên biến `${VENDOR1_EMAIL}`…
- Bước này chỉ cần chạy **1 lần** đầu conversation; đổi module ở Bước 5 không cần chạy lại.
