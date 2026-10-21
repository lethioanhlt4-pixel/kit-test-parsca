---
description: Sinh Playwright TypeScript script từ testcase PARSCA (UI hoặc API) — inspect DOM thật, POM, smart wait, chạy PASS 2 lần liên tiếp.
skills:
  - generate-playwright-script
---

# /gen-script — Sinh Playwright Script Từ Testcase

> **BẮT BUỘC nạp trước:**
> - Skill: `.agent/skills/generate-playwright-script/SKILL.md`
> - Rule: `.agent/rules/core.md`, `.agent/rules/selectors.md`, `.agent/rules/test-data.md`

---

## Input cần từ User

| Input | Bắt buộc | Ví dụ |
|-------|----------|-------|
| Testcase | ✅ | File `practices/testcases/vendor/TC_PARSCA_VENDOR_02_DATA_SCOPE.md` + danh sách TC ID, hoặc `@Smoke` |
| `{FE_URL}` / `{API_URL}` | ✅ | Từ `.env` (không dán mật khẩu vào chat) |
| Project Playwright | ❌ | Đường dẫn project có sẵn; nếu chưa có → scaffold theo cấu trúc trong skill |
| Loại | ❌ | `ui` / `api` / `e2e` (mặc định theo cột `Auto Type`) |

---

## Các Bước

### Bước 1 — Pre-flight (STOP nếu fail)
1. `GET {API_URL}/products` (không token) → 200? Có `/v1`? Có `{data, meta}`?
2. Đăng nhập V1 trên browser → vào `/vendor`?
3. `.env` có đủ biến theo `rules/test-data.md` §1?

### Bước 2 — Lọc & nhóm TC
- Chỉ TC `Automatable` = Yes / Partial; nhóm theo module-feature → danh sách spec dự kiến.
- Hiển thị bảng `TC ID → spec file → loại` cho User.

### Bước 3 — Recon DOM (UI)
```
navigate → resize(1920×1080) → wait_for → snapshot → chọn locator → verify unique → reload verify
```
- Ghi locator vào Page Object; cập nhật cột "Verified" trong `rules/selectors.md` §4 nếu dùng text anchor.

### Bước 4 — Sinh code
- Page Object, fixtures, API helper, dataFactory, spec theo template của skill.
- Mỗi `test()` bắt đầu bằng TC ID; tag theo cột Tags; mapping `@CodeHienTai` / `@GiaLap` / `@NeedDevSupport` theo skill.

### Bước 5 — Chạy & tự sửa
1. `npx playwright test <spec> --headed --project=<project>`
2. FAIL → đọc error + trace → phân loại (locator / data / timing / bug thật) → sửa test hoặc ghi bug (`/analyze-bug`).
3. Lặp đến khi **PASS 2 lần liên tiếp**; sau đó chạy headless 1 lần.

### Bước 6 — Cleanup & bàn giao
- Checklist bàn giao trong skill; xoá file debug/trace tạm ngoài `test-results/`, `playwright-report/`.
- Báo cáo: PASS / FAIL / SKIP, TC skip + lý do, bug phát hiện.

---

## Output
- Code Playwright trong project (pages/, fixtures/, api/, utils/, tests/).
- Bảng mapping TC ↔ test ↔ kết quả.
