# Bước 5: Sinh Test Case chi tiết (RBT & Test Case Generation) — PARSCA Vendor

---

## Mục đích

Sinh Test Case chi tiết theo **Risk-Based Testing**: module 🔴 test kỹ (phân quyền, phạm vi dữ liệu, form, CSV, website), module 🟢 / giả lập test cơ bản. Mọi TC dùng **dữ liệu cụ thể** theo `.agent/rules/test-data.md` và **chuỗi thông báo chính xác** từ doc.

## Cách sử dụng

1. Đảm bảo đã review và chốt scenarios + risk ở Bước 4.
2. Gửi file `prompt.txt` cho AI; sửa dòng `[Module sinh lần này]`.
3. AI sinh TC đầy đủ: Title, Pre-condition, Steps, Expected Result, Test Data, Risk Level, Priority, Tag.
4. Review kết quả → lặp cho module tiếp theo → sang Bước 6.

## Mẹo quan trọng

### Sinh từng module
PARSCA có 19 nhóm — **tối đa 2 module mỗi lần**:
```
Hãy sinh Test Case cho SCOPE và CSV trước tiên.
```
Sau khi review:
```
Tiếp tục sinh Test Case cho PFORM và IMG.
```

### Test Data phải cụ thể (theo test-data.md)
- ✅ `AUTO-PFORM12-20261020` thay vì ❌ `SKU hợp lệ`
- ✅ `img_11mb.png (11.534.336 B)` thay vì ❌ `ảnh quá lớn`
- ✅ `${VENDOR2_EMAIL}` + `{{V2_PRODUCT_SKU}}` thay vì ❌ `tài khoản vendor khác`

### Risk Level quyết định độ sâu
| Risk Level | Module | Số TC dự kiến | Bao phủ |
|------------|--------|---------------|---------|
| **High** 🔴 | ROLE, LOGIN, SESS, SCOPE, PSTAT, PFORM, CSV, WEB, API | 8–15+ TC/module | Happy + Negative + Boundary + Edge + Security |
| **Medium** 🟡 | PLIST, IMG, ORDD, PAY, PROF | 4–8 TC/module | Happy + Negative chính |
| **Low** 🟢 | PDTL, DASH, ORD, REV, SET | 2–4 TC/module | Happy path + kiểm hiển thị |

### Nhãn bắt buộc
| Tình huống | Tag | Expected / Kết quả |
|------------|-----|--------------------|
| Doc ghi THEO CODE HIỆN TẠI | `@CodeHienTai` | Expected theo nghiệp vụ đúng; ghi "OBSERVED — chờ Q-Vx" |
| Doc ghi [SUY LUẬN] | `@SuyLuan` | Cập nhật sau khi chạy thật |
| Màn giả lập | `@GiaLap` | Chỉ kiểm hiển thị dữ liệu mẫu + không gọi API cấm |
| Cần Dev hỗ trợ (TTL ngắn, giả lập 5xx) | `@NeedDevSupport` | Ghi rõ hỗ trợ cần có |

### Kỹ thuật thiết kế Test Case

| Kỹ thuật | Khi nào dùng | Ví dụ PARSCA |
|----------|-------------|--------------|
| **Equivalence Partitioning** | Nhiều lớp input | Chủ sở hữu sản phẩm: V1 / V2 / Admin; Department: marine / auto / door / tools |
| **Boundary Value Analysis** | Có min / max | Stock count 0 / 1; ảnh 0 / 1 / 5 / 6; CSV 50.000 / 50.001 dòng; ảnh 10 MB |
| **Decision Table** | Nhiều điều kiện kết hợp | Vai × endpoint → 200 / 401 / 403 / 404 |
| **State Transition** | Đối tượng có trạng thái | Sản phẩm Active ↔ Draft ↔ Archived → Xoá; website hiện / ẩn |
