# Prompt Templates — PARSCA Vendor Testing

Thư mục này chứa các **prompt mẫu dùng nhanh (Quick Prompts)** được tinh chỉnh riêng cho dự án **PARSCA (Role Vendor)** — bao gồm cổng quản trị sản phẩm `/vendor`, hệ thống phân quyền 4 vai, kiểm thử BOLA/Scope, và API NestJS.

Khác với thư mục `plans/` (quy trình 6 bước tuần tự chuyên sâu), các prompt ở đây được thiết kế để **dùng độc lập 1 lần**: copy → điền thông tin vào `[...]` → paste vào Antigravity chat → gửi.

---

## 📋 Danh Sách Prompt Mẫu (Standard Prompts)

| # | File | Mục đích | Workflow tương ứng |
|---|------|----------|--------------------|
| 01 | [`prompt_01_generate_requirements.txt`](prompt_01_generate_requirements.txt) | Phân tích tài liệu BA (00–20) / UI sinh Requirements chuẩn 8 phần | `/gen-testcase` |
| 02 | [`prompt_02_generate_test_cases.txt`](prompt_02_generate_test_cases.txt) | Sinh manual test cases 12 cột theo phương pháp RBT & Catalog M1–M18 | `/gen-testcase` |
| 03 | [`prompt_03_create_framework_playwright.txt`](prompt_03_create_framework_playwright.txt) | Scaffold framework `playwright-parsca/` theo kiến trúc chuẩn | `/gen-script` |
| 04 | [`prompt_04_generate_script_playwright.txt`](prompt_04_generate_script_playwright.txt) | Viết automation test script Playwright TS từ test scenario | `/gen-script` |
| 05 | [`prompt_05_convert_manual_to_automation.txt`](prompt_05_convert_manual_to_automation.txt) | Chuyển đổi bảng Manual TC (12 cột) sang Playwright TS hoàn chỉnh | `/gen-script` |
| 06 | [`prompt_06_review_automation_code.txt`](prompt_06_review_automation_code.txt) | Review code automation theo checklist 5 nhóm tiêu chuẩn (A–E) | `/review-script` |
| 07 | [`prompt_07_generate_test_data.txt`](prompt_07_generate_test_data.txt) | Sinh bộ Test Data có cấu trúc (Positive, Negative, BVA, Edge) | `/gen-testcase` |
| 08 | [`prompt_08_analyze_flaky_tests.txt`](prompt_08_analyze_flaky_tests.txt) | Phân tích và khắc phục các test chập chờn / flaky / fail | `/analyze-bug` |
| 09 | [`prompt_09_generate_api_tests.txt`](prompt_09_generate_api_tests.txt) | Viết API test script ma trận 4 vai & kiểm thử BOLA / Mass Assignment | `/gen-script` |
| 10 | [`prompt_10_analyze_bug.txt`](prompt_10_analyze_bug.txt) | Phân tích lỗi theo quy trình Fact → Root Cause → Recommendation | `/analyze-bug` |
| 11 | [`prompt_11_write_test_report.txt`](prompt_11_write_test_report.txt) | Tổng hợp kết quả kiểm thử đợt test và đánh giá Go / No-Go | `/write-report` |
| 12 | [`prompt_12_analyze_metabase_log.txt`](prompt_12_analyze_metabase_log.txt) | Hậu kiểm dữ liệu bất thường bằng truy vấn DB/Metabase (Read-only) | `/analyze-log` |

---

## ⚡ Prompt Workflow Templates (Tích Hợp Slash Commands)

Thư mục [`prompt_workflow_template/`](prompt_workflow_template/) chứa các phiên bản prompt **đã gắn sẵn lệnh gọi workflow chuyên dụng của `kit-test-parsca`**:
- `/gen-testcase`
- `/gen-script`
- `/review-script`
- `/analyze-bug`
- `/write-report`
- `/analyze-log`

Khi paste prompt này vào Antigravity, AI Agent sẽ tự động nạp đúng Skill và tuân thủ các quy tắc trong `.agent/rules/`.

---

## 🎯 Các Quy Tắc PARSCA Quan Trọng Được Nhúng Sẵn

Mọi prompt trong thư mục này đều đã được cấu hình sẵn các quy tắc cốt lõi:
1. **Phân biệt nhãn doc BA:** Xử lý chuẩn xác `@CodeHienTai` (ghi nhận câu hỏi PO `Q-Vx`, trạng thái `OBSERVED`, không ép PASS), và `@GiaLap` (không ghi bug "không lưu DB").
2. **Business Rules cốt lõi:** Luôn đối chiếu `BR-01` đến `BR-12` (sản phẩm người khác trả 404, SKU duy nhất toàn hệ thống và đổi thành CHỮ HOA, chống mass assignment...).
3. **Quản lý dữ liệu test an toàn:** Dữ liệu có tiền tố `AUTO-` để dọn dẹp, tuyệt đối không hardcode mật khẩu hay thông tin nhạy cảm.
4. **Đồng bộ thông minh:** Cấm dùng sleep cứng `waitForTimeout()`, ưu tiên `expect().toBeVisible()` và `waitForResponse()`.
