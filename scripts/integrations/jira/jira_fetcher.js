/**
 * Jira Fetcher (PARSCA Vendor) - Lấy Requirement / User Story / Issue từ Jira
 *
 * Hỗ trợ:
 *   - Jira Cloud (API Token + Email)
 *   - Jira Server / Data Center (Personal Access Token)
 *
 * Khác bản gốc:
 *   - Output mặc định: kit-test-parsca/practices/requirements/jira/<KEY>/ (cùng chỗ với Jira mẫu PVEN-*)
 *   - Requirement markdown có thêm dòng "Epic" và mục "Tài liệu PARSCA liên quan"
 *     (tự nhận diện module từ mã AC-<MOD>-NN / labels / components → doc BA, requirements, testcase)
 *   - Overview của Epic có thêm bảng "Liên kết test"
 *   - --project không truyền giá trị → dùng JIRA_PROJECT_KEY trong .env (VD: PVEN)
 *
 * Sử dụng (chạy từ kit-test-parsca/):
 *   node scripts/integrations/jira/jira_fetcher.js --issue PVEN-3 --format md
 *   node scripts/integrations/jira/jira_fetcher.js --epic PVEN-1 --format md --attachments
 *   node scripts/integrations/jira/jira_fetcher.js --project PVEN --type Story
 *   node scripts/integrations/jira/jira_fetcher.js --jql "project = PVEN AND labels = csv"
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');
const {
  loadEnv,
  validateEnvVars,
  buildJiraHeaders,
  formatIssue,
  adfToPlainText,
  saveJsonToFile,
  saveTextToFile,
  getTimestamp,
  log,
} = require('./utils');
const {
  KIT_ROOT,
  PATHS,
  BASE_DOCS,
  detectModules,
  modulesToMarkdownTable,
  resolveDocsDir,
} = require('../../common/parsca_catalog');

let JIRA_BASE_URL;

const DEFAULT_OUTPUT_DIR = path.join(KIT_ROOT, PATHS.jira);

function initEnv() {
  loadEnv();
  validateEnvVars(['JIRA_BASE_URL']);
  JIRA_BASE_URL = process.env.JIRA_BASE_URL.replace(/\/+$/, '');
}

/**
 * Lấy một issue cụ thể theo key
 * @param {string} issueKey - VD: "PVEN-3"
 * @returns {object} Issue data
 */
async function fetchIssue(issueKey) {
  const url = `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}`;
  log('LOG', `Đang lấy issue: ${issueKey} ...`);

  try {
    const response = await axios.get(url, {
      headers: buildJiraHeaders(),
      params: {
        expand: 'renderedFields',
      },
    });
    log('LOG', `Đã lấy thành công: ${issueKey}`);
    return response.data;
  } catch (error) {
    handleApiError(error, `Lấy issue ${issueKey}`);
    return null;
  }
}

/**
 * Tìm kiếm issues bằng JQL
 * @param {string} jql - JQL query string
 * @param {number} maxResults - Số kết quả tối đa (default: 50)
 * @returns {object[]} Danh sách issues
 */
async function searchIssues(jql, maxResults = 50) {
  const url = `${JIRA_BASE_URL}/rest/api/3/search/jql`;
  log('LOG', `Đang tìm kiếm với JQL: ${jql}`);

  try {
    const allIssues = [];
    let nextPageToken = null;

    while (true) {
      const params = {
        jql,
        maxResults: Math.min(maxResults - allIssues.length, 50),
        fields: 'summary,status,priority,issuetype,assignee,reporter,created,updated,labels,components,description,attachment,parent,customfield_10014,customfield_10020,customfield_10028',
      };
      if (nextPageToken) {
        params.nextPageToken = nextPageToken;
      }

      const response = await axios.get(url, {
        headers: buildJiraHeaders(),
        params,
      });

      const data = response.data;
      allIssues.push(...data.issues);

      log('LOG', `Đã lấy ${allIssues.length} issues`);

      if (data.isLast || !data.nextPageToken || allIssues.length >= maxResults) {
        break;
      }
      nextPageToken = data.nextPageToken;
    }

    return allIssues;
  } catch (error) {
    handleApiError(error, 'Tìm kiếm JQL');
    return [];
  }
}

/**
 * Lấy tất cả issues của một project theo type
 * @param {string} projectKey - VD: "PVEN"
 * @param {string} issueType - VD: "Story", "Bug", "Task", "Epic"
 * @param {number} maxResults
 * @returns {object[]}
 */
