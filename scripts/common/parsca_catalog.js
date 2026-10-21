/**
 * PARSCA Vendor - Catalog dùng chung cho mọi script trong kit-test-parsca/scripts/
 *
 * Nguồn: docs/parsca-vendor-test-docs/ (doc 00–20)
 *        .agent/skills/generate-testcase/resources/module_catalog.md
 *
 * Không phụ thuộc thư viện ngoài (chỉ Node.js core) để mọi integration đều require được.
 */

const fs = require('fs');
const path = require('path');

// kit-test-parsca/ (scripts/common/ → ../../)
const KIT_ROOT = path.resolve(__dirname, '..', '..');

const PATHS = {
  docs: 'docs/parsca-vendor-test-docs',
  docsFallback: 'parsca-vendor-test-docs',
  requirements: 'practices/requirements/parsca-vendor',
  jira: 'practices/requirements/jira',
  googleSheet: 'practices/requirements/google_sheet',
  manualTestcases: 'practices/testcases/vendor',
  apiTestcases: 'practices/testcases/api',
};

const REQUIREMENT_FILES = {
  AUTH: '01_requirements_auth_role_session.md',
  SCOPE: '02_requirements_access_control_data_scope.md',
  PRODUCT: '03_requirements_product_management.md',
  CSV: '04_requirements_import_csv.md',
  SIMULATED: '05_requirements_simulated_screens.md',
  PROFILE: '06_requirements_profile_storefront.md',
};

const MANUAL_TC_FILES = {
  AUTH: 'TC_PARSCA_VENDOR_01_AUTH_ROLE_SESSION.md',
  SCOPE: 'TC_PARSCA_VENDOR_02_DATA_SCOPE.md',
  PRODUCT_LIST: 'TC_PARSCA_VENDOR_03_PRODUCT_LIST_DETAIL_STATUS.md',
  PRODUCT_FORM: 'TC_PARSCA_VENDOR_04_PRODUCT_FORM_IMAGE.md',
  CSV: 'TC_PARSCA_VENDOR_05_IMPORT_CSV.md',
  SIMULATED: 'TC_PARSCA_VENDOR_06_SIMULATED_SCREENS.md',
  PAYOUTS: 'TC_PARSCA_VENDOR_07_PAYOUTS.md',
  PROFILE: 'TC_PARSCA_VENDOR_08_PROFILE_STOREFRONT.md',
};

const API_TC_FILE = 'API_TC_PARSCA_VENDOR.md';

/**
 * 18 module manual (M1–M18) — khớp cột Module "Mn: CODE" trong testcases/vendor/*.md
 * simulated: true = màn [GIẢ LẬP] (không gọi API, không lưu) → không ghi bug cho việc không lưu
 */
