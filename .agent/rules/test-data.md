# TEST DATA RULES — PARSCA Vendor

> Chuẩn test data cho mọi testcase, script, bug report của PARSCA (thay cho chuẩn Shopify trong template gốc: email, password, product/SKU, price/amount, discount, file).
> Nguyên tắc: **Unique · Traceable · Không dữ liệu thật · Không credentials trong file**.

---

## 1. Tài Khoản (chỉ dùng biến môi trường)

| Biến | Role | Dùng cho |
|------|------|----------|
| `VENDOR1_EMAIL` / `VENDOR1_PASSWORD` | vendor | Tài khoản chính (V1) — ≥ 25 sản phẩm đủ Active/Draft/Archived, 4 department |
| `VENDOR2_EMAIL` / `VENDOR2_PASSWORD` | vendor | Vendor đối chứng (V2) — kiểm phạm vi dữ liệu |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | admin | Cấp role, đối chiếu "Created by" |
| `USER_EMAIL` / `USER_PASSWORD` | user | Kiểm 403 / guard |
| `ROLE_TEST_EMAIL` / `ROLE_TEST_PASSWORD` | user ↔ vendor | Nâng/hạ role, Forgot password (không dùng V1 để tránh đăng xuất suite khác) |
| `ROLE_TEST_NEW_PASSWORD` | – | Mật khẩu mới khi reset |
| `V2_PRODUCT_ID`, `V2_PRODUCT_SKU`, `V2_PRODUCT_SLUG`, `ADMIN_PRODUCT_ID`, `ADMIN_PRODUCT_SKU` | – | Dữ liệu đối chứng (ghi ở pre-flight) |

- Trong TC viết `${VENDOR1_EMAIL}`; trong code đọc `process.env.VENDOR1_EMAIL` qua `.env` (đã `.gitignore`) — **không** commit `.env`, chỉ commit `.env.example`.

---

## 2. Format Dữ Liệu Unique

| Trường | Format | Ví dụ | Ràng buộc từ doc |
|--------|--------|-------|------------------|
| Email đăng ký / liên hệ | `auto.<mod>.<tc>.<ts>@auto.test` | `auto.login.tc005.1792480000@auto.test` | Email hợp lệ |
| Password hợp lệ | Biến môi trường | `${ROLE_TEST_NEW_PASSWORD}` | ≥ 8 ký tự |
| Password sai (negative) | Hằng mô tả rõ | `Short7!` (7 ký tự), `WrongPass#2026` | – |
| SKU (manual) | `AUTO-<MOD><NN>-<YYYYMMDD>` | `AUTO-PFORM12-20261020` | Không dấu cách, BE → HOA, unique toàn hệ thống |
| SKU (automation) | `AUTO-<MOD>-<timestamp>` | `AUTO-CSV-1792480000123` | – |
| Product name | `Auto <Mod> TC<NNN> <YYYYMMDD>` | `Auto Web TC001 20261020` | Trim, ≥ 1 ký tự |
| Brand (Settings / CSV) | `AutoBrand<MOD><YYYYMMDD>` | `AutoBrandCSV20261020` | Mô tả ≤ 500 ký tự |
| Make / Model | `AutoMake<MOD><YYYYMMDD>` | `AutoMakeSET20261020` | – |
| Từ khoá không kết quả | `zz_no_<thing>_<YYYYMMDD>` | `zz_no_order_20261020` | – |

> `<ts>` = Unix timestamp (giây) hoặc `Date.now()` (ms); `<YYYYMMDD>` = ngày chạy. Từ ID suy ra được TC + thời điểm chạy.

---

## 3. Giá Trị Số & Tiền Tệ (Amount)

| Trường | Hợp lệ | Biên / Negative | Ghi chú |
|--------|--------|-----------------|---------|
| Price | `0`, `10`, `19.99`, `0.0001` | `-0.01` (lỗi "Price must be 0 or greater"), `0.00001` (> 4 thập phân), `abc`, `1.2.3` | Đơn vị hiển thị **CAD** |
| Compare at | ≥ 0 | `5` khi Price `10` → BE không chặn (Q-V15) | – |
| Stock count | `1`, `999` | `0` ("…at least 1"), `1.5` ("…whole number"), `-1`, rỗng | Nguyên ≥ 1 |
| Rating | `0`, `4.5`, `5` | `5.1`, `-0.1` | Bước 0,1 (Q-V11) |
| Year start / end | `2015` / `2020` | `2025` / `2020` (start > end, BE không chặn — Q-V15) | Nguyên ≥ 0 |
| Limit danh sách | `10`, `100` | `500` → BE trả ≤ 100 | – |

