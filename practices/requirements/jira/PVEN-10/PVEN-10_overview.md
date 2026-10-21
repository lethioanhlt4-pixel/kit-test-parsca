# PVEN-10 — Tổng quan

> Tổng số issues: 3 | Ngày lấy: 2026-10-20T17:30:00.000+0700

> ⚠️ **Dữ liệu mẫu, không phải Jira thật.** Key `PVEN-*` là key giả, dựng lại từ `docs/parsca-vendor-test-docs/` (doc 02–04) và `practices/requirements/parsca-vendor/01_requirements_auth_role_session.md`. Dùng làm đầu vào cho `/gen-testcase`.

**EPIC:** Truy cập và phiên làm việc của vendor — admin cấp/thu hồi role, vendor đăng nhập vào `/vendor`, phiên JWT cookie httpOnly được duy trì và huỷ an toàn.

| # | Key | Type | Status | Summary | Attachments |
|---|-----|------|--------|---------|-------------|
| 1 | [PVEN-11](./PVEN-11/PVEN-11_requirement.md) | Story | To Do | Cấp và thu hồi role vendor | 0 |
| 2 | [PVEN-12](./PVEN-12/PVEN-12_requirement.md) | Story | To Do | Đăng nhập và điều hướng theo role | 0 |
| 3 | [PVEN-13](./PVEN-13/PVEN-13_requirement.md) | Story | To Do | Phiên làm việc và đăng xuất | 0 |

## Liên kết test

| Story | Testcase manual | Testcase API |
|-------|-----------------|--------------|
| PVEN-11 | `practices/testcases/vendor/TC_PARSCA_VENDOR_01_AUTH_ROLE_SESSION.md` (ROLE_TC_*) | `API_PERM_*` (đổi role) |
| PVEN-12 | `practices/testcases/vendor/TC_PARSCA_VENDOR_01_AUTH_ROLE_SESSION.md` (LOGIN_TC_*) | `API_AUTH_*`, `API_SEC_*` |
| PVEN-13 | `practices/testcases/vendor/TC_PARSCA_VENDOR_01_AUTH_ROLE_SESSION.md` (SESS_TC_*) | `API_AUTH_*` |