const MODULES = [
  { no: 'M1', code: 'ROLE', name: 'Cấp / thu hồi role vendor', doc: '02-cap-thu-hoi-role-vendor.md', risk: 'High', simulated: false, requirement: REQUIREMENT_FILES.AUTH, testcase: MANUAL_TC_FILES.AUTH },
  { no: 'M2', code: 'LOGIN', name: 'Đăng nhập & điều hướng', doc: '03-dang-nhap-dieu-huong.md', risk: 'High', simulated: false, requirement: REQUIREMENT_FILES.AUTH, testcase: MANUAL_TC_FILES.AUTH },
  { no: 'M3', code: 'SESS', name: 'Phiên & đăng xuất', doc: '04-phien-lam-viec-logout.md', risk: 'High', simulated: false, requirement: REQUIREMENT_FILES.AUTH, testcase: MANUAL_TC_FILES.AUTH },
  { no: 'M4', code: 'SCOPE', name: 'Phạm vi dữ liệu', doc: '06-pham-vi-du-lieu.md', risk: 'High', simulated: false, requirement: REQUIREMENT_FILES.SCOPE, testcase: MANUAL_TC_FILES.SCOPE },
  { no: 'M5', code: 'PLIST', name: 'Danh sách sản phẩm', doc: '07-ds-san-pham.md', risk: 'Medium', simulated: false, requirement: REQUIREMENT_FILES.PRODUCT, testcase: MANUAL_TC_FILES.PRODUCT_LIST },
  { no: 'M6', code: 'PDTL', name: 'Chi tiết sản phẩm', doc: '08-chi-tiet-san-pham.md', risk: 'Low', simulated: false, requirement: REQUIREMENT_FILES.PRODUCT, testcase: MANUAL_TC_FILES.PRODUCT_LIST },
  { no: 'M7', code: 'PSTAT', name: 'Đổi trạng thái & xoá sản phẩm', doc: '10-trang-thai-xoa-san-pham.md', risk: 'High', simulated: false, requirement: REQUIREMENT_FILES.PRODUCT, testcase: MANUAL_TC_FILES.PRODUCT_LIST },
  { no: 'M8', code: 'PFORM', name: 'Thêm / sửa sản phẩm', doc: '09-them-sua-san-pham.md', risk: 'High', simulated: false, requirement: REQUIREMENT_FILES.PRODUCT, testcase: MANUAL_TC_FILES.PRODUCT_FORM },
  { no: 'M9', code: 'IMG', name: 'Upload ảnh sản phẩm', doc: '11-upload-anh.md', risk: 'Medium', simulated: false, requirement: REQUIREMENT_FILES.PRODUCT, testcase: MANUAL_TC_FILES.PRODUCT_FORM },
  { no: 'M10', code: 'CSV', name: 'Import CSV', doc: '12-import-csv.md', risk: 'High', simulated: false, requirement: REQUIREMENT_FILES.CSV, testcase: MANUAL_TC_FILES.CSV },
  { no: 'M11', code: 'DASH', name: 'Dashboard', doc: '13-dashboard.md', risk: 'Low', simulated: true, requirement: REQUIREMENT_FILES.SIMULATED, testcase: MANUAL_TC_FILES.SIMULATED },
  { no: 'M12', code: 'ORD', name: 'Danh sách đơn hàng', doc: '14-don-hang.md', risk: 'Low', simulated: true, requirement: REQUIREMENT_FILES.SIMULATED, testcase: MANUAL_TC_FILES.SIMULATED },
  { no: 'M13', code: 'ORDD', name: 'Chi tiết đơn hàng', doc: '15-chi-tiet-don-hang.md', risk: 'Medium', simulated: true, requirement: REQUIREMENT_FILES.SIMULATED, testcase: MANUAL_TC_FILES.SIMULATED },
  { no: 'M14', code: 'REV', name: 'Đánh giá', doc: '16-danh-gia.md', risk: 'Low', simulated: true, requirement: REQUIREMENT_FILES.SIMULATED, testcase: MANUAL_TC_FILES.SIMULATED },
  { no: 'M15', code: 'SET', name: 'Settings Brand / Fitment', doc: '18-cai-dat-brand-fitment.md', risk: 'Low', simulated: true, requirement: REQUIREMENT_FILES.SIMULATED, testcase: MANUAL_TC_FILES.SIMULATED },
  { no: 'M16', code: 'PAY', name: 'Payouts', doc: '17-thanh-toan-payouts.md', risk: 'Medium', simulated: true, requirement: REQUIREMENT_FILES.SIMULATED, testcase: MANUAL_TC_FILES.PAYOUTS },
  { no: 'M17', code: 'PROF', name: 'Hồ sơ vendor', doc: '19-ho-so.md', risk: 'Medium', simulated: false, requirement: REQUIREMENT_FILES.PROFILE, testcase: MANUAL_TC_FILES.PROFILE },
  { no: 'M18', code: 'WEB', name: 'Vendor trên website', doc: '20-vendor-tren-website.md', risk: 'High', simulated: false, requirement: REQUIREMENT_FILES.PROFILE, testcase: MANUAL_TC_FILES.PROFILE },
];

/** Nhóm API TC trong practices/testcases/api/API_TC_PARSCA_VENDOR.md */
const API_GROUPS = [
  { code: 'PERM', name: 'Ma trận phân quyền', docs: ['05-phan-quyen-api.md'] },
  { code: 'SCOPE', name: 'Phạm vi dữ liệu createdBy', docs: ['06-pham-vi-du-lieu.md'] },
  { code: 'PROD', name: 'Validation sản phẩm', docs: ['09-them-sua-san-pham.md', '10-trang-thai-xoa-san-pham.md'] },
  { code: 'FILE', name: 'Upload ảnh & Import CSV', docs: ['11-upload-anh.md', '12-import-csv.md'] },
  { code: 'AUTH', name: 'Phiên làm việc', docs: ['04-phien-lam-viec-logout.md'] },
  { code: 'SEC', name: 'Bảo mật & độ bền', docs: ['05-phan-quyen-api.md'] },
];

/** Doc nền — đọc trước mọi module */
const BASE_DOCS = ['README.md', '00-tong-quan.md', '01-canh-bao-moi-truong.md'];

