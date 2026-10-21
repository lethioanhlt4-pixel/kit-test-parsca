# Bước 5: Sinh mã Automation (Script Generation) — PARSCA Vendor

**Workflow:** `/gen-script` (tiếp tục)
**Skill:** `generate-playwright-script`

---

## Mục đích

Bước cốt lõi — AI kết hợp POM (Bước 3) và Data Strategy (Bước 4) để sinh spec Playwright hoàn chỉnh cho TC PARSCA, chạy test, và tự sửa đến khi PASS **2 lần liên tiếp** (headed), sau đó chạy headless.

## Cách sử dụng

1. Gửi file `prompt.txt` cho AI.
2. AI sẽ:
   - Sinh spec trong `tests/vendor/` hoặc `tests/api/` (1 spec / module-feature)
   - **Tự chạy test** bằng terminal (headed)
   - FAIL → **đọc log / trace, sửa, chạy lại**
   - PASS 2 lần liên tiếp → chạy headless
3. Nhận bảng TC → spec → kết quả → sang Bước 6.

## Code Pattern: Arrange → Act → Assert

```
Arrange: tạo dữ liệu qua API (dataFactory), mở page bằng storageState đúng vai
Act:     thao tác UI / gọi API theo TC
Assert:  status code + thông báo nguyên văn + trạng thái website (nếu liên quan)
```

## Mapping nhãn TC → Playwright

| Nhãn | Cách viết |
|------|-----------|
| `@Smoke`, `@Security`, `@DataScope`… | `tag: ['@Smoke', ...]` |
| `@CodeHienTai` | Assert theo nghiệp vụ đúng + annotation `question: Q-Vx`; PO chưa trả lời → `test.fixme()` (không PASS giả) |
| `@SuyLuan` | Chạy bình thường; cập nhật TC theo kết quả |
| `@GiaLap` | Assert hiển thị + không có request API cấm |
| `@NeedDevSupport` | `test.skip(!process.env.<FLAG>, '<lý do>')` |

## Self-fix Loop

```
Sinh code → Chạy headed → FAIL?
    ├── Đọc error + trace
    ├── Phân loại: locator / timing / data / môi trường (/v1) / bug thật
    ├── Bug thật của sản phẩm → KHÔNG sửa test cho PASS; ghi lại, đề xuất /analyze-bug
    ├── Lỗi test → sửa code
    └── Chạy lại → PASS 2 lần → headless → DONE ✅
```

## Lưu ý

- AI **không hỏi user** khi self-fix, trừ khi phát hiện business rule mâu thuẫn doc hoặc nghi bug sản phẩm.
- Mọi `expect` có message rõ; mỗi test có assertion cuối.
- Không `waitForTimeout`; không locator inline trong spec.
