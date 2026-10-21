# Bước 4: Chiến lược dữ liệu (Test Data Strategy) — PARSCA Vendor

**Workflow:** `/gen-script` (tiếp tục)
**Rule:** `test-data.md`

---

## Mục đích

Thiết kế `utils/dataFactory.ts`, `utils/files.ts` và bộ file trong `test-data/` để test PARSCA chạy nhiều lần / song song không trùng SKU, không đụng dữ liệu thật, và tự dọn sau khi chạy.

## Cách sử dụng

1. Gửi file `prompt.txt` cho AI.
2. AI sẽ sinh:
   - `utils/dataFactory.ts` (SKU, tên, payload sản phẩm, email)
   - `utils/files.ts` (sinh ảnh 10 / 11 MB, CSV 50.000 / 50.001 dòng vào `test-data/generated/`)
   - Danh sách file tĩnh cần có trong `test-data/images`, `test-data/csv`
   - Cleanup registry + `afterEach` teardown
3. Review và tích hợp → sang Bước 5.

## Format dữ liệu chuẩn PARSCA

```
SKU (automation):  AUTO-<MOD>-<timestamp>          → AUTO-CSV-1792480000123
Product name:      Auto <Mod> <TC> <timestamp>     → Auto Pform TC012 1792480000123
Email:             auto.<mod>.<tc>.<ts>@auto.test  → auto.pay.tc004.1792480000@auto.test
Brand (CSV/SET):   AutoBrand<MOD><YYYYMMDD>        → AutoBrandCSV20261020
```

→ Nhìn DB / Metabase biết ngay dữ liệu do TC nào sinh ra, lúc nào (hỗ trợ `/analyze-log`).

## Lưu ý

- Mỗi test có SKU riêng → chạy parallel an toàn.
- Teardown chỉ xoá sản phẩm `AUTO-*` do **chính vendor tạo** (`DELETE /products/:id`).
- File lớn không commit; ảnh link https trong CSV dùng URL công khai ổn định do team cung cấp.
- Payouts (`@GiaLap`): số tài khoản giả `1234560720`, SWIFT `ABCD1234`, tên `Auto Pay TC0xx`.
