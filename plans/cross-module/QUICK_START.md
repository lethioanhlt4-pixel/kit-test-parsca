# 📋 Hướng Dẫn Nhanh: Cross-Module Testing & Ma Trận Kết Hợp — PARSCA Vendor

## 🔀 Chọn Luồng Sử Dụng

### Luồng 1: Antigravity — Tự động (Đề xuất ⭐)

> Workspace root = `kit-test-parsca/`. Agent đọc doc, chạy script pairwise, sinh ma trận.

```
Phân tích cross-module cho PARSCA Vendor theo plans/cross-module/README.md

Luồng: LC — Vòng đời sản phẩm (PFORM/CSV → SCOPE → PSTAT → WEB)
Mode: DOCUMENT (doc 06, 09, 10, 12, 20, 05)   [hoặc BROWSER nếu đã có {FE_URL}]
Chiến lược ma trận: pairwise (hoặc: business-critical / full-cartesian)

Yêu cầu:
1. Data Flow + Dependencies Matrix → ⏸️ dừng cho tôi review
2. Dimension Catalog + Constraints
3. Chạy plans/cross-module/scripts/pairwise_product_lifecycle.py (KHÔNG tính tay)
4. Map Expected cho từng bộ LC-NN → ⏸️ dừng cho tôi review
```

> Có thể dùng workflow gốc `/generate_cross_module_test_plan` nếu mở `antigravity-testing-kit-main/` làm workspace root.

---

### Luồng 2: Copy-Paste vào ChatGPT / Claude — Thủ công

**Prompt mẫu (đã điền PARSCA) — copy paste vào chat AI, đính kèm doc 06, 09, 10, 12, 20:**

```
Bạn là Senior QA Engineer chuyên Combinatorial Testing.

Tính năng "Vòng đời sản phẩm của Vendor PARSCA" đi qua nhiều module nối tiếp:
tạo sản phẩm (Form hoặc Import CSV) → phạm vi dữ liệu theo createdBy → đổi trạng thái / xoá → hiển thị trên website.

Các module và dimensions:
- PFORM/CSV: D1 Kênh tạo = [Form, Import CSV]
- PFORM:     D2 Department = [marine, auto, door, tools]
- PFORM:     D3 Status ban đầu = [Active, Draft, Archived]
- PSTAT:     D4 Hành động sau tạo = [Giữ nguyên, Đổi trạng thái, Sửa tên, Xoá]
- SCOPE/WEB: D5 Người kiểm = [Owner (vendor tạo), Vendor khác, Admin, Khách (storefront)]
- CSV/SET:   D6 Brand = [Có sẵn, Mới]

Constraints:
- C1: Import CSV luôn tạo Active (cột status bị bỏ qua) → Import + Draft/Archived không hợp lệ
- C2: Form chỉ chọn brand có sẵn từ /product-brands → Form + Brand mới không hợp lệ

Business rules:
- Vendor khác truy cập → API 404 "Product not found"; UI "Product not found or you do not have permission to view it."
- Active hiện ngay trên website; Draft / Archived / Xoá → 404 trên storefront
- Brand mới từ CSV được thêm vào bộ lọc brand dùng chung (THEO CODE HIỆN TẠI — Q-V5)

Hãy thực hiện:
1. Vẽ Data Flow giữa các module (output nào → input module nào)
2. Liệt kê constraints và số tổ hợp hợp lệ
3. Sinh ma trận Pairwise BẰNG SCRIPT Python allpairspy (đưa script + output), không tính tay
4. Với mỗi bộ, ghi Final status + Expected (vendor portal / admin / storefront / API status)

Output dạng bảng Markdown, không dùng ký tự | trong ô.
```

---

## 🎯 Luồng End-to-End — Từng bước

### Bước 1: Phân tích Cross-Module & Sinh Ma Trận

**Data Flow (LC):**
```
PFORM / CSV ──(createdBy, status, brand, slug)──► SCOPE ──► PSTAT ──(status mới / xoá)──► WEB
     │                                                                     ▲
     └──(brand mới từ CSV)──► danh mục brand dùng chung ───────────────────┘ (bộ lọc storefront, Q-V5)
```

**Dependencies Matrix:**

| Module đích | Phụ thuộc vào | Trường phụ thuộc | Loại phụ thuộc |
|-------------|---------------|------------------|----------------|
| SCOPE | PFORM / CSV | `createdBy` | Quyết định ai thấy / sửa được |
| PSTAT | PFORM / CSV + SCOPE | `status`, `createdBy` | Chỉ owner đổi trạng thái / xoá |
| WEB | PSTAT | `status`, đã xoá | Active hiện, còn lại 404 |
| WEB (bộ lọc) | CSV | `brand` mới | Brand mới vào danh mục chung |

**Chạy script:**
```bash
python3 -m venv .venv-pairwise && .venv-pairwise/bin/pip install allpairspy
.venv-pairwise/bin/python plans/cross-module/scripts/pairwise_product_lifecycle.py          # Markdown
.venv-pairwise/bin/python plans/cross-module/scripts/pairwise_product_lifecycle.py --csv    # CSV cho Excel
```
> `.venv-pairwise/` là môi trường tạm — thêm vào `.gitignore`, xoá sau khi dùng.

**⏸️ User review:** kiểm Data Flow + ma trận → bổ sung / sửa → xác nhận OK.

---

### Bước 2: Sinh Test Data cho Ma Trận

```
Sinh test data cho ma trận LC (paste bảng LC-NN)
Mode: GENERATE (hoặc PIPELINE khi đã có {FE_URL}, {API_URL} và pre-flight /v1)
Format: json (payload POST /products) + csv (cho bộ Import CSV)
Quy tắc: .agent/rules/test-data.md — SKU AUTO-LC<NN>-<YYYYMMDD>, brand mới AutoBrandLC<NN><YYYYMMDD>
```

