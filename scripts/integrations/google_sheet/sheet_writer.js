/**
 * Google Sheets Writer (PARSCA Vendor) - Ghi dữ liệu / kết quả test lên Google Sheets
 *
 * Hỗ trợ:
 *   - Ghi kết quả test automation (Playwright JSON report) theo quy ước PARSCA
 *   - Upload file Excel (.xlsx/.xls) — 1 file hoặc cả thư mục (VD: practices/testcases/vendor)
 *   - Append rows mới vào cuối sheet
 *   - Ghi đè (overwrite) data vào range cụ thể
 *   - Tạo sheet mới tự động nếu chưa tồn tại
 *   - Color coding: PASS = xanh lá, FAIL = đỏ, SKIP = vàng, OBSERVED = xanh dương, BLOCKED = xám
 *
 * Khác bản gốc:
 *   - Sheet kết quả có cột TC ID / Module / Tags / Doc (tách TC ID PARSCA_*_TC_NNN, API_*_TC_NNN từ tên test)
 *   - Trạng thái OBSERVED (@CodeHienTai) và BLOCKED (annotation "blocked")
 *   - --excel: --sheet không bắt buộc (mặc định = tên file), nhận cả thư mục
 *   - Tô màu đúng vị trí dòng vừa append (dựa vào updatedRange)
 *
 * Sử dụng (từ kit-test-parsca/):
 *   node scripts/integrations/google_sheet/sheet_writer.js --excel practices/testcases/vendor/TC_PARSCA_VENDOR_05_IMPORT_CSV.xlsx
 *   node scripts/integrations/google_sheet/sheet_writer.js --excel practices/testcases/vendor
 *   node scripts/integrations/google_sheet/sheet_writer.js --results ./test-results/results.json
 *   node scripts/integrations/google_sheet/sheet_writer.js --append "Sheet1" --data '[{"Name":"John"}]'
 *   node scripts/integrations/google_sheet/sheet_writer.js --clear "Sheet1" --range "A2:Z1000"
 *   node scripts/integrations/google_sheet/sheet_writer.js --create "New Sheet"
 */

const path = require('path');
const fs = require('fs');
const {
  RESULT_HEADERS,
  RESULT_STATUS_COL,
  STATUS_COLORS,
  loadEnv,
  validateEnvVars,
  buildSheetsClient,
  objectsToRows,
  buildRange,
  formatTestResultRow,
  readJsonFile,
  log,
  handleApiError,
} = require('./utils');
const {
  parseTcId,
  collectTags,
  toParscaStatus,
  resolveDocsDir,
  RESULT_STATUSES,
} = require('../../common/parsca_catalog');

let SPREADSHEET_ID;

function initEnv() {
  loadEnv();
  validateEnvVars(['GOOGLE_SPREADSHEET_ID']);
  SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
}

/**
 * Lấy sheetId (numeric) theo tên sheet
 * @param {string} sheetName
 * @returns {number|null}
 */
async function getSheetId(sheetName) {
  try {
    const sheetsClient = await buildSheetsClient();
    const metaRes = await sheetsClient.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: 'sheets.properties',
    });
    const found = (metaRes.data.sheets || []).find((s) => s.properties.title === sheetName);
    return found ? found.properties.sheetId : null;
  } catch (_) {
    return null;
  }
}

/**
 * Tạo sheet mới nếu chưa tồn tại
 * @param {string} sheetName
 * @returns {boolean} true nếu tạo thành công hoặc sheet đã tồn tại
 */
async function ensureSheetExists(sheetName) {
  try {
    const sheetsClient = await buildSheetsClient();

    // Lấy danh sách sheets hiện có
    const metaRes = await sheetsClient.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: 'sheets.properties.title',
    });

    const existing = (metaRes.data.sheets || []).map((s) => s.properties.title);

    if (existing.includes(sheetName)) {
      log('LOG', `Sheet "${sheetName}" đã tồn tại.`);
      return true;
    }

    // Tạo sheet mới
    log('LOG', `Đang tạo sheet mới: "${sheetName}"...`);
    await sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: sheetName,
              gridProperties: { rowCount: 1000, columnCount: 26 },
            },
          },
        }],
      },
    });

    log('LOG', `✅ Đã tạo sheet: "${sheetName}"`);
    return true;
  } catch (error) {
    handleApiError(error, `Ensure Sheet "${sheetName}"`);
    return false;
  }
}

