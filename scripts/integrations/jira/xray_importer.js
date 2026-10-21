/**
 * Xray Importer (PARSCA Vendor) - Đẩy kết quả test lên Xray
 *
 * Hỗ trợ import:
 *   - Playwright JSON report
 *   - JUnit XML report
 *   - Xray JSON (đã format sẵn)
 *
 * Khác bản gốc:
 *   - Map test → Xray Test key theo thứ tự:
 *       1. Jira key trong tên test:          test('[PVEN-101] PARSCA_CSV_TC_004 ...')
 *       2. Annotation Playwright:            { type: 'xray' | 'jira', description: 'PVEN-101' }
 *       3. File mapping TC ID → key (--mapping / XRAY_MAPPING_FILE): { "PARSCA_CSV_TC_004": "PVEN-101" }
 *   - Trạng thái PARSCA (practices/README.md "Cách ghi kết quả"):
 *       passed + tag @CodeHienTai  → OBSERVED (KHÔNG tính PASS) → XRAY_STATUS_OBSERVED (default TODO)
 *       annotation 'blocked'       → BLOCKED                    → XRAY_STATUS_BLOCKED  (default TODO)
 *   - Comment có TC ID, module, doc BA nguồn; liệt kê test chưa map được key
 *   - --dry-run: chỉ ghi payload ra file, không gọi Xray (không cần credentials)
 *
 * Sử dụng (từ kit-test-parsca/):
 *   node scripts/integrations/jira/xray_importer.js --format playwright --file ./test-results/results.json --dry-run
 *   node scripts/integrations/jira/xray_importer.js --format playwright --file ./test-results/results.json --mapping ./xray_mapping.json
 *   node scripts/integrations/jira/xray_importer.js --format junit --file ./test-results/junit.xml --project PVEN
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const {
  loadEnv,
  validateEnvVars,
  log,
  readJsonFile,
  saveJsonToFile,
  getTimestamp,
} = require('./utils');
const {
  getXrayCloudToken,
  getXrayServerAuth,
  buildXrayHeaders,
} = require('./xray_auth');
const {
  parseTcId,
  resolveDocsDir,
  collectTags,
  toParscaStatus,
} = require('../../common/parsca_catalog');

// Xray Cloud Import Endpoints
const XRAY_CLOUD_BASE = 'https://xray.cloud.getxray.app/api/v2';
const IMPORT_ENDPOINTS = {
  xray: '/import/execution',
  junit: '/import/execution/junit',
  cucumber: '/import/execution/cucumber',
};

const JIRA_KEY_PATTERN = /\[?\b([A-Z][A-Z0-9]+-\d+)\b\]?/;

/** Regex Jira key: theo project key nếu có (tránh nhận nhầm "UTF-8"), ngược lại dùng mẫu chung */
function jiraKeyRegex(projectKey) {
  if (!projectKey) return JIRA_KEY_PATTERN;
  const escaped = projectKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\[?\\b(${escaped}-\\d+)\\b\\]?`);
}

/** Load .env nếu có (dry-run không bắt buộc .env) */
function initEnv({ required }) {
  const envPath = path.resolve(__dirname, '.env');
  if (required || fs.existsSync(envPath)) {
    loadEnv();
  }
}

/**
 * Import kết quả test lên Xray Cloud (Xray JSON format)
 * @param {object} payload - Xray execution payload
 * @returns {object} Import result
 */
async function importToXrayCloud(payload) {
  const token = await getXrayCloudToken();
  if (!token) {
    log('ERROR', 'Không lấy được Xray token.');
    return null;
  }

  log('LOG', 'Đang import kết quả test lên Xray Cloud...');

  try {
    const response = await axios.post(
      `${XRAY_CLOUD_BASE}${IMPORT_ENDPOINTS.xray}`,
      payload,
      {
        headers: buildXrayHeaders('cloud', token),
      }
    );

    log('LOG', 'Import thành công!');
    log('LOG', `Test Execution Key: ${response.data.key || response.data.id}`);
    return response.data;
  } catch (error) {
    handleImportError(error);
    return null;
  }
}

/**
 * Import JUnit XML lên Xray Cloud
 * @param {string} xmlFilePath - Đường dẫn file JUnit XML
 * @param {string} projectKey - Jira project key
 * @returns {object}
 */
async function importJunitToXrayCloud(xmlFilePath, projectKey) {
  const token = await getXrayCloudToken();
  if (!token) return null;

  if (!fs.existsSync(xmlFilePath)) {
    log('ERROR', `File không tồn tại: ${xmlFilePath}`);
    return null;
  }

  const xmlContent = fs.readFileSync(xmlFilePath, 'utf-8');

  log('LOG', `Đang import JUnit XML: ${xmlFilePath}`);

  try {
    const response = await axios.post(
      `${XRAY_CLOUD_BASE}${IMPORT_ENDPOINTS.junit}`,
      xmlContent,
      {
        headers: {
          ...buildXrayHeaders('cloud', token),
          'Content-Type': 'text/xml',
        },
        params: {
          projectKey,
        },
      }
    );

    log('LOG', `Import JUnit thành công! Key: ${response.data.key}`);
    return response.data;
  } catch (error) {
    handleImportError(error);
    return null;
  }
}

/**
 * Import kết quả test lên Xray Server/Data Center
 * @param {object} payload - Xray execution payload
 * @returns {object}
 */
async function importToXrayServer(payload) {
  validateEnvVars(['JIRA_BASE_URL']);
  const baseUrl = process.env.JIRA_BASE_URL.replace(/\/+$/, '');
  const auth = getXrayServerAuth();

  if (!auth) return null;

  log('LOG', 'Đang import kết quả test lên Xray Server...');

  try {
    const response = await axios.post(
      `${baseUrl}/rest/raven/2.0/import/execution`,
      payload,
      {
        headers: buildXrayHeaders('server', auth),
      }
    );

    log('LOG', `Import thành công! Test Execution: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error) {
    handleImportError(error);
    return null;
  }
}