/** Tag chuẩn trong cột Tags của TC manual */
const KNOWN_TAGS = [
  '@Smoke', '@CriticalPath', '@Regression', '@Security', '@DataScope', '@Boundary',
  '@GiaLap', '@CodeHienTai', '@SuyLuan', '@NeedDevSupport',
];

/**
 * Trạng thái kết quả theo practices/README.md ("Cách ghi kết quả")
 *   OBSERVED = TC @CodeHienTai chạy đúng code hiện tại nhưng chờ PO → KHÔNG tính PASS
 *   BLOCKED  = thiếu môi trường / dữ liệu / quyền
 */
const RESULT_STATUSES = ['PASS', 'FAIL', 'OBSERVED', 'BLOCKED', 'SKIP'];

// PARSCA_LOGIN_TC_001 | API_PERM_TC_005
const TC_ID_PATTERN = /\b(?:PARSCA_([A-Z]+)_TC_(\d{3})|API_([A-Z]+)_TC_(\d{3}))\b/;
const TC_ID_PATTERN_GLOBAL = new RegExp(TC_ID_PATTERN.source, 'g');
// AC-CSV-01, AC-LOGIN-10 …
const AC_ID_PATTERN_GLOBAL = /\bAC-([A-Z]+)-\d{2}\b/g;

/** Gợi ý module từ labels / components / summary của Jira (lowercase keyword → module code) */
const KEYWORD_HINTS = [
  [/\brole\b|vendorid|cấp role|thu hồi/, 'ROLE'],
  [/\blogin\b|đăng nhập|forgot|guard|điều hướng/, 'LOGIN'],
  [/session|\bphiên\b|logout|đăng xuất|refresh/, 'SESS'],
  [/\bscope\b|phạm vi|createdby|data scope/, 'SCOPE'],
  [/product list|danh sách sản phẩm|\bplist\b|pagination|phân trang/, 'PLIST'],
  [/product detail|chi tiết sản phẩm|\bpdtl\b/, 'PDTL'],
  [/\bstatus\b|trạng thái|\bdelete\b|xoá|xóa/, 'PSTAT'],
  [/product form|thêm sản phẩm|sửa sản phẩm|\bpform\b|validation/, 'PFORM'],
  [/\bimage\b|\bupload\b|ảnh/, 'IMG'],
  [/\bcsv\b|\bimport\b/, 'CSV'],
  [/dashboard/, 'DASH'],
  [/\borders?\b|đơn hàng/, 'ORD'],
  [/review|đánh giá/, 'REV'],
  [/settings|\bbrand\b|fitment/, 'SET'],
  [/payout|thanh toán/, 'PAY'],
  [/profile|hồ sơ|avatar/, 'PROF'],
  [/website|storefront/, 'WEB'],
];

/**
 * Thư mục doc BA thực tế (ưu tiên docs/…, fallback parsca-vendor-test-docs/ ở gốc kit)
 * @returns {string} Đường dẫn tương đối từ KIT_ROOT
 */
function resolveDocsDir() {
  if (fs.existsSync(path.join(KIT_ROOT, PATHS.docs))) return PATHS.docs;
  if (fs.existsSync(path.join(KIT_ROOT, PATHS.docsFallback))) return PATHS.docsFallback;
  return PATHS.docs;
}

function getModule(code) {
  return MODULES.find((m) => m.code === code) || null;
}

function getApiGroup(code) {
  return API_GROUPS.find((g) => g.code === code) || null;
}

/**
 * Phân tích TC ID PARSCA
 * @param {string} text - Chuỗi chứa TC ID (VD: "PARSCA_CSV_TC_004 Import thật")
 * @returns {{ id: string, kind: 'manual'|'api', code: string, number: string, module: object|null, docs: string[] }|null}
 */
function parseTcId(text) {
  if (!text) return null;
  const match = String(text).match(TC_ID_PATTERN);
  if (!match) return null;

  if (match[1]) {
    const mod = getModule(match[1]);
    return {
      id: match[0],
      kind: 'manual',
      code: match[1],
      number: match[2],
      module: mod,
      docs: mod ? [mod.doc] : [],
    };
  }

  const group = getApiGroup(match[3]);
  return {
    id: match[0],
    kind: 'api',
    code: match[3],
    number: match[4],
    module: group,
    docs: group ? group.docs : [],
  };
}