/**
 * Xóa nội dung trong một range
 * @param {string} sheetName
 * @param {string} [range] - Range VD: "A2:Z1000" (nếu không có sẽ clear toàn bộ data rows)
 */
async function clearRange(sheetName, range = 'A2:Z10000') {
  const fullRange = buildRange(sheetName, range);
  log('LOG', `Đang xóa range: ${fullRange}...`);

  try {
    const sheetsClient = await buildSheetsClient();
    await sheetsClient.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: fullRange,
    });
    log('LOG', `✅ Đã xóa range: ${fullRange}`);
  } catch (error) {
    handleApiError(error, `Clear Range "${fullRange}"`);
  }
}

/**
 * Ghi header vào row đầu tiên của sheet
 * @param {string} sheetName
 * @param {string[]} headers
 */
async function writeHeaders(sheetName, headers) {
  const range = buildRange(sheetName, 'A1');
  log('LOG', `Đang ghi headers vào "${sheetName}"...`);

  try {
    const sheetsClient = await buildSheetsClient();
    await sheetsClient.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    });
    log('LOG', `✅ Đã ghi ${headers.length} header cột`);
  } catch (error) {
    handleApiError(error, `Write Headers "${sheetName}"`);
  }
}

/**
 * Append rows và trả về vị trí đã ghi
 * @param {string} sheetName
 * @param {string[][]} rows
 * @returns {{ count: number, startRowIndex: number|null }} startRowIndex: 0-indexed
 */
async function appendRowsDetailed(sheetName, rows) {
  if (!rows || rows.length === 0) {
    log('WARN', 'Không có row nào để append.');
    return { count: 0, startRowIndex: null };
  }

  const range = buildRange(sheetName);
  log('LOG', `Đang append ${rows.length} row(s) vào "${sheetName}"...`);

  try {
    const sheetsClient = await buildSheetsClient();
    const res = await sheetsClient.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: rows,
      },
    });

    const updatedRange = res.data.updates?.updatedRange || '';
    const match = updatedRange.match(/![A-Z]+(\d+)/);
    log('LOG', `✅ Đã append ${rows.length} row(s) vào ${updatedRange || sheetName}`);
    return { count: rows.length, startRowIndex: match ? Number(match[1]) - 1 : null };
  } catch (error) {
    handleApiError(error, `Append Rows "${sheetName}"`);
    return { count: 0, startRowIndex: null };
  }
}

/**
 * Append rows vào cuối sheet (sau dữ liệu hiện có)
 * @param {string} sheetName
 * @param {string[][]} rows - Mảng 2D các giá trị
 * @returns {number} Số rows đã append
 */
async function appendRows(sheetName, rows) {
  const { count } = await appendRowsDetailed(sheetName, rows);
  return count;
}

/**
 * Ghi đè dữ liệu vào một range cụ thể
 * @param {string} sheetName
 * @param {string} range - Range VD: "A1:K100"
 * @param {string[][]} rows - Mảng 2D
 */
async function writeRange(sheetName, range, rows) {
  const fullRange = buildRange(sheetName, range);
  log('LOG', `Đang ghi ${rows.length} row(s) vào ${fullRange}...`);

  try {
    const sheetsClient = await buildSheetsClient();
    await sheetsClient.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: fullRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: rows,
      },
    });
    log('LOG', `✅ Đã ghi ${rows.length} row(s) vào ${fullRange}`);
  } catch (error) {
    handleApiError(error, `Write Range "${fullRange}"`);
  }
}

/**
 * Áp dụng màu sắc cho cột Status trong sheet kết quả test
 * @param {number} sheetId - Numeric sheet ID
 * @param {number} startRow - Row bắt đầu (0-indexed)
 * @param {Array<{status: string}>} results - Danh sách kết quả test
 * @param {number} statusColIndex - Index cột Status (0-indexed)
 */
