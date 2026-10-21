/**
 * Script: md_to_xlsx.js (PARSCA Vendor)
 * Mô tả:  Convert file Markdown Test Cases của PARSCA sang Excel (.xlsx) có format đẹp.
 *
 * Hỗ trợ 2 loại bảng (tự nhận diện theo header):
 *   - Manual (practices/testcases/vendor/*.md) — 12 cột:
 *       TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result |
 *       Priority | Test Data | Automatable | Auto Type | Tags
 *     → sheet "Test Cases"
 *   - API (practices/testcases/api/*.md) — 6 cột:
 *       TC ID | Scenario | Request | Expected Response | Priority | Testing Technique / Rule
 *     → sheet "API Test Cases"
 *
 * Cách dùng (chạy từ thư mục kit-test-parsca/):
 *   node scripts/convert_excel/md_to_xlsx.js <input.md | thư_mục> [output.xlsx] [--core] [--summary]
 *
 *   --core      Manual chỉ xuất 9 cột chuẩn (bỏ Automatable / Auto Type / Tags) — giống script gốc
 *   --summary   Thêm sheet "Summary" (thống kê theo Module / Risk / Priority / Tags)
 *
 * Yêu cầu: cd scripts/convert_excel && npm install
 */

const fs = require("fs");
const path = require("path");
const { parseTcId, KNOWN_TAGS } = require("../common/parsca_catalog");

let XLSX;
try {
  XLSX = require("xlsx");
} catch {
  console.error("❌ Thiếu thư viện xlsx. Cài đặt bằng lệnh:");
  console.error("   cd scripts/convert_excel && npm install");
  process.exit(1);
}

// ── Cấu hình bảng ──────────────────────────────────────────────────────────

const MANUAL_CORE_HEADERS = [
  "TC ID",
  "Module",
  "Risk Level",
  "Test Title",
  "Pre-Condition",
  "Test Steps",
  "Expected Result",
  "Priority",
  "Test Data",
];

const MANUAL_FULL_HEADERS = [...MANUAL_CORE_HEADERS, "Automatable", "Auto Type", "Tags"];

const API_HEADERS = [
  "TC ID",
  "Scenario",
  "Request",
  "Expected Response",
  "Priority",
  "Testing Technique / Rule",
];

const SHEET_NAMES = {
  manual: "Test Cases",
  api: "API Test Cases",
};

const COLUMN_WIDTHS = {
  "TC ID": 24,
  Module: 14,
  "Risk Level": 12,
  "Test Title": 50,
  "Pre-Condition": 35,
  "Test Steps": 60,
  "Expected Result": 60,
  Priority: 10,
  "Test Data": 40,
  Automatable: 13,
  "Auto Type": 11,
  Tags: 32,
  Scenario: 45,
  Request: 50,
  "Expected Response": 55,
  "Testing Technique / Rule": 32,
};

// ── Helpers ────────────────────────────────────────────────────────────────

/** Remove emoji dùng trong tài liệu PARSCA (risk, giả lập, cảnh báo) */
function stripEmoji(text) {
  return text
    .replace(/[\u{1F534}\u{1F7E0}\u{1F7E1}\u{1F7E2}\u26AA\u2705\u274C\u{1F525}\u26A0]\uFE0F?/gu, "")
    .trim();
}

/** Convert <br> → newline, bỏ backtick / **bold**, unescape \| và bỏ emoji */
function cleanCell(text) {
  let out = String(text || "").replace(/<br\s*\/?>/gi, "\n");
  out = out.replace(/`([^`]*)`/g, "$1"); // inline code markers
  out = out.replace(/\*\*([^*]+)\*\*/g, "$1"); // bold markers
  out = out.replace(/\\\|/g, "|");
  return out
    .split("\n")
    .map((line) => stripEmoji(line))
    .join("\n")
    .trim();
}

/**
 * Tách 1 dòng bảng Markdown thành cells.
 * Không tách tại "\|" (pipe escape) hoặc "|" nằm trong `inline code`.
 */
function splitRow(line) {
  const cells = [];
  let current = "";
  let inCode = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "\\" && line[i + 1] === "|") {
      current += "\\|";
      i++;
      continue;
    }
    if (ch === "`") inCode = !inCode;
    if (ch === "|" && !inCode) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());

  // Bỏ phần trước "|" đầu và sau "|" cuối
  return cells.slice(1, -1);
}

