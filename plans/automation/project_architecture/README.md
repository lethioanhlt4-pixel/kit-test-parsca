# Kiến Trúc Project Automation — PARSCA Vendor (Playwright + TypeScript)

**Workflow:** `/gen-script` (+ `/review-script`)
**Skill:** `generate-playwright-script` · **Rules:** `core.md`, `selectors.md`, `test-data.md`

---

## Mục tiêu

Dựng **framework gốc** `playwright-parsca/` cho role Vendor PARSCA thay vì viết test đơn lẻ: đăng nhập 4 vai một lần (storageState), API client cấu hình được prefix `/v1`, data factory `AUTO-*`, POM theo màn vendor, báo cáo HTML + JUnit cho CI.

## Cách sử dụng

Cung cấp kiến trúc này cho AI **ở Bước 0/1** để AI biết nơi đặt file.
- **Project mới:** AI scaffold theo cây thư mục bên dưới (chỉ tạo Page Object khi đã recon DOM màn tương ứng).
- **Project có sẵn:** Mô tả cấu trúc hiện tại; AI tuân theo, chỉ bổ sung phần thiếu.

> Kit gốc hỗ trợ 9 stack (Playwright TS/Python, Selenium, Appium, REST Assured…). PARSCA **chốt 1 stack: Playwright + TypeScript** cho cả UI và API để dùng chung fixtures, storageState và data factory.

---

## Supported Stack

| Loại | Công cụ | Ghi chú |
|------|---------|---------|
| Web UI | Playwright Test (TypeScript) | Chromium 1920×1080, locale `en-US` |
| API | Playwright `request` / `APIRequestContext` | Dùng chung `ApiClient` + storageState |
| Report | HTML Reporter + JUnit (`test-results/junit.xml`) | JUnit dùng cho `/write-report`, Xray |
| Build | npm | Node LTS |
| CI | GitHub Actions / GitLab CI (template) | Headless, `retries: 1` trên CI |

---

## Kiến Trúc Chuẩn

```text
playwright-parsca/
├── playwright.config.ts          # projects: setup, vendor-ui, api; baseURL từ FE_URL
├── package.json                  # scripts: test, test:smoke, test:api, report
├── tsconfig.json
├── .env.example                  # CHỈ tên biến (xem dưới) — KHÔNG giá trị thật
├── .gitignore                    # .env, .auth/, test-results/, playwright-report/, test-data/generated/
├── README.md
├── fixtures/
│   ├── auth.setup.ts             # Đăng nhập vendor1, vendor2, admin, user → .auth/<role>.json
│   └── test.ts                   # test.extend: pages, apiAs(role), dataFactory, env, cleanup registry
├── pages/                        # Page Objects — locator CHỈ ở đây (đã verify trên DOM)
│   ├── BasePage.ts               # goto(path), expectToast(text), waitForApi(urlPart)
│   ├── LoginPage.ts
│   ├── storefront/
│   │   └── ProductPublicPage.ts  # Kiểm WEB: Active hiện, Draft/Archived/Xoá 404
│   └── vendor/
│       ├── VendorShell.ts        # Menu trái, avatar menu, Log out
│       ├── ProductListPage.ts    # Bảng, filter, đổi status, Delete product?
│       ├── ProductFormPage.ts    # Add Product / Update, 6 khối (a)–(f)
│       ├── ProductDetailPage.ts
│       ├── ImportCsvDialog.ts    # Template, Check file, Import N row(s)
│       ├── ProfilePage.ts        # Avatar upload
│       └── simulated/            # Màn @GiaLap: Dashboard, Orders, OrderDetail, Reviews, Payouts, Settings
├── api/
│   ├── ApiClient.ts              # baseURL + API_PREFIX, unwrap {data, meta} khi bật
│   ├── AuthApi.ts                # login, me, refresh, logout
│   ├── ProductsApi.ts            # create, get, patch, delete, list admin/all, import (dryRun)
│   └── UsersApi.ts               # PATCH /users/:id/role (chỉ admin, dùng ROLE_TEST)
├── utils/
│   ├── env.ts                    # Đọc + validate biến bắt buộc, fail-fast nếu thiếu
│   ├── dataFactory.ts            # sku(), slugName(), productPayload(), email() theo test-data.md
│   └── files.ts                  # Sinh file lớn (ảnh 10/11 MB, CSV 50.001 dòng) vào test-data/generated/
├── test-data/
│   ├── images/                   # img_ok_200kb.png, img_ok.jpg/.webp/.gif, img_vector.svg, fake_image_text.png...
│   ├── csv/                      # csv_valid_5_rows.csv, thiếu cột, SKU lặp, BOM... (placeholder {{V2_PRODUCT_SKU}})
│   └── generated/                # gitignore — file lớn sinh khi chạy
├── tests/
│   ├── api/
│   │   ├── perm.matrix.spec.ts           # API_PERM — 4 vai × endpoint (Doc 05)
│   │   └── scope.product-access.spec.ts  # API_SCOPE — V1 vs V2/Admin → 404
│   └── vendor/
│       ├── login.guard.spec.ts
│       ├── scope.product-access.spec.ts
│       ├── pform.create-product.spec.ts
│       ├── pform.validation.spec.ts
│       ├── img.upload.spec.ts
│       ├── pstat.status-delete.spec.ts
│       ├── csv.import.spec.ts
│       ├── web.sync.spec.ts
│       └── simulated.screens.spec.ts     # @GiaLap
└── .github/
    └── workflows/
        └── playwright.yml        # CI template (secrets → env)
```