async function fetchProjectIssues(projectKey, issueType = 'Story', maxResults = 100) {
  const jql = `project = "${projectKey}" AND issuetype = "${issueType}" ORDER BY created DESC`;
  return searchIssues(jql, maxResults);
}

/**
 * Lấy tất cả children (Story/Task/Bug) của một Epic
 * Hỗ trợ cả Jira Cloud next-gen (parent) và classic (Epic Link)
 * @param {string} epicKey - VD: "PVEN-1"
 * @returns {object[]}
 */
async function fetchEpicChildren(epicKey) {
  // Jira Cloud next-gen project dùng "parent" field
  const jqlParent = `parent = "${epicKey}" ORDER BY rank ASC`;
  let results = await searchIssues(jqlParent, 200);

  // Fallback: Jira classic project dùng "Epic Link"
  if (results.length === 0) {
    log('LOG', 'Thử lại với "Epic Link" (classic project)...');
    const jqlEpicLink = `"Epic Link" = "${epicKey}" ORDER BY rank ASC`;
    results = await searchIssues(jqlEpicLink, 200);
  }

  return results;
}

/**
 * Lấy comments của một issue
 * @param {string} issueKey
 * @returns {object[]}
 */
async function fetchComments(issueKey) {
  const url = `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/comment`;
  log('LOG', `Đang lấy comments của: ${issueKey} ...`);

  try {
    const response = await axios.get(url, {
      headers: buildJiraHeaders(),
    });
    return response.data.comments || [];
  } catch (error) {
    handleApiError(error, `Lấy comments ${issueKey}`);
    return [];
  }
}

/**
 * Download tất cả attachments của một issue
 * @param {object} rawIssue - Raw issue data từ Jira API
 * @param {string} outputDir - Thư mục lưu file
 * @returns {object[]} Danh sách file đã tải
 */
async function downloadAttachments(rawIssue, outputDir) {
  const attachments = rawIssue.fields?.attachment || [];
  if (attachments.length === 0) {
    log('LOG', `${rawIssue.key}: Không có attachment`);
    return [];
  }

  const issueDir = path.join(outputDir, rawIssue.key);
  if (!fs.existsSync(issueDir)) {
    fs.mkdirSync(issueDir, { recursive: true });
  }

  const downloaded = [];
  for (const att of attachments) {
    const filePath = path.join(issueDir, att.filename);
    try {
      log('LOG', `Đang tải: ${att.filename} (${(att.size / 1024).toFixed(1)} KB)`);
      const response = await axios.get(att.content, {
        headers: buildJiraHeaders(),
        responseType: 'arraybuffer',
      });
      fs.writeFileSync(filePath, response.data);
      downloaded.push({
        filename: att.filename,
        path: filePath,
        size: att.size,
        mimeType: att.mimeType,
      });
      log('LOG', `Đã tải: ${att.filename}`);
    } catch (error) {
      log('ERROR', `Không tải được ${att.filename}: ${error.message}`);
    }
  }

  log('LOG', `${rawIssue.key}: Đã tải ${downloaded.length}/${attachments.length} attachments`);
  return downloaded;
}

/**
 * Lấy danh sách attachment metadata từ issue (không download)
 * @param {object} rawIssue - Raw issue data
 * @returns {object[]} Danh sách attachment info
 */
function getAttachmentList(rawIssue) {
  return (rawIssue.fields?.attachment || []).map((att) => ({
    id: att.id,
    filename: att.filename,
    mimeType: att.mimeType,
    size: att.size,
    created: att.created,
    author: att.author?.displayName || '',
    downloadUrl: att.content,
  }));
}

/**
 * Nhận diện module PARSCA liên quan tới issue
 * @param {object} rawIssue
 * @returns {object[]} Module trong catalog (M1–M18)
 */
function detectIssueModules(rawIssue) {
  const issue = formatIssue(rawIssue);
  const descText = adfToPlainText(rawIssue.fields?.description);
  const acText = issue.acceptanceCriteria ? adfToPlainText(issue.acceptanceCriteria) : '';
  return detectModules({
    text: `${descText}\n${acText}`,
    labels: issue.labels,
    components: issue.components,
    summary: issue.summary,
  });
}

/**
 * Chuyển issue thành Requirement Document (Markdown) — format giống Jira mẫu PVEN-*
 * @param {object} rawIssue - Raw issue data từ Jira API
 * @param {string} [attachmentDir] - Thư mục chứa attachments (để tạo link)
 * @returns {string} Markdown content
 */