/**
 * Đọc file mapping TC ID → Xray Test key
 * @param {string} [mappingPath]
 * @returns {object}
 */
function loadMapping(mappingPath) {
  if (!mappingPath) return {};
  const resolved = path.resolve(process.cwd(), mappingPath);
  if (!fs.existsSync(resolved)) {
    log('WARN', `Không tìm thấy file mapping: ${resolved} — bỏ qua.`);
    return {};
  }
  const data = readJsonFile(resolved) || {};
  log('LOG', `Đã nạp mapping: ${Object.keys(data).length} TC ID`);
  return data;
}

/**
 * Map trạng thái PARSCA sang Xray status
 */
function mapParscaStatusToXray(parscaStatus) {
  const mapping = {
    PASS: 'PASSED',
    FAIL: 'FAILED',
    SKIP: 'TODO',
    OBSERVED: process.env.XRAY_STATUS_OBSERVED || 'TODO',
    BLOCKED: process.env.XRAY_STATUS_BLOCKED || 'TODO',
  };
  return mapping[parscaStatus] || 'TODO';
}

/**
 * Tìm Xray Test key cho 1 test
 */
function resolveTestKey(title, annotations, tcId, mapping, projectKey) {
  const fromTitle = extractTestKey(title, projectKey);
  if (fromTitle) return fromTitle;

  const keyRegex = jiraKeyRegex(projectKey);
  const ann = (annotations || []).find((a) => /^(xray|jira|issue)$/i.test(a.type || ''));
  if (ann && keyRegex.test(ann.description || '')) {
    return ann.description.match(keyRegex)[1];
  }

  if (tcId && mapping[tcId]) return mapping[tcId];
  return null;
}

/**
 * Chuyển đổi Playwright JSON report sang Xray format
 * @param {object} playwrightReport - Playwright JSON report data
 * @param {string} projectKey - Jira project key
 * @param {string} testPlanKey - (Optional) Test Plan key
 * @param {object} mapping - TC ID → Xray key
 * @returns {{ payload: object, stats: object, unmapped: string[] }}
 */
