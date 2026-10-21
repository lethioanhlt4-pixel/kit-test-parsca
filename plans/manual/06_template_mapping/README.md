# Bước 6: Chuẩn hóa Format (Template Mapping) — PARSCA Vendor

---

## Mục đích

Đóng gói toàn bộ Test Cases ở Bước 5 sang bảng Markdown chuẩn của kit (9 field + 3 cột Automation Metadata), lưu thành `practices/testcases/vendor/TC_PARSCA_VENDOR_<MOD>.md`, sẵn sàng convert **Excel** hoặc import **Jira / Xray / TestRail**.

## Cách sử dụng

1. Gửi file `prompt.txt` sau khi đã review test cases ở Bước 5.
2. AI xuất bảng Markdown:
   ```
   | TC ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
   ```
3. Lưu file vào `practices/testcases/vendor/` → convert Excel:
   ```bash
   node scripts/convert_excel/md_to_xlsx.js practices/testcases/vendor/TC_PARSCA_VENDOR_<MOD>.md
   ```
   (Chạy từ thư mục `kit-test-parsca/`; cần `npm install` trong `kit-test-parsca/scripts/convert_excel` lần đầu.)

## Quy tắc TC ID

Format: `PARSCA_<MOD>_TC_<NNN>` — VD: `PARSCA_SCOPE_TC_003`, `PARSCA_CSV_TC_012`.
TC API: `API_<GROUP>_TC_<NNN>` — VD: `API_PERM_TC_001`.

Mã `<MOD>` bắt buộc thuộc: ROLE, LOGIN, SESS, SCOPE, PLIST, PDTL, PSTAT, PFORM, IMG, CSV, DASH, ORD, ORDD, REV, SET, PAY, PROF, WEB.

## Quy ước giá trị cột

| Cột | Giá trị |
|-----|---------|
| Module | `M<n>: <MOD>` (VD `M10: CSV`) |
| Risk Level | `🔴 High` / `🟡 Medium` / `🟢 Low` |
| Priority | Critical / High / Medium / Low |
| Automatable | Yes / Partial / No |
| Auto Type | UI / API / E2E / N/A |
| Tags | `@Smoke @Regression @Security @DataScope @Boundary @CodeHienTai @SuyLuan @GiaLap @NeedDevSupport` |

## Xử lý khi quá dài

Nếu tổng số TC > 30, AI chia thành **Part 1, Part 2...** và hỏi trước khi tiếp tục:
- Không bỏ sót TC giữa các phần
- Số thứ tự TC ID liên tục giữa các phần
- Không dùng ký tự `|` bên trong ô (làm vỡ bảng và converter)
