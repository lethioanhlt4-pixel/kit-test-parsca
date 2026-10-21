# 📋 Jira & Xray Integration Scripts — PARSCA Vendor

> Bộ scripts Node.js kết nối **kit-test-parsca** với Jira REST API và Xray Test Management.
> Bản PARSCA của `antigravity-testing-kit-main/scripts/integrations/jira/`.

---

## 📁 Cấu trúc thư mục

```
kit-test-parsca/scripts/
├── common/
│   └── parsca_catalog.js        # Catalog module M1–M18, nhóm API, đường dẫn kit (dùng chung)
└── integrations/
    └── jira/                    # Self-contained Jira integration
        ├── jira_fetcher.js      # Lấy Requirements / User Stories / Issues từ Jira
        ├── xray_auth.js         # Xác thực và quản lý Token Xray Cloud
        ├── xray_importer.js     # Import kết quả test (Playwright/JUnit) lên Xray
        ├── utils.js             # Hàm utility dùng chung
        ├── .env.example         # Template biến môi trường
        ├── .env                 # Biến môi trường thực tế (KHÔNG commit)
        ├── package.json         # Dependencies (axios, dotenv)
        ├── package-lock.json    # Lock file (BẮT BUỘC commit)
        ├── node_modules/        # (auto-generated)
        └── README.md            # Tài liệu hướng dẫn (file này)
```

### Khác bản gốc

| Hạng mục | Bản gốc | Bản PARSCA |
|----------|---------|------------|
| Output mặc định | `requirements/jira/` | `practices/requirements/jira/` (cạnh Jira mẫu `PVEN-*`) |
| Requirement `.md` | Bảng thuộc tính + mô tả | Thêm dòng **Epic** + mục **Tài liệu PARSCA liên quan** (doc BA, requirements, testcase theo module) |
| Overview Epic | Danh sách issue | Thêm bảng **Liên kết test** (Story → module → file TC manual) |
| `--issue` | Ghi vào `<KEY>/<KEY>/` | Ghi thẳng vào `<KEY>/<KEY>_requirement.md` |
| Xray mapping | Chỉ Jira key trong tên test | Tên test → annotation `xray` → file mapping theo **TC ID** |
| Trạng thái | PASSED / FAILED / TODO | Thêm **OBSERVED** (`@CodeHienTai`) và **BLOCKED** theo quy ước kit |
| An toàn | In 20 ký tự đầu token | Không in token; `--dry-run` không cần credentials |

> Module được nhận diện từ mã **`AC-<MOD>-NN`** trong mô tả / AC (chính xác nhất), nếu không có thì từ labels / components / summary (VD: `csv`, `login`, `payout`).

---

## ⚡ Cài đặt nhanh

### 1. Cài dependencies

```bash
cd scripts/integrations/jira
npm install
```

### 2. Tạo file `.env`

```bash
cd scripts/integrations/jira
cp .env.example .env
```

### 3. Điền thông tin xác thực

Mở file **`scripts/integrations/jira/.env`** và điền:

```env
# Jira Cloud
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=PVEN

# Xray Cloud (nếu dùng)
XRAY_PLATFORM=cloud
XRAY_CLIENT_ID=your-client-id
XRAY_CLIENT_SECRET=your-client-secret
```

> ⚠️ `PVEN` là key **mẫu** (Jira giả trong `practices/requirements/jira/`). Đổi sang key thật khi team có Jira.

---

## 🔑 Cách lấy Credentials

### Jira API Token

> Script sử dụng xác thực **Basic Auth** (Email + API Token) cho Jira Cloud.

1. Truy cập: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **"Create API token"**
3. Đặt label (ví dụ: `parsca-qa-automation`) → Click **Create**
4. **Copy token ngay** → Dán vào `JIRA_API_TOKEN` trong file `.env`

> ⚠️ Token chỉ hiển thị **MỘT LẦN**. Nếu mất, phải tạo mới.

### Xray Cloud API Key (nếu dùng Xray)

