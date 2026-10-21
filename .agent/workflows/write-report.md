---
description: Viết test report sprint / release cho PARSCA Vendor từ kết quả manual + Playwright, kèm khuyến nghị Go / Conditional Go / No-Go.
skills:
  - write-test-report
---

# /write-report — Viết Test Report + Go/No-Go

> **BẮT BUỘC nạp trước:**
> - Skill: `.agent/skills/write-test-report/SKILL.md`
> - Rule: `.agent/rules/core.md`

---

## Input cần từ User

| Input | Bắt buộc | Ví dụ |
|-------|----------|-------|
| Kết quả manual | ✅ (hoặc automation) | Excel/markdown TC có cột Result |
| Kết quả automation | ❌ | `test-results/junit.xml`, `playwright-report/` |
| Danh sách bug | ❌ | Export Jira / bảng markdown |
| Loại report | ❌ | `sprint` (mặc định) / `release` |
| Tên sprint / release, build | ❌ | `Sprint 12`, `v1.4.0` |

---

## Các Bước

### Bước 1 — Thu thập & chuẩn hoá
- Map mọi kết quả về trạng thái chuẩn: PASS / FAIL / OBSERVED / BLOCKED / SKIP / NOT RUN.
- Playwright: lấy TC ID từ đầu title test; test `fixme` của `@CodeHienTai` → OBSERVED.

### Bước 2 — Đối soát
- [ ] Smoke 12 TC đã chạy đủ?
- [ ] Mỗi FAIL có Bug ID; mỗi OBSERVED có Q-Vx / ghi nhận BA?
- [ ] Không có TC trùng hoặc thiếu so với file TC gốc?
→ Lệch → liệt kê cho User trước khi viết tiếp.

### Bước 3 — Tổng hợp số liệu
- Tổng, theo module, theo risk, automation (flaky = pass sau retry).
- Execution rate, Pass rate (không tính OBSERVED).

### Bước 4 — Đánh giá Go / No-Go
- Áp bảng G1–G7 của skill; kết luận = mức thấp nhất; nêu tiêu chí quyết định.

### Bước 5 — Viết report theo template
- File: `reports/TEST_REPORT_PARSCA_VENDOR_<sprint|release>_<YYYYMMDD>.md`.
- Tóm tắt điều hành tối đa 5 dòng, đặt khuyến nghị lên đầu.

---

## Output
- Test report markdown đủ 10 mục.
- Câu trả lời chat: khuyến nghị + 3 lý do chính + link file.