### `.env.example` (chỉ tên biến)

```dotenv
FE_URL=
API_URL=
API_PREFIX=            # "/v1" hoặc để trống — CHỐT với Dev (Doc 01)
API_WRAPPED=           # "true" nếu response dạng {data, meta}
VENDOR1_EMAIL=
VENDOR1_PASSWORD=
VENDOR2_EMAIL=
VENDOR2_PASSWORD=
ADMIN_EMAIL=
ADMIN_PASSWORD=
USER_EMAIL=
USER_PASSWORD=
ROLE_TEST_EMAIL=
ROLE_TEST_PASSWORD=
ROLE_TEST_NEW_PASSWORD=
V2_PRODUCT_ID=
V2_PRODUCT_SKU=
V2_PRODUCT_SLUG=
ADMIN_PRODUCT_ID=
ADMIN_PRODUCT_SKU=
```

### `api/ApiClient.ts` — prefix & unwrap cấu hình (không phụ thuộc DOM)

```ts
import { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../utils/env';

export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  private url(path: string): string {
    return `${env.API_URL}${env.API_PREFIX ?? ''}${path}`;
  }

  get(path: string): Promise<APIResponse> {
    return this.request.get(this.url(path));
  }

  post(path: string, data?: unknown): Promise<APIResponse> {
    return this.request.post(this.url(path), { data });
  }

  patch(path: string, data?: unknown): Promise<APIResponse> {
    return this.request.patch(this.url(path), { data });
  }

  delete(path: string): Promise<APIResponse> {
    return this.request.delete(this.url(path));
  }

  async body<T>(res: APIResponse): Promise<T> {
    const json = await res.json();
    return (env.API_WRAPPED ? json.data : json) as T;
  }
}
```

### `fixtures/auth.setup.ts` — storageState 4 vai

- Ưu tiên đăng nhập qua **API** (`POST /auth/login`) rồi lưu `request.storageState({ path: '.auth/<role>.json' })` — nhanh, không phụ thuộc locator.
- Nếu cookie phiên gắn domain API khác domain FE → xác nhận với Dev; fallback đăng nhập qua UI **sau khi** đã recon `LoginPage`.
- Không đăng nhập lặp lại quá 5 lần/phút cho cùng tài khoản (rate limit 429 — Doc 03).
- `ROLE_TEST` **không** tạo storageState dùng chung (role bị thay đổi trong test).

