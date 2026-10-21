# PVEN-1 — Tổng quan

> Tổng số issues: 4 | Ngày lấy: 2026-10-20T17:30:00.000+0700

> ⚠️ **Dữ liệu mẫu, không phải Jira thật.** Key `PVEN-*` là key giả, dựng lại từ `docs/parsca-vendor-test-docs/` (doc 06, 07–12) và `practices/requirements/parsca-vendor/02–04`. Dùng làm đầu vào cho `/gen-testcase`. Khi có Jira thật, thay bằng kết quả lấy từ Jira (workflow `/fetch_jira_requirements` của kit gốc).

**EPIC:** Quản lý sản phẩm vendor — vendor tự tạo, sửa, import, đổi trạng thái và xoá sản phẩm **của chính mình**; sản phẩm Active lên website ngay, không qua duyệt.

| # | Key | Type | Status | Summary | Attachments |
|---|-----|------|--------|---------|-------------|
| 1 | [PVEN-2](./PVEN-2/PVEN-2_requirement.md) | Story | To Do | Thêm / sửa sản phẩm và upload ảnh | 0 |
| 2 | [PVEN-3](./PVEN-3/PVEN-3_requirement.md) | Story | To Do | Import sản phẩm bằng CSV | 0 |
| 3 | [PVEN-4](./PVEN-4/PVEN-4_requirement.md) | Story | To Do | Danh sách, đổi trạng thái và xoá sản phẩm | 0 |
| 4 | [PVEN-5](./PVEN-5/PVEN-5_requirement.md) | Story | To Do | Phạm vi dữ liệu và phân quyền API của vendor | 0 |

## Liên kết test

| Story | Testcase manual | Testcase API |
|-------|-----------------|--------------|
| PVEN-2 | `practices/testcases/vendor/TC_PARSCA_VENDOR_04_PRODUCT_FORM_IMAGE.md` | `API_PROD_*`, `API_FILE_*` |
| PVEN-3 | `practices/testcases/vendor/TC_PARSCA_VENDOR_05_IMPORT_CSV.md` | – (TC CSV loại API nằm trong file 05) |
| PVEN-4 | `practices/testcases/vendor/TC_PARSCA_VENDOR_03_PRODUCT_LIST_DETAIL_STATUS.md` | `API_PROD_*` |
| PVEN-5 | `practices/testcases/vendor/TC_PARSCA_VENDOR_02_DATA_SCOPE.md` | `API_PERM_*`, `API_SCOPE_*` |