function convertPlaywrightToXray(playwrightReport, projectKey, testPlanKey, mapping = {}) {
  const tests = [];
  const unmapped = [];
  const stats = { PASS: 0, FAIL: 0, SKIP: 0, OBSERVED: 0, BLOCKED: 0 };
  const docsDir = resolveDocsDir();

  // Playwright report format: suites → specs → tests → results
  function processSuite(suite) {
    if (suite.specs) {
      suite.specs.forEach((spec) => {
        spec.tests.forEach((test) => {
          const result = test.results[test.results.length - 1]; // Lấy kết quả cuối
          const tags = collectTags(spec, test);
          const annotations = test.annotations || [];
          const parscaStatus = toParscaStatus(test.status, tags, annotations);
          const duration = result?.duration || 0;
          const parsed = parseTcId(spec.title);
          const testKey = resolveTestKey(spec.title, annotations, parsed?.id, mapping, projectKey);
          stats[parscaStatus]++;

          const commentLines = [
            `Test: ${spec.title}`,
            parsed ? `TC ID: ${parsed.id}${parsed.module ? ` (${parsed.module.no ? parsed.module.no + ': ' : ''}${parsed.code} — ${parsed.module.name})` : ''}` : null,
            parsed && parsed.docs.length > 0 ? `Doc: ${parsed.docs.map((d) => `${docsDir}/${d}`).join(', ')}` : null,
            `PARSCA status: ${parscaStatus}${parscaStatus === 'OBSERVED' ? ' — theo code hiện tại, chờ PO (không tính PASS)' : ''}`,
            tags.length > 0 ? `Tags: ${tags.join(' ')}` : null,
            `File: ${spec.file}:${spec.line}`,
            `Duration: ${duration}ms${test.status === 'flaky' ? ' (flaky — pass sau retry)' : ''}`,
            result?.error?.message ? `Error: ${String(result.error.message).substring(0, 500)}` : null,
          ].filter(Boolean);

          if (!testKey) {
            unmapped.push(parsed?.id || spec.title);
            return;
          }

          tests.push({
            testKey,
            status: mapParscaStatusToXray(parscaStatus),
            comment: commentLines.join('\n'),
            // Chỉ gửi attachment có nội dung inline (base64); attachment dạng path bị bỏ qua
            evidences: (result?.attachments || [])
              .filter((att) => att.body)
              .map((att) => ({
                data: att.body,
                filename: att.name || 'attachment',
                contentType: att.contentType || 'text/plain',
              })),
          });
        });
      });
    }

    if (suite.suites) {
      suite.suites.forEach(processSuite);
    }
  }

  if (playwrightReport.suites) {
    playwrightReport.suites.forEach(processSuite);
  }

  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  const payload = {
    info: {
      project: projectKey,
      summary: `PARSCA Vendor — Playwright Test Execution - ${new Date().toISOString()}`,
      description: [
        'Automated Playwright test results imported via kit-test-parsca.',
        `Total: ${total} | PASS: ${stats.PASS} | FAIL: ${stats.FAIL} | OBSERVED: ${stats.OBSERVED} | BLOCKED: ${stats.BLOCKED} | SKIP: ${stats.SKIP}`,
        `Mapped to Xray: ${tests.length} | Unmapped: ${unmapped.length}`,
      ].join('\n'),
      startDate: playwrightReport.stats?.startTime || new Date().toISOString(),
    },
    tests,
  };

  if (testPlanKey) {
    payload.info.testPlanKey = testPlanKey;
  }

  return { payload, stats, unmapped };
}

/**
 * Trích xuất Jira test key từ tên test (nếu có)
 * Convention: test title chứa [PVEN-123] hoặc PVEN-123
 * (TC ID PARSCA_*_TC_NNN dùng dấu "_" nên không bị nhận nhầm)
 */
function extractTestKey(title, projectKey) {
  const match = String(title || '').match(jiraKeyRegex(projectKey));
  return match ? match[1] : null;
}

/**
 * Xử lý lỗi import
 */
function handleImportError(error) {
  if (error.response) {
    log('ERROR', `Import HTTP ${error.response.status}`);
    log('ERROR', `Response: ${JSON.stringify(error.response.data)}`);
  } else {
    log('ERROR', `Import error: ${error.message}`);
  }
}

