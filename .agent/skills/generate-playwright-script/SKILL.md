---
name: generate-playwright-script
description: Sinh Playwright TypeScript spec (POM + fixtures + API helpers) từ manual testcase PARSCA Vendor; locator phải inspect trên DOM thật, test data unique, smart wait, chạy PASS 2 lần liên tiếp trước khi bàn giao.
---

# Skill: Generate Playwright Script (PARSCA Vendor)

## Khi nào dùng
- Chuyển TC `PARSCA_<MOD>_TC_<NNN>` (cột `Automatable` = Yes/Partial) thành spec Playwright.
- Chuyển TC API `API_<GROUP>_TC_<NNN>` thành spec dùng `request` context.

## Nạp bắt buộc
- `.agent/rules/core.md`, `.agent/rules/selectors.md`, `.agent/rules/test-data.md`

## Điều kiện tiên quyết (STOP nếu thiếu)
| Điều kiện | Nếu thiếu |
|-----------|-----------|
| `{FE_URL}`, `{API_URL}` truy cập được | Dừng, hỏi User |
| Tài khoản trong `.env` (V1, V2, Admin, User) | Dừng, hỏi User |
| Đã xác nhận `/v1` + `{data, meta}` (Doc 01) | Dừng — mọi API helper phụ thuộc điểm này |
| Đã inspect DOM màn hình liên quan | Inspect trước (MCP), **không** sinh code |

---

## Cấu Trúc Project

```
playwright-parsca/
├── playwright.config.ts
├── .env.example                 # Tên biến, KHÔNG giá trị thật
├── fixtures/
│   ├── auth.setup.ts            # Đăng nhập 4 vai → storageState
│   └── test.ts                  # test.extend: pages, api clients, dataFactory
├── pages/
│   ├── LoginPage.ts
│   └── vendor/
│       ├── ProductListPage.ts
│       ├── ProductFormPage.ts
│       ├── ProductDetailPage.ts
│       └── ImportCsvDialog.ts
├── api/
│   ├── ApiClient.ts             # baseURL, prefix /v1 (config), unwrap {data, meta}
│   └── ProductsApi.ts
├── utils/
│   ├── dataFactory.ts           # sku(), productName(), email() theo test-data.md
│   └── env.ts                   # Đọc & validate biến môi trường
├── test-data/                   # CSV, ảnh nhỏ; generated/ (gitignore) cho file lớn
└── tests/
    ├── api/perm.matrix.spec.ts
    ├── api/scope.product-access.spec.ts
    └── vendor/
        ├── scope.product-access.spec.ts
        ├── pform.create-product.spec.ts
        └── csv.import.spec.ts
```

---

## Quy Trình

1. **Chọn TC**: lọc `Automatable` = Yes; nhóm theo module → 1 spec / module-feature.
2. **Recon DOM**: `navigate → resize(1920×1080) → wait_for → snapshot`; ghi locator đã verify vào Page Object (theo `selectors.md`).
3. **Sinh code** theo template bên dưới; dữ liệu qua `dataFactory`, setup/teardown qua API.
4. **Chạy headed** từng spec → đọc lỗi → sửa → chạy lại đến khi PASS **2 lần liên tiếp**; sau đó mới chạy headless.
5. **Cleanup**: xoá `console.log`, code comment-out, locator không dùng, import thừa.
6. **Báo cáo**: bảng TC → spec → kết quả; TC `@CodeHienTai` dùng `test.fail()`/annotation (xem §Mapping).

---

## Template

### playwright.config.ts (rút gọn)
```ts
import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests',
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]],
  use: {
    baseURL: process.env.FE_URL,
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    { name: 'vendor-ui', dependencies: ['setup'], use: { ...devices['Desktop Chrome'], storageState: '.auth/vendor1.json' } },
    { name: 'api', testMatch: /tests\/api\/.*\.spec\.ts/ },
  ],
});
```