---

## Component Checklist (Bắt Buộc)

| # | Component | Bắt buộc | PARSCA cụ thể |
|---|-----------|----------|---------------|
| 1 | **Project Structure** | ✅ | `pages/`, `api/`, `fixtures/`, `utils/`, `tests/{api,vendor}` |
| 2 | **Config Management** | ✅ | `.env` + `utils/env.ts` validate; `API_PREFIX`, `API_WRAPPED` |
| 3 | **Browser Management** | ✅ | `playwright.config.ts` projects + storageState 4 vai |
| 4 | **Base Classes** | ✅ | `BasePage`, `ApiClient` |
| 5 | **Page Object Model** | ✅ | Mỗi màn vendor 1 class; dialog Import CSV tách riêng |
| 6 | **Test Data Management** | ✅ | `dataFactory` (`AUTO-*`), file test, cleanup registry `afterEach` |
| 7 | **Utilities** | ✅ | `files.ts` sinh file lớn; helper `waitForApi` |
| 8 | **Reporting** | ✅ | HTML + JUnit; trace/screenshot `retain-on-failure` |
| 9 | **CI/CD Pipeline** | 🟡 Khuyến khích | Secrets → env; chạy `--grep @Smoke` mỗi PR, full nightly |

---

## Design Principles

1. **DRY** — Đăng nhập 1 lần / vai (storageState); setup dữ liệu qua `ProductsApi`.
2. **Single Responsibility** — Page chỉ thao tác UI; spec chỉ chứa Arrange → Act → Assert.
3. **Open/Closed** — Thêm màn mới = thêm Page + spec, không sửa core.
4. **Configuration over Code** — URL, prefix, tài khoản, ID đối chứng đều từ `.env`.
5. **Fail Fast, Log Rich** — `env.ts` fail ngay khi thiếu biến; assertion có message; trace khi fail.
6. **Traceable** — Title test bắt đầu bằng TC ID (`PARSCA_SCOPE_TC_003 — ...`); dữ liệu mang tiền tố `AUTO-<MOD>`.

---

## Anti-Patterns (CẤM)

| ❌ Anti-Pattern | ✅ Đúng cách |
|---|---|
| Hardcode URL / credentials / ID sản phẩm | `.env` + `utils/env.ts` |
| Hardcode prefix `/v1` trong từng request | `ApiClient` + `API_PREFIX` |
| Locator inline trong spec | Khai báo trong Page class |
| `page.waitForTimeout()` | `expect().toBeVisible()`, `waitForResponse()` |
| Dùng V1 để test hạ role | `ROLE_TEST_*` |
| Xoá dữ liệu không có tiền tố `AUTO-` | Chỉ teardown dữ liệu do test tạo |
| Test "lưu dữ liệu" trên màn giả lập | Assert hiển thị + không request cấm |
| `test` PASS cho TC `@CodeHienTai` chưa có câu trả lời PO | `test.fixme()` + annotation Q-Vx |
| `console.log()` token / cookie | Không log thông tin nhạy cảm |
| Đoán locator không inspect DOM | Recon bằng browser MCP ở Bước 2 |

---

## Tham chiếu

- **Skill:** [`generate-playwright-script/SKILL.md`](../../../.agent/skills/generate-playwright-script/SKILL.md)
- **Rules:** [`core.md`](../../../.agent/rules/core.md), [`selectors.md`](../../../.agent/rules/selectors.md), [`test-data.md`](../../../.agent/rules/test-data.md)
- **Workflow:** `/gen-script`, `/review-script`
- **Doc nền:** `docs/parsca-vendor-test-docs/01-canh-bao-moi-truong.md`, `05-phan-quyen-api.md`
