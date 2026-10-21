# 📊 MD to XLSX Converter — PARSCA Vendor

Convert file Markdown Test Cases của **PARSCA (role Vendor)** sang Excel (`.xlsx`) có format đẹp, sẵn sàng chia sẻ.

> Bản PARSCA của `antigravity-testing-kit-main/scripts/convert_excel/`. Khác bản gốc: hiểu cả bảng **manual 12 cột** và bảng **API 6 cột**, không cắt mất cột Automatable / Auto Type / Tags.

## Yêu cầu

- **Node.js** ≥ 16

## Cài đặt

```bash
cd scripts/convert_excel
npm install
```

## Cách dùng

```bash
# Từ thư mục gốc kit-test-parsca/
node scripts/convert_excel/md_to_xlsx.js <input.md | thư_mục> [output.xlsx] [--core] [--summary]
```

| Option | Mô tả |
|--------|-------|
| `--core` | Bảng manual chỉ xuất **9 cột chuẩn** (bỏ Automatable / Auto Type / Tags) — giống script gốc |
| `--summary` | Thêm sheet **Summary**: số TC theo Module × Priority, Risk Level, Automatable / Auto Type, Tags |
| `--help` | Hiển thị hướng dẫn |

### Ví dụ

```bash
# Output tự động cùng thư mục, cùng tên (đuôi .xlsx)
node scripts/convert_excel/md_to_xlsx.js practices/testcases/vendor/TC_PARSCA_VENDOR_05_IMPORT_CSV.md

# File API (6 cột) → sheet "API Test Cases"
node scripts/convert_excel/md_to_xlsx.js practices/testcases/api/API_TC_PARSCA_VENDOR.md

# Convert cả thư mục (8 file manual) + sheet Summary
node scripts/convert_excel/md_to_xlsx.js practices/testcases/vendor --summary

# Chỉ định output path, chỉ 9 cột chuẩn
node scripts/convert_excel/md_to_xlsx.js practices/testcases/vendor/TC_PARSCA_VENDOR_01_AUTH_ROLE_SESSION.md output/tc01.xlsx --core
```

Hoặc dùng npm script (chạy trong `scripts/convert_excel/`):

```bash
npm run convert:vendor   # practices/testcases/vendor/*.md --summary
npm run convert:api      # practices/testcases/api/API_TC_PARSCA_VENDOR.md
```

## Đầu vào (Input)

Script tự nhận diện bảng theo dòng header có cột `TC ID`:

**Manual** — `practices/testcases/vendor/*.md` (AI-RBT Full Mode, 12 cột):

```markdown
| TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
|-------|--------|-----------|------------|---------------|------------|-----------------|----------|-----------|-------------|-----------|------|
| PARSCA_CSV_TC_004 | M10: CSV | 🔴 High | ... | ... | 1. Step 1<br>2. Step 2 | ... | Critical | ... | Yes | UI | @Smoke @Regression |
```

**API** — `practices/testcases/api/*.md` (6 cột):

```markdown
| TC ID | Scenario | Request | Expected Response | Priority | Testing Technique / Rule |
|---|---|---|---|---|---|
| `API_PERM_TC_005` | ... | ... | **403** ... | P1 | Decision Table |
```

> **Lưu ý:**
> - Bảng thiếu 3 cột mở rộng (bản 9 cột cũ) vẫn convert được.
> - Bảng có `TC ID` nhưng không thuộc 2 format trên → xuất vào sheet `Other`, giữ nguyên header.
> - Khi input là **thư mục**, file `.xlsx` được ghi **đè** cạnh file `.md` cùng tên.

## Đầu ra (Output)

| Tính năng | Mô tả |
|-----------|-------|
| **Sheet theo loại bảng** | `Test Cases` (manual), `API Test Cases` (API) — trùng tên sheet với file `.xlsx` đang có trong `practices/testcases/` |
| **Column widths** | Độ rộng theo tên cột (Test Steps / Expected Result rộng hơn) |
| **Freeze panes** | Cố định dòng header khi cuộn |
| **AutoFilter** | Bộ lọc tự động trên toàn bộ header (A → cột cuối) |
| **Line breaks** | `<br>` trong cell chuyển thành xuống dòng |
| **Clean text** | Xoá emoji (🔴 🟡 🟢 ✅ ⚠️ …), backtick, `**bold**`, unescape `\|` |
| **Validate** | Cảnh báo TC ID sai chuẩn `PARSCA_<MOD>_TC_NNN` / `API_<GRP>_TC_NNN`, TC ID trùng, dòng lệch số cột (không chặn xuất file) |

## Liên quan

- Chuẩn bảng TC: `.agent/rules/core.md` (mục 5.1), `plans/manual/06_template_mapping/`
- Catalog module dùng chung: `scripts/common/parsca_catalog.js`
- Upload file Excel lên Google Sheets: `scripts/integrations/google_sheet/` (`sheet_writer.js --excel`)