### Spec — mapping TC ↔ test
```ts
import { test, expect } from '../../fixtures/test';

test.describe('M4: SCOPE — Product access by createdBy', () => {
  test('PARSCA_SCOPE_TC_003 — V1 opens V2 product detail by URL', {
    tag: ['@Smoke', '@DataScope', '@Security'],
  }, async ({ page, productDetailPage, env }) => {
    const responsePromise = page.waitForResponse(r => r.url().includes(`/products/admin/${env.V2_PRODUCT_ID}`));

    await productDetailPage.goto(env.V2_PRODUCT_ID);

    const response = await responsePromise;
    expect(response.status(), 'Other vendor product must return 404, not 403').toBe(404);
    await expect(productDetailPage.notFoundMessage, 'UI must show permission message').toBeVisible();
  });
});
```

### Spec API — ma trận 4 vai (data-driven)
```ts
const matrix = [
  { role: 'anonymous', expected: 401 },
  { role: 'user', expected: 403 },
  { role: 'vendor1', expected: 200 },
  { role: 'admin', expected: 200 },
] as const;

for (const row of matrix) {
  test(`API_PERM_TC_001 — GET /products/admin/all as ${row.role}`, async ({ apiAs }) => {
    const api = await apiAs(row.role);
    const res = await api.get('/products/admin/all');
    expect(res.status(), `Role ${row.role}`).toBe(row.expected);
  });
}
```

### dataFactory
```ts
const stamp = () => Date.now().toString();
export const dataFactory = {
  sku: (mod: string) => `AUTO-${mod.toUpperCase()}-${stamp()}`,
  productName: (mod: string, tc: string) => `Auto ${mod} ${tc} ${stamp()}`,
  email: (mod: string, tc: string) => `auto.${mod}.${tc}.${stamp()}@auto.test`.toLowerCase(),
};
```

---

## Mapping Nhãn TC → Playwright

| Nhãn TC | Cách viết |
|---------|-----------|
| `@Smoke`, `@Regression`, `@Security`… | `tag: ['@Smoke']` → chạy `npx playwright test --grep @Smoke` |
| `@CodeHienTai` | Assert theo **hành vi mong muốn của nghiệp vụ** + `test.info().annotations.push({ type: 'question', description: 'Q-V4' })`; nếu PO chưa trả lời → `test.fixme()` kèm lý do (không để PASS giả) |
| `@SuyLuan` | Chạy bình thường; kết quả thực tế cập nhật lại TC |
| `@GiaLap` | Chỉ assert hiển thị + **không có request API cấm** (`page.on('request')`) |
| `@NeedDevSupport` | `test.skip(!process.env.DEV_SHORT_TTL, 'Needs Dev: short token TTL')` |
| Partial | Tự động phần ổn định; bước thủ công ghi trong annotation |

---

## Quy Tắc Code

- Locator **chỉ** trong Page Object; spec không có `page.locator(...)` inline.
- Không `waitForTimeout`; dùng `expect().toBeVisible()`, `toHaveURL()`, `waitForResponse()`.
- Mọi `expect` có message rõ (tham số thứ 2 hoặc `expect(x, 'msg')`).
- Setup dữ liệu bằng API, teardown xoá sản phẩm `AUTO-*` đã tạo (`afterEach`).
- Không phụ thuộc thứ tự test; không share state giữa test (trừ storageState read-only).
- Không log credentials / cookie; trace/screenshot không commit.

## Checklist Bàn Giao
- [ ] Mỗi test có TC ID ở đầu title
- [ ] Locator đã verify trên DOM (ghi ngày verify trong PR description)
- [ ] PASS 2 lần liên tiếp headed, sau đó headless
- [ ] Không hard sleep, không debug log, không code comment-out, không import thừa
- [ ] Không credentials trong code / config
- [ ] Báo cáo: số PASS / FAIL / SKIP, TC skip kèm lý do
