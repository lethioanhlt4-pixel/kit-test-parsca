# Bước 6: Kiểm duyệt & Tối ưu (Review & Refactoring) — PARSCA Vendor

**Workflow:** `/review-script` (hoặc tiếp tục `/gen-script`)
**Skill:** `generate-playwright-script`

---

## Mục đích

Sau khi spec PASS 2 lần, "dọn dẹp" và review theo chuẩn kit trước khi merge: selector, wait, mapping TC, test data, bảo mật, tag CI.

## Cách sử dụng

1. Gửi file `prompt.txt` (hoặc gõ `/review-script tests/vendor/<file>.spec.ts so với practices/testcases/vendor/<file>.md`).
2. AI sẽ:
   - Liệt kê finding theo mức độ (Blocker / Major / Minor)
   - Đề xuất diff và áp dụng sau khi bạn đồng ý
   - Xoá debug log, code comment-out, locator / import thừa
   - Kiểm tag + script npm cho CI
3. Nhận code final → commit (không commit `.env`, `.auth/`, report, trace).

## Checklist Review

| # | Kiểm tra | Trạng thái |
|---|---|---|
| 1 | Không còn `console.log` / debug log | ☐ |
| 2 | Không còn code comment-out | ☐ |
| 3 | Không có locator / import / biến thừa | ☐ |
| 4 | Không `waitForTimeout` | ☐ |
| 5 | Locator chỉ trong `pages/`, đúng priority `selectors.md` | ☐ |
| 6 | Mỗi test có TC ID ở đầu title + tag đúng TC | ☐ |
| 7 | Assertions có message, đủ status + thông báo nguyên văn | ☐ |
| 8 | Test data qua `dataFactory`, teardown `AUTO-*` | ☐ |
| 9 | `@CodeHienTai` không PASS giả (fixme + Q-Vx) | ☐ |
| 10 | Không credentials / token trong code, log, report | ☐ |
| 11 | Mỗi test độc lập, chạy parallel được | ☐ |
| 12 | PASS 2 lần headed + headless | ☐ |

## Lưu ý

- Trong One-Click, bước này chạy tự động sau khi PASS.
- Code phải đạt `.agent/rules/core.md` + `selectors.md` + `test-data.md` trước khi commit.
