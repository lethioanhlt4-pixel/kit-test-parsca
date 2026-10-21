# Bước 2: Phân tích & Điều tra UI (Analysis & UI Recon) — PARSCA Vendor

**Workflow:** `/gen-script` (tiếp tục)
**Skill:** `generate-playwright-script` · **Rule:** `selectors.md`

---

## Mục đích

Giao cho AI **tự mở trình duyệt**, đăng nhập đúng vai, đi theo test steps và trích xuất locators thật từ DOM PARSCA. Đồng thời ghi lại **request/response** liên quan (endpoint, status, prefix thực tế) để Bước 3 thiết kế `api/*` đúng.

## Cách sử dụng

1. Điền TC (hoặc file + bộ lọc) vào `prompt.txt`.
2. Gửi cho AI — AI dùng browser MCP để:
   - Mở `{FE_URL}`, resize **1920×1080**, chờ load xong
   - Đăng nhập bằng tài khoản từ `.env` (không in ra chat)
   - Đi theo từng step, snapshot Accessibility Tree
   - Thu thập locator + endpoint quan sát được
3. Review bảng locators.
4. Locator nào chưa ổn → yêu cầu AI re-inspect element đó.
5. Xác nhận → sang Bước 3.

## Màn cần recon theo module

| Module | Route | Phần tử trọng tâm |
|--------|-------|-------------------|
| LOGIN | `/login` | Email, Password, nút đăng nhập, thông báo lỗi |
| PLIST / PSTAT | `/vendor/products` | Bảng (row theo SKU), filter status, ô tìm kiếm, đổi status, nút xoá, dialog "Delete product?" |
| PFORM / IMG | `/vendor/products/new`, `/:id/edit` | Name, SKU, Price, Compare at, Brand, Department, Subcategory, Gallery (input file, "N/5 images", Make cover image, Remove image), Status, Stock count, nút "Add Product" / "Update", toast "Saved" |
| PDTL / SCOPE | `/vendor/products/:id` | Thông báo "Product not found or you do not have permission to view it." |
| CSV | dialog "Import products from CSV" | Template, input file, "Check file", ô Rows / To create / To update / Skipped, "Import N row(s)", bảng lỗi |
| PROF | `/vendor/profile` | Input avatar, toast "Profile picture updated." |
| WEB | Storefront | Trang sản phẩm công khai, trang 404 |
| Giả lập | `/vendor`, `/vendor/orders`, `/vendor/reviews`, `/vendor/payouts`, `/vendor/settings/*` | Tiêu đề, bảng dữ liệu mẫu, wizard Payouts |

## Lưu ý quan trọng

- Thứ tự MCP bắt buộc: `navigate → resize(1920×1080) → wait_for → snapshot → interact → screenshot (chỉ khi fail)`.
- Không gọi `navigate` lại nếu đã ở đúng trang.
- Ưu tiên locator theo `.agent/rules/selectors.md`: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByTestId` > `getByText` > id/name > CSS > XPath.
- Không thao tác làm thay đổi dữ liệu không mang tiền tố `AUTO-` khi recon.
- Không đăng nhập lặp lại quá 5 lần/phút (429).