1. Jira → Apps → Xray → Settings → **API Keys**
2. Hoặc: https://app.getxray.app → Settings → API Keys
3. Tạo API Key → Copy **Client ID** và **Client Secret** vào `.env`

### Cách lấy JIRA_BASE_URL

```
https://your-domain.atlassian.net/jira/software/projects/PVEN/boards/1
└──────────── JIRA_BASE_URL ────────────┘
```

### Cách lấy JIRA_PROJECT_KEY

```
URL:       .../projects/PVEN/boards/1  →  Project Key = PVEN
Issue Key: PVEN-3                      →  Project Key = PVEN
```

---

## 🚀 Sử dụng

> Các lệnh dưới đây chạy từ thư mục gốc **`kit-test-parsca/`**.

### jira_fetcher.js — Lấy Issues từ Jira

```bash
# Xem hướng dẫn
node scripts/integrations/jira/jira_fetcher.js --help

# Lấy 1 story → xuất Markdown requirement
node scripts/integrations/jira/jira_fetcher.js --issue PVEN-3 --format md

# Lấy cả Epic "Quản lý sản phẩm vendor" → Markdown + overview + liên kết test
node scripts/integrations/jira/jira_fetcher.js --epic PVEN-1 --format md

# Lấy Epic "Truy cập & phiên" kèm attachments
node scripts/integrations/jira/jira_fetcher.js --epic PVEN-10 --format md --attachments

# Lấy tất cả Bug của project trong .env (JIRA_PROJECT_KEY)
node scripts/integrations/jira/jira_fetcher.js --project --type Bug --max 20

# JQL tùy chỉnh: story có label csv
node scripts/integrations/jira/jira_fetcher.js --jql "project = PVEN AND labels = csv"

# Chỉ định thư mục output
node scripts/integrations/jira/jira_fetcher.js --issue PVEN-3 --format md --output ./my-output
```

**Options:**

| Option | Mô tả | Mặc định |
|--------|--------|----------|
| `--issue <KEY>` | Lấy 1 issue cụ thể | — |
| `--project [KEY]` | Lấy issues theo project (bỏ trống = `JIRA_PROJECT_KEY`) | — |
| `--jql <QUERY>` | Tìm bằng JQL query | — |
| `--epic <KEY>` | Lấy tất cả Story/Task/Bug thuộc Epic | — |
| `--type <TYPE>` | Loại issue: Story, Bug, Task, Epic | Story |
| `--max <N>` | Số kết quả tối đa | 50 |
| `--format <FMT>` | Định dạng output: `json` hoặc `md` | json |
| `--attachments` | Tải kèm file đính kèm | không tải |
| `--output <DIR>` | Thư mục lưu file | `practices/requirements/jira/` |

**Cấu trúc output** (trùng format Jira mẫu đang có):

```
practices/requirements/jira/
├── PVEN-1/                                 # Thư mục Epic
│   ├── PVEN-1_overview.md                  # Tổng quan + bảng "Liên kết test"
│   ├── PVEN-2/
│   │   └── PVEN-2_requirement.md
│   └── PVEN-3/                             # Story — self-contained
│       ├── PVEN-3_requirement.md           # Requirement + "Tài liệu PARSCA liên quan"
│       └── csv_dialog.png                  # Attachment cùng folder
└── PVEN-12/                                # --issue PVEN-12
    └── PVEN-12_requirement.md
```

> ⚠️ Lấy lại Epic/issue đã có sẽ **ghi đè** file `.md` cùng tên (VD: Jira mẫu `PVEN-*`). Dùng `--output` nếu muốn giữ bản mẫu.

> 💡 **Tip:** Trỏ `/gen-testcase` vào `PVEN-3/` → sinh TC cho 1 story. Trỏ vào `PVEN-1/` → sinh cho cả Epic.

**Output mẫu (Markdown — phần thêm của PARSCA):**