async function applyStatusColors(sheetId, startRow, results, statusColIndex = RESULT_STATUS_COL) {
  if (!results || results.length === 0) return;

  log('LOG', `Đang áp dụng màu sắc cho ${results.length} row(s)...`);

  const requests = results.map((result, idx) => {
    const rowIndex = startRow + idx; // 0-indexed
    const statusKey = (result.status || '').toUpperCase();
    const color = STATUS_COLORS[statusKey] || { red: 0.9, green: 0.9, blue: 0.9 }; // grey default

    return {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: rowIndex,
          endRowIndex: rowIndex + 1,
          startColumnIndex: statusColIndex,
          endColumnIndex: statusColIndex + 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: color,
            textFormat: {
              bold: true,
              foregroundColor: { red: 1, green: 1, blue: 1 },
            },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat)',
      },
    };
  });

  try {
    const sheetsClient = await buildSheetsClient();
    await sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests },
    });
    log('LOG', `✅ Đã áp dụng màu sắc cho cột Status`);
  } catch (error) {
    log('WARN', `Không thể áp dụng màu sắc: ${error.message}. Tiếp tục không có màu.`);
  }
}

/**
 * Chuyển đổi Playwright JSON report sang rows theo cấu trúc PARSCA
 * @param {object} playwrightReport - Nội dung file results.json
 * @returns {{ headers: string[], rows: string[][], results: object[] }}
 */
