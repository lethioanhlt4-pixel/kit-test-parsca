# TÀI LIỆU YÊU CẦU - HỒ SƠ VENDOR & VENDOR TRÊN WEBSITE

| Thông tin | Chi tiết |
|-----------|----------|
| Module | PROF (Hồ sơ) · WEB (Vendor trên website bán hàng) |
| Hệ thống | PARSCA — Marketplace phụ tùng |
| URL | `{FE_URL}/vendor/profile`, `/profile`, `/orders`, `/forgot-password`, `/reset-password?token=...`, website storefront |
| Endpoint | `POST /auth/me/avatar`, `DELETE /auth/me/avatar` · `GET /products`, `GET /products/:idOrSlug`, `/products/category-counts`, `/products/filter-options`, `/products/filter-summary` |
| Doc nguồn | `19-ho-so.md` (2.18), `20-vendor-tren-website.md` (2.19) — đọc kèm 03, 04, 09, 10, 12 |
| Ngày tạo | 2026-10-20 |

---

## 1. TỔNG QUAN

- **Hồ sơ**: chỉ **ảnh đại diện chạy thật**; Thông tin cá nhân và Devices là **[GIẢ LẬP]**. Vendor **không** có đổi mật khẩu — cách duy nhất là "Forgot password".
- **Website**: vendor dùng website như khách; sản phẩm Active của vendor hiện ngay ở danh sách / tìm kiếm / bộ lọc, Draft/Archived/xoá thì biến mất (chi tiết công khai 404). Có bộ nhớ đệm (Redis) làm mới sau tạo/sửa/xoá/import.

---

## 2. YÊU CẦU CHỨC NĂNG

### 2.1. Ảnh đại diện (PROF — chạy thật)

> Là vendor, tôi muốn đổi ảnh đại diện để nhận diện tài khoản.

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-PROF-01 | Nút "Add image" (chưa có ảnh) / "Change image"; gợi ý "Maximum file size: 10 MB · Formats: JPEG, PNG, WEBP, GIF" |
| AC-PROF-02 | Chọn file là upload ngay (`POST /auth/me/avatar`), không cần Save; thành công → toast **"Profile picture updated."** + avatar trên thanh tiêu đề/menu đổi theo |
| AC-PROF-03 | Sai loại → toast **"Choose a JPEG, PNG, WebP or GIF image."** |
| AC-PROF-04 | > 10 MB → toast **"That image is X.X MB — the limit is 10 MB."** (định nghĩa 10 MB: **Q-V14**) |
| AC-PROF-05 | Hết phiên → **"Your session was renewed. Please choose the image again."** |
| AC-PROF-06 | Không có nút xoá ảnh trên UI (BE có `DELETE /auth/me/avatar`); ảnh cũ không bị xoá khỏi storage |

### 2.2. Thông tin cá nhân & Devices (PROF — giả lập)

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-PROF-07 | First name, Last name (tách từ tên tài khoản), Phone number (trống), Status Active/Inactive sửa được; Email chỉ đọc |
| AC-PROF-08 | "Save" chỉ hiện toast "Your picture saves straight away. The other fields need the profile endpoint, which is not built yet."; tải lại là mất; không có Cancel. Status không phải khoá tài khoản thật |
| AC-PROF-09 | Devices viết cứng; thiết bị hiện tại nhãn "This device"; "Sign out" thiết bị khác → toast "Session management arrives with the sessions API." |

### 2.3. Mật khẩu (PROF)

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-PROF-10 | `/vendor/profile` **không** có đổi mật khẩu. `/profile` (khách) có hộp thoại nhưng Confirm chỉ báo lỗi "Changing your password needs an API endpoint that does not exist yet. Use “Forgot password?” on the sign-in page for now." |
| AC-PROF-11 | Forgot password với tài khoản vendor: email chứa link hiệu lực **1 giờ**; đặt lại thành công → **mọi phiên bị đăng xuất** |
| AC-PROF-12 | Link dùng lại / hết hạn → **"This reset link is invalid or has expired."**; `/reset-password` thiếu `?token=` không hiện form |

### 2.4. Vendor trên website (WEB)

> Là vendor, tôi muốn sản phẩm Active của tôi hiển thị ngay cho khách và sản phẩm ẩn/xoá thì biến mất.

| ID | Tiêu chí chấp nhận |
|------|------|
| AC-WEB-01 | Vendor dùng website như khách: xem sản phẩm, giỏ hàng, thanh toán, `/profile`, `/orders` — **không** bị chuyển sang `/vendor` |
| AC-WEB-02 | Menu tài khoản có thêm mục **"Vendor"** dẫn tới `/vendor` |
| AC-WEB-03 | Sản phẩm vendor tạo **Active** hiển thị **ngay** ở danh sách, tìm kiếm, bộ lọc (không qua duyệt — **Q-V10**) |
| AC-WEB-04 | Đổi sang **Draft** / **Archived** → biến mất; link chi tiết công khai → **404** |
| AC-WEB-05 | Đổi lại Active → hiện lại; Xoá → mất hẳn (404) |
| AC-WEB-06 | `category-counts`, bộ lọc brand/xe cập nhật theo thay đổi của vendor; đệm làm mới sau tạo/sửa/xoá/import thành công (không Redis → không đệm) |
| AC-WEB-07 | API công khai trả `creator` (tên vendor) trong dữ liệu sản phẩm |

---

## 3. ĐẶC TẢ TRƯỜNG DỮ LIỆU

