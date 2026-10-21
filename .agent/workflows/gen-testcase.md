---
description: Sinh manual testcase 12 cột (9 field + Automatable / Auto Type / Tags) cho role Vendor PARSCA từ user story / AC / file doc BA (QUICK hoặc FULL).
skills:
  - generate-testcase
---

# /gen-testcase — Sinh Testcase Từ User Story / AC

> **BẮT BUỘC nạp trước:**
> - Skill: `.agent/skills/generate-testcase/SKILL.md` (+ `resources/module_catalog.md`)
> - Rule: `.agent/rules/core.md`, `.agent/rules/test-data.md`

---

## Input cần từ User

| Input | Bắt buộc | Ví dụ |
|-------|----------|-------|
| Nguồn yêu cầu | ✅ | `12-import-csv.md` · đoạn user story · danh sách AC |
| Mode | ❌ | `QUICK` (mặc định) / `FULL` |
| Module code | ❌ | `CSV` (tự suy nếu không có) |
| File output | ❌ | Mặc định `practices/testcases/vendor/TC_PARSCA_VENDOR_<MOD>.md` |
| TC ID bắt đầu | ❌ | Mặc định `001`, hoặc nối tiếp file đã có |

> Thiếu nguồn yêu cầu → hỏi User, **không** tự bịa.

---

## Các Bước

### Bước 1 — Đọc nguồn
1. Mở doc trong `docs/parsca-vendor-test-docs/` + mọi file trong `read_with`.
2. Đọc `00-tong-quan.md`, `01-canh-bao-moi-truong.md` nếu chưa đọc trong phiên.

### Bước 2 — Phân tích (output ngắn, hiển thị cho User)
- Danh sách AC `AC-<MOD>-NN`, giới hạn số (BVA), thông báo lỗi nguyên văn.
- Điểm `THEO CODE HIỆN TẠI` / `[SUY LUẬN]` / `[GIẢ LẬP]` và Q-Vx liên quan.
- Ambiguity mới (AMB-xx) → đề xuất câu hỏi PO.

> **⏸️ CHECKPOINT (Mode FULL):** trình bày phân tích + số TC dự kiến theo kỹ thuật, chờ User xác nhận. Mode QUICK: tiếp tục.

### Bước 3 — Sinh testcase
- Theo skill `generate-testcase` Bước 3–4: EP, BVA, Decision Table, State Transition, Error Guessing.
- Bảng 9 field (+ `Automatable | Auto Type | Tags`).

### Bước 4 — Đóng gói
- QUICK: header + bảng TC + thống kê ngắn.
- FULL: header → Risk summary → Traceability (AC → TC) → Bảng TC theo module → Ambiguities → Thống kê.

### Bước 5 — Tự kiểm & xuất
1. Chạy checklist của skill; đếm lại số dòng, sửa thống kê cho khớp.
2. (Tuỳ chọn) xuất Excel: `node scripts/convert_excel/md_to_xlsx.js <file>.md`.

---

## Output
- File markdown testcase đúng format 12 cột.
- Tóm tắt: số TC theo priority, AC đã phủ, câu hỏi PO mới, TC gắn `@CodeHienTai`.
