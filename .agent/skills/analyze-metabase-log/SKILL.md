---
name: analyze-metabase-log
description: Phân tích kết quả query Metabase / SQL (read-only) của PARSCA để phát hiện bất thường dữ liệu liên quan role Vendor — sai phạm vi createdBy, SKU trùng, role/vendorId lệch, sản phẩm Active ngoài ý muốn, danh mục bị vendor thay đổi, dữ liệu test rác — và đề xuất TC/bug.
---

# Skill: Analyze Metabase Log (PARSCA Vendor)

## Khi nào dùng
- User dán kết quả query Metabase (bảng / CSV / JSON) hoặc câu SQL cần kiểm.
- Cần xác minh hậu quả dữ liệu sau khi chạy test (import, đổi role, xoá) hoặc điều tra bug dữ liệu.

## Nạp bắt buộc
- `.agent/rules/core.md` (BR-01..12, an toàn: **chỉ SELECT**)
- `resources/anomaly_queries.md` (bộ query mẫu)

> [!WARNING]
> Tên bảng / cột trong `anomaly_queries.md` là **giả định** từ tài liệu BA (`products`, `users`, `createdBy`, `status`, `sku`, `slug`, `role`, `vendorId`…). **Bắt buộc** đối chiếu schema thật với Dev / Metabase trước khi chạy; không đoán rồi kết luận.

---

## An Toàn (CRITICAL)
- Chỉ `SELECT` / Metabase question. **Cấm** `INSERT/UPDATE/DELETE/DROP/TRUNCATE/ALTER`.
- Luôn `LIMIT` (≤ 1000) khi xem chi tiết.
- Che PII khi trích kết quả vào báo cáo: email → `v***@domain`, không in số điện thoại, địa chỉ, token.
- Không in connection string / credentials Metabase.

---

## Quy Trình

1. **Xác định câu hỏi**: bất thường nào cần kiểm (bảng dưới) và khoảng thời gian (`createdAt` / `updatedAt`).
2. **Xác nhận schema**: liệt kê bảng/cột dùng; đánh dấu cột nào đã xác nhận.
3. **Chạy query đếm trước** (aggregate), chỉ xem chi tiết khi count > 0.
4. **Phân tích**: so với rule kỳ vọng; loại trừ dữ liệu test hợp lệ (tiền tố `AUTO-`).
5. **Kết luận** theo khung Fact → Interpretation → Action.

---

## Danh Mục Bất Thường

| Mã | Bất thường | Rule kỳ vọng | Mức | Liên quan |
|----|------------|--------------|-----|-----------|
| ANM-01 | Sản phẩm `createdBy` null / trỏ user không tồn tại | Mọi sản phẩm có `createdBy` hợp lệ (fallback "Unknown vendor") | High | BR-01, Doc 06 |
| ANM-02 | Sản phẩm vendor được sửa bởi tài khoản khác (nếu có audit) | Chỉ chủ sở hữu / admin | Critical | BR-01 |
| ANM-03 | SKU trùng khi so không phân biệt hoa thường / có khoảng trắng | SKU unique toàn hệ thống, CHỮ HOA | High | BR-06 |
| ANM-04 | Slug trùng | Unique toàn hệ thống | High | BR-06 |
| ANM-05 | User role ≠ vendor nhưng `vendorId` khác null | Hạ role → `vendorId` null | Medium | BR-10 |
| ANM-06 | Role giá trị lạ (ngoài user/vendor/admin) | Chỉ 3 role | Medium | Doc 02 |
| ANM-07 | Đột biến sản phẩm Active do vendor tạo trong thời gian ngắn (import) | Ghi nhận — vendor tự xuất bản (Q-V10) | Info | BR-07, BR-08 |
| ANM-08 | Sản phẩm `stockCount` < 1 hoặc > 5 ảnh hoặc 0 ảnh | Ràng buộc form/API | Medium | BR-09 |
| ANM-09 | Brand / giá trị xe mới xuất hiện ngay sau import của vendor | THEO CODE HIỆN TẠI (Q-V5) | Info / Q | Doc 12, 18 |
| ANM-10 | Sản phẩm Draft/Archived nhưng `inStock`/cache website vẫn tính | Không công khai | High | BR-07 |
| ANM-11 | Dữ liệu test `AUTO-*` tồn đọng > 7 ngày | Teardown xoá | Low | test-data.md §6 |
| ANM-12 | Một tài khoản có > 1 refresh token hiệu lực (nếu lưu DB) | Mỗi tài khoản 1 refresh token | Medium | BR-12, Doc 04 |
| ANM-13 | Ảnh trên storage không còn sản phẩm nào tham chiếu (mồ côi) | Xoá sản phẩm dọn ảnh; upload không lưu → ghi nhận (Q-V13) | Low | Doc 10, 11 |

---

## Output

```markdown
# 🔍 METABASE ANALYSIS — <chủ đề> — <YYYY-MM-DD>

| Mục | Giá trị |
|-----|---------|
| Nguồn | Metabase question #<id> / SQL (đính kèm) |
| Khoảng thời gian | ... |
| Schema đã xác nhận | ✅ products.createdBy, ... / ⚠️ giả định: ... |

## Kết quả
| Mã | Kiểm tra | Count | Kỳ vọng | Kết luận |
|----|----------|-------|---------|----------|
| ANM-03 | SKU trùng (case-insensitive) | 2 | 0 | ❌ Bất thường |

## Chi tiết (đã che PII)
| id | sku | createdBy | status | createdAt |

## Phân tích
- **Fact:** ...
- **Interpretation:** (bug / dữ liệu test / hành vi THEO CODE HIỆN TẠI / chưa đủ dữ liệu)
- **Action:** bug (→ /analyze-bug), TC mới (→ /gen-testcase), câu hỏi PO, dọn dữ liệu (chờ User đồng ý)
```

## Checklist
- [ ] Chỉ SELECT, có LIMIT
- [ ] Đã ghi rõ cột nào là giả định
- [ ] Loại trừ dữ liệu `AUTO-*` khi đánh giá dữ liệu thật (hoặc ngược lại khi kiểm teardown)
- [ ] PII đã che
- [ ] Mỗi bất thường có hành động đề xuất