### 3.1. Ảnh đại diện

| Thuộc tính | Giá trị | Phân vùng test |
|-----------|---------|----------------|
| Định dạng hợp lệ | jpeg, png, webp, gif | png / jpg / webp / gif → pass |
| Định dạng không hợp lệ | pdf, svg, heic, file text đổi đuôi .png | → toast sai loại (đổi đuôi: cần quan sát FE/BE) |
| Dung lượng tối đa | 10 MB | 200 KB, 10.000.000 B, 10.485.760 B, 11.534.336 B (Q-V14) |

### 3.2. Thông tin cá nhân (giả lập)

| Trường | Sửa được | Lưu thật |
|--------|----------|----------|
| First name / Last name | ✅ | ❌ |
| Email | ❌ (chỉ đọc) | – |
| Phone number | ✅ | ❌ |
| Status Active/Inactive | ✅ | ❌ (không phải trạng thái tài khoản) |

### 3.3. Vòng đời sản phẩm trên website

| Trạng thái | Danh sách / tìm kiếm | Chi tiết công khai | category-counts |
|-----------|----------------------|--------------------|-----------------|
| Active | Hiện | 200 | Tính |
| Draft | Ẩn | 404 | Không tính |
| Archived | Ẩn | 404 | Không tính |
| Đã xoá | Ẩn | 404 | Không tính |

---

## 4. LUỒNG XỬ LÝ

### 4.1. Đổi avatar
1. Vendor mở `/vendor/profile` → "Change image" → chọn file
2. FE kiểm tra loại + dung lượng → lỗi thì toast, dừng
3. Gọi `POST /auth/me/avatar` → toast "Profile picture updated." → avatar header đổi

### 4.2. Quên mật khẩu
1. `/forgot-password` → nhập email vendor → gửi
2. Mở email → link `/reset-password?token=...` (hiệu lực 1 giờ)
3. Đặt mật khẩu mới → mọi phiên cũ bị đăng xuất → đăng nhập bằng mật khẩu mới
4. Dùng lại link → "This reset link is invalid or has expired."

### 4.3. Vòng đời E2E trên website
1. Vendor tạo sản phẩm Active → website tìm thấy ngay
2. Draft → biến mất; link chi tiết 404
3. Active lại → hiện lại
4. Xoá → mất hẳn

---

## 5. TỔNG HỢP THÔNG BÁO

| # | Thông báo | Loại | Điều kiện |
|---|-----------|------|-----------|
| 1 | Profile picture updated. | Toast | Upload avatar thành công |
| 2 | Choose a JPEG, PNG, WebP or GIF image. | Toast | Sai loại file |
| 3 | That image is X.X MB — the limit is 10 MB. | Toast | > 10 MB |
| 4 | Your session was renewed. Please choose the image again. | Toast | Hết phiên khi upload |
| 5 | Your picture saves straight away. The other fields need the profile endpoint, which is not built yet. | Toast | Bấm Save |
| 6 | Session management arrives with the sessions API. | Toast | Sign out thiết bị khác |
| 7 | Changing your password needs an API endpoint that does not exist yet. Use “Forgot password?” on the sign-in page for now. | Lỗi | Confirm đổi mật khẩu ở `/profile` |
| 8 | This reset link is invalid or has expired. | UI | Link reset dùng lại / hết hạn |
| 9 | (404) | Website | Mở chi tiết sản phẩm Draft/Archived/đã xoá |

---

## 6. CẤU TRÚC GIAO DIỆN

```
/vendor/profile
+--------------------------------------------------------------+
| [Avatar]  [Change image]                                     |
| Maximum file size: 10 MB · Formats: JPEG, PNG, WEBP, GIF     |
|--------------------------------------------------------------|
| First name [____]  Last name [____]                          |
| Email [readonly]   Phone number [____]  Status [Active ▼]    |
|                                                   [Save]     |
|--------------------------------------------------------------|
| Devices                                                      |
| Chrome · macOS  (This device)                                |
| Safari · iPhone                               [Sign out]     |
+--------------------------------------------------------------+
(Không có mục đổi mật khẩu)
```

---

## 7. YÊU CẦU PHI CHỨC NĂNG

| ID | Nội dung |
|----|----------|
| NFR-PROF-01 | Bảo mật: link reset dùng 1 lần, hiệu lực 1 giờ; reset huỷ mọi phiên |
| NFR-PROF-02 | Bảo mật: kiểm tra loại file phía BE (không chỉ dựa đuôi file) |
| NFR-PROF-03 | Lưu trữ: ghi nhận ảnh cũ không bị dọn khỏi storage (D-07) |
| NFR-WEB-01 | Tính nhất quán: thay đổi trạng thái sản phẩm phản ánh lên website ngay sau khi cache được làm mới |
| NFR-WEB-02 | SEO/Bảo mật: sản phẩm không Active trả 404, không lộ nội dung |

---

## 8. CÂU HỎI CẦN LÀM RÕ VỚI PO/USER

| ID | Câu hỏi |
|----|---------|
| Q-V10 | Vendor tự xuất bản sản phẩm Active không qua duyệt — có chấp nhận? |
| Q-V14 | "10 MB" là 10.000.000 hay 10.485.760 byte? |
| D-04 | Môi trường test có Redis cache? |
| D-05 | Hộp thư nhận email reset password cho tài khoản vendor test? |
| D-07 | Kiểm tra ảnh cũ trên storage bằng cách nào? |
