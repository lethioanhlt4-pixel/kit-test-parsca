# 📋 Hướng Dẫn Nhanh: AI-RBT 6 Bước — PARSCA Vendor

## 🔀 Chọn Luồng Sử Dụng

Có **2 luồng** riêng biệt, tuỳ tool AI bạn đang dùng:

### Luồng 1: Antigravity (Slash Command) — Tự động

```
Mở kit-test-parsca/ làm workspace root
Gõ: /gen-testcase + tên doc hoặc module
→ AI tự chạy theo skill generate-testcase, dừng ở checkpoint chờ bạn
→ KHÔNG cần copy-paste prompt templates
```

**Ưu điểm:** Nhanh, agent tự nạp `rules/` + `module_catalog.md`, nhớ context xuyên suốt.
**Nhược điểm:** Hướng dẫn ở mức tổng quát (ít ví dụ bằng prompt templates).

### Luồng 2: Copy-Paste Prompt — Thủ công (ChatGPT / Claude / AI bất kỳ)

```
Copy prompt Bước 1 → paste vào chat + đính kèm doc BA → AI xử lý
→ Copy prompt Bước 2 → paste → AI xử lý
→ ... lặp lại đến Bước 6
```

**Ưu điểm:** Prompt chi tiết, đã điền sẵn bối cảnh PARSCA, có ví dụ cụ thể.
**Nhược điểm:** Phải copy-paste thủ công 6 lần; phải tự đính kèm doc.

---

## Luồng 1: Antigravity — Prompt nhanh

```
/gen-testcase Mode FULL

Dự án: PARSCA Marketplace — Role Vendor
Module: [VD: M10 CSV — Import CSV]
Doc: docs/parsca-vendor-test-docs/[VD: 12-import-csv.md]
Mục tiêu: [VD: Phủ dry run, import thật, SKU người khác, file lỗi, mất mạng/401]
Câu hỏi PO đã có câu trả lời: [VD: Q-V5 = brand mới KHÔNG vào danh mục — hoặc "chưa có"]
```

Khi AI dừng ở checkpoint, chỉ cần trả lời câu hỏi hoặc gõ:
```
Tiếp tục sang Bước [X]
```

**Thứ tự module đề xuất (theo risk + dependency):**
```
API(05) → ROLE(02) → LOGIN(03) → SESS(04) → SCOPE(06) → PFORM(09) → IMG(11)
→ CSV(12) → PSTAT(10) → WEB(20) → PLIST(07) → PDTL(08) → PROF(19) → PAY(17)
→ ORDD(15) → ORD(14) → DASH(13) → REV(16) → SET(18)
```

---

## Luồng 2: Copy-Paste — Hướng dẫn từng bước

| Bước | Tên | Prompt file | Chờ User? |
|------|-----|-------------|-----------|
| **1** | Context & Role-play | Copy `plans/manual/01_context_and_roleplay/prompt.txt` + đính kèm doc `00`, `01`, `README` + doc module | ✅ Chờ xác nhận |
| **2** | Analysis & QnA | Copy `plans/manual/02_analysis_and_qna/prompt.txt` | ✅ **Chờ trả lời Q&A (Q-Vx)** |
| **3** | Decomposition | Copy `plans/manual/03_decomposition/prompt.txt` | Review nhanh |
| **4** | Traceability | Copy `plans/manual/04_traceability/prompt.txt` | ✅ **Chờ review scenarios + chốt risk** |
| **5** | RBT & TC Generation | Copy `plans/manual/05_rbt_and_tc_generation/prompt.txt` | Review kết quả |
| **6** | Template Mapping | Copy `plans/manual/06_template_mapping/prompt.txt` | Lưu `.md` → convert Excel |

### Sơ đồ luồng:

```
[Bước 1] Copy prompt + đính kèm doc 00, 01, README + doc module
    ↓  AI xác nhận hiểu → User xác nhận OK
[Bước 2] Copy prompt phân tích
    ↓  AI liệt kê luồng + điểm mờ + Q-Vx → ⏸️ User trả lời / ghi "chưa có"
[Bước 3] Copy prompt phân rã
    ↓  AI sinh Module map (M1–M18 + API) → User review nhanh
[Bước 4] Copy prompt traceability
    ↓  AI sinh REQ + scenarios + gap → ⏸️ User chốt risk + bổ sung
[Bước 5] Copy prompt sinh TC (từng module)
    ↓  AI sinh TC chi tiết có nhãn @CodeHienTai/@GiaLap → User review
[Bước 6] Copy prompt chuẩn hóa
    ↓  AI sinh bảng 12 cột → lưu practices/testcases/vendor/ → convert Excel ✅
```

### Convert Excel (sau Bước 6)

```bash
node scripts/convert_excel/md_to_xlsx.js practices/testcases/vendor/TC_PARSCA_VENDOR_<MOD>.md
```
> Script nằm ở `kit-test-parsca/scripts/convert_excel/` (chạy từ `kit-test-parsca/`, `npm install` lần đầu). Xuất đủ 12 cột; thêm `--core` nếu chỉ cần 9 cột.

---

## Mẹo Tối Ưu

1. **Bước 2 là quan trọng nhất** — Đối chiếu Q-Vx đã có trong doc trước khi đặt câu hỏi mới; câu nào chưa có trả lời → TC gắn `@CodeHienTai`.
2. **Sinh từng module** — PARSCA có 19 nhóm; ở Bước 5 yêu cầu AI sinh tối đa 2 module/lần.
3. **Không báo nhầm màn giả lập** — DASH, ORD, ORDD, REV, PAY, SET, Profile (trừ avatar) chỉ kiểm hiển thị.
4. **Dùng cùng conversation** — Chạy cả 6 bước trong 1 conversation để AI giữ context.
5. **Không đưa credentials vào prompt** — luôn dùng `${VENDOR1_EMAIL}`, `${VENDOR1_PASSWORD}`…
6. **Luồng Copy-Paste chi tiết hơn** — Cần chất lượng cao nhất (module 🔴) thì dùng Luồng 2 kể cả khi đang ở Antigravity.
