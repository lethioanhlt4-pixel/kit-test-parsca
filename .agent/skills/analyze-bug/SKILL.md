---
name: analyze-bug
description: Phân tích bug report / log lỗi / kết quả test FAIL của PARSCA Vendor theo khung Fact → Root cause → Recommendation; phân loại Bug / Question PO / Observation (giả lập) / Environment / Test issue và chuẩn hoá bug report.
---

# Skill: Analyze Bug (PARSCA Vendor)

## Khi nào dùng
- Có test FAIL (manual hoặc Playwright), bug report thô, log console/network, trace Playwright.
- Cần quyết định: đây có thật là bug không, ai xử lý, mức độ nào.

## Nạp bắt buộc
- `.agent/rules/core.md` (nhãn doc, business rules BR-01..12, cảnh báo môi trường)
- Doc BA của module liên quan (`docs/parsca-vendor-test-docs/NN-*.md`)

---

## Khung Phân Tích: Fact → Root Cause → Recommendation

### 1. FACT (chỉ sự thật quan sát được)
| Mục | Nội dung |
|-----|----------|
| Môi trường | `{FE_URL}` / `{API_URL}`, build/commit nếu có, trình duyệt, viewport |
| Tài khoản / vai trò | V1 / V2 / Admin / User / Không token (không ghi mật khẩu) |
| Dữ liệu | SKU, product id, file CSV, timestamp |
| Bước tái hiện | Đánh số, tối thiểu |
| Expected (trích doc) | Câu nguyên văn + số doc |
| Actual | Câu nguyên văn, status code, response body (che token/PII) |
| Bằng chứng | Screenshot, trace, HAR, log console |
| Tần suất | Luôn / thỉnh thoảng (x/10) |

> Không suy đoán trong phần Fact.

### 2. PHÂN LOẠI (Triage) — đi theo cây quyết định

```
Mọi API cùng lỗi 404 / dữ liệu đọc sai?  ──yes──► ENVIRONMENT (lệch /v1, {data, meta} — Doc 01) → báo Dev, dừng
        │no
Màn hình thuộc [GIẢ LẬP] và lỗi là "không lưu / không gọi API / dấu —"?  ──yes──► OBSERVATION (không phải bug)
        │no
Hành vi khớp đoạn "THEO CODE HIỆN TẠI" của doc?  ──yes──► QUESTION PO (Q-Vx) — không PASS, không FAIL
        │no
Ngày test làm bộ lọc thời gian tương đối rỗng (Orders/Reviews)?  ──yes──► NOT A BUG
        │no
Test script sai (locator, data trùng, phụ thuộc thứ tự, hard sleep)?  ──yes──► TEST ISSUE → sửa test
        │no
Lệch so với doc BA / business rule  ──► BUG
```

### 3. ROOT CAUSE (giả thuyết có căn cứ)
| Lớp | Dấu hiệu | Ví dụ PARSCA |
|-----|----------|--------------|
| BE — Authorization | Sai status code theo vai | Vendor gọi `POST /product-brands` nhận 201 thay vì 403 |
| BE — Data scope | Thấy/sửa được sản phẩm người khác; 403 thay vì 404 | `GET /products/admin/<id V2>` trả 200 |
| BE — Validation | Nhận trường lạ, stockCount 0, 6 ảnh | `createdBy` trong body được nhận |
| BE — Cache | Website chưa cập nhật sau đổi status | Redis chưa làm mới `category-counts` |
| FE — Guard / routing | Vào sai cổng, không redirect | Vendor vào `/admin` không bị chuyển `/vendor` |
| FE — Session | Không refresh, refresh nhiều lần, gửi lại upload | Import gửi 2 lần sau 401 |
| FE — Validation / UI | Thiếu thông báo, sai câu chữ | Không hiện "Stock count must be at least 1" |
| Contract | FE/BE lệch path/shape | `/v1/products` 404 |
| Data | Dữ liệu seed thiếu / trùng | SKU `AUTO-*` từ lần chạy trước |

Ghi rõ **mức tin cậy**: Cao (có log/response chứng minh) / Trung bình / Thấp (cần Dev xác nhận).

### 4. RECOMMENDATION
- **Cho Dev:** điểm nghi ngờ (endpoint, guard, DTO), cách xác minh.
- **Cho QA:** TC bổ sung / sửa, dữ liệu cần chuẩn bị lại.
- **Cho PO/BA:** câu hỏi Q-Vx mới nếu là vấn đề nghiệp vụ.

---

## Severity & Priority

| Severity | Tiêu chí PARSCA |
|----------|-----------------|
| **Critical** | Rò rỉ / sửa / xoá dữ liệu vendor khác (BR-01, BR-02); vượt quyền admin (BR-03, BR-10); mất dữ liệu hàng loạt (import ghi đè) |
| **High** | Luồng chính hỏng (tạo / sửa / import / đăng nhập); sản phẩm Draft vẫn công khai; phiên không hết hạn sau logout |
| **Medium** | Validation thiếu, thông báo sai, bộ lọc sai, lỗi một trình duyệt |
| **Low** | Câu chữ, giao diện, i18n, cosmetic |

---

## Output — Bug Report Chuẩn

```markdown
## BUG-PARSCA-<MOD>-<YYYYMMDD>-<NN>: <Tóm tắt: [Vai trò] <hành động> → <kết quả sai>>

| Trường | Giá trị |
|--------|---------|
| Loại | Bug / Question PO / Observation / Environment / Test issue |
| Severity / Priority | Critical / P1 |
| Module / TC | SCOPE / PARSCA_SCOPE_TC_005 |
| Doc tham chiếu | 06-pham-vi-du-lieu.md — "Truy cập sản phẩm của người khác trả 404" |
| Môi trường | {FE_URL} · Chrome 1920×1080 · build ... |
| Tài khoản | V1 (`${VENDOR1_EMAIL}`) |
| Dữ liệu | SKU `AUTO-SCOPE05-20261020`, id V2 ... |

### Bước tái hiện
1. ...

### Expected
...

### Actual
...

### Bằng chứng
- Screenshot / trace / HAR (đã che token)

### Phân tích
- **Fact:** ...
- **Root cause (giả thuyết, tin cậy: Cao/TB/Thấp):** ...
- **Recommendation:** ...
```

## Checklist
- [ ] Đã chạy cây phân loại trước khi gọi là Bug
- [ ] Expected trích doc nguyên văn + số doc
- [ ] Không có token / cookie / mật khẩu / PII thật trong báo cáo
- [ ] Severity theo bảng PARSCA
- [ ] Có TC liên quan (hoặc đề xuất TC mới)
