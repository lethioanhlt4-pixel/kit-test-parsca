# AI-DRIVEN CROSS-MODULE TESTING FRAMEWORK — PARSCA Vendor

**Mục tiêu:**
Kiểm thử các luồng PARSCA đi qua **nhiều module nối tiếp**, trong đó kết quả cuối (hiển thị cho ai, ở đâu, trạng thái gì) phụ thuộc **bộ kết hợp điều kiện đa chiều** (Combinatorial Testing).

> Mirror từ `antigravity-testing-kit-main/plans/cross-module/`, điền sẵn luồng PARSCA, Dimension Catalog, constraints và **script pairwise chạy được** (`scripts/pairwise_product_lifecycle.py`).

## 📌 Bài Toán Giải Quyết

Với role Vendor, một sản phẩm đi qua chuỗi module: **tạo (PFORM / CSV) → phạm vi dữ liệu (SCOPE) → đổi trạng thái / xoá (PSTAT) → hiển thị website (WEB)**. Mỗi bước có nhiều lựa chọn; bộ kết hợp quyết định kết quả cuối.

**Luồng cross-module của PARSCA Vendor:**

| Luồng | Modules | Các chiều kết hợp (dimensions) |
|-------|---------|-------------------------------|
| **LC — Vòng đời sản phẩm** ⭐ | PFORM / CSV → SCOPE → PSTAT → WEB | Kênh tạo × Department × Status ban đầu × Hành động sau tạo × Người kiểm × Brand |
| **RL — Thay đổi role** | ROLE → LOGIN / SESS → SCOPE → API | Role trước × Role sau × Trạng thái phiên (đang mở / mới) × Màn đang đứng × Kênh kiểm (UI / API) |
| **IM — Import + danh mục** | CSV → SET → WEB (bộ lọc) | Kết quả dry run × SKU (mới / của mình / của người khác / trùng file) × Brand (có sẵn / mới) × Xe (có / không) × Import lại |
| **IMG — Ảnh qua các kênh** | IMG → PFORM / CSV → PSTAT | Kênh (upload / link https CSV) × Loại / dung lượng × Số ảnh × Xoá sản phẩm (ảnh riêng / dùng chung) |

**LC:** 2 × 4 × 3 × 4 × 4 × 2 = 768 tổ hợp → sau constraints còn **320** → Pairwise còn **21 bộ** (đã chạy script thật).

---

## 🚀 Quy Trình 2 Giai Đoạn

### Giai đoạn 1: Phân Tích & Sinh Ma Trận

| Bước | Tên | Mô tả | Chờ User? |
|------|-----|-------|-----------|
| **1** | Multi-Module Recon | Đọc doc 06, 09, 10, 12, 20 (DOCUMENT) hoặc inspect DOM (BROWSER) — thu thập fields + values | ❌ |
| **2** | Data Flow Mapping | Module nào output gì → input module nào (`createdBy`, `status`, `brand`, `slug`) | ✅ **Checkpoint** |
| **3** | Dimension Extraction | Liệt kê chiều + values + constraints (C1 Import ⇒ Active, C2 Form ⇒ brand có sẵn) | ❌ |
| **4** | Combinatorial Matrix | **Chạy script** `allpairspy` — KHÔNG tính tay | ❌ |
| **5** | Expected Output Mapping | Map kết quả cho từng bộ (vendor portal / admin / storefront / API status) | ✅ **Checkpoint** |

**Output chính:** Bảng ma trận `LC-NN` — sẵn sàng Excel / Jira, làm input cho `/gen-testcase`.

### Giai đoạn 2: Sinh Test Data

| Mode | Khi nào dùng | Output |
|------|-------------|--------|
| **GENERATE** | Sinh data offline (JSON / CSV) theo `test-data.md` | Payload `POST /products`, file CSV `AUTO-LC<NN>-*` |
| **PIPELINE** | Tạo data thật qua API/UI trên môi trường test | ID + SKU thật, screenshot, kết quả từng bộ |

---

## 3 Chiến Lược Ma Trận

| Chiến lược | Mô tả | Khi nào dùng | Ví dụ LC |
|-----------|-------|-------------|----------|
| **Pairwise** (Mặc định) | Cover 100% cặp giữa 2 dimensions | Regression định kỳ | 320 → 21 bộ |
| **Business-Critical** | Chọn theo risk | Smoke trước release | ~8 bộ (xem QUICK_START) |
| **Full Cartesian** | Mọi tổ hợp hợp lệ | Không khuyến nghị cho LC | 320 bộ |

> 💡 Pairwise giảm ~93% số bộ của LC mà vẫn phủ mọi cặp giá trị.

---

## 🔗 Luồng End-to-End Hoàn Chỉnh

```
┌─────────────────────────────────────────────────────────────────┐
│              CROSS-MODULE TESTING FLOW — PARSCA                  │
├─────────────────────────────────────────────────────────────────┤
│  📋 Bước 0: Đọc doc module (06, 09, 10, 12, 20, 05)             │
│                          ↓                                       │
│  📊 Bước 1: Phân tích cross-module & sinh ma trận                │
│      Prompt: QUICK_START.md (Luồng 2) + scripts/pairwise_*.py    │
│      Output: Data Flow + Dimension Catalog + Ma trận LC-NN       │
│                          ↓                                       │
│  🗃️ Bước 2: Sinh test data cho ma trận (GENERATE / PIPELINE)    │
│                          ↓                                       │
│  📝 Bước 3: Sinh test cases chi tiết                             │
│      /gen-testcase  hoặc  plans/manual/ (Bước 5–6)               │
│      TC ID: PARSCA_WEB_TC_NNN / PARSCA_SCOPE_TC_NNN ...          │
│                          ↓                                       │
│  🤖 Bước 4: Sinh automation (data-driven theo LC-NN)             │
│      /gen-script  hoặc  plans/automation/                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Cấu trúc thư mục

```
plans/cross-module/
├── README.md                              ← Giới thiệu + tổng quan (file này)
├── QUICK_START.md                         ← Prompt mẫu + luồng chạy + ma trận LC thực tế
└── scripts/
    └── pairwise_product_lifecycle.py      ← Sinh ma trận Pairwise LC (allpairspy)
```

**Liên quan trong kit:**

```
.agent/skills/generate-testcase/            ← Sinh TC từ ma trận
.agent/skills/generate-playwright-script/   ← Spec data-driven
.agent/rules/test-data.md                   ← Format SKU / file cho từng combo
```

> Kit gốc có workflow `/generate_cross_module_test_plan` và `/generate_combinatorial_test_data`. Muốn dùng 2 lệnh này, mở `antigravity-testing-kit-main/` làm workspace root và đính kèm doc PARSCA; trong `kit-test-parsca/` dùng prompt ở QUICK_START.

---

## 📋 Hướng dẫn nhanh

Xem file [`QUICK_START.md`](QUICK_START.md) trong thư mục này để bắt đầu nhanh.
