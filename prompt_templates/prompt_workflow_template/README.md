# Prompt Workflow Templates — PARSCA Vendor (Có Tích Hợp Slash Commands)

Thư mục này chứa các prompt mẫu **đã tích hợp sẵn lệnh gọi Workflow (Slash Command)** của `kit-test-parsca`.
Khi paste vào Antigravity (với workspace root mở tại `kit-test-parsca/`), AI Agent sẽ tự động nhận diện workflow, kích hoạt đúng Kỹ năng (Skill) và Quy tắc (Rule) chuyên biệt cho PARSCA.

---

## Danh Sách Prompt Workflow PARSCA

| # | File | Workflow Slash Command | Kỹ năng (Skill) phụ trách | Mục đích |
|---|------|------------------------|---------------------------|----------|
| 01 | [`prompt_01_gen_testcase.txt`](prompt_01_gen_testcase.txt) | `/gen-testcase` | `generate-testcase` | Sinh manual testcase 12 cột từ tài liệu BA / AC / User Story |
| 02 | [`prompt_02_gen_script.txt`](prompt_02_gen_script.txt) | `/gen-script` | `generate-playwright-script` | Tự động hoá kịch bản test thành Playwright TS (POM + self-fix) |
| 03 | [`prompt_03_review_script.txt`](prompt_03_review_script.txt) | `/review-script` | `generate-playwright-script` | Review Playwright script theo checklist 5 tiêu chí (A–E) |
| 04 | [`prompt_04_analyze_bug.txt`](prompt_04_analyze_bug.txt) | `/analyze-bug` | `analyze-bug` | Phân tích log/bug: Fact → Root cause → Recommendation |
| 05 | [`prompt_05_write_report.txt`](prompt_05_write_report.txt) | `/write-report` | `write-test-report` | Tổng hợp kết quả kiểm thử & đánh giá Go / No-Go |
| 06 | [`prompt_06_analyze_log.txt`](prompt_06_analyze_log.txt) | `/analyze-log` | `analyze-metabase-log` | Phân tích bất thường dữ liệu qua truy vấn Metabase/SQL |

---

## Cách Sử Dụng

1. Mở file `.txt` tương ứng với tác vụ cần thực hiện.
2. Thay thế các placeholder trong dấu `[...]` bằng thông tin thực tế của bạn (Module, Đường dẫn file, Bằng chứng, hoặc Tên test).
3. Copy toàn bộ nội dung -> Paste vào khung chat Antigravity -> Gửi.
4. AI Agent sẽ tự động nạp skill và thực hiện từng bước mà không cần hướng dẫn thêm.
