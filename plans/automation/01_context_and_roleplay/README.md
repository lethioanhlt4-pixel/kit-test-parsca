# Bước 1: Khởi tạo ngữ cảnh (Context & Role-play) — PARSCA Vendor

**Workflow:** `/gen-script`
**Skill:** `generate-playwright-script` · **Rule:** `core.md`

---

## Mục đích

Định hình cho AI vai trò **Senior Automation Engineer** và nạp bối cảnh kỹ thuật PARSCA:
- Stack cố định: Playwright + TypeScript (UI + API)
- Project `playwright-parsca/` theo `project_architecture/README.md`
- 4 vai + ROLE_TEST, storageState, dữ liệu đối chứng V2 / Admin
- **Pre-flight bắt buộc:** prefix `/v1` + `{data, meta}` (Doc 01)

## Cách sử dụng

1. Mở file `prompt.txt`.
2. Thay thế các phần trong `[...]`:
   - **Môi trường:** `{FE_URL}`, `{API_URL}` (chỉ URL, không mật khẩu)
   - **Pre-flight:** kết quả xác nhận prefix / format với Dev
   - **Scope:** module + file TC sẽ tự động hoá
   - **Kiến trúc:** project mới hay có sẵn
3. Gửi cho AI và chờ AI xác nhận + bảng pre-flight → sang Bước 2.

## Lưu ý

- Pre-flight có mục ❌ → AI phải **dừng**, không sinh code.
- Nếu project đã tồn tại, mô tả cấu trúc để AI sinh code vào đúng thư mục.
- Bước này chỉ chạy **1 lần** đầu conversation.