/** Tìm mọi TC ID trong text (không trùng lặp) */
function findTcIds(text) {
  if (!text) return [];
  return [...new Set(String(text).match(TC_ID_PATTERN_GLOBAL) || [])];
}

/**
 * Nhận diện module PARSCA từ nội dung Jira issue
 * Ưu tiên mã AC-<MOD>-NN (chính xác), sau đó mới tới keyword trong labels/components/summary.
 * @param {{ text?: string, labels?: string[], components?: string[], summary?: string }} input
 * @returns {object[]} Danh sách module (theo thứ tự M1→M18)
 */
function detectModules({ text = '', labels = [], components = [], summary = '' } = {}) {
  const codes = new Set();

  for (const m of String(text).matchAll(AC_ID_PATTERN_GLOBAL)) {
    if (getModule(m[1])) codes.add(m[1]);
    if (m[1] === 'API') codes.add('SCOPE');
  }
  findTcIds(text).forEach((id) => {
    const parsed = parseTcId(id);
    if (parsed && parsed.kind === 'manual') codes.add(parsed.code);
  });

  if (codes.size === 0) {
    const haystack = [...labels, ...components, summary].join(' ').toLowerCase();
    KEYWORD_HINTS.forEach(([regex, code]) => {
      if (regex.test(haystack)) codes.add(code);
    });
  }

  return MODULES.filter((m) => codes.has(m.code));
}

/**
 * Bảng Markdown "Tài liệu liên quan" cho danh sách module
 * @param {object[]} modules
 * @returns {string}
 */
function modulesToMarkdownTable(modules) {
  const docsDir = resolveDocsDir();
  let md = '| Module | Doc BA | Requirements | Testcase manual | Giả lập |\n';
  md += '|--------|--------|--------------|-----------------|---------|\n';
  modules.forEach((m) => {
    md += `| ${m.no}: ${m.code} — ${m.name} | \`${docsDir}/${m.doc}\` | \`${PATHS.requirements}/${m.requirement}\` | \`${PATHS.manualTestcases}/${m.testcase}\` | ${m.simulated ? '✅ [GIẢ LẬP]' : '–'} |\n`;
  });
  return md;
}

/**
 * Lấy tag của 1 test Playwright (≥ 1.42 có spec.tags; bản cũ đặt tag trong title)
 * @param {object} spec - Playwright JSON spec
 * @param {object} [test] - Playwright JSON test
 * @returns {string[]} VD: ['@Smoke', '@CodeHienTai']
 */
function collectTags(spec, test = {}) {
  const fromTitle = `${spec.title || ''} ${test.title || ''}`.match(/@[A-Za-z]+/g) || [];
  const fromSpec = (spec.tags || []).map((t) => (t.startsWith('@') ? t : `@${t}`));
  return [...new Set([...fromSpec, ...fromTitle])];
}

/**
 * Quy đổi kết quả Playwright sang trạng thái PARSCA
 *   annotation { type: 'blocked' }  → BLOCKED
 *   passed + tag @CodeHienTai       → OBSERVED (không tính PASS)
 * @param {string} playwrightStatus - test.status (expected/unexpected/flaky/skipped) hoặc result.status
 * @param {string[]} tags
 * @param {object[]} annotations
 * @returns {'PASS'|'FAIL'|'OBSERVED'|'BLOCKED'|'SKIP'}
 */
function toParscaStatus(playwrightStatus, tags = [], annotations = []) {
  const isBlocked = (annotations || []).some((a) => /^blocked$/i.test(a.type || ''));
  if (isBlocked) return 'BLOCKED';

  const base = {
    passed: 'PASS',
    expected: 'PASS',
    flaky: 'PASS',
    failed: 'FAIL',
    unexpected: 'FAIL',
    timedOut: 'FAIL',
    interrupted: 'FAIL',
    skipped: 'SKIP',
  }[playwrightStatus] || 'SKIP';

  if (base === 'PASS' && tags.includes('@CodeHienTai')) return 'OBSERVED';
  return base;
}

module.exports = {
  KIT_ROOT,
  PATHS,
  REQUIREMENT_FILES,
  MANUAL_TC_FILES,
  API_TC_FILE,
  MODULES,
  API_GROUPS,
  BASE_DOCS,
  KNOWN_TAGS,
  RESULT_STATUSES,
  TC_ID_PATTERN,
  resolveDocsDir,
  getModule,
  getApiGroup,
  parseTcId,
  findTcIds,
  detectModules,
  modulesToMarkdownTable,
  collectTags,
  toParscaStatus,
};
