# 📋 Hướng Dẫn Nhanh: Automation Testing 6 Bước — PARSCA Vendor

## Hai cách sử dụng

### Cách 1: One-Click (Tự động hoàn toàn — Đề xuất)

```
/gen-script

FE URL: {FE_URL}            (VD: https://staging.parsca.example — điền thật khi chạy)
API URL: {API_URL}
Prefix API: [/v1 hoặc không — ĐÃ xác nhận với Dev ngày ...]
Tài khoản: đọc từ .env (VENDOR1_*, VENDOR2_*, ADMIN_*, USER_*, ROLE_TEST_*)
Framework: Playwright TypeScript (project playwright-parsca/)

Manual Test Cases:
practices/testcases/vendor/TC_PARSCA_VENDOR_02_DATA_SCOPE.md — các TC tag @Smoke, Automatable = Yes
```

→ Agent tự chạy hết 6 bước, tự fix đến khi test PASS 2 lần liên tiếp.
→ Không dùng Antigravity? Copy [`prompt_automation.txt`](prompt_automation.txt).

---

### Cách 2: Tuần Tự (Từng bước)

| Bước | Prompt gửi Antigravity | Chờ User? |
|------|------------------------|-----------|
| **0** | Xem `project_architecture/README.md` → scaffold `playwright-parsca/` | Setup 1 lần |
| **1** | Copy `plans/automation/01_context_and_roleplay/prompt.txt` + điền `[...]` | ✅ Chờ xác nhận pre-flight |
| **2** | Copy `plans/automation/02_analysis_and_ui_recon/prompt.txt` + điền TC | ✅ Review bảng locators |
| **3** | Copy `plans/automation/03_pom_design/prompt.txt` | Review POM |
| **4** | Copy `plans/automation/04_test_data_strategy/prompt.txt` | Review nhanh |
| **5** | Copy `plans/automation/05_script_generation/prompt.txt` | Chờ PASS 2 lần |
| **6** | Copy `plans/automation/06_review_and_refactor/prompt.txt` (hoặc `/review-script`) | Nhận clean code |

### Luồng thực hiện:

```
[Bước 0] Scaffold playwright-parsca/ (1 lần)
    ↓
[Bước 1] Nạp bối cảnh + pre-flight (/v1, tài khoản, dữ liệu đối chứng)
    ↓  AI xác nhận → OK (thiếu điều kiện → DỪNG)
[Bước 2] Cung cấp TC (Automatable = Yes)
    ↓  AI mở {FE_URL} 1920×1080, thu thập locators
    ↓  ⏸️ User review bảng locators
[Bước 3] AI thiết kế pages/vendor/*, api/*
    ↓  User review kiến trúc
[Bước 4] AI sinh dataFactory + danh sách file test
    ↓  User review nhanh
[Bước 5] AI sinh spec + chạy headed
    ↓  Self-fix loop → PASS 2 lần → headless ✅
[Bước 6] /review-script + cleanup
    ↓  User nhận clean code → commit ✅
```

### Lệnh chạy thường dùng

```bash
npx playwright test --project=setup                 # Tạo storageState 4 vai
npx playwright test --grep @Smoke --headed          # Debug headed
npx playwright test tests/api                       # Chỉ API
npx playwright test --grep @DataScope --repeat-each=2   # Kiểm ổn định 2 lần
npx playwright show-report
```

---

## Mẹo Tối Ưu

1. **Pre-flight trước mọi thứ** — chưa chốt `/v1` thì mọi API helper đều có thể sai.
2. **Bắt đầu từ API_PERM** — ít phụ thuộc DOM, phát hiện lỗi môi trường sớm.
3. **Luôn chạy trong cùng 1 conversation** để AI giữ context locator / POM.
4. **Không đưa mật khẩu vào prompt** — chỉ tên biến; `.env` không commit.
5. **Màn giả lập** — chỉ assert hiển thị + không request cấm, không viết test "lưu dữ liệu".
6. **Thay đổi role** — dùng `ROLE_TEST_*`, không dùng V1 (tránh làm hỏng storageState của suite khác).
