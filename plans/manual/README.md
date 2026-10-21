# AI-DRIVEN RISK-BASED TESTING FRAMEWORK (AI-RBT) — PARSCA Vendor

**Mục tiêu:**
Tận dụng tốc độ của AI để thực thi chi tiết, kết hợp với tư duy chiến lược RBT (Risk-Based Testing) của con người để sinh bộ **manual test case cho role Vendor của marketplace PARSCA** — đúng nghiệp vụ trong `docs/parsca-vendor-test-docs/`, đúng format 9-field + Automation Metadata của kit.

> Mirror từ `antigravity-testing-kit-main/plans/manual/`, đã điền sẵn bối cảnh PARSCA (module M1–M18 + API, risk, nhãn tài liệu, câu hỏi PO Q-Vx).

## 📌 Nguyên Tắc Cốt Lõi

1. **Human Strategy:** Tester xác định chiến lược, mức độ rủi ro (🔴/🟡/🟢) và chốt câu trả lời Q-Vx với PO.
2. **AI Execution:** AI đọc doc BA 00–20, phân tích, viết TC và rà soát lỗ hổng.
3. **Human Verification:** Tester review kết quả AI trước khi chốt, đặc biệt các TC `@CodeHienTai` / `@GiaLap`.

---

## 🚀 Quy Trình Tổng Quan (6 Bước)

1. **Context & Role-play (Khởi tạo ngữ cảnh):** Nạp vai trò Senior QA + bối cảnh PARSCA Vendor + danh sách doc BA.
2. **Analysis & QnA (Phân tích yêu cầu):** AI liệt kê luồng, điểm mờ, đối chiếu câu hỏi PO đã có (Q-V2, Q-V4, Q-V5, Q-V6, Q-V8, Q-V9…) và đề xuất câu hỏi mới.
3. **Decomposition (Phân rã module):** Phân rã theo Module Catalog M1–M18 + API, chỉ rõ dependencies (ROLE → LOGIN → SCOPE → PFORM/CSV → PSTAT → WEB).
4. **Traceability (Đảm bảo độ bao phủ):** Map `REQ-<MOD>-NN` ↔ doc ↔ scenario; Gap analysis so với mục "GHI CHÚ CHO TESTER" của từng doc.
   - *(Sau bước 4 là **Human Checkpoint** — Tester chốt risk từng module.)*
5. **RBT & TC Generation (Sinh Test Case chi tiết):** Sinh TC theo risk, field-level validation (form sản phẩm, CSV, ảnh, Payouts, avatar), áp dụng nhãn `@CodeHienTai` / `@SuyLuan` / `@GiaLap`.
6. **Template Mapping (Chuẩn hóa Format):** Bảng 12 cột, TC ID `PARSCA_<MOD>_TC_NNN`, tương thích `scripts/convert_excel/md_to_xlsx.js`.

*(Mỗi bước tương ứng 1 thư mục con: `README.md` hướng dẫn + `prompt.txt` câu lệnh mẫu.)*

---

## 🗺️ Bối Cảnh PARSCA Đã Điền Sẵn

| Risk | Module (doc) | Độ sâu TC |
|------|--------------|-----------|
| 🔴 High | ROLE (02), LOGIN (03), SESS (04), SCOPE (06), PSTAT (10), PFORM (09), CSV (12), WEB (20), API (05) | 8–15+ TC/module |
| 🟡 Medium | PLIST (07), IMG (11), ORDD (15), PAY (17), PROF (19) | 4–8 TC/module |
| 🟢 Low | PDTL (08), DASH (13), ORD (14), REV (16), SET (18) | 2–4 TC/module |

| Nhãn trong doc | Tag TC | Cách xử lý |
|----------------|--------|------------|
| THEO CODE HIỆN TẠI | `@CodeHienTai` | Expected = hành vi đúng nghiệp vụ; kết quả thực tế ghi **OBSERVED** + mã Q-Vx, không PASS |
| [SUY LUẬN] | `@SuyLuan` | Chạy và cập nhật lại TC theo thực tế |
| [GIẢ LẬP] | `@GiaLap` | Chỉ kiểm hiển thị dữ liệu mẫu; **không** ghi bug "không lưu / không gọi API" |

---

## ⚠️ Lưu ý Quan Trọng: Chiến Lược Thực Thi (Execution Strategy)

Với phần **Manual Testing**, **BẮT BUỘC chạy tuần tự từng prompt** thay vì gộp thành một lệnh chạy 100% tự động.

**Lý do:**
1. **Điểm nghẽn ở Bước 2:** PARSCA còn nhiều câu hỏi PO mở (Q-V2, Q-V4, Q-V5, Q-V6, Q-V8, Q-V9). Nếu chạy 1 lèo, AI sẽ tự đoán (vd: SKU unique theo vendor hay toàn hệ thống) → TC sai.
2. **Human in the loop:** Ở Bước 4 và 5, Tester phải chốt risk và xác nhận phạm vi màn giả lập trước khi AI sinh TC chi tiết.
3. **Chống ảo giác:** 22 file doc, 19 nhóm module — xé nhỏ từng module giúp không sót luồng (đặc biệt SCOPE, CSV, WEB).
4. **Cảnh báo môi trường (Doc 01):** FE dùng `/v1` + `{data, meta}`, BE thì không → mọi TC API phải ghi rõ giả định endpoint cho tới khi Dev xác nhận.

---

## 🔗 Liên Kết

- Hướng dẫn nhanh: [`QUICK_START.md`](QUICK_START.md)
- Rules: [`../../.agent/rules/core.md`](../../.agent/rules/core.md), [`test-data.md`](../../.agent/rules/test-data.md)
- Skill: [`generate-testcase`](../../.agent/skills/generate-testcase/SKILL.md) + [`module_catalog.md`](../../.agent/skills/generate-testcase/resources/module_catalog.md)
- Workflow Antigravity: `/gen-testcase`
