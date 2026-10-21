---
id: 05-phan-quyen-api
title: Phân quyền API của vendor
source_section: "2.4"
applies_to: Mọi API
roles: [Không token, User, Vendor, Admin]
read_with: [01-canh-bao-moi-truong.md, 06-pham-vi-du-lieu.md, 18-cai-dat-brand-fitment.md]
---

# 2.4. PHÂN QUYỀN API CỦA VENDOR

> Quy ước: **GHI CHÚ CHO TESTER** = điểm cần test / xác nhận · **THEO CODE HIỆN TẠI** = hành vi hiện có, có thể sai nghiệp vụ → ghi bug hoặc câu hỏi, không Pass · **[SUY LUẬN]** = suy ra từ code, cần chạy thật · **[GIẢ LẬP]** = dữ liệu viết cứng trong FE, không gọi API.

> Đọc file này kèm mọi file test API của vendor.

## Nhóm 1: API vendor ĐƯỢC gọi (phải đăng nhập, role vendor hoặc admin)
| Endpoint | Chức năng |
|---|---|
| GET /products/admin/all | Danh sách sản phẩm cho quản trị (mọi trạng thái) |
| GET /products/admin/:idOrSlug | Một sản phẩm theo id hoặc slug, mọi trạng thái |
| POST /products | Tạo sản phẩm |
| PATCH /products/:id | Sửa sản phẩm |
| DELETE /products/:id | Xoá sản phẩm (204) |
| POST /products/upload | Upload ảnh sản phẩm |
| GET /products/import/template | Tải file mẫu CSV |
| POST /products/import | Import CSV (có `?dryRun=true` để chạy thử) |

Mọi API không gắn @Roles và không công khai (mọi role đã đăng nhập): /auth/me, /auth/logout, POST /auth/me/avatar, DELETE /auth/me/avatar.

## Nhóm 2: API vendor KHÔNG được gọi
Trả 403 "You do not have permission to access this resource":
- GET /users, PATCH /users/:id/role
- GET /dashboard/stats
- Mọi API quản trị của blog (blog-posts)
- Logo thương hiệu (brand-logos)
- Thương hiệu sản phẩm: POST / PATCH / DELETE và admin/all của product-brands
- Tuỳ chọn xe: POST / PATCH / DELETE và admin/all của fitment-options
- Báo giá (quotes)
- Đăng ký nhận tin (newsletter-subscriptions)

## Nhóm 3: API công khai (ai cũng gọi được)
GET /products, GET /products/:idOrSlug, /products/category-counts, /products/filter-summary, /products/filter-options, GET /product-brands, GET /fitment-options, GET /brand-logos, GET /blog-posts, POST /contact, POST /quotes, POST /newsletter-subscriptions, /sitemap*.xml, /health, /public/uploads/....

## Ghi chú cho tester
- Với mỗi API trong ba nhóm trên, chạy 4 trường hợp bằng Postman:
  - Không token (401 với API cần đăng nhập)
  - Token user (403 với API admin/vendor)
  - Token vendor
  - Token admin
- Điểm cần chú ý: vendor gọi trực tiếp `POST /product-brands` hoặc `PATCH /fitment-options/:id` phải 403.
- Màn Settings của vendor (xem `18-cai-dat-brand-fitment.md`) hiển thị được vì dùng dữ liệu giả; nếu sau này đổi sang API thật thì vendor sẽ nhận 403 (code FE đã ghi chú rõ).
- Test thêm: gửi trường lạ trong body (hệ thống từ chối 400), id sai định dạng ở PATCH / DELETE.
