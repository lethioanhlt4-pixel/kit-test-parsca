---
name: write-test-report
description: Viết test report cho sprint / release PARSCA Vendor từ kết quả chạy manual + Playwright (HTML/JUnit), tổng hợp PASS/FAIL/SKIP/OBSERVED theo module và risk, liệt kê bug và câu hỏi PO mở, đưa ra khuyến nghị Go / Conditional Go / No-Go.
---

# Skill: Write Test Report (PARSCA Vendor)

## Khi nào dùng
- Kết thúc sprint / trước release / sau một vòng regression.
- User đưa: file kết quả (Excel TC có cột Result, `test-results/junit.xml`, Playwright HTML report, danh sách bug).

## Nạp bắt buộc
- `.agent/rules/core.md` (trạng thái OBSERVED cho `@CodeHienTai`, không bug cho `@GiaLap`)

---

## Trạng Thái Kết Quả Chuẩn

| Trạng thái | Khi nào |
|-----------|---------|
| ✅ PASS | Actual = Expected |
| ❌ FAIL | Lệch Expected → có Bug ID |
| 👁️ OBSERVED | TC `@CodeHienTai` / `@GiaLap` — ghi nhận hiện trạng, chờ PO (không tính PASS/FAIL) |
| ⛔ BLOCKED | Không chạy được (môi trường, thiếu Dev support, bug chặn) |
| ⏭️ SKIP | Ngoài scope vòng này (ghi lý do) |
| ⬜ NOT RUN | Chưa chạy |

**Công thức:**
- Execution rate = (PASS + FAIL + OBSERVED) / Tổng
- Pass rate = PASS / (PASS + FAIL) — **không** tính OBSERVED vào mẫu số

---

## Quy Trình
1. **Thu thập**: đọc kết quả từng nguồn; map TC ID ↔ kết quả (Playwright title bắt đầu bằng TC ID).
2. **Đối soát**: TC trong Smoke suite đã chạy đủ? TC FAIL có Bug ID? TC OBSERVED có Q-Vx?
3. **Tổng hợp** theo module + risk + priority.
4. **Đánh giá rủi ro còn lại**: bug mở theo severity, câu hỏi PO mở ảnh hưởng release.
5. **Áp tiêu chí Go/No-Go** (bảng dưới) → khuyến nghị có lý do.
6. **Viết report** theo template; số liệu phải cộng khớp.

---

## Tiêu Chí Go / No-Go (PARSCA Vendor)

| # | Tiêu chí | Go | Conditional Go | No-Go |
|---|----------|----|----------------|-------|
| G1 | Bug **Critical** mở (rò rỉ dữ liệu vendor, vượt quyền, mất dữ liệu) | 0 | 0 | ≥ 1 |
| G2 | Smoke suite (12 TC) | 12/12 PASS (trừ OBSERVED) | ≥ 11/12, lỗi có workaround | < 11/12 |
| G3 | SCOPE + API PERM/SCOPE | 100% PASS | – | Bất kỳ FAIL |
| G4 | Bug **High** mở | 0 | ≤ 2, có workaround + kế hoạch fix | > 2 hoặc không workaround |
| G5 | Pass rate module 🔴 High | ≥ 95% | 90–95% | < 90% |
| G6 | Câu hỏi PO chặn release (Q-V4, Q-V5, Q-V8 nếu go-live có đơn thật) | Đã trả lời | Có quyết định tạm, ghi rủi ro | Chưa có quyết định |
| G7 | Môi trường khớp FE/BE (`/v1`, `{data, meta}`) | Xác nhận | – | Chưa xác nhận |

> Kết luận = mức **thấp nhất** trong các tiêu chí. Luôn nêu tiêu chí nào kéo kết luận xuống.

---

## Template Report

```markdown
# 📊 TEST REPORT — PARSCA Vendor — <Sprint/Release> — <YYYY-MM-DD>

## 1. Tóm tắt điều hành
- **Khuyến nghị:** 🟢 GO / 🟡 CONDITIONAL GO / 🔴 NO-GO
- **Lý do chính:** (1–3 gạch đầu dòng, gắn tiêu chí G#)
- **Phạm vi:** modules, build, môi trường, thời gian chạy

## 2. Số liệu tổng
| Tổng TC | PASS | FAIL | OBSERVED | BLOCKED | SKIP | NOT RUN | Execution rate | Pass rate |
|---------|------|------|----------|---------|------|---------|----------------|-----------|

## 3. Theo module
| Module | Risk | Tổng | PASS | FAIL | OBSERVED | BLOCKED | Pass rate | Ghi chú |
|--------|------|------|------|------|----------|---------|-----------|---------|

## 4. Automation
| Suite | Tests | Passed | Failed | Flaky | Skipped | Thời gian |
|-------|-------|--------|--------|-------|---------|-----------|

## 5. Bug
| Bug ID | Tóm tắt | Severity | Module / TC | Trạng thái | Owner |
|--------|---------|----------|-------------|-----------|-------|

## 6. Câu hỏi PO / Observation
| Q | Nội dung | TC OBSERVED | Ảnh hưởng release |
|---|----------|-------------|-------------------|

## 7. Đánh giá Go / No-Go
| Tiêu chí | Kết quả | Mức |
|----------|---------|-----|

## 8. Rủi ro còn lại & khuyến nghị
## 9. Blocked / Known limitations
## 10. Phụ lục: link report Playwright, file Excel, trace
```

## Checklist
- [ ] Số liệu cộng khớp (tổng = tổng các trạng thái)
- [ ] OBSERVED tách riêng, không tính vào pass rate
- [ ] Mỗi FAIL có Bug ID; mỗi OBSERVED có Q-Vx hoặc "📝 Ghi nhận cho BA"
- [ ] Kết luận Go/No-Go chỉ rõ tiêu chí quyết định
- [ ] Không credentials / PII trong report
