# Test Strategy — PARSCA Role Vendor

## Hướng Dẫn Sử Dụng

File này định nghĩa chiến lược kiểm thử cho **role Vendor** của PARSCA. Agent và tester tham khảo file này để hiểu scope, ưu tiên, approach khi chạy test, sinh thêm test cases hoặc automation scripts.

---

## Testing Objectives

- Đảm bảo vendor **chỉ thao tác được dữ liệu của chính mình** (createdBy) ở cả UI và API.
- Đảm bảo **ma trận phân quyền** 4 vai (Không token, User, Vendor, Admin) đúng với tài liệu cho mọi API.
- Đảm bảo vòng đời sản phẩm (tạo → trạng thái → website → xoá) và Import CSV **không làm hỏng dữ liệu** (không nhân đôi, không ghi đè dữ liệu người khác).
- Ghi nhận rõ ràng các hành vi **THEO CODE HIỆN TẠI** để PO quyết định (Q-V2 → Q-V9), không đánh PASS nhầm.
- Đo mức độ hoàn thiện của các màn **[GIẢ LẬP]** và lỗ hổng validation để BA đưa vào yêu cầu.

## Scope of Testing

| Loại Test | Áp dụng | Tool / Framework | Ghi chú |
|-----------|---------|------------------|---------|
| UI Functional Testing (manual) | ✅ | Chrome desktop 1920×1080 | `practices/testcases/vendor/` |
| API Testing | ✅ | Postman / Playwright API | `practices/testcases/api/` — 4 role cho mọi endpoint |
| Security (Access control, IDOR, XSS, open redirect) | ✅ | Postman, DevTools | Tag `@Security`, `@DataScope` |
| Cross-module E2E | ✅ | Manual + Pairwise | `plans/cross-module/` |
| Integration (cache, storage ảnh) | ✅ | Manual + hỗ trợ Dev | Tag `@NeedDevSupport` |
| UI Automation | ⬜ (giai đoạn 2) | Playwright + TypeScript (POM) | Sau khi có URL & inspect DOM thật |
| Performance (Import CSV file lớn) | ⚠️ Ghi nhận | Đồng hồ đo thủ công | Chỉ đo thời gian, không phải load test |
| Accessibility | ⚠️ Cơ bản | Keyboard / DevTools Lighthouse | Form sản phẩm, hộp thoại |
| Mobile / Responsive | ⚠️ Cơ bản | DevTools device toolbar | Payouts (màn hẹp) |

### Ngoài phạm vi (Out of scope)

- Chức năng **chưa có**: đổi mật khẩu cho vendor, quản lý thiết bị thật, duyệt sản phẩm, xoá avatar trên UI, cập nhật trạng thái đơn, hoàn tiền, in hoá đơn.
- Nối cổng thanh toán thật (Tipalti — Epic 11), API đơn hàng (Epic 9/10).
- Load / stress test hệ thống.

## Risk-Based Prioritization

| Risk | Tiêu chí | Modules | Độ sâu test |
|------|----------|---------|-------------|
| 🔴 High | Phân quyền, dữ liệu người khác, publish công khai, import hàng loạt | ROLE, LOGIN, SESS, API, SCOPE, PFORM, PSTAT, CSV, WEB | EP + BVA + Decision Table + State Transition + Security |
| 🟡 Medium | Màn dùng thường xuyên, dữ liệu nhạy cảm giả lập | PLIST, IMG, ORDD, PAY, PROF | EP + BVA + negative chính |
| 🟢 Low | Màn giả lập, hiển thị | PDTL, DASH, ORD, REV, SET | Happy path + kiểm tra không gọi API sai |

## Test Design Techniques