```markdown
## Tài liệu PARSCA liên quan

> Doc nền (đọc trước): `docs/parsca-vendor-test-docs/README.md`, `…/00-tong-quan.md`, `…/01-canh-bao-moi-truong.md`

| Module | Doc BA | Requirements | Testcase manual | Giả lập |
|--------|--------|--------------|-----------------|---------|
| M10: CSV — Import CSV | `docs/parsca-vendor-test-docs/12-import-csv.md` | `practices/requirements/parsca-vendor/04_requirements_import_csv.md` | `practices/testcases/vendor/TC_PARSCA_VENDOR_05_IMPORT_CSV.md` | – |
```

**Output mẫu (JSON)** — có thêm `parscaModules`:

```json
{
  "fetchedAt": "2026-10-20T10:00:00.000Z",
  "mode": "epic",
  "ticketKey": "PVEN-1",
  "total": 4,
  "issues": [
    { "key": "PVEN-3", "summary": "Import sản phẩm bằng CSV", "epic": "PVEN-1", "parscaModules": ["CSV"] }
  ]
}
```

---

### xray_auth.js — Xác thực Xray

```bash
# Lấy token mới
node scripts/integrations/jira/xray_auth.js

# Verify token đang dùng
node scripts/integrations/jira/xray_auth.js --verify
```

Token được cache tự động tại `.xray_token_cache.json` (hết hạn sau 1 giờ). Script **không** in nội dung token.

---

### xray_importer.js — Đẩy kết quả test lên Xray

```bash
# Xem hướng dẫn
node scripts/integrations/jira/xray_importer.js --help

# Chạy thử: convert + ghi payload ra file, KHÔNG gửi (không cần .env)
node scripts/integrations/jira/xray_importer.js \
  --format playwright --file ./test-results/results.json --project PVEN --dry-run

# Import Playwright JSON report, map TC ID → Xray key bằng file mapping
node scripts/integrations/jira/xray_importer.js \
  --format playwright \
  --file ./test-results/results.json \
  --mapping ./scripts/integrations/jira/xray_mapping.json

# Import JUnit XML
node scripts/integrations/jira/xray_importer.js \
  --format junit --file ./test-results/junit.xml --project PVEN

# Import Xray JSON (đã format sẵn)
node scripts/integrations/jira/xray_importer.js --format xray --file ./xray-payload.json
```

**Options:**

| Option | Mô tả | Mặc định |
|--------|--------|----------|
| `--format <FMT>` | Format: `playwright`, `junit`, `xray` | xray |
| `--file <PATH>` | Đường dẫn file report | — |
| `--project <KEY>` | Jira Project Key | Từ `.env` |
| `--testplan <KEY>` | Link vào Test Plan (optional) | — |
| `--mapping <JSON>` | File map TC ID → Xray key | `XRAY_MAPPING_FILE` |
| `--dry-run` | Chỉ ghi payload ra file, không gọi Xray | false |
| `--out <PATH>` | File payload khi `--dry-run` | cạnh file report |

**Map test → Xray Test key** (theo thứ tự ưu tiên):

```typescript
// 1. Jira key trong tên test
test('[PVEN-101] PARSCA_CSV_TC_004 Import thật file hợp lệ', { tag: ['@Smoke'] }, async ({ page }) => { ... });

// 2. Annotation
test('API_PERM_TC_005 vendor POST /product-brands → 403', {
  annotation: { type: 'xray', description: 'PVEN-205' },
}, async ({ request }) => { ... });
```

```json
// 3. xray_mapping.json (TC ID → key) — dùng khi không muốn sửa tên test
{ "PARSCA_SCOPE_TC_010": "PVEN-150", "API_PERM_TC_005": "PVEN-205" }
```

**Quy ước trạng thái PARSCA → Xray:**

| Kết quả Playwright | Điều kiện | Trạng thái PARSCA | Xray status |
|--------------------|-----------|-------------------|-------------|
| passed / flaky | — | PASS | `PASSED` |
| passed | tag `@CodeHienTai` | **OBSERVED** (không tính PASS) | `XRAY_STATUS_OBSERVED` (default `TODO`) |
| bất kỳ | annotation `{ type: 'blocked' }` | **BLOCKED** | `XRAY_STATUS_BLOCKED` (default `TODO`) |
| failed / timedOut | — | FAIL | `FAILED` |
| skipped | — | SKIP | `TODO` |