function issueToRequirementMarkdown(rawIssue, attachmentDir) {
  const issue = formatIssue(rawIssue);
  const descText = adfToPlainText(rawIssue.fields?.description);
  const attachments = getAttachmentList(rawIssue);
  const modules = detectIssueModules(rawIssue);

  let md = '';
  md += `# ${issue.key}: ${issue.summary}\n\n`;
  md += `| Thuộc tính | Giá trị |\n`;
  md += `|---|---|\n`;
  md += `| **Issue Key** | ${issue.key} |\n`;
  md += `| **Loại** | ${issue.issueType} |\n`;
  md += `| **Trạng thái** | ${issue.status} |\n`;
  md += `| **Độ ưu tiên** | ${issue.priority} |\n`;
  md += `| **Người giao** | ${issue.assignee} |\n`;
  md += `| **Người báo** | ${issue.reporter} |\n`;
  md += `| **Labels** | ${issue.labels.join(', ') || 'N/A'} |\n`;
  md += `| **Components** | ${issue.components.join(', ') || 'N/A'} |\n`;
  if (issue.epic) {
    md += `| **Epic** | ${issue.epic} |\n`;
  }
  md += `| **Attachments** | ${attachments.length > 0 ? attachments.length + ' file(s)' : 'N/A'} |\n`;
  md += `| **Ngày tạo** | ${issue.created} |\n`;
  md += `| **Cập nhật** | ${issue.updated} |\n`;
  md += `\n## Mô tả (Description)\n\n`;
  md += descText || '_Không có mô tả_';
  md += '\n';

  if (issue.acceptanceCriteria) {
    const acText = adfToPlainText(issue.acceptanceCriteria);
    md += `\n## Tiêu chí chấp nhận (Acceptance Criteria)\n\n`;
    md += acText || '_Không có_';
    md += '\n';
  }

  if (attachments.length > 0) {
    md += `\n## Attachments (${attachments.length} file)\n\n`;
    md += `| # | Filename | Type | Size |\n`;
    md += `|---|----------|------|------|\n`;
    attachments.forEach((att, i) => {
      const sizeStr = att.size < 1024
        ? `${att.size} B`
        : att.size < 1024 * 1024
          ? `${(att.size / 1024).toFixed(1)} KB`
          : `${(att.size / (1024 * 1024)).toFixed(1)} MB`;
      const relPath = attachmentDir === 'same-folder'
        ? att.filename
        : attachmentDir ? `${issue.key}/${att.filename}` : '';
      const nameCell = relPath ? `[${att.filename}](${relPath})` : att.filename;
      const isImage = att.mimeType.startsWith('image/');
      const imageEmbed = (isImage && relPath) ? `<br>![${att.filename}](${relPath})` : '';
      md += `| ${i + 1} | ${nameCell} | ${att.mimeType} | ${sizeStr} |${imageEmbed ? ' ' + imageEmbed : ''}\n`;
    });
  }

  // Liên kết sang tài liệu PARSCA để /gen-testcase đọc kèm
  const docsDir = resolveDocsDir();
  md += `\n## Tài liệu PARSCA liên quan\n\n`;
  md += `> Doc nền (đọc trước): ${BASE_DOCS.map((d) => `\`${docsDir}/${d}\``).join(', ')}\n\n`;
  if (modules.length > 0) {
    md += modulesToMarkdownTable(modules);
    if (modules.some((m) => m.simulated)) {
      md += `\n> ⚠️ Có module **[GIẢ LẬP]**: không ghi bug cho việc không lưu / không gọi API (doc README, mục 5).\n`;
    }
  } else {
    md += `_Chưa nhận diện được module — thêm mã AC-<MOD>-NN vào AC hoặc label (VD: csv, login, payout) rồi lấy lại._\n`;
  }

  return md;
}

/**
 * Tạo overview cho Epic / project — format giống practices/requirements/jira/PVEN-1/PVEN-1_overview.md
 * @param {string} ticketKey
 * @param {object[]} results - Raw issues
 * @returns {string}
 */
function buildOverviewMarkdown(ticketKey, results) {
  let overview = `# ${ticketKey} — Tổng quan\n\n`;
  overview += `> Tổng số issues: ${results.length} | Ngày lấy: ${new Date().toISOString()}\n\n`;
  overview += `| # | Key | Type | Status | Summary | Attachments |\n`;
  overview += `|---|-----|------|--------|---------|-------------|\n`;
  results.forEach((r, i) => {
    const f = formatIssue(r);
    const attCount = (r.fields?.attachment || []).length;
    const attInfo = attCount > 0 ? `📎 ${attCount}` : '—';
    overview += `| ${i + 1} | [${f.key}](./${f.key}/${f.key}_requirement.md) | ${f.issueType} | ${f.status} | ${f.summary} | ${attInfo} |\n`;
  });

  overview += `\n## Liên kết test\n\n`;
  overview += `| Story | Module | Testcase manual |\n`;
  overview += `|-------|--------|-----------------|\n`;
  results.forEach((r) => {
    const modules = detectIssueModules(r);
    const modCell = modules.length > 0 ? modules.map((m) => m.code).join(', ') : '—';
    const tcFiles = [...new Set(modules.map((m) => `\`${PATHS.manualTestcases}/${m.testcase}\``))];
    overview += `| ${r.key} | ${modCell} | ${tcFiles.join('<br>') || '—'} |\n`;
  });

  return overview;
}

