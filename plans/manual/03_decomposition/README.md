# Bước 3: Phân rã hệ thống (Decomposition Strategy) — PARSCA Vendor

---

## Mục đích

Chia PARSCA Vendor thành các **Module / Sub-module** dễ quản lý, khớp **Module Catalog M1–M18 + API** của kit, để mọi bước sau (REQ ID, TC ID, tag, spec automation) dùng chung một mã module.

## Cách sử dụng

1. Đảm bảo các câu hỏi ở Bước 2 đã được trả lời / ghi giả định.
2. Gửi file `prompt.txt` cho AI.
3. AI sẽ trả về:
   - Bảng **Module / Sub-module** (mã, doc, route / endpoint, giả lập, risk đề xuất)
   - **Dependencies** giữa các module
4. Review nhanh → sang Bước 4.

## Chiến lược phân rã cho PARSCA

PARSCA dùng **kết hợp** cả 3 cách:

| Cách | Áp dụng | Ví dụ PARSCA |
|------|---------|--------------|
| **Theo đối tượng** | Cấp module | Role, Phiên, Sản phẩm, Import, Đơn hàng, Payouts, Hồ sơ |
| **Theo luồng** | Sub-module của sản phẩm | PFORM: Tạo / Sửa; PSTAT: Đổi trạng thái / Xoá; CSV: Template / Dry run / Import thật |
| **Theo UI** | Sub-module form | PFORM: (a) Nhận diện, (b) Phân loại, (c) Ảnh, (d) Trạng thái & tồn kho, (e) Part & xe, (f) Mô tả |

## Module Catalog chuẩn

Bảng chuẩn ở [`module_catalog.md`](../../../.agent/skills/generate-testcase/resources/module_catalog.md). AI **không được** đổi mã module (ROLE, LOGIN, SESS, SCOPE, PLIST, PDTL, PSTAT, PFORM, IMG, CSV, DASH, ORD, ORDD, REV, SET, PAY, PROF, WEB, API).
