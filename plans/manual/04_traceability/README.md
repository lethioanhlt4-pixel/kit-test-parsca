# Bước 4: Đảm bảo độ bao phủ (Traceability & Gap Analysis) — PARSCA Vendor

---

## Mục đích

Thiết lập **Ma trận truy vết** để đảm bảo 100% yêu cầu trong doc BA (đặc biệt mục **"Ghi chú cho tester"** và các điểm **THEO CODE HIỆN TẠI**) đều có scenario kiểm thử.

## Cách sử dụng

1. Gửi file `prompt.txt` sau khi đã review kết quả phân rã ở Bước 3.
2. AI sẽ trả về:
   - **Traceability Matrix:** `REQ-<MOD>-NN` ↔ Doc / mục ↔ Module ↔ Scenario
   - **Gap Analysis:** điểm trong doc chưa được map
   - **High-Level Scenarios:** `SC-<MOD>-NN`, kèm nhãn `@CodeHienTai` / `@GiaLap` nếu có
3. **Review kỹ** danh sách scenarios:
   - Đủ ma trận 4 vai (anonymous / user / vendor / admin) cho module 🔴 chưa?
   - Đủ kịch bản đối chứng V1 ↔ V2 ↔ Admin cho SCOPE / CSV chưa?
   - Có scenario nào ghi bug "không lưu" cho màn giả lập không? → loại bỏ.
   - Bổ sung nếu cần → Xác nhận → sang Bước 5.

## Quy ước mã

| Loại | Format | Ví dụ |
|------|--------|-------|
| Requirement | `REQ-<MOD>-NN` | `REQ-CSV-03` |
| Scenario | `SC-<MOD>-NN` | `SC-SCOPE-05` |
| Test case (Bước 6) | `PARSCA_<MOD>_TC_NNN` | `PARSCA_CSV_TC_012` |

## ⚠️ Human Checkpoint

**Đây là điểm chốt chặn nhân sự.** Tester phải:

- Xác nhận / điều chỉnh **risk** từng module (mặc định theo Module Catalog).
- Chốt scenario nào cần chờ PO (`@CodeHienTai`), scenario nào cần Dev hỗ trợ (`@NeedDevSupport`, vd rút ngắn TTL token).
- Nếu phát hiện thiếu, yêu cầu AI bổ sung: *"Hãy thêm scenarios cho trường hợp [X]"*.
