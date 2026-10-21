---
name: generate-testcase
description: Sinh manual test case 12 cột (TC ID, Module, Risk Level, Test Title, Pre-Condition, Test Steps, Expected Result, Priority, Test Data, Automatable, Auto Type, Tags) cho role Vendor PARSCA từ user story / acceptance criteria / file doc BA, áp dụng Risk-Based Testing và xuất được sang Excel.
---

# Skill: Generate Testcase (PARSCA Vendor)

## Khi nào dùng
- User đưa user story / AC / đoạn doc BA (`docs/parsca-vendor-test-docs/NN-*.md`) và cần manual testcase.
- Bổ sung TC cho module còn thiếu, hoặc cập nhật TC sau khi PO trả lời câu hỏi Q-Vx.

## Nạp bắt buộc
- `.agent/rules/core.md` (format 12 cột, nhãn doc, business rules)
- `.agent/rules/test-data.md` (dữ liệu unique, traceable)
- `resources/module_catalog.md` (mã module, doc nguồn, risk, điểm bắt buộc phủ)

---

## Input

| Input | Bắt buộc | Ghi chú |
|-------|----------|---------|
| User story / AC / doc BA | ✅ | Có thể là tên file doc (vd `12-import-csv.md`) |
| Module code | ❌ | Tự suy ra từ `module_catalog.md` nếu không có |
| Mode | ❌ | `QUICK` (mặc định, chỉ bảng TC) / `FULL` (thêm Risk summary, Traceability, Ambiguities, Thống kê) |
| Số TC mong muốn | ❌ | Mặc định: đủ để phủ mọi AC + mọi "GHI CHÚ CHO TESTER" |

---

## Quy Trình

### Bước 1 — Đọc & trích xuất
1. Đọc doc nguồn **và** các file trong `read_with` của front-matter doc.
2. Trích: AC (đánh mã `AC-<MOD>-NN`), thông báo lỗi nguyên văn, giới hạn số (BVA), route/endpoint, nhãn `THEO CODE HIỆN TẠI` / `[SUY LUẬN]` / `[GIẢ LẬP]`, câu hỏi `Q-Vx`.
3. Liệt kê **Ambiguity** (AMB-xx) cho điểm doc không nói rõ — không tự bịa đáp án.

### Bước 2 — Đánh giá rủi ro
- Risk theo module (`core.md` §5.3). Trong module, TC chạm **BR-01..BR-12** (phạm vi dữ liệu, phân quyền, xuất bản website, mất dữ liệu) → Priority **Critical/High**.

### Bước 3 — Thiết kế TC theo kỹ thuật
| Kỹ thuật | Áp dụng khi |
|----------|-------------|
| EP | Vai trò (Không token/User/Vendor/Admin), chủ sở hữu (V1/V2/Admin), trạng thái (Active/Draft/Archived) |
| BVA | Mọi giới hạn số: stockCount, số ảnh, 10 MB, 20 MB, 50.000 dòng, 500 ký tự, limit 100 |
| Decision Table | Hành động × chủ sở hữu; trạng thái đơn × nút Cancel |
| State Transition | Vòng đời sản phẩm, phiên (login → refresh → logout), wizard Payouts, dialog Import |
| Error Guessing | Trường lạ, SKU chữ thường/dấu cách, XSS, mất mạng, 401 giữa chừng, double click |

Mỗi AC ≥ 1 TC positive; mỗi ràng buộc ≥ 1 TC negative; mỗi giới hạn số ≥ 1 TC boundary.

### Bước 4 — Viết TC (9 field)

```
| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
```

| Field | Quy tắc |
|-------|---------|
| TC ID | `PARSCA_<MOD>_TC_<NNN>` liên tục, không trùng file khác |
| Module | `M<n>: <MOD>` theo catalog |
| Risk Level | `🔴 High` / `🟡 Medium` / `🟢 Low` |
| Test Title | Động từ + đối tượng + điều kiện; ≤ 120 ký tự |
| Pre-Condition | Vai trò đăng nhập, dữ liệu cần có (SKU cụ thể), trạng thái màn hình |
| Test Steps | Đánh số `1.` … nối `<br>`; mỗi bước 1 hành động; URL/endpoint đầy đủ `{FE_URL}/...` |
| Expected Result | Đánh số khớp Steps; câu thông báo **nguyên văn** in đậm; status code; số lượng |
| Priority | Critical / High / Medium / Low |
| Test Data | Giá trị cụ thể theo `test-data.md` (không "dữ liệu hợp lệ") |
| Cột phụ | `Automatable` Yes/Partial/No · `Auto Type` UI/API/E2E · `Tags` |

**Ký hiệu đặc biệt trong Expected Result:**
- `⚠️ THEO CODE HIỆN TẠI: … → ghi Q-Vx, không PASS` (+ tag `@CodeHienTai`)
- `[SUY LUẬN]` (+ tag `@SuyLuan`)
- `📝 Ghi nhận cho BA: …` (màn `@GiaLap`, không phải bug)

### Bước 5 — Đóng gói (Mode FULL)
Thứ tự section: Header info table → `TỔNG HỢP RISK LEVEL` → `TRACEABILITY MATRIX` (AC → TC) → `BẢNG TEST CASES` (mỗi module 1 bảng) → `TỔNG HỢP AMBIGUITIES` → `THỐNG KÊ` (tổng, theo priority, automatable, kỹ thuật).

### Bước 6 — Xuất Excel (tuỳ chọn)
```bash
node scripts/convert_excel/md_to_xlsx.js practices/testcases/vendor/<file>.md
```
(Script của kit-test-parsca, chạy từ `kit-test-parsca/`; cần `npm install` trong `scripts/convert_excel` lần đầu. Converter cảnh báo dòng sai số cột / TC ID trùng.)

---

## Ví Dụ 1 Dòng

| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_SCOPE_TC_003 | M4: SCOPE | 🔴 High | V1 mở trang chi tiết sản phẩm của V2 bằng URL trực tiếp | V1 đăng nhập; biết `${V2_PRODUCT_ID}` | 1. Truy cập `{FE_URL}/vendor/products/${V2_PRODUCT_ID}`<br>2. Quan sát Network | 1. Hiển thị **"Product not found or you do not have permission to view it."**<br>2. `GET /products/admin/${V2_PRODUCT_ID}` trả **404 "Product not found"** (không phải 403) | Critical | id: `${V2_PRODUCT_ID}` | Yes | UI | @Smoke @DataScope @Security |

---

## Checklist Tự Kiểm

- [ ] Mọi AC và mọi "GHI CHÚ CHO TESTER" trong doc có TC
- [ ] Không TC nào Expected mơ hồ ("hiển thị đúng", "thành công")
- [ ] Thông báo lỗi trích nguyên văn từ doc
- [ ] `@CodeHienTai` / `@GiaLap` / `@SuyLuan` gắn đúng
- [ ] Test data cụ thể, unique, không credentials thật
- [ ] Mỗi TC độc lập (tự chuẩn bị dữ liệu)
- [ ] Không có ký tự `|` trong ô; mỗi dòng đủ 12 cột
- [ ] Thống kê khớp số dòng thực tế