> Comment của mỗi test trên Xray có: TC ID, module, doc BA nguồn, trạng thái PARSCA, tags, file:line, lỗi (500 ký tự đầu). Test không map được key sẽ được liệt kê trong log và **bị bỏ qua**.

---

## 🔧 Sử dụng như Module (Programmatic)

```javascript
const { fetchIssue, searchIssues, issueToRequirementMarkdown, detectIssueModules } = require('./jira_fetcher');
const { getXrayCloudToken, buildXrayHeaders } = require('./xray_auth');
const { importToXrayCloud, convertPlaywrightToXray } = require('./xray_importer');

// Lấy 1 issue
const issue = await fetchIssue('PVEN-3');

// Module PARSCA liên quan
console.log(detectIssueModules(issue).map((m) => m.code)); // ['CSV']

// Chuyển thành Markdown
const md = issueToRequirementMarkdown(issue);

// Convert Playwright report
const { payload, stats, unmapped } = convertPlaywrightToXray(report, 'PVEN', null, mapping);
```

---

## 🤖 Sử dụng qua Antigravity Agent

| Command | Mô tả |
|---------|--------|
| `/fetch_jira_requirements` | Agent hỏi issue key rồi tự chạy script (workflow kit gốc) |
| `/import_test_results_xray` | Agent tìm report file rồi đẩy lên Xray (workflow kit gốc) |
| `/gen-testcase` | Sinh TC từ file `practices/requirements/jira/<KEY>/` vừa lấy về |

---

## ❓ Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|------|-------------|-----------|
| `File .env không tồn tại` | Chưa tạo `.env` | `cd scripts/integrations/jira && cp .env.example .env` |
| `HTTP 401` | Token sai | Tạo lại API Token tại id.atlassian.com |
| `HTTP 403` | Không có quyền | Kiểm tra account có access vào project |
| `HTTP 404` | URL sai / issue không tồn tại | Kiểm tra `JIRA_BASE_URL` (không có `/` cuối); `PVEN-*` mẫu không tồn tại trên Jira thật |
| `MODULE_NOT_FOUND` | Chưa cài npm | `cd scripts/integrations/jira && npm install` |
| `ENOTFOUND` | Domain sai | Kiểm tra domain trong `JIRA_BASE_URL` |
| `Xray Auth failed` | Client ID/Secret sai | Tạo lại API Key trong Xray Settings |
| `test chưa có Xray key` | Tên test không có key, không có mapping | Thêm `[PVEN-xxx]`, annotation `xray` hoặc `--mapping` |
| "Chưa nhận diện được module" | Issue không có `AC-<MOD>-NN` / label phù hợp | Thêm mã AC hoặc label (csv, login, payout…) |

---

## 📌 Lưu ý bảo mật

- ❌ **KHÔNG** commit file `.env` lên Git (đã có trong `.gitignore`)
- ❌ **KHÔNG** commit file `.xray_token_cache.json`
- ❌ **KHÔNG** dán token / email / mật khẩu tài khoản PARSCA vào requirement `.md`, comment Xray hay chat
- ✅ Chỉ commit file `.env.example` (template không chứa giá trị thật)
- ✅ Mỗi thành viên tự tạo `.env` riêng với credentials cá nhân

---

## 📚 Tham khảo

- [Jira Cloud REST API v3](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)
- [Xray Cloud REST API v2](https://docs.getxray.app/display/XRAYCLOUD/REST+API)
- [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
- [JQL Syntax Guide](https://support.atlassian.com/jira-software-cloud/docs/use-advanced-search-with-jira-query-language-jql/)
- Catalog module PARSCA: `scripts/common/parsca_catalog.js`, `.agent/skills/generate-testcase/resources/module_catalog.md`