/**
 * Xử lý lỗi từ Jira API
 */
function handleApiError(error, context) {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    log('ERROR', `[${context}] HTTP ${status}`);
    if (status === 401) {
      log('ERROR', 'Lỗi xác thực. Kiểm tra JIRA_EMAIL + JIRA_API_TOKEN hoặc JIRA_PAT.');
    } else if (status === 403) {
      log('ERROR', 'Không có quyền truy cập. Kiểm tra permission trên Jira project.');
    } else if (status === 404) {
      log('ERROR', 'Không tìm thấy resource. Kiểm tra JIRA_BASE_URL và issue key.');
    } else {
      log('ERROR', `Response: ${JSON.stringify(data)}`);
    }
  } else {
    log('ERROR', `[${context}] ${error.message}`);
  }
}

// ============ CLI ============

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || Object.keys(args).length === 0) {
    printUsage();
    return;
  }

  // Load env chỉ khi thực sự cần gọi API
  initEnv();

  // --project không có giá trị → lấy JIRA_PROJECT_KEY
  if (args.project === true) {
    args.project = process.env.JIRA_PROJECT_KEY;
    if (!args.project) {
      log('ERROR', 'Cần --project <KEY> hoặc JIRA_PROJECT_KEY trong .env');
      return;
    }
  }

  let results = [];
  let mode = 'unknown';

  // Mode 1: Lấy 1 issue cụ thể
  if (args.issue) {
    mode = 'single';
    const raw = await fetchIssue(args.issue);
    if (raw) results.push(raw);
  }
  // Mode 2: Tìm theo JQL tùy chỉnh
  else if (args.jql) {
    mode = 'jql';
    results = await searchIssues(args.jql, parseInt(args.max) || 50);
  }
  // Mode 3: Lấy issues theo project + type
  else if (args.project) {
    mode = 'project';
    const type = args.type || 'Story';
    results = await fetchProjectIssues(args.project, type, parseInt(args.max) || 100);
  }
  // Mode 4: Lấy children của Epic
  else if (args.epic) {
    mode = 'epic';
    results = await fetchEpicChildren(args.epic);
  }

  if (results.length === 0) {
    log('WARN', 'Không có kết quả nào.');
    return;
  }

  log('LOG', `Tổng số issues: ${results.length}`);

  // Xác định thư mục output gốc (mặc định: practices/requirements/jira)
  const baseOutputDir = args.output ? path.resolve(process.cwd(), args.output) : DEFAULT_OUTPUT_DIR;

  // Xác định ticket key cho tên thư mục
  let ticketKey;
  if (args.epic) {
    ticketKey = args.epic;
  } else if (args.issue) {
    ticketKey = args.issue;
  } else if (args.project) {
    const type = args.type || 'Story';
    ticketKey = `${args.project}_${type}`;
  } else {
    ticketKey = `jql_${getTimestamp()}`;
  }

  // Tạo thư mục theo ticket key
  const ticketDir = path.join(baseOutputDir, ticketKey);
  if (!fs.existsSync(ticketDir)) {
    fs.mkdirSync(ticketDir, { recursive: true });
  }

  // Download attachments vào thư mục từng issue (--issue: chính là ticketDir)
  if (args.attachments) {
    const attachmentRoot = mode === 'single' ? baseOutputDir : ticketDir;
    for (const issue of results) {
      await downloadAttachments(issue, attachmentRoot);
    }
  }

  if (args.format === 'md' || args.format === 'markdown') {
    const hasAttachments = !!args.attachments;

    // Xuất file MD riêng cho từng issue
    for (const rawIssue of results) {
      const issueKey = rawIssue.key;
      // --issue: ghi thẳng vào <KEY>/<KEY>_requirement.md (tránh lồng <KEY>/<KEY>/)
      const issueDir = mode === 'single' ? ticketDir : path.join(ticketDir, issueKey);
      if (!fs.existsSync(issueDir)) {
        fs.mkdirSync(issueDir, { recursive: true });
      }

      // Markdown trỏ attachment cùng folder (relative path = filename)
      const mdContent = issueToRequirementMarkdown(rawIssue, hasAttachments ? 'same-folder' : null);
      const mdFile = path.join(issueDir, `${issueKey}_requirement.md`);
      saveTextToFile(mdFile, mdContent);
    }

    // Tạo file overview cho epic/project (danh sách tổng hợp + liên kết test)
    if (results.length > 1) {
      const overviewFile = path.join(ticketDir, `${ticketKey}_overview.md`);
      saveTextToFile(overviewFile, buildOverviewMarkdown(ticketKey, results));
    }
  } else {
    // Xuất JSON — file tổng hợp (kèm module PARSCA nhận diện được)
    const formatted = results.map((r) => {
      const f = formatIssue(r);
      f.attachments = getAttachmentList(r);
      f.parscaModules = detectIssueModules(r).map((m) => m.code);
      return f;
    });

    const jsonFile = path.join(ticketDir, `${ticketKey}_issues.json`);
    saveJsonToFile(jsonFile, {
      fetchedAt: new Date().toISOString(),
      mode,
      ticketKey,
      total: formatted.length,
      issues: formatted,
    });

    // In ra tóm tắt
    console.log('\n--- Tóm tắt kết quả ---');
    formatted.forEach((issue) => {
      const attCount = issue.attachments?.length || 0;
      const attInfo = attCount > 0 ? ` | 📎 ${attCount} files` : '';
      const modInfo = issue.parscaModules.length > 0 ? ` | ${issue.parscaModules.join(',')}` : '';
      console.log(`  ${issue.key} | ${issue.issueType} | ${issue.status} | ${issue.summary}${attInfo}${modInfo}`);
    });
  }

  log('LOG', `Output: ${ticketDir}`);
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
║            JIRA FETCHER - PARSCA Vendor Kit                  ║
║     Lấy Requirement / User Story / Issue từ Jira             ║
╚══════════════════════════════════════════════════════════════╝