/** Nhận diện loại bảng theo header */
function detectTableType(headers) {
  if (headers.includes("Test Steps")) return "manual";
  if (headers.includes("Request") || headers.includes("Expected Response")) return "api";
  return "other";
}

// ── Parse Markdown tables ──────────────────────────────────────────────────

/**
 * @returns {{ type: string, headers: string[], rows: string[][], section: string }[]}
 */
function parseMdTables(filepath) {
  const content = fs.readFileSync(filepath, "utf-8");
  const lines = content.split(/\r?\n/);

  const tables = [];
  let current = null;
  let awaitingSeparator = false;
  let lastHeading = "";

  for (const line of lines) {
    const stripped = line.trim();

    if (/^#{2,4}\s/.test(stripped)) {
      lastHeading = stripped.replace(/^#+\s*/, "");
    }

    // Header row của bảng test case
    if (stripped.startsWith("|") && /\|\s*TC ID\s*\|/.test(stripped)) {
      if (current && current.rows.length > 0) tables.push(current);
      const headers = splitRow(stripped).map((h) => cleanCell(h));
      current = { type: detectTableType(headers), headers, rows: [], section: lastHeading };
      awaitingSeparator = true;
      continue;
    }

    // Separator row (|---|---|…)
    if (awaitingSeparator && /^\|[\s\-:|]+\|$/.test(stripped)) {
      awaitingSeparator = false;
      continue;
    }

    if (current && stripped.startsWith("|")) {
      const cells = splitRow(stripped);
      if (cells.length > 0) current.rows.push(cells);
    } else if (current && !stripped.startsWith("|")) {
      if (current.rows.length > 0) tables.push(current);
      current = null;
      awaitingSeparator = false;
    }
  }

  if (current && current.rows.length > 0) tables.push(current);
  return tables;
}

// ── Validate (cảnh báo, không chặn xuất file) ──────────────────────────────

function validateTables(tables) {
  const warnings = [];
  const seen = new Set();

  tables.forEach((table) => {
    table.rows.forEach((row) => {
      const id = cleanCell(row[0] || "");
      if (row.length !== table.headers.length) {
        warnings.push(`${id || "(không có TC ID)"}: có ${row.length} cột, header có ${table.headers.length} cột`);
      }
      if (!parseTcId(id)) {
        warnings.push(`${id || "(trống)"}: TC ID không đúng chuẩn PARSCA_<MOD>_TC_NNN / API_<GRP>_TC_NNN`);
      }
      if (seen.has(id)) warnings.push(`${id}: TC ID bị trùng`);
      seen.add(id);
    });
  });

  return warnings;
}

// ── Build Excel ────────────────────────────────────────────────────────────

/**
 * Chuẩn hoá rows theo danh sách header đích (map theo tên cột của bảng markdown)
 */
function buildRows(tables, targetHeaders) {
  const allRows = [];
  for (const table of tables) {
    const indexMap = targetHeaders.map((h) => table.headers.indexOf(h));
    for (const row of table.rows) {
      allRows.push(indexMap.map((idx) => (idx >= 0 ? cleanCell(row[idx] || "") : "")));
    }
  }
  return allRows;
}

function buildSheet(headers, rows) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws["!cols"] = headers.map((h) => ({ wch: COLUMN_WIDTHS[h] || 25 }));
  ws["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", state: "frozen" };
  const lastCol = XLSX.utils.encode_col(headers.length - 1);
  ws["!autofilter"] = { ref: `A1:${lastCol}${rows.length + 1}` };
  return ws;
}

