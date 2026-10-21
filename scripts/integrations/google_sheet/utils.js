/**
 * Google Sheets Integration - Utility Functions (PARSCA Vendor)
 * Các hàm xử lý chung cho việc tích hợp Google Sheets của kit-test-parsca
 */

const fs = require('fs');
const path = require('path');

/** Lazy-load googleapis (nặng) — chỉ nạp khi thật sự gọi Google API */
function getGoogle() {
  return require('googleapis').google;
}

let cachedSheetsClient = null;

/**
 * Cấu trúc sheet kết quả test PARSCA (thứ tự cột cố định)
 * Status: PASS | FAIL | OBSERVED | BLOCKED | SKIP (practices/README.md "Cách ghi kết quả")
 */
const RESULT_HEADERS = [
  'TC ID', 'Module', 'Title', 'Status', 'Duration (ms)',
  'Error', 'Tags', 'File', 'Run At', 'Retries', 'Doc',
];
const RESULT_STATUS_COL = RESULT_HEADERS.indexOf('Status');

/** Màu nền cột Status */
const STATUS_COLORS = {
  PASS: { red: 0.149, green: 0.800, blue: 0.376 },     // #26CC60 - xanh lá
  FAIL: { red: 0.918, green: 0.263, blue: 0.208 },     // #EA4335 - đỏ
  SKIP: { red: 1.0, green: 0.757, blue: 0.027 },       // #FFC107 - vàng
  OBSERVED: { red: 0.259, green: 0.522, blue: 0.957 }, // #4285F4 - xanh dương (chờ PO)
  BLOCKED: { red: 0.459, green: 0.459, blue: 0.459 },  // #757575 - xám
};

/**
 * Load biến môi trường từ file .env
 * File .env nằm cùng thư mục kit-test-parsca/scripts/integrations/google_sheet/
 */
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error(`[ERROR] File .env không tồn tại tại: ${envPath}`);
    console.error('Hãy copy .env.example thành .env và điền thông tin.');
    process.exit(1);
  }
  require('dotenv').config({ path: envPath });
}

/**
 * Validate các biến môi trường bắt buộc
 * @param {string[]} requiredVars - Danh sách tên biến cần kiểm tra
 */
function validateEnvVars(requiredVars) {
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(`[ERROR] Thiếu biến môi trường: ${missing.join(', ')}`);
    console.error('Hãy kiểm tra file .env và bổ sung đầy đủ.');
    process.exit(1);
  }
}

/**
 * Tạo Google Auth client từ Service Account hoặc API Key
 * @returns {object} auth client hoặc apiKey string
 */
function buildGoogleAuth() {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (keyPath) {
    const resolvedPath = path.resolve(__dirname, keyPath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`[ERROR] Không tìm thấy file Service Account key: ${resolvedPath}`);
      console.error('Hãy tải file JSON credentials từ Google Cloud Console.');
      process.exit(1);
    }
    const auth = new (getGoogle().auth.GoogleAuth)({
      keyFile: resolvedPath,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly',
      ],
    });
    return { type: 'serviceAccount', auth };
  }

  if (apiKey) {
    return { type: 'apiKey', apiKey };
  }

  console.error('[ERROR] Thiếu thông tin xác thực Google.');
  console.error('Cần GOOGLE_SERVICE_ACCOUNT_KEY_PATH (Service Account) hoặc GOOGLE_API_KEY (chỉ read-only).');
  process.exit(1);
}

/**
 * Tạo Google Sheets API client (cache trong 1 lần chạy)
 * @returns {object} sheets API client
 */
async function buildSheetsClient() {
  if (cachedSheetsClient) return cachedSheetsClient;

  const google = getGoogle();
  const authInfo = buildGoogleAuth();

  if (authInfo.type === 'serviceAccount') {
    const authClient = await authInfo.auth.getClient();
    cachedSheetsClient = google.sheets({ version: 'v4', auth: authClient });
  } else if (authInfo.type === 'apiKey') {
    cachedSheetsClient = google.sheets({ version: 'v4', auth: authInfo.apiKey });
  }

  return cachedSheetsClient;
}

/**
 * Chuyển đổi dữ liệu dạng rows (mảng 2D từ Sheets API) sang mảng objects
 * Row đầu tiên là header, các row sau là data
 * @param {string[][]} rows - Dữ liệu thô từ Sheets API
 * @returns {object[]} Mảng objects với key là tên cột
 */
function rowsToObjects(rows) {
  if (!rows || rows.length === 0) return [];

  const headers = rows[0].map((h) => String(h).trim());
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Bỏ qua row trống hoàn toàn
    if (!row || row.every((cell) => !cell)) continue;

    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = row[idx] !== undefined ? String(row[idx]) : '';
    });
    data.push(obj);
  }

  return data;
}