// ============ CLI ============

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || Object.keys(args).length === 0) {
    printUsage();
    return;
  }

  const dryRun = !!args['dry-run'];
  initEnv({ required: !dryRun });

  const format = args.format || 'xray';
  const filePath = args.file;
  const projectKey = args.project || process.env.JIRA_PROJECT_KEY;
  const platform = process.env.XRAY_PLATFORM || 'cloud';

  if (!filePath) {
    log('ERROR', 'Cần chỉ định --file <path>');
    return;
  }

  if (!fs.existsSync(filePath)) {
    log('ERROR', `File không tồn tại: ${filePath}`);
    return;
  }

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║            XRAY IMPORTER - PARSCA Vendor Kit                 ║
║     Đẩy kết quả test automation lên Xray                     ║
╚══════════════════════════════════════════════════════════════╝
`);
  console.log(`Platform: ${platform}${dryRun ? ' (DRY RUN — không gửi lên Xray)' : ''}`);
  console.log(`Format:   ${format}`);
  console.log(`File:     ${filePath}`);
  console.log(`Project:  ${projectKey || 'N/A'}`);
  console.log('');

  let result;

  switch (format) {
    case 'playwright': {
      const report = readJsonFile(filePath);
      if (!report) return;
      if (!projectKey) {
        log('ERROR', 'Cần --project <KEY> hoặc JIRA_PROJECT_KEY trong .env');
        return;
      }
      const mapping = loadMapping(args.mapping || process.env.XRAY_MAPPING_FILE);
      const { payload, stats, unmapped } = convertPlaywrightToXray(report, projectKey, args.testplan, mapping);

      console.log('--- Kết quả theo quy ước PARSCA ---');
      Object.entries(stats).forEach(([k, v]) => console.log(`  ${k.padEnd(9)}: ${v}`));
      log('LOG', `Đã chuyển đổi ${payload.tests.length} tests sang Xray format.`);
      if (unmapped.length > 0) {
        log('WARN', `${unmapped.length} test chưa có Xray key (bị bỏ qua): ${unmapped.slice(0, 15).join(', ')}${unmapped.length > 15 ? ', …' : ''}`);
        log('WARN', 'Thêm [PVEN-xxx] vào tên test, annotation { type: "xray" } hoặc khai báo trong --mapping.');
      }

      if (dryRun) {
        const outFile = args.out
          ? path.resolve(process.cwd(), args.out)
          : path.join(path.dirname(path.resolve(filePath)), `xray_payload_${getTimestamp()}.json`);
        saveJsonToFile(outFile, payload);
        return;
      }

      if (payload.tests.length === 0) {
        log('ERROR', 'Không có test nào map được Xray key — dừng import.');
        return;
      }

      if (platform === 'cloud') {
        result = await importToXrayCloud(payload);
      } else {
        result = await importToXrayServer(payload);
      }
      break;
    }

    case 'junit': {
      if (!projectKey) {
        log('ERROR', 'Cần --project <KEY> hoặc JIRA_PROJECT_KEY trong .env');
        return;
      }
      if (dryRun) {
        log('LOG', 'Dry run JUnit: file hợp lệ, không gửi lên Xray.');
        return;
      }
      if (platform === 'cloud') {
        result = await importJunitToXrayCloud(filePath, projectKey);
      } else {
        log('ERROR', 'JUnit import cho Xray Server chưa được hỗ trợ trong phiên bản này.');
      }
      break;
    }

    case 'xray': {
      const payload = readJsonFile(filePath);
      if (!payload) return;
      if (dryRun) {
        log('LOG', `Dry run Xray JSON: ${payload.tests?.length || 0} tests, không gửi lên Xray.`);
        return;
      }
      if (platform === 'cloud') {
        result = await importToXrayCloud(payload);
      } else {
        result = await importToXrayServer(payload);
      }
      break;
    }

    default:
      log('ERROR', `Format không hỗ trợ: ${format}`);
      log('ERROR', 'Hỗ trợ: playwright, junit, xray');
  }

  if (result) {
    console.log('\n--- Kết quả import ---');
    console.log(JSON.stringify(result, null, 2));
  }
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.replace('--', '');
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

function printUsage() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║            XRAY IMPORTER - PARSCA Vendor Kit                 ║
║     Đẩy kết quả test automation lên Xray                     ║
╚══════════════════════════════════════════════════════════════╝

Cách sử dụng (từ kit-test-parsca/):
  node scripts/integrations/jira/xray_importer.js [options]

Options:
  --format <FMT>      Format report: playwright, junit, xray (default: xray)
  --file <PATH>       Đường dẫn file report
  --project <KEY>     Jira Project Key (hoặc JIRA_PROJECT_KEY trong .env, VD: PVEN)
  --testplan <KEY>    (Optional) Test Plan Key để link Test Execution
  --mapping <JSON>    (Optional) File map TC ID → Xray key (hoặc XRAY_MAPPING_FILE)
  --dry-run           Chỉ convert + ghi payload ra file, KHÔNG gửi lên Xray
  --out <PATH>        File payload khi --dry-run (default: cạnh file report)
  --help              Hiển thị hướng dẫn này

Quy ước trạng thái PARSCA:
  PASS + tag @CodeHienTai  → OBSERVED (XRAY_STATUS_OBSERVED, default TODO)
  annotation "blocked"     → BLOCKED  (XRAY_STATUS_BLOCKED,  default TODO)

Ví dụ:
  node scripts/integrations/jira/xray_importer.js --format playwright --file ./test-results/results.json --dry-run
  node scripts/integrations/jira/xray_importer.js --format playwright --file ./test-results/results.json --mapping ./xray_mapping.json
  node scripts/integrations/jira/xray_importer.js --format junit --file ./test-results/junit.xml --project PVEN
  node scripts/integrations/jira/xray_importer.js --format xray --file ./xray-payload.json
  `);
}

// Export
module.exports = {
  importToXrayCloud,
  importToXrayServer,
  importJunitToXrayCloud,
  convertPlaywrightToXray,
  toParscaStatus,
  extractTestKey,
};

// CLI
if (require.main === module) {
  main().catch((err) => {
    log('ERROR', `Unexpected error: ${err.message}`);
    process.exit(1);
  });
}