/** Sheet "Summary" — đếm theo Module × Priority, Risk, Automatable, Tags */
function buildSummarySheet(groups) {
  const aoa = [["PARSCA Vendor — Test Case Summary"], [`Generated: ${new Date().toISOString()}`], []];

  for (const group of groups) {
    const { type, headers, rows } = group;
    const col = (name) => headers.indexOf(name);
    const byModule = {};
    const priorities = new Set();

    rows.forEach((r) => {
      const parsed = parseTcId(r[0]);
      const key = type === "manual" ? r[col("Module")] || "N/A" : parsed ? `API ${parsed.code}` : "N/A";
      const prio = r[col("Priority")] || "N/A";
      priorities.add(prio);
      byModule[key] = byModule[key] || { total: 0 };
      byModule[key].total++;
      byModule[key][prio] = (byModule[key][prio] || 0) + 1;
    });

    const order = ["Critical", "High", "Medium", "Low", "P1", "P2", "P3"];
    const rank = (p) => (order.indexOf(p) === -1 ? order.length : order.indexOf(p));
    const prioList = [...priorities].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
    aoa.push([SHEET_NAMES[type] || type]);
    aoa.push(["Module / Nhóm", "Tổng", ...prioList]);
    Object.entries(byModule).forEach(([mod, counts]) => {
      aoa.push([mod, counts.total, ...prioList.map((p) => counts[p] || 0)]);
    });
    aoa.push(["Tổng", rows.length, ...prioList.map((p) => rows.filter((r) => r[col("Priority")] === p).length)]);
    aoa.push([]);

    if (type === "manual") {
      const countBy = (name) =>
        rows.reduce((acc, r) => {
          const v = r[col(name)] || "N/A";
          acc[v] = (acc[v] || 0) + 1;
          return acc;
        }, {});

      [["Risk Level", countBy("Risk Level")]].forEach(([title, counts]) => {
        aoa.push([title, "Số TC"]);
        Object.entries(counts).forEach(([k, v]) => aoa.push([k, v]));
        aoa.push([]);
      });

      if (col("Automatable") >= 0) {
        aoa.push(["Automatable / Auto Type", "Số TC"]);
        const auto = rows.reduce((acc, r) => {
          const k = `${r[col("Automatable")] || "N/A"} / ${r[col("Auto Type")] || "N/A"}`;
          acc[k] = (acc[k] || 0) + 1;
          return acc;
        }, {});
        Object.entries(auto).forEach(([k, v]) => aoa.push([k, v]));
        aoa.push([]);
      }

      if (col("Tags") >= 0) {
        aoa.push(["Tag", "Số TC"]);
        KNOWN_TAGS.forEach((tag) => {
          const n = rows.filter((r) => (r[col("Tags")] || "").split(/\s+/).includes(tag)).length;
          if (n > 0) aoa.push([tag, n]);
        });
        aoa.push([]);
      }
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];
  return ws;
}

/**
 * @returns {{ total: number, sheets: string[] }}
 */
function buildXlsx(tables, outputPath, options = {}) {
  const { core = false, summary = false } = options;
  const wb = XLSX.utils.book_new();
  const groups = [];
  const sheets = [];
  let otherRowCount = 0;

  const manualTables = tables.filter((t) => t.type === "manual");
  const apiTables = tables.filter((t) => t.type === "api");
  const otherTables = tables.filter((t) => t.type === "other");

  if (manualTables.length > 0) {
    const hasExtra = manualTables.some((t) => t.headers.includes("Tags"));
    const headers = core || !hasExtra ? MANUAL_CORE_HEADERS : MANUAL_FULL_HEADERS;
    const rows = buildRows(manualTables, headers);
    XLSX.utils.book_append_sheet(wb, buildSheet(headers, rows), SHEET_NAMES.manual);
    groups.push({ type: "manual", headers, rows });
    sheets.push(`${SHEET_NAMES.manual} (${rows.length} TC × ${headers.length} cột)`);
  }

  if (apiTables.length > 0) {
    const rows = buildRows(apiTables, API_HEADERS);
    XLSX.utils.book_append_sheet(wb, buildSheet(API_HEADERS, rows), SHEET_NAMES.api);
    groups.push({ type: "api", headers: API_HEADERS, rows });
    sheets.push(`${SHEET_NAMES.api} (${rows.length} TC × ${API_HEADERS.length} cột)`);
  }

  if (otherTables.length > 0) {
    // Bảng có cột TC ID nhưng không đúng 2 format chuẩn → giữ nguyên header gốc
    const headers = otherTables[0].headers;
    const rows = buildRows(otherTables, headers);
    otherRowCount = rows.length;
    XLSX.utils.book_append_sheet(wb, buildSheet(headers, rows), "Other");
    sheets.push(`Other (${rows.length} dòng × ${headers.length} cột)`);
  }

  if (summary && groups.length > 0) {
    XLSX.utils.book_append_sheet(wb, buildSummarySheet(groups), "Summary");
    sheets.push("Summary");
  }

  XLSX.writeFile(wb, outputPath);

  const total = groups.reduce((sum, g) => sum + g.rows.length, otherRowCount);
  return { total, sheets };
}

// ── Main ───────────────────────────────────────────────────────────────────

function convertFile(inputPath, outputPath, options) {
  console.log(`📖 Đang đọc: ${inputPath}`);
  const tables = parseMdTables(inputPath);

  if (tables.length === 0) {
    console.warn(`⚠️  Bỏ qua — không tìm thấy bảng có cột "TC ID": ${path.basename(inputPath)}`);
    return 0;
  }

  const totalRows = tables.reduce((sum, t) => sum + t.rows.length, 0);
  const types = [...new Set(tables.map((t) => t.type))].join(", ");
  console.log(`📊 Tìm thấy ${tables.length} bảng (${types}), tổng ${totalRows} test cases`);

  const warnings = validateTables(tables);
  if (warnings.length > 0) {
    console.warn(`⚠️  ${warnings.length} cảnh báo format:`);
    warnings.slice(0, 20).forEach((w) => console.warn(`   - ${w}`));
    if (warnings.length > 20) console.warn(`   … và ${warnings.length - 20} cảnh báo khác`);
  }

  const { total, sheets } = buildXlsx(tables, outputPath, options);
  console.log(`✅ Đã xuất ${total} test cases → ${outputPath}`);
  console.log(`   Sheets: ${sheets.join(" | ")}`);
  return total;
}

function printUsage() {
  console.log(`
Cách dùng (chạy từ kit-test-parsca/):
  node scripts/convert_excel/md_to_xlsx.js <input.md | thư_mục> [output.xlsx] [--core] [--summary]

Options:
  --core      Manual chỉ xuất 9 cột chuẩn (bỏ Automatable / Auto Type / Tags)
  --summary   Thêm sheet "Summary" thống kê theo Module / Risk / Priority / Tags

Ví dụ:
  node scripts/convert_excel/md_to_xlsx.js practices/testcases/vendor/TC_PARSCA_VENDOR_05_IMPORT_CSV.md
  node scripts/convert_excel/md_to_xlsx.js practices/testcases/api/API_TC_PARSCA_VENDOR.md
  node scripts/convert_excel/md_to_xlsx.js practices/testcases/vendor --summary
`);
}

function main() {
  const argv = process.argv.slice(2);
  const flags = new Set(argv.filter((a) => a.startsWith("--")));
  const args = argv.filter((a) => !a.startsWith("--"));
  const options = { core: flags.has("--core"), summary: flags.has("--summary") };

  if (args.length < 1 || flags.has("--help")) {
    printUsage();
    process.exit(args.length < 1 ? 1 : 0);
  }

  const inputPath = path.resolve(args[0]);
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File / thư mục không tồn tại: ${inputPath}`);
    process.exit(1);
  }

  // Chế độ thư mục: convert mọi file .md, output cùng tên cạnh file nguồn
  if (fs.statSync(inputPath).isDirectory()) {
    if (args[1]) {
      console.error("❌ Không hỗ trợ [output.xlsx] khi input là thư mục.");
      process.exit(1);
    }
    const files = fs
      .readdirSync(inputPath)
      .filter((f) => f.toLowerCase().endsWith(".md"))
      .sort();
    let grandTotal = 0;
    let converted = 0;
    for (const f of files) {
      const src = path.join(inputPath, f);
      const count = convertFile(src, src.replace(/\.md$/i, ".xlsx"), options);
      if (count > 0) converted++;
      grandTotal += count;
      console.log("");
    }
    if (converted === 0) {
      console.error("❌ Không có file markdown nào chứa bảng Test Cases.");
      process.exit(1);
    }
    console.log(`🏁 Hoàn tất: ${converted}/${files.length} file, tổng ${grandTotal} test cases`);
    return;
  }

  const outputPath = args[1] ? path.resolve(args[1]) : inputPath.replace(/\.md$/i, ".xlsx");
  const count = convertFile(inputPath, outputPath, options);
  if (count === 0) {
    console.error("❌ Không tìm thấy bảng Test Cases nào trong file markdown.");
    process.exit(1);
  }
}

main();
