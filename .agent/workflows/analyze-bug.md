---
description: Phân tích bug report / log lỗi / test FAIL của PARSCA theo Fact → Root cause → Recommendation, phân loại Bug / Question PO / Observation / Environment / Test issue.
skills:
  - analyze-bug
---

# /analyze-bug — Phân Tích Bug Report / Log Lỗi

> **BẮT BUỘC nạp trước:**
> - Skill: `.agent/skills/analyze-bug/SKILL.md`
> - Rule: `.agent/rules/core.md`

---

## Input cần từ User

| Input | Bắt buộc | Ví dụ |
|-------|----------|-------|
| Mô tả lỗi / bug report thô | ✅ | "Vendor import CSV bị nhân đôi sản phẩm" |
| Bằng chứng | ❌ (khuyến nghị) | Screenshot, Playwright trace, HAR, console log, response body |
| TC liên quan | ❌ | `PARSCA_CSV_TC_005` |
| Môi trường / build | ❌ | URL, commit, trình duyệt |

> Bằng chứng có token / cookie / mật khẩu → yêu cầu User che trước, **không** nhắc lại giá trị trong câu trả lời.

---

## Các Bước

### Bước 1 — Thu thập Fact
- Điền bảng Fact (môi trường, vai trò, dữ liệu, bước, expected trích doc, actual, bằng chứng, tần suất).
- Thiếu thông tin quan trọng → hỏi tối đa 3 câu, rồi tiếp tục với giả định ghi rõ.

### Bước 2 — Đối chiếu doc
- Tìm module trong `generate-testcase/resources/module_catalog.md` → mở doc BA tương ứng.
- Trích đoạn mô tả hành vi kỳ vọng (nguyên văn + số doc).

### Bước 3 — Triage theo cây quyết định của skill
Environment → Observation (giả lập) → Question PO (THEO CODE HIỆN TẠI) → Not a bug (bộ lọc thời gian) → Test issue → Bug.

### Bước 4 — Root cause
- Xác định lớp (BE auth / scope / validation / cache, FE guard / session / UI, contract, data).
- Ghi mức tin cậy + cách Dev xác minh.
- Nếu có trace/HAR: chỉ ra request/response cụ thể làm bằng chứng.

### Bước 5 — Recommendation & bug report
- Severity theo bảng PARSCA; viết bug report chuẩn (`BUG-PARSCA-<MOD>-<YYYYMMDD>-<NN>`).
- Đề xuất TC bổ sung (→ `/gen-testcase`) hoặc sửa script (→ `/review-script`).
- Là câu hỏi PO → soạn câu hỏi Q mới theo format Q-Vx.

---

## Output
- Phân loại + bug report chuẩn (hoặc ghi chú Observation / câu hỏi PO).
- Danh sách hành động cho Dev / QA / PO.