/**
 * Chuyển đổi mảng objects sang rows (mảng 2D) để ghi lên Sheets
 * @param {object[]} objects - Mảng dữ liệu
 * @param {string[]} [columns] - Danh sách cột theo thứ tự (nếu không truyền sẽ lấy từ keys)
 * @returns {{ headers: string[], rows: string[][] }}
 */
function objectsToRows(objects, columns) {
  if (!objects || objects.length === 0) return { headers: [], rows: [] };

  const headers = columns || Object.keys(objects[0]);
  const rows = objects.map((obj) => headers.map((h) => {
    const val = obj[h];
    if (val === null || val === undefined) return '';
    return String(val);
  }));

  return { headers, rows };
}

/**
 * Tính toán range A1 Notation cho một sheet
 * @param {string} sheetName - Tên sheet (tab)
 * @param {string} [range] - Range VD: "A1:Z100" (tuỳ chọn)
 * @returns {string} Full range string VD: "Sheet1!A1:Z100"
 */
function buildRange(sheetName, range) {
  // Luôn bọc nháy đơn (escape ' → '') để an toàn với tên có khoảng trắng / ký tự đặc biệt
  const escapedName = `'${String(sheetName).replace(/'/g, "''")}'`;
  return range ? `${escapedName}!${range}` : escapedName;
}

/**
 * Format kết quả test thành row để ghi lên Sheets (theo RESULT_HEADERS)
 * @param {object} testResult - Kết quả test
 * @returns {string[]} Row values
 */
function formatTestResultRow(testResult) {
  const now = new Date();
  const timezone = process.env.TIMEZONE || 'Asia/Ho_Chi_Minh';
  const timestamp = now.toLocaleString('vi-VN', { timeZone: timezone });

  return [
    testResult.tcId || '',
    testResult.module || '',
    testResult.title || '',
    testResult.status || '',          // PASS | FAIL | OBSERVED | BLOCKED | SKIP
    testResult.duration || '',        // ms
    testResult.error || '',
    testResult.tags || '',
    testResult.file || '',
    timestamp,
    testResult.retries || '0',
    testResult.doc || '',
  ];
}

/**
 * Đọc file JSON
 * @param {string} filePath - Đường dẫn file
 * @returns {object|null}
 */
function readJsonFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[ERROR] Không đọc được file: ${filePath}`, err.message);
    return null;
  }
}

/**
 * Lưu dữ liệu JSON ra file
 * @param {string} filePath
 * @param {object} data
 */
function saveJsonToFile(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[OK] Đã lưu file: ${filePath}`);
}

/**
 * Lưu nội dung text ra file
 * @param {string} filePath
 * @param {string} content
 */
function saveTextToFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`[OK] Đã lưu file: ${filePath}`);
}

/**
 * Tạo timestamp string dạng YYYYMMDD_HHmmss
 * @returns {string}
 */
function getTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

/**
 * Log message với prefix timestamp
 * @param {string} level - LOG | WARN | ERROR
 * @param {string} message
 */
function log(level, message) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level}]`;
  if (level === 'ERROR') {
    console.error(`${prefix} ${message}`);
  } else if (level === 'WARN') {
    console.warn(`${prefix} ${message}`);
  } else {
    console.log(`${prefix} ${message}`);
  }
}

/**
 * Xử lý lỗi từ Google Sheets API
 * @param {Error} error
 * @param {string} context
 */
function handleApiError(error, context) {
  const status = error?.response?.status || error?.code;
  const message = error?.response?.data?.error?.message || error?.message;

  log('ERROR', `[${context}] ${status ? `HTTP ${status}: ` : ''}${message}`);

  if (status === 401 || status === 403) {
    log('ERROR', 'Lỗi xác thực. Kiểm tra Service Account có quyền truy cập vào Spreadsheet.');
    log('ERROR', 'Đảm bảo đã share Spreadsheet cho email của Service Account.');
  } else if (status === 404) {
    log('ERROR', 'Không tìm thấy Spreadsheet. Kiểm tra GOOGLE_SPREADSHEET_ID trong .env.');
  } else if (String(message).includes('Unable to parse range')) {
    log('ERROR', 'Range không hợp lệ. Kiểm tra tên Sheet và định dạng range (VD: Sheet1!A1:Z100).');
  }
}

/**
 * Chuyển đổi chỉ số cột (0-indexed) sang ký hiệu A1 (A, B, ... Z, AA, AB, ...)
 * @param {number} colIndex - 0-indexed
 * @returns {string}
 */
function colIndexToLetter(colIndex) {
  let letter = '';
  let index = colIndex;
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}

module.exports = {
  RESULT_HEADERS,
  RESULT_STATUS_COL,
  STATUS_COLORS,
  loadEnv,
  validateEnvVars,
  buildGoogleAuth,
  buildSheetsClient,
  rowsToObjects,
  objectsToRows,
  buildRange,
  formatTestResultRow,
  readJsonFile,
  saveJsonToFile,
  saveTextToFile,
  getTimestamp,
  log,
  handleApiError,
  colIndexToLetter,
};
