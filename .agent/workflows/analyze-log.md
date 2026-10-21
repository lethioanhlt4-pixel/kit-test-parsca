---
description: Phân tích kết quả query Metabase / SQL (read-only) để phát hiện bất thường dữ liệu liên quan role Vendor PARSCA và đề xuất bug / testcase.
skills:
  - analyze-metabase-log
---

# /analyze-log — Phân Tích Metabase Query

> **BẮT BUỘC nạp trước:**
> - Skill: `.agent/skills/analyze-metabase-log/SKILL.md` (+ `resources/anomaly_queries.md`)
> - Rule: `.agent/rules/core.md` §7 (chỉ SELECT, không in credentials)

---

## Input cần từ User

| Input | Bắt buộc | Ví dụ |
|-------|----------|-------|
| Kết quả query | ✅ (hoặc câu hỏi cần kiểm) | Bảng / CSV / JSON export từ Metabase |
| Câu SQL / Metabase question | ❌ | `SELECT ... FROM products ...` |
| Mục tiêu | ❌ | "Kiểm tra sau import CSV", "Điều tra SKU trùng", ANM-xx |
| Schema | ❌ (khuyến nghị) | Tên bảng/cột thật |
| Khoảng thời gian | ❌ | `2026-10-20 08:00 → 12:00` |

---

## Các Bước

### Bước 1 — Xác định mục tiêu
- Map yêu cầu sang mã bất thường ANM-01…ANM-13 của skill.

### Bước 2 — Kiểm schema & query
- Đối chiếu bảng/cột với schema User cung cấp; đánh dấu phần giả định.
- Review SQL User đưa: chỉ SELECT, có LIMIT, điều kiện thời gian hợp lý. Nếu câu lệnh có ghi/xoá → **từ chối chạy**, đề xuất bản SELECT.
- Chưa có kết quả → đưa query mẫu (COUNT trước) để User chạy trên Metabase.

### Bước 3 — Phân tích kết quả
- So với rule kỳ vọng; tách dữ liệu test `AUTO-*`.
- Tìm mẫu: theo `createdBy`, theo thời gian, theo trạng thái.

### Bước 4 — Kết luận
- Fact → Interpretation (bug / dữ liệu test / THEO CODE HIỆN TẠI / thiếu dữ liệu) → Action.
- Bất thường là bug → chuyển `/analyze-bug`; cần TC mới → `/gen-testcase`; cần dọn dữ liệu → hỏi User (dọn qua API, không SQL).

---

## Output
- Báo cáo theo template của skill (PII đã che).
- Danh sách hành động tiếp theo.
