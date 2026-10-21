# SELECTOR RULES — Playwright TypeScript (PARSCA)

> Áp dụng khi sinh / sửa / review locator cho Playwright. Nguyên tắc tối thượng: **KHÔNG ĐOÁN** — mọi locator phải được inspect và verify trên DOM thật trước khi vào code.

---

## 1. Thứ Tự Ưu Tiên (Priority)

| # | Loại | Playwright API | Ví dụ | Khi dùng |
|---|------|----------------|-------|----------|
| 1 | Role + accessible name | `page.getByRole()` | `getByRole('button', { name: 'Check file' })` | Nút, link, heading, dialog, combobox, row, cell |
| 2 | Label | `page.getByLabel()` | `getByLabel('Stock count')` | Ô nhập có `<label>` / `aria-label` |
| 3 | Placeholder | `page.getByPlaceholder()` | `getByPlaceholder('Search by SKU, product name, brand…')` | Ô tìm kiếm không có label |
| 4 | Test id | `page.getByTestId()` | `getByTestId('product-row')` | Khi Dev có gắn `data-testid` |
| 5 | Text | `page.getByText()` | `getByText('No products.', { exact: true })` | Thông báo, trạng thái rỗng, toast |
| 6 | `id` / `name` ổn định | `page.locator('#email')` | – | Không có lựa chọn 1–5 |
| 7 | CSS ngữ nghĩa | `page.locator('form[aria-label="Product"] input[name="sku"]')` | – | Phạm vi hẹp, có thuộc tính ổn định |
| 8 | XPath tương đối | `page.locator('xpath=//th[.="Status"]')` | – | **Cuối cùng**, phải ghi lý do |

### 1.1. Thu hẹp phạm vi (scoping)
- Bảng: `page.getByRole('row').filter({ hasText: sku })` rồi tìm nút trong row.
- Dialog: `const dialog = page.getByRole('dialog', { name: 'Import products from CSV' })` → mọi locator con dùng `dialog.getBy...`.
- Toast: ưu tiên `getByRole('status')` / `getByRole('alert')` nếu DOM có; nếu không → `getByText(<câu nguyên văn>)`.

---

## 2. Anti-Patterns (CẤM)

| ❌ Anti-pattern | Lý do | ✅ Thay bằng |
|----------------|-------|-------------|
| Class hash / CSS-in-JS: `.css-1n2xyz`, `.sc-bdVaJa` | Đổi mỗi lần build | Role / label / test id |
| Tailwind utility: `.flex.items-center.px-4` | Gắn styling | Role / text |
| `nth-child`, `.nth(3)`, `.first()` không lý do | Vỡ khi thứ tự đổi | Filter theo text/SKU |
| XPath tuyệt đối `//div[3]/div[2]/button` | Vỡ khi đổi layout | Role scoped |
| Text phụ thuộc i18n mà không cố định ngôn ngữ | Vỡ khi đổi ngôn ngữ | Cố định locale `en` trong config, hoặc role |
| Locator inline trong spec | Khó bảo trì | Định nghĩa trong Page Object |
| `page.$()`, `page.$$()` (ElementHandle) | Không auto-wait | `page.locator()` |
| `waitForSelector` + `click` | Thừa | Locator auto-wait + `expect()` |
| Copy locator từ code cũ không verify | Có thể đã hỏng | Verify lại trên DOM hiện tại |

---

## 3. Quy Trình Verify (BẮT BUỘC trước khi vào code)

```
navigate(url) → resize(1920×1080) → wait_for(page_load) → snapshot (a11y tree)
→ chọn locator theo priority → kiểm tra match đúng 1 element
→ reload / đổi trạng thái (rỗng, có data, loading) → locator vẫn đúng
→ ghi vào Page Object
```

- Công cụ: Playwright MCP hoặc `chrome-devtools-mcp` (`take_snapshot`, `evaluate_script` đếm số match).
- Locator match > 1 element → thu hẹp scope; = 0 → xem lại, **không** đổi sang XPath ngay.

---

## 4. Text Anchor Ứng Viên Từ Tài Liệu BA (PHẢI VERIFY)

> Các chuỗi dưới đây lấy từ doc BA → **chỉ là ứng viên**, chưa xác nhận trên DOM. Cột "Verified" cập nhật sau khi inspect.

| Màn hình | Element | Text trong doc | Role dự kiến | Verified |
|----------|---------|----------------|--------------|----------|
| `/vendor/products` | Nút import | "Import CSV" | button | ☐ |
| `/vendor/products` | Nút tạo | "Add product" | button / link | ☐ |
| `/vendor/products` | Ô tìm | "Search by SKU, product name, brand…" | textbox (placeholder) | ☐ |
| `/vendor/products` | Lọc trạng thái | "Active products" / "Draft products" / "Archived products" / "All statuses" | combobox | ☐ |
| `/vendor/products` | Rỗng | "No products." | text | ☐ |
| `/vendor/products/:id` | Không quyền | "Product not found or you do not have permission to view it." | text | ☐ |
| Form sản phẩm | Nút lưu | "Add Product" (tạo) | button | ☐ |
| Form sản phẩm | Toast | "Saved" / "Save failed" | status | ☐ |
| Danh sách | Toast | "Status updated" / "Deleted 1" | status | ☐ |
| Dialog xoá | Tiêu đề / nút | "Delete product?" / "Delete" | dialog / button | ☐ |
| Dialog Import | Tiêu đề | "Import products from CSV" | dialog | ☐ |
| Dialog Import | Nút | "Template", "Check file", "Import N row(s)", "Nothing to import" | button | ☐ |
| Dialog Import | Kết quả | "Validation result — nothing written yet", "Import finished" | heading / text | ☐ |
| `/vendor` | Tiêu đề | "Overview" | heading | ☐ |
| `/vendor/payouts` | Nút | "Set up payouts" | button | ☐ |
| `/vendor/profile` | Nút ảnh | "Add image" / "Change image" | button | ☐ |
| `/login` | Ô | Email, Password | textbox (label) | ☐ |

---

## 5. Page Object Convention

```ts
// pages/vendor/ProductListPage.ts
export class ProductListPage {
  constructor(private readonly page: Page) {}

  // Locators: readonly getters, verified on DOM (ghi ngày verify trong PR)
  get importCsvButton() { return this.page.getByRole('button', { name: 'Import CSV' }); }

  rowBySku(sku: string) {
    return this.page.getByRole('row').filter({ hasText: sku });
  }
}
```
- 1 Page = 1 màn hình / 1 dialog lớn (`ImportCsvDialog`).
- Method đặt tên theo hành vi nghiệp vụ: `importFile(path)`, `changeStatus(sku, 'Draft')`.
- **Không** assertion trong Page Object (trừ helper `expectLoaded()`).