Cách sử dụng (từ kit-test-parsca/):
  node scripts/integrations/jira/jira_fetcher.js [options]

Options:
  --issue <KEY>       Lấy 1 issue cụ thể (VD: PVEN-3)
  --jql <QUERY>       Tìm bằng JQL query
  --project [KEY]     Lấy issues theo project key (bỏ trống = JIRA_PROJECT_KEY)
  --epic <KEY>        Lấy children issues của Epic (VD: PVEN-1)
  --type <TYPE>       Loại issue (Story, Bug, Task, Epic) - default: Story
  --max <NUMBER>      Số kết quả tối đa - default: 50
  --format <FMT>      Định dạng output: json (default) hoặc md
  --attachments       Tải kèm file đính kèm (lưu cùng folder issue)
  --output <DIR>      Thư mục lưu file output - default: practices/requirements/jira
  --help              Hiển thị hướng dẫn này

Ví dụ:
  node scripts/integrations/jira/jira_fetcher.js --issue PVEN-3 --format md
  node scripts/integrations/jira/jira_fetcher.js --epic PVEN-1 --format md
  node scripts/integrations/jira/jira_fetcher.js --epic PVEN-10 --format md --attachments
  node scripts/integrations/jira/jira_fetcher.js --project --type Bug --max 20
  node scripts/integrations/jira/jira_fetcher.js --jql "project = PVEN AND labels = csv"
  `);
}

// Export cho việc sử dụng như module
module.exports = {
  fetchIssue,
  searchIssues,
  fetchProjectIssues,
  fetchEpicChildren,
  fetchComments,
  downloadAttachments,
  getAttachmentList,
  detectIssueModules,
  issueToRequirementMarkdown,
  buildOverviewMarkdown,
};

// Chạy CLI khi gọi trực tiếp
if (require.main === module) {
  main().catch((err) => {
    log('ERROR', `Unexpected error: ${err.message}`);
    process.exit(1);
  });
}