function convertPlaywrightReport(playwrightReport) {
  const results = [];
  const docsDir = resolveDocsDir();

  function processSuite(suite) {
    (suite.specs || []).forEach((spec) => {
      (spec.tests || []).forEach((test) => {
        const lastResult = test.results?.[test.results.length - 1] || {};
        const tags = collectTags(spec, test);
        const status = toParscaStatus(test.status || lastResult.status, tags, test.annotations);
        const parsed = parseTcId(spec.title);

        let moduleLabel = '';
        if (parsed && parsed.kind === 'manual' && parsed.module) moduleLabel = `${parsed.module.no}: ${parsed.code}`;
        if (parsed && parsed.kind === 'api') moduleLabel = `API ${parsed.code}`;

        results.push({
          tcId: parsed ? parsed.id : '',
          module: moduleLabel,
          title: spec.title || '',
          status,
          duration: lastResult.duration ?? '',
          error: (lastResult.errors?.[0]?.message || lastResult.error?.message || '')
            .replace(/\u001b\[[0-9;]*m/g, '') // bỏ mã màu ANSI
            .replace(/\n/g, ' ')
            .substring(0, 200),
          tags: tags.join(' '),
          file: spec.file ? `${spec.file}:${spec.line}` : '',
          retries: String(Math.max((test.results?.length || 1) - 1, 0)),
          doc: parsed ? parsed.docs.map((d) => `${docsDir}/${d}`).join(', ') : '',
        });
      });
    });
    (suite.suites || []).forEach(processSuite);
  }

  (playwrightReport.suites || []).forEach(processSuite);

  const rows = results.map((r) => formatTestResultRow(r));
  return { headers: RESULT_HEADERS, rows, results };
}

/** Đếm số TC theo từng trạng thái PARSCA */
function countByStatus(results) {
  return RESULT_STATUSES.reduce((acc, s) => {
    acc[s] = results.filter((r) => r.status === s).length;
    return acc;
  }, {});
}

/**
 * Import kết quả Playwright test lên Google Sheets
 * @param {string} reportPath - Đường dẫn file results.json
 * @param {string} sheetName - Tên sheet đích
 * @param {object} options - { clearFirst: boolean, addSummaryRow: boolean }
 */
async function importPlaywrightResults(reportPath, sheetName, options = {}) {
  const { clearFirst = false, addSummaryRow = true } = options;

  log('LOG', `Đang đọc Playwright report: ${reportPath}`);

  const rawReport = readJsonFile(reportPath);
  if (!rawReport) {
    log('ERROR', `Không đọc được file: ${reportPath}`);
    return;
  }

  const { headers, rows, results } = convertPlaywrightReport(rawReport);

  if (rows.length === 0) {
    log('WARN', 'Không có test nào trong report.');
    return;
  }

  log('LOG', `Tìm thấy ${rows.length} test result(s)`);

  // Đảm bảo sheet tồn tại + lấy sheetId để color coding
  await ensureSheetExists(sheetName);
  const sheetId = await getSheetId(sheetName);

  if (clearFirst) {
    await clearRange(sheetName);
    await writeHeaders(sheetName, headers);
  } else {
    // Chỉ ghi header nếu sheet trống (kiểm tra A1)
    const { readSheet } = require('./sheet_reader');
    const existing = await readSheet(sheetName, 'A1:A1');
    if (!existing.headers || existing.headers.length === 0) {
      await writeHeaders(sheetName, headers);
    }
  }

  // Append data rows, tô màu đúng vị trí vừa ghi
  const { startRowIndex } = await appendRowsDetailed(sheetName, rows);
  if (sheetId !== null && startRowIndex !== null) {
    await applyStatusColors(sheetId, startRowIndex, results);
  }

  const counts = countByStatus(results);

  // Summary row
  if (addSummaryRow) {
    const totalDuration = results.reduce((s, r) => s + (Number(r.duration) || 0), 0);
    const summaryRow = RESULT_HEADERS.map(() => '');
    summaryRow[0] = '--- SUMMARY ---';
    summaryRow[2] = `Total: ${rows.length}`;
    summaryRow[RESULT_STATUS_COL] = RESULT_STATUSES.map((s) => `${s}: ${counts[s]}`).join(' | ');
    summaryRow[RESULT_HEADERS.indexOf('Duration (ms)')] = `${(totalDuration / 1000).toFixed(2)}s`;
    summaryRow[RESULT_HEADERS.indexOf('Run At')] = new Date().toISOString();
    await appendRows(sheetName, [summaryRow]);
  }

  log('LOG', `✅ Import hoàn tất: ${rows.length} test(s) → Sheet "${sheetName}"`);

  console.log('\n--- Kết quả import (quy ước PARSCA) ---');
  console.log(`  ✅ PASS:     ${counts.PASS}`);
  console.log(`  ❌ FAIL:     ${counts.FAIL}`);
  console.log(`  🔵 OBSERVED: ${counts.OBSERVED}  (@CodeHienTai — chờ PO, không tính PASS)`);
  console.log(`  ⛔ BLOCKED:  ${counts.BLOCKED}`);
  console.log(`  ⏭️  SKIP:     ${counts.SKIP}`);
  console.log(`  📊 Total:    ${rows.length}`);
  const noTcId = results.filter((r) => !r.tcId).length;
  if (noTcId > 0) {
    console.log(`  ⚠️  ${noTcId} test không có TC ID PARSCA trong tên (cột TC ID để trống)`);
  }
  console.log(`  🔗 URL: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
}

/**
 * Upload file Excel (.xlsx/.xls) lên Google Sheets
 * @param {string} excelPath - Đường dẫn file Excel
 * @param {string} sheetName - Tên sheet đích trên Google Sheets
 * @param {object} options - { sheetIndex: number, clearFirst: boolean, newlineReplacement: string|null }
 *   newlineReplacement = null (mặc định) → giữ xuống dòng trong cell (Test Steps / Expected Result nhiều dòng)
 */
async function importExcel(excelPath, sheetName, options = {}) {
  const { sheetIndex = 0, clearFirst = true, newlineReplacement = null } = options;

  // Kiểm tra package xlsx
  let XLSX;
  try {
    XLSX = require('xlsx');
  } catch (_) {
    log('ERROR', 'Package "xlsx" chưa được cài. Chạy: npm install');
    process.exit(1);
  }

  // Kiểm tra file tồn tại
  if (!fs.existsSync(excelPath)) {
    log('ERROR', `Không tìm thấy file: ${excelPath}`);
    process.exit(1);
  }

  log('LOG', `Đọc file Excel: ${excelPath}`);
  const wb = XLSX.readFile(excelPath);

  if (sheetIndex >= wb.SheetNames.length) {
    log('ERROR', `File Excel chỉ có ${wb.SheetNames.length} sheet(s): ${wb.SheetNames.join(', ')}`);
    process.exit(1);
  }

  const excelSheetName = wb.SheetNames[sheetIndex];
  const ws = wb.Sheets[excelSheetName];
  const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  // Chuẩn hóa: (tuỳ chọn) thay newline trong cell bằng separator
  const rows = rawRows.map((row) =>
    row.map((cell) => (newlineReplacement === null
      ? String(cell)
      : String(cell).replace(/\r\n|\r|\n/g, newlineReplacement)))
  );

  log('LOG', `Excel sheet: "${excelSheetName}" → ${rows.length} rows × ${rows[0]?.length || 0} cột`);
  log('LOG', `Google Sheet đích: "${sheetName}"`);

  // Đảm bảo sheet tồn tại
  await ensureSheetExists(sheetName);

  const sheetsClient = await buildSheetsClient();

  // Xóa data cũ nếu cần
  if (clearFirst) {
    log('LOG', `Xóa data cũ trong "${sheetName}"...`);
    await sheetsClient.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: buildRange(sheetName),
    });
  }

  // Upload toàn bộ data
  log('LOG', `Đang upload ${rows.length} rows...`);
  await sheetsClient.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: buildRange(sheetName, 'A1'),
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: rows },
  });

  log('LOG', `✅ Upload hoàn tất: ${rows.length} rows → Sheet "${sheetName}"`);
  console.log('\n--- Kết quả upload Excel ---');
  console.log(`  📁 File: ${path.basename(excelPath)}`);
  console.log(`  📋 Excel sheet: "${excelSheetName}" (index ${sheetIndex})`);
  console.log(`  📊 Rows: ${rows.length} | Cols: ${rows[0]?.length || 0}`);
  console.log(`  ✅ Google Sheet: "${sheetName}"`);
  console.log(`  🔗 URL: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`);
}

/**
 * Tên sheet mặc định từ tên file Excel (giới hạn 100 ký tự của Google Sheets)
 * VD: TC_PARSCA_VENDOR_05_IMPORT_CSV.xlsx → "TC_PARSCA_VENDOR_05_IMPORT_CSV"
 */
function defaultSheetNameFromFile(filePath) {
  return path.basename(filePath).replace(/\.(xlsx|xls)$/i, '').substring(0, 100);
}

// ============ CLI ============

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || Object.keys(args).length === 0) {
    printUsage();
    return;
  }

  initEnv();

  const defaultResultsSheet = process.env.RESULTS_SHEET_NAME || 'PARSCA Vendor Results';

  // Mode: Import Playwright results
  if (args.results) {
    const reportPath = path.resolve(process.cwd(), args.results);
    if (!fs.existsSync(reportPath)) {
      log('ERROR', `Không tìm thấy file: ${reportPath}`);
      process.exit(1);
    }
    const sheetName = args.sheet || defaultResultsSheet;
    const clearFirst = args['clear-first'] === true;
    await importPlaywrightResults(reportPath, sheetName, { clearFirst });
    return;
  }

  // Mode: Upload Excel file / thư mục Excel
  if (args.excel) {
    const excelPath = path.resolve(process.cwd(), args.excel);
    const sheetIndex = args['sheet-index'] ? parseInt(args['sheet-index'], 10) : 0;
    const clearFirst = !(args['no-clear'] === true);
    const newlineReplacement = args.flat ? ' | ' : null;

    if (fs.existsSync(excelPath) && fs.statSync(excelPath).isDirectory()) {
      if (args.sheet) {
        log('ERROR', '--sheet không dùng được khi --excel là thư mục (mỗi file → 1 sheet cùng tên file).');
        process.exit(1);
      }
      const files = fs.readdirSync(excelPath).filter((f) => /\.(xlsx|xls)$/i.test(f) && !f.startsWith('~$')).sort();
      if (files.length === 0) {
        log('ERROR', `Không có file .xlsx/.xls trong: ${excelPath}`);
        process.exit(1);
      }
      log('LOG', `Upload ${files.length} file Excel từ ${excelPath}`);
      for (const f of files) {
        await importExcel(path.join(excelPath, f), defaultSheetNameFromFile(f), { sheetIndex, clearFirst, newlineReplacement });
      }
      return;
    }

    const sheetName = args.sheet || defaultSheetNameFromFile(excelPath);
    await importExcel(excelPath, sheetName, { sheetIndex, clearFirst, newlineReplacement });
    return;
  }

  // Mode: Append JSON data
  if (args.append && args.data) {
    const sheetName = args.append;
    let data;
    try {
      data = JSON.parse(args.data);
    } catch (_) {
      log('ERROR', 'Giá trị --data không hợp lệ (phải là JSON array).');
      process.exit(1);
    }

    if (!Array.isArray(data)) {
      log('ERROR', 'Giá trị --data phải là JSON array.');
      process.exit(1);
    }

    await ensureSheetExists(sheetName);
    const { headers, rows } = objectsToRows(data);
    await appendRows(sheetName, [headers, ...rows]);
    return;
  }

  // Mode: Clear range
  if (args.clear && args.clear !== true) {
    const sheetName = args.clear;
    const range = args.range || 'A2:Z10000';
    await clearRange(sheetName, range);
    return;
  }

  // Mode: Tạo sheet mới
  if (args.create) {
    await ensureSheetExists(args.create);
    return;
  }

  log('WARN', 'Không nhận được lệnh hợp lệ. Chạy --help để xem hướng dẫn.');
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
║         GOOGLE SHEETS WRITER - PARSCA Vendor Kit             ║
║   Ghi test case / kết quả test automation lên Google Sheets  ║
╚══════════════════════════════════════════════════════════════╝

Cách sử dụng (từ kit-test-parsca/):
  node scripts/integrations/google_sheet/sheet_writer.js [options]

Options:
  --excel <FILE|DIR>    Upload file Excel (.xlsx/.xls) hoặc cả thư mục lên Google Sheet
  --sheet <NAME>        Tên sheet đích (với --excel: mặc định = tên file)
  --sheet-index <N>     Index tab Excel cần đọc (0 = tab đầu tiên, default: 0)
  --no-clear            Giữ lại data cũ, chỉ ghi đè từ A1 (default: xóa trước)
  --flat                Thay xuống dòng trong cell bằng " | " (default: giữ xuống dòng)
  --results <FILE>      Import Playwright JSON report lên Sheets
  --clear-first         Xóa data cũ trước khi ghi (dùng với --results)
  --append <SHEET>      Append JSON data vào sheet chỉ định
  --data <JSON>         Dữ liệu JSON array để append (dùng với --append)
  --clear <SHEET>       Xóa dữ liệu trong sheet (giữ row 1 - header)
  --range <A1_RANGE>    Range cần xóa (dùng với --clear, default: A2:Z10000)
  --create <NAME>       Tạo sheet mới với tên chỉ định
  --help                Hiển thị hướng dẫn này

Ví dụ:
  # Upload test case Excel (sinh bởi scripts/convert_excel/md_to_xlsx.js)
  node scripts/integrations/google_sheet/sheet_writer.js --excel practices/testcases/vendor/TC_PARSCA_VENDOR_05_IMPORT_CSV.xlsx
  node scripts/integrations/google_sheet/sheet_writer.js --excel practices/testcases/vendor
  node scripts/integrations/google_sheet/sheet_writer.js --excel practices/testcases/api/API_TC_PARSCA_VENDOR.xlsx --sheet "API_TC"

  # Import kết quả Playwright
  node scripts/integrations/google_sheet/sheet_writer.js --results ./test-results/results.json
  node scripts/integrations/google_sheet/sheet_writer.js --results ./test-results/results.json --sheet "Smoke 2026-10-20" --clear-first

  # Append / xóa / tạo sheet
  node scripts/integrations/google_sheet/sheet_writer.js --append "Bug Log" --data '[{"TC ID":"PARSCA_SCOPE_TC_003","Status":"FAIL"}]'
  node scripts/integrations/google_sheet/sheet_writer.js --clear "PARSCA Vendor Results"
  node scripts/integrations/google_sheet/sheet_writer.js --create "Regression Sprint 2"

Cấu trúc sheet kết quả:
  | ${RESULT_HEADERS.join(' | ')} |

Màu sắc tự động (cột Status):
  🟢 PASS      🔴 FAIL      🟡 SKIP
  🔵 OBSERVED  (@CodeHienTai — chờ PO, không tính PASS)
  ⚫ BLOCKED   (annotation "blocked" — thiếu môi trường / dữ liệu / quyền)
  `);
}

// Export để dùng như module
module.exports = {
  ensureSheetExists,
  clearRange,
  appendRows,
  appendRowsDetailed,
  writeHeaders,
  writeRange,
  importPlaywrightResults,
  convertPlaywrightReport,
  importExcel,
};

if (require.main === module) {
  main().catch((err) => {
    log('ERROR', `Unexpected error: ${err.message}`);
    process.exit(1);
  });
}
