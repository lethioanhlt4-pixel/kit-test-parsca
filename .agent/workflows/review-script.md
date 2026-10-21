---
description: Review Playwright script PARSCA — selector, wait, test data, TC mapping, POM, bảo mật — và đưa ra danh sách finding có mức độ + bản sửa đề xuất.
skills:
  - generate-playwright-script
---

# /review-script — Review Playwright Script

> **BẮT BUỘC nạp trước:**
> - Skill: `.agent/skills/generate-playwright-script/SKILL.md` (chuẩn code, mapping nhãn)
> - Rule: `.agent/rules/selectors.md`, `.agent/rules/test-data.md`, `.agent/rules/core.md`

---

## Input cần từ User

| Input | Bắt buộc | Ví dụ |
|-------|----------|-------|
| File / thư mục script | ✅ | `tests/vendor/csv.import.spec.ts`, `pages/vendor/` |
| File testcase gốc | ❌ (khuyến nghị) | `practices/testcases/vendor/TC_PARSCA_VENDOR_05_IMPORT_CSV.md` |
| Kết quả chạy gần nhất | ❌ | Report / trace nếu có FAIL hoặc flaky |
| Mức review | ❌ | `quick` (chỉ Blocker/Major) / `full` (mặc định) |

---

## Checklist Review

### A. Selector (`rules/selectors.md`)
| # | Kiểm tra | Mức nếu vi phạm |
|---|----------|-----------------|
| A1 | Theo priority: role → label → placeholder → test id → text → id → CSS → XPath | Major |
| A2 | Không class hash / utility CSS / XPath tuyệt đối / `nth` không lý do | Major |
| A3 | Locator chỉ nằm trong Page Object | Minor |
| A4 | Scope đúng (dialog, row theo SKU) — tránh match nhiều element | Major |
| A5 | Text locator phụ thuộc ngôn ngữ → đã cố định locale | Minor |

### B. Wait & ổn định
| # | Kiểm tra | Mức |
|---|----------|-----|
| B1 | Không `waitForTimeout` / sleep | **Blocker** |
| B2 | Dùng `expect().toBeVisible/toHaveURL/toHaveText`, `waitForResponse` cho API | Major |
| B3 | Không `page.$`, `waitForSelector` thừa | Minor |
| B4 | Không race: `waitForResponse` đăng ký **trước** hành động | Major |

### C. TC mapping & assertion
| # | Kiểm tra | Mức |
|---|----------|-----|
| C1 | Title bắt đầu bằng TC ID tồn tại trong file TC | Major |
| C2 | Mỗi Expected Result của TC có assertion tương ứng (status code, câu nguyên văn, số lượng) | Major |
| C3 | Assertion có message | Minor |
| C4 | Tag khớp cột Tags; `@CodeHienTai` không bị assert theo hành vi sai để PASS giả | **Blocker** |
| C5 | `@GiaLap`: có kiểm không gọi API cấm; không assert "đã lưu" | Major |

### D. Test data & độc lập
| # | Kiểm tra | Mức |
|---|----------|-----|
| D1 | SKU/email/tên qua `dataFactory`, unique, traceable | Major |
| D2 | Setup qua API, teardown xoá `AUTO-*` đã tạo | Major |
| D3 | Không phụ thuộc thứ tự test / state test khác | **Blocker** |
| D4 | Không dữ liệu thật / PII | Major |

### E. Bảo mật & hygiene
| # | Kiểm tra | Mức |
|---|----------|-----|
| E1 | Không credentials / token / cookie hard-code hoặc log | **Blocker** |
| E2 | Không `console.log`, code comment-out, import thừa, locator không dùng | Minor |
| E3 | Đặt tên file / class / method theo convention `core.md` §5.2 | Minor |

---

## Các Bước
1. Đọc script + TC gốc; lập bảng mapping TC ID ↔ test (thiếu / thừa).
2. Chạy checklist A–E; với selector đáng ngờ → verify trên DOM (MCP) nếu có môi trường.
3. (Tuỳ chọn) chạy spec 2 lần để phát hiện flaky.
4. Viết kết quả.

## Output

```markdown
# 🔎 SCRIPT REVIEW — <file> — <YYYY-MM-DD>

**Kết luận:** ✅ Approve / 🟡 Approve with changes / ❌ Request changes
**Thống kê:** Blocker x · Major y · Minor z

| # | Mức | Checklist | File:dòng | Vấn đề | Đề xuất sửa |
|---|-----|-----------|-----------|--------|-------------|

## TC mapping
| TC ID | Test | Trạng thái (Đủ / Thiếu assertion / Không có test) |

## Code đề xuất (diff)
```
- Có Blocker → **Request changes**. Chỉ sửa trực tiếp file khi User yêu cầu.
