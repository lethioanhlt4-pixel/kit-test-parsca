# AI-DRIVEN AUTOMATION TESTING FRAMEWORK — PARSCA Vendor

**Mục tiêu:**
Dùng AI để dựng project **Playwright + TypeScript** cho role Vendor PARSCA, thiết kế POM và sinh spec chất lượng cao từ TC `PARSCA_<MOD>_TC_NNN` / `API_<GROUP>_TC_NNN` — dễ bảo trì, CI/CD friendly.

> Mirror từ `antigravity-testing-kit-main/plans/automation/`, cố định stack Playwright TS và điền sẵn bối cảnh PARSCA (4 vai, storageState, prefix `/v1`, dữ liệu `AUTO-*`).

## 📌 Nguyên Tắc Cốt Lõi

1. **Pre-flight trước tiên:** Xác nhận với Dev prefix `/v1` + format `{data, meta}` (Doc 01), có đủ tài khoản V1, V2, Admin, User, ROLE_TEST và dữ liệu đối chứng (`V2_PRODUCT_ID`…). Thiếu → **dừng**.
2. **AI DOM Recon First:** AI dùng browser MCP mở `{FE_URL}` thật (1920×1080), inspect DOM. TUYỆT ĐỐI không đoán locator.
3. **POM Architecture:** Locator chỉ nằm trong `pages/`; spec không có `page.locator(...)` inline.
4. **Smart Waits & Stability:** Không `waitForTimeout`; dùng `expect().toBeVisible()`, `toHaveURL()`, `waitForResponse()`.
5. **Deterministic Data:** SKU `AUTO-<MOD>-<timestamp>`, email `auto.<mod>.<tc>.<ts>@auto.test`; setup qua API, teardown xoá `AUTO-*` do chính vendor tạo.
6. **Self-fix Loop:** Chạy headed → fail → đọc log/trace → sửa → chạy lại đến khi PASS **2 lần liên tiếp**, sau đó mới headless.
7. **Không PASS giả:** TC `@CodeHienTai` chưa có câu trả lời PO → `test.fixme()` + annotation Q-Vx.

---

## 🚀 Quy Trình 6 Bước + Bước 0 (Setup)

| Bước | Tên | Mục đích | Skill / Rule |
|------|-----|----------|--------------|
| **0** | Project Architecture | Scaffold `playwright-parsca/` (fixtures 4 vai, ApiClient `/v1`) | `generate-playwright-script` |
| **1** | Context & Role-play | Nạp vai trò + bối cảnh PARSCA + pre-flight | `rules/core.md` |
| **2** | Analysis & UI Recon | AI mở browser, thu thập locators theo TC | `rules/selectors.md` |
| **3** | POM Design | Thiết kế `pages/vendor/*`, `api/*` | `generate-playwright-script` |
| **4** | Test Data Strategy | `utils/dataFactory.ts` + file test (ảnh, CSV) | `rules/test-data.md` |
| **5** | Script Generation | Sinh spec + chạy + tự fix đến PASS 2 lần | `generate-playwright-script` |
| **6** | Review & Refactoring | Clean code + tag + CI | `/review-script` |

*(Mỗi bước tương ứng 1 thư mục con, gồm `README.md` + `prompt.txt`)*

---

## 🎯 Chiến Lược Thực Thi

### Cách 1: Tuần Tự (Manual Control)

Dùng từng file `prompt.txt` (01 → 06):
- **Phù hợp khi:** module 🔴 (SCOPE, CSV, API) cần review locator / POM kỹ
- **Hoặc khi:** lần đầu dựng project, chưa có Page Object nào

### Cách 2: One-Click Auto Workflow (Đề xuất)

Gọi `/gen-script` (Antigravity, workspace root = `kit-test-parsca/`) hoặc dán [`prompt_automation.txt`](prompt_automation.txt):
- Agent tự: Pre-flight → Đọc TC → Mở Browser → Lấy Locator → Sinh POM → Sinh Spec → Chạy → Sửa → PASS 2 lần → `/review-script`
- **Ưu điểm:** Toàn bộ tự động sau 1 lệnh

---

## 🧭 Thứ Tự Tự Động Hoá Đề Xuất

| Đợt | Phạm vi | Lý do |
|-----|---------|-------|
| 1 | `tests/api/perm.matrix.spec.ts` (API_PERM), `auth.setup.ts` | Không phụ thuộc DOM; phát hiện sớm lệch `/v1` |
| 2 | SCOPE (UI + API), LOGIN guard | 🔴 Security, nhiều TC `Automatable = Yes` |
| 3 | PFORM, IMG, PSTAT → WEB | Vòng đời sản phẩm, cần recon form |
| 4 | CSV (dry run, import, file lỗi) | Cần bộ file test; file lớn sinh khi chạy |
| 5 | Màn `@GiaLap` (DASH, ORD, REV, PAY) | Chỉ assert hiển thị + không request cấm |

---

## 📋 Rules tham chiếu

- [`.agent/rules/core.md`](../../.agent/rules/core.md) — vai trò, nhãn doc, business rules, an toàn
- [`.agent/rules/selectors.md`](../../.agent/rules/selectors.md) — priority locator Playwright, anti-patterns
- [`.agent/rules/test-data.md`](../../.agent/rules/test-data.md) — tài khoản, SKU, file test, vòng đời dữ liệu
- [`.agent/skills/generate-playwright-script/SKILL.md`](../../.agent/skills/generate-playwright-script/SKILL.md) — cấu trúc project, template, mapping tag

## 📁 Hướng dẫn nhanh

Xem file [`QUICK_START.md`](QUICK_START.md) trong thư mục này để bắt đầu nhanh.