| Kỹ thuật | Áp dụng tiêu biểu |
|----------|-------------------|
| Equivalence Partitioning | Role (4 lớp), department (4), status (3), định dạng ảnh (hợp lệ / không) |
| Boundary Value Analysis | Ảnh 0/1/5/6; 10 MB vs 11 MB; stockCount 0/1; rating 5/5.1; price 4 vs 5 số thập phân; CSV 50.000 / 50.001 dòng; 20 MB |
| Decision Table | Chặn truy cập 4 role × 3 khu vực; redirect `?redirect=`; Import: SKU (mới / của mình / của người khác / trùng file) |
| State Transition | Active ↔ Draft ↔ Archived ↔ Deleted và hiển thị website; vòng đời phiên (login → refresh → logout → reuse token); role user ↔ vendor ↔ admin |
| Pairwise (allpairspy) | Vòng đời sản phẩm đa module (`plans/cross-module/`) |
| Error Guessing | Double submit, mất mạng khi import, hết phiên khi upload, file đổi đuôi |

## Test Automation Strategy (giai đoạn 2)

### Framework Architecture
- **Design Pattern:** Page Object Model (POM)
- **Language:** TypeScript
- **Test Runner:** Playwright Test (UI + API request context)
- **Build Tool:** npm
- **Reporting:** Playwright HTML report → Xray (`/import_test_results_xray` (kit gốc))

### Automation Scope (ứng viên)
- **Smoke:** đăng nhập vendor, danh sách mặc định, tạo sản phẩm tối thiểu, đổi trạng thái, xoá, website hiển thị.
- **API Permission Matrix:** data-driven 4 role × endpoint (giá trị automation cao nhất, ổn định nhất).
- **Data Scope:** V1/V2 IDOR qua API.
- **Không tự động hoá:** màn giả lập (giá trị thấp), test cần Dev rút TTL, file > 20 MB.

## Test Data Management

- Dữ liệu unique dùng tiền tố + timestamp: SKU `AUTO-<MODULE><TC>-<yyyyMMddHHmm>`, tên `Auto <Module> TC<nn> <timestamp>`.
- Tài khoản và mật khẩu lấy từ biến môi trường, **không** hard-code, **không** commit.
- Mọi sản phẩm tạo bởi test phải xoá ở cuối phiên (tìm theo SKU `AUTO-`).
- File CSV fixture nhỏ có sẵn ở `practices/test-data/csv/`; file lớn sinh bằng `practices/scripts/generate_fixtures.py`.

## Entry / Exit Criteria

| Loại | Tiêu chí |
|------|----------|
| **Entry** | Pre-flight checklist hoàn tất; có 2 vendor + 1 admin + 1 user; smoke API `/auth/me` trả đúng role |
| **Exit** | 100% TC 🔴 High đã chạy; không còn bug Critical/High mở cho SCOPE/API/ROLE; mọi TC `@CodeHienTai` đã có Bug hoặc Q-V tương ứng; báo cáo đã gửi |
| **Suspend** | Mọi API lỗi (lệch `/v1`), không đăng nhập được, mất tài khoản test |

## Execution Plan

| Phase | Mô tả | Trigger |
|-------|-------|---------|
| Pre-flight | Xác nhận môi trường, tài khoản, dữ liệu | Trước mỗi đợt test |
| Smoke | 12 TC trong `practices/README.md` | Mỗi build |
| Regression High | Toàn bộ 🔴 High + API | Mỗi sprint |
| Regression Full | Toàn bộ kit | Trước release |
| Cross-module | Ma trận Pairwise vòng đời sản phẩm | Trước release |

## Test Environment

- Test trên môi trường Test/Staging do Dev cung cấp — **KHÔNG** test trên production.
- Trình duyệt: Chrome mới nhất, viewport desktop **1920×1080** (headed khi debug).
- Công cụ: DevTools (Network, Application → Cookies/LocalStorage), Postman.
- CI/CD (giai đoạn automation) chạy headless.

## Defect Management

| Severity | Ví dụ |
|----------|-------|
| Critical | Vendor xem/sửa/xoá được sản phẩm người khác; vendor gọi được API admin; open redirect ra ngoài |
| High | Import nhân đôi sản phẩm; hạ quyền vendor không có hiệu lực ngay; sản phẩm Draft vẫn hiện website |
| Medium | Sai thông báo lỗi; phân trang sai; validation form thiếu |
| Low | Chính tả, chú thích nội bộ "Epic 9/10/11", ký hiệu "$$" |