- **GENERATE:** mỗi bộ LC-NN → 1 payload hoặc 1 dòng CSV.
- **PIPELINE:** tạo thật bằng `${VENDOR1_EMAIL}`, kiểm bằng `${VENDOR2_EMAIL}` / `${ADMIN_EMAIL}` / khách; teardown xoá `AUTO-LC*`.

---

### Bước 3: Sinh Test Cases (Tùy chọn)

```
/gen-testcase

Nguồn: ma trận LC-NN (paste) + doc 06, 09, 10, 12, 20
Mỗi bộ LC-NN → 1 TC; TC ID theo module kiểm chính (VD PARSCA_WEB_TC_0xx, PARSCA_SCOPE_TC_0xx)
Ghi Ref = LC-NN; bộ có brand mới từ CSV gắn @CodeHienTai (Q-V5)
```

---

### Bước 4: Sinh Automation Scripts (Tùy chọn)

```
/gen-script

Test cases: practices/testcases/vendor/TC_PARSCA_VENDOR_08_PROFILE_STOREFRONT.md (các TC Ref LC-*)
Yêu cầu: spec data-driven đọc ma trận LC (CSV từ --csv), setup qua ProductsApi, kiểm 4 vai
```

→ AI sinh spec + tự chạy + tự fix → PASS 2 lần.

---

## 📊 Ví Dụ Thực Tế: Ma Trận LC (output thật của script)

**Input:** 6 dimensions, 2 constraints → Full Cartesian 768, hợp lệ **320**.

**Output Pairwise: 21 bộ** (trích 8 bộ đầu):

| # | Combo | Kênh | Department | Status đầu | Hành động | Người kiểm | Brand | Status cuối | Expected |
|---|-------|------|------------|------------|-----------|------------|-------|-------------|----------|
| 1 | LC-01 | Form | marine | Active | Keep | Owner | Existing | Active | Có trong /vendor/products (Active); createdBy = owner |
| 2 | LC-02 | Import CSV | auto | Active | Change status | Other vendor | New | Draft | Không thấy; GET /products/admin/:id → 404; brand mới vào bộ lọc (@CodeHienTai Q-V5) |
| 3 | LC-03 | Import CSV | door | Active | Edit name | Admin | Existing | Active | Admin thấy (Active); Created by = owner |
| 4 | LC-04 | Form | tools | Draft | Delete | Guest | Existing | Deleted | Storefront → 404 |
| 5 | LC-05 | Form | door | Archived | Change status | Guest | Existing | Active | Hiện ngay trên storefront |
| 6 | LC-06 | Import CSV | tools | Active | Delete | Owner | New | Deleted | Không còn trong danh sách; brand mới vào bộ lọc (Q-V5) |
| 7 | LC-07 | Import CSV | marine | Active | Keep | Guest | New | Active | Hiện ngay trên storefront; brand mới vào bộ lọc (Q-V5) |
| 8 | LC-08 | Form | auto | Archived | Edit name | Admin | Existing | Archived | Admin thấy (Archived); Created by = owner |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |

→ Chạy script để lấy đủ 21 bộ; cover 100% cặp giữa 2 dimensions bất kỳ.

**Business-Critical (smoke trước release, chọn tay theo risk):**

| Combo | Lý do |
|-------|-------|
| Form + Active + Keep + Guest | Vendor tự xuất bản → hiện ngay (BR cốt lõi) |
| Form + Draft + Keep + Guest | Draft không được lộ ra website |
| Import + Active + Keep + Guest | Import luôn Active |
| Form + Active + Keep + Other vendor | Phạm vi dữ liệu — 404 |
| Import + Active + Keep + Other vendor (SKU của V2 trong file) | "sku: this product belongs to another vendor" |
| Form + Active + Change status (→ Draft) + Guest | Ẩn ngay khỏi website |
| Form + Active + Delete + Guest | Xoá → 404, dọn ảnh |
| Import + Brand mới + Guest | Q-V5 — ghi OBSERVED |

---

## 💡 Mẹo Tối Ưu

1. **Bắt đầu với Pairwise LC** — 21 bộ đủ cho regression; Business-Critical 8 bộ cho smoke.
2. **Không tính pairwise tay** — luôn chạy script; đổi dimension → sửa `DIMENSIONS` và `is_valid()` trong script.
3. **Review Data Flow ở Bước 1** — sai `createdBy` / constraint thì cả ma trận sai.
4. **Mode PIPELINE** chỉ khi đã pre-flight `/v1` và có đủ tài khoản 4 vai.
5. **Chia batch** nếu ma trận > 30 bộ (VD luồng IM khi thêm chiều).
6. **Dọn dữ liệu** — mọi sản phẩm sinh từ ma trận mang tiền tố `AUTO-LC`, xoá sau khi chạy.

---

## ⚠️ Phân Biệt: Khi Nào KHÔNG Cần Quy Trình Này?

| Tình huống | Dùng gì? |
|------------|----------|
| Test 1 module / 1 form (VD validation Stock count) | `/gen-testcase` hoặc `plans/manual/` |
| Nhiều module nhưng **độc lập** (DASH, REV, ORD giả lập) | `/gen-testcase` từng module |
| Nhiều module **nối tiếp**, kết quả phụ thuộc **bộ kết hợp** (LC, RL, IM, IMG) | ✅ **Quy trình này** |
| Chỉ cần test data cho 1 form | `.agent/rules/test-data.md` |