### 3.1. Dữ liệu tiền & giảm giá trên màn giả lập (để không báo nhầm)
| Màn | Quy tắc viết cứng |
|-----|-------------------|
| Order detail | Phí ship cố định **10**; số lượng ≥ 3 → **"Volume discount (6%)"**; Currency luôn **CAD**; Payment method luôn **"Credit card"** |
| Payouts | Available **$18.6K** (hover "18,600.00 CAD"), Pending **$183.7**, Lifetime paid **$$15.9K**; 14 dòng activity |
| Orders | 20 đơn **ORD-2134 → ORD-2153**, ngày 30/05/2026 → 08/08/2026; route id chữ thường `ord-2136` |
| Reviews | 13 đánh giá: 5★=5, 4★=4, 3★=2, 2★=1, 1★=1 |

---

## 4. File Test

| Nhóm | File | Kích thước / nội dung |
|------|------|-----------------------|
| Ảnh hợp lệ | `img_ok_200kb.png`, `img_ok.jpg`, `img_ok.webp`, `img_ok.gif`, `avatar_ok_200kb.png` | < 1 MB |
| Ảnh biên | `img_10mb_decimal.png` (10.000.000 B), `img_exact_10mib.png` (10.485.760 B), `img_11mb.png` (11.534.336 B) | Q-V14 |
| Sai loại | `doc_sample.pdf`, `img_vector.svg`, `img_photo.heic`, `fake_image_text.png` (text đổi đuôi) | – |
| CSV hợp lệ | `csv_valid_5_rows.csv` (SKU `AUTO-CSV-0001..0005`) | Cột bắt buộc: `sku,name,price,stockCount` |
| CSV lỗi | thiếu từng cột, `stockCount` 0, SKU lặp, `status=draft`, rỗng, chỉ header, header giả `Column1`, BOM + ô nhiều dòng, lẫn đúng/sai, `.txt`, `.xlsx` | Doc 12 |
| CSV lớn | 50.000 / 50.001 dòng, > 20 MB | Sinh bằng script, **không commit** |
| CSV đối chứng | SKU của V2 / Admin dùng placeholder `{{V2_PRODUCT_SKU}}`, `{{ADMIN_PRODUCT_SKU}}` → thay khi chạy | – |

- Sinh bằng `python3 practices/scripts/generate_fixtures.py` (chạy từ `kit-test-parsca/`): CSV nhỏ → `practices/test-data/csv/` (commit được); file lớn, ảnh, bản đã thay placeholder → `practices/test-data/generated/` (đã gitignore).
- Ảnh link https trong CSV: dùng URL công khai ổn định do team cung cấp, không dùng ảnh có bản quyền (mặc định script dùng `https://placehold.co/...`).

---

## 5. Phân Loại Data Theo Kỹ Thuật

Mỗi trường quan trọng phải có đủ: **Positive · Negative · Boundary · Edge**.

| Kỹ thuật | Ví dụ PARSCA |
|----------|--------------|
| Boundary (BVA) | stockCount 0/1, ảnh 0/1/5/6, CSV 50.000/50.001 dòng, 20 MB, ảnh 10 MB, mô tả brand 500/501 |
| Equivalence (EP) | Chủ sở hữu sản phẩm: V1 / V2 / Admin; Status: active/draft/archived/lạ; Department: marine/auto/door/tools/lạ |
| Edge / Error guessing | SKU chữ thường, có dấu cách; tên chứa `<script>`; JSON hỏng; trường lạ `createdBy`; race 5 request cùng SKU |

---

## 6. Vòng Đời Dữ Liệu

1. **Setup:** tạo dữ liệu qua API (nhanh, ổn định) trong `beforeEach`/fixture; UI chỉ dùng cho bước đang test.
2. **Isolation:** mỗi TC dùng SKU riêng; không dùng chung sản phẩm giữa TC có thay đổi trạng thái.
3. **Teardown:** xoá sản phẩm `AUTO-*` do TC tạo (`DELETE /products/:id` bằng chính vendor đã tạo). Không xoá dữ liệu không mang tiền tố `AUTO-`.
4. **Truy vết:** bug report luôn kèm SKU / email / timestamp đã dùng.

---

## 7. CẤM

- Dữ liệu cá nhân thật (tên, email, số điện thoại, số tài khoản ngân hàng thật). Payouts: dùng `1234560720`, `ABCD1234`, tên `Auto Pay TC0xx`.
- Hard-code mật khẩu / token trong testcase, spec, fixture, báo cáo.
- Dùng lại SKU cố định giữa các lần chạy automation.
