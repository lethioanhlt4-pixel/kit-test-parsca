# Anomaly Queries — PARSCA (READ-ONLY, schema GIẢ ĐỊNH)

> ⚠️ Tên bảng / cột dưới đây suy ra từ tài liệu BA, **chưa xác nhận**. Trước khi chạy: mở Metabase → Browse data → đối chiếu, thay tên cho đúng (Postgres dùng `"createdBy"` có ngoặc kép nếu cột camelCase; Mongo dùng Metabase query builder tương đương).
> Chỉ dùng `SELECT`. Luôn chạy câu **COUNT** trước.

---

## ANM-01 — createdBy null / không tồn tại
```sql
SELECT COUNT(*) AS orphan_products
FROM products p
LEFT JOIN users u ON u.id = p."createdBy"
WHERE p."createdBy" IS NULL OR u.id IS NULL;
```

## ANM-03 — SKU trùng không phân biệt hoa thường / khoảng trắng
```sql
SELECT UPPER(TRIM(sku)) AS norm_sku, COUNT(*) AS cnt
FROM products
GROUP BY UPPER(TRIM(sku))
HAVING COUNT(*) > 1
LIMIT 100;
```

## ANM-04 — Slug trùng
```sql
SELECT slug, COUNT(*) AS cnt
FROM products
GROUP BY slug
HAVING COUNT(*) > 1
LIMIT 100;
```

## ANM-05 — vendorId lệch role
```sql
SELECT role, COUNT(*) AS cnt
FROM users
WHERE role <> 'vendor' AND "vendorId" IS NOT NULL
GROUP BY role;
```

## ANM-06 — Role lạ
```sql
SELECT role, COUNT(*) AS cnt
FROM users
WHERE role NOT IN ('user', 'vendor', 'admin')
GROUP BY role;
```

## ANM-07 — Đột biến sản phẩm Active do vendor tạo (theo giờ)
```sql
SELECT DATE_TRUNC('hour', p."createdAt") AS hour_bucket,
       p."createdBy",
       COUNT(*) AS active_created
FROM products p
JOIN users u ON u.id = p."createdBy"
WHERE u.role = 'vendor'
  AND p.status = 'active'
  AND p."createdAt" >= NOW() - INTERVAL '7 days'
GROUP BY 1, 2
HAVING COUNT(*) >= 50
ORDER BY active_created DESC
LIMIT 100;
```

## ANM-08 — Vi phạm ràng buộc tồn kho / ảnh
```sql
-- images assumed to be an array/json column; adjust to the real schema
SELECT COUNT(*) FILTER (WHERE "stockCount" < 1)                      AS stock_lt_1,
       COUNT(*) FILTER (WHERE COALESCE(array_length(images, 1), 0) = 0) AS zero_images,
       COUNT(*) FILTER (WHERE array_length(images, 1) > 5)            AS over_5_images
FROM products;
```

## ANM-09 — Brand mới xuất hiện ngay sau import của vendor
```sql
SELECT b.name, b."createdAt"
FROM product_brands b
WHERE b."createdAt" BETWEEN :import_started_at AND :import_finished_at + INTERVAL '5 minutes'
ORDER BY b."createdAt"
LIMIT 100;
```

## ANM-10 — Sản phẩm không Active nhưng còn được tính công khai
> Đối chiếu bằng API thay vì SQL: `GET /products/category-counts` so với
```sql
SELECT "subcategoryId", COUNT(*) AS active_cnt
FROM products
WHERE status = 'active'
GROUP BY "subcategoryId";
```

## ANM-11 — Dữ liệu test tồn đọng
```sql
SELECT p."createdBy", COUNT(*) AS stale_auto
FROM products p
WHERE p.sku LIKE 'AUTO-%'
  AND p."createdAt" < NOW() - INTERVAL '7 days'
GROUP BY p."createdBy";
```

## ANM-12 — Nhiều refresh token hiệu lực / tài khoản (nếu lưu DB)
```sql
SELECT "userId", COUNT(*) AS active_tokens
FROM refresh_tokens
WHERE "expiresAt" > NOW() AND "revokedAt" IS NULL
GROUP BY "userId"
HAVING COUNT(*) > 1
LIMIT 100;
```

---

> Dọn dữ liệu (ANM-11) **không** làm bằng SQL. Dùng API `DELETE /products/:id` bằng đúng tài khoản tạo, sau khi User đồng ý.
