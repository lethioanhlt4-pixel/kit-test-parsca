#!/usr/bin/env python3
"""
generate_fixtures.py — Sinh fixture cho bộ test PARSCA Vendor (chỉ dùng thư viện chuẩn Python 3.8+).

Đầu ra (tính từ --out-root, mặc định practices/test-data/):
  csv/        CSV nhỏ, cố định, có thể commit (file có placeholder {{...}} giữ nguyên).
  generated/  File lớn, file đã thay placeholder, ảnh/tài liệu — KHÔNG commit (đã gitignore).

Biến môi trường (tuỳ chọn, KHÔNG phải secret):
  V2_PRODUCT_SKU     SKU một sản phẩm thuộc Vendor 2   -> generated/csv_sku_other_vendor.csv, scope_sku_other_vendor.csv
  ADMIN_PRODUCT_SKU  SKU một sản phẩm do Admin tạo    -> generated/csv_sku_admin.csv
  SHARED_IMAGE_URL   URL ảnh đã upload (/public/uploads/...) -> generated/pstat_shared_image.csv
  RUN_SUFFIX         Hậu tố SKU cho file lớn (mặc định: yyyymmddHHMM hiện tại)

Cách dùng (chạy từ thư mục kit-test-parsca/):
  python3 practices/scripts/generate_fixtures.py                 # sinh đầy đủ
  python3 practices/scripts/generate_fixtures.py --skip-large    # bỏ qua file 50.000 dòng / 20 MB / ảnh 10 MB
  python3 practices/scripts/generate_fixtures.py --csv-only      # chỉ sinh lại csv/
"""
import argparse
import base64
import csv
import io
import os
import struct
import sys
import zipfile
import zlib
from datetime import datetime
from pathlib import Path

DATE_TAG = "20261020"
BASE_HEADER = ["sku", "name", "price", "stockCount"]
DEPARTMENT_BRAND = {
    "marine": "Parsca Marine",
    "auto": "Parsca",
    "door": "Parsca",
    "tools": "Vevor",
}
PUBLIC_IMG = "https://placehold.co/600x400.png?text={}"

# Small, well-known valid binaries (1x1 pixel)
GIF_1X1 = "R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
WEBP_1X1 = "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=="

KIB = 1024
MIB = 1024 * 1024


# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------
def write_csv(path: Path, header, rows, bom=False, line_terminator="\n"):
    path.parent.mkdir(parents=True, exist_ok=True)
    buf = io.StringIO()
    writer = csv.writer(buf, lineterminator=line_terminator)
    if header is not None:
        writer.writerow(header)
    writer.writerows(rows)
    data = buf.getvalue().encode("utf-8")
    if bom:
        data = b"\xef\xbb\xbf" + data
    path.write_bytes(data)
    return path


def write_raw(path: Path, data: bytes):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return path


def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
    crc = zlib.crc32(chunk_type + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", crc)


def make_png(target_bytes: int = 0, width: int = 400, height: int = 300) -> bytes:
    """Valid RGB PNG (gradient). If target_bytes > 0, pad with a private ancillary
    chunk ('prVt') so the file size equals target_bytes exactly."""
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter type: none
        for x in range(width):
            raw += bytes(((x * 255) // width, (y * 255) // height, 160))
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    head = b"\x89PNG\r\n\x1a\n" + png_chunk(b"IHDR", ihdr) + png_chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    tail = png_chunk(b"IEND", b"")
    if target_bytes <= 0:
        return head + tail
    pad_len = target_bytes - len(head) - len(tail) - 12
    if pad_len < 0:
        raise ValueError(f"target {target_bytes} B is smaller than base PNG")
    return head + png_chunk(b"prVt", b"\x00" * pad_len) + tail


def make_jpeg() -> bytes:
    """Minimal baseline JPEG 8x8 gray, built from scratch (no external libs)."""
    # Quantization table: all ones; Huffman tables: standard-ish minimal (DC lum, AC lum)
    soi = b"\xff\xd8"
    app0 = b"\xff\xe0" + struct.pack(">H", 16) + b"JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
    dqt = b"\xff\xdb" + struct.pack(">H", 67) + b"\x00" + b"\x01" * 64
    sof0 = b"\xff\xc0" + struct.pack(">HBHHB", 11, 8, 8, 8, 1) + b"\x01\x11\x00"
    # DC table: one code of length 1 -> category 0
    dht_dc = b"\xff\xc4" + struct.pack(">H", 20) + b"\x00" + b"\x01" + b"\x00" * 15 + b"\x00"
    # AC table: one code of length 1 -> EOB (0x00)
    dht_ac = b"\xff\xc4" + struct.pack(">H", 20) + b"\x10" + b"\x01" + b"\x00" * 15 + b"\x00"
    sos = b"\xff\xda" + struct.pack(">HB", 8, 1) + b"\x01\x00" + b"\x00\x3f\x00"
    # One block: DC code '0' (diff 0) + AC code '0' (EOB) -> bits '00', padded with 1s -> 0x3F
    scan = b"\x3f"
    eoi = b"\xff\xd9"
    return soi + app0 + dqt + sof0 + dht_dc + dht_ac + sos + scan + eoi


def make_xlsx(header, rows) -> bytes:
    """Minimal valid .xlsx (one sheet, inline strings) using zipfile only."""
    def col(i):
        s = ""
        i += 1
        while i:
            i, r = divmod(i - 1, 26)
            s = chr(65 + r) + s
        return s

    def esc(v):
        return str(v).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    sheet_rows = []
    for r_idx, row in enumerate([header] + rows, start=1):
        cells = "".join(
            f'<c r="{col(c_idx)}{r_idx}" t="inlineStr"><is><t>{esc(v)}</t></is></c>'
            for c_idx, v in enumerate(row)
        )
        sheet_rows.append(f'<row r="{r_idx}">{cells}</row>')
    files = {
        "[Content_Types].xml": (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            "</Types>"
        ),
        "_rels/.rels": (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            "</Relationships>"
        ),
        "xl/workbook.xml": (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            '<sheets><sheet name="products" sheetId="1" r:id="rId1"/></sheets></workbook>'
        ),
        "xl/_rels/workbook.xml.rels": (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            "</Relationships>"
        ),
        "xl/worksheets/sheet1.xml": (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            f'<sheetData>{"".join(sheet_rows)}</sheetData></worksheet>'
        ),
    }
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for name, content in files.items():
            zf.writestr(name, content)
    return buf.getvalue()


def make_pdf() -> bytes:
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R "
        b"/Resources << /Font << /F1 5 0 R >> >> >>",
        None,  # content stream
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    stream = b"BT /F1 18 Tf 20 70 Td (PARSCA fixture - not an image) Tj ET"
    objects[3] = b"<< /Length %d >>\nstream\n" % len(stream) + stream + b"\nendstream"
    out = bytearray(b"%PDF-1.4\n")
    offsets = []
    for i, body in enumerate(objects, start=1):
        offsets.append(len(out))
        out += b"%d 0 obj\n" % i + body + b"\nendobj\n"
    xref = len(out)
    out += b"xref\n0 %d\n0000000000 65535 f \n" % (len(objects) + 1)
    for off in offsets:
        out += b"%010d 00000 n \n" % off
    out += b"trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n" % (len(objects) + 1, xref)
    return bytes(out)


def make_fake_heic() -> bytes:
    """ISO-BMFF 'ftyp' box with brand heic + filler. Header only (fake) — enough to test type rejection."""
    ftyp = b"ftyp" + b"heic" + struct.pack(">I", 0) + b"mif1heic"
    box = struct.pack(">I", len(ftyp) + 4) + ftyp
    return box + b"\x00" * 2048


# ----------------------------------------------------------------------------
# Data sets
# ----------------------------------------------------------------------------
VALID_HEADER = BASE_HEADER + ["compareAtPrice", "description", "brand", "departmentId"]


def valid_rows(start: int, names=None):
    names = names or [
        "Marine Bilge Pump",
        "Boat Cleat Set",
        "LED Trailer Light",
        "Professional Bracket",
        "Door Hinge Kit",
    ]
    depts = ["marine", "marine", "auto", "door", "tools"]
    rows = []
    for i in range(5):
        n = start + i
        dept = depts[i]
        rows.append([
            f"AUTO-CSV-{n:04d}",
            names[i],
            f"{19.99 + i * 10:.2f}",
            str(5 + i),
            f"{29.99 + i * 10:.2f}",
            f"Auto CSV description {n:04d} {DATE_TAG}",
            DEPARTMENT_BRAND[dept],
            dept,
        ])
    return rows


def build_small_csv(csv_dir: Path):
    out = []
    # CSV_TC_002..005, 022 — note: AUTO-CSV-0004 name must stay "Professional Bracket" (slug check)
    out.append(write_csv(csv_dir / "csv_valid_5_rows.csv", VALID_HEADER, valid_rows(1)))
    out.append(write_csv(csv_dir / "csv_valid_5_rows_b.csv", VALID_HEADER, valid_rows(1001)))
    out.append(write_csv(csv_dir / "csv_valid_5_rows_c.csv", VALID_HEADER, valid_rows(1301)))
    out.append(write_csv(csv_dir / "csv_valid_5_rows_d.csv", VALID_HEADER, valid_rows(1401)))

    # CSV_TC_006 — blank optional cells must not overwrite existing values
    out.append(write_csv(
        csv_dir / "csv_partial_update_blank_cells.csv",
        BASE_HEADER + ["description", "brand", "compareAtPrice"],
        [["AUTO-CSV-0001", f"Marine Bilge Pump Updated {DATE_TAG}", "55.50", "5", "", "", ""]],
    ))

    # CSV_TC_007 — 3 valid rows (lines 2-4), line 5 missing name, line 6 price 'abc'
    out.append(write_csv(csv_dir / "csv_mixed_valid_invalid.csv", BASE_HEADER, [
        ["AUTO-CSV-0101", f"Mixed Valid One {DATE_TAG}", "10.00", "3"],
        ["AUTO-CSV-0102", f"Mixed Valid Two {DATE_TAG}", "11.00", "3"],
        ["AUTO-CSV-0103", f"Mixed Valid Three {DATE_TAG}", "12.00", "3"],
        ["AUTO-CSV-0104", "", "13.00", "3"],
        ["AUTO-CSV-0105", f"Mixed Bad Price {DATE_TAG}", "abc", "3"],
    ]))

    # CSV_TC_008 — each file misses one required column
    sample = {"sku": "AUTO-CSV-0151", "name": f"Missing Column {DATE_TAG}", "price": "9.99", "stockCount": "2"}
    for col_name in BASE_HEADER:
        header = [c for c in BASE_HEADER if c != col_name]
        out.append(write_csv(
            csv_dir / f"csv_missing_{col_name.lower()}.csv", header, [[sample[c] for c in header]]
        ))

    # CSV_TC_009 — line 2 stockCount 0 (skipped), line 3 stockCount 1 (min valid)
    out.append(write_csv(csv_dir / "csv_stockcount_zero.csv", BASE_HEADER, [
        ["AUTO-CSV-0201", f"Stock Zero {DATE_TAG}", "8.00", "0"],
        ["AUTO-CSV-0202", f"Stock One {DATE_TAG}", "8.00", "1"],
    ]))
    # CSV_TC_003 — every row stockCount 0 -> "Nothing to import"
    out.append(write_csv(csv_dir / "csv_stockcount_zero_all.csv", BASE_HEADER, [
        ["AUTO-CSV-0211", f"Stock Zero A {DATE_TAG}", "8.00", "0"],
        ["AUTO-CSV-0212", f"Stock Zero B {DATE_TAG}", "8.00", "0"],
    ]))

    # CSV_TC_010 — duplicated SKU on lines 2 and 4
    out.append(write_csv(csv_dir / "csv_dup_sku_in_file.csv", BASE_HEADER, [
        ["AUTO-CSV-0301", f"Dup First {DATE_TAG}", "7.00", "2"],
        ["AUTO-CSV-0302", f"Dup Other {DATE_TAG}", "7.00", "2"],
        ["AUTO-CSV-0301", f"Dup Again {DATE_TAG}", "7.00", "2"],
    ]))

    # CSV_TC_011, 012
    out.append(write_raw(csv_dir / "csv_not_csv.txt", b"This is a plain text file, not a CSV.\n"))
    out.append(write_raw(csv_dir / "csv_empty.csv", b""))
    out.append(write_csv(csv_dir / "csv_header_only.csv", BASE_HEADER, []))

    # CSV_TC_015 — fake "Column1..4" header on line 1
    out.append(write_csv(csv_dir / "csv_fake_header_column1.csv", ["Column1", "Column2", "Column3", "Column4"], [
        BASE_HEADER,
        ["AUTO-CSV-0401", f"Fake Header One {DATE_TAG}", "6.00", "2"],
        ["AUTO-CSV-0402", f"Fake Header Two {DATE_TAG}", "6.00", "2"],
    ]))

    # CSV_TC_016 — status column must be ignored
    out.append(write_csv(csv_dir / "csv_status_draft.csv", BASE_HEADER + ["status"], [
        ["AUTO-CSV-0501", f"Status Draft New {DATE_TAG}", "15.00", "4", "draft"],
        [f"AUTO-CSV16-{DATE_TAG}", f"Auto Csv16 {DATE_TAG}", "77", "4", "draft"],
    ]))

    # CSV_TC_019 — UTF-8 BOM + CRLF + multi-line cell
    out.append(write_csv(
        csv_dir / "csv_bom_multiline.csv",
        BASE_HEADER + ["description"],
        [["AUTO-CSV-0701", f"Bom Multiline {DATE_TAG}", "21.00", "3", "Line one of description\nLine two of description"]],
        bom=True,
        line_terminator="\r\n",
    ))

    # CSV_TC_020 — header case/space variants + unknown column (written raw to keep spaces)
    out.append(write_raw(
        csv_dir / "csv_column_case_unknown.csv",
        (f"SKU, Name ,PRICE,stock_count,Unknown Col\n"
         f"AUTO-CSV-0801,Column Case {DATE_TAG},23.00,3,ignore me\n").encode("utf-8"),
    ))

    # CSV_TC_021 — images separated by '|': 5 links (OK) and 6 links (over limit)
    links5 = "|".join(PUBLIC_IMG.format(f"0901-{i}") for i in range(1, 6))
    links6 = "|".join(PUBLIC_IMG.format(f"0902-{i}") for i in range(1, 7))
    out.append(write_csv(csv_dir / "csv_images_links.csv", BASE_HEADER + ["images"], [
        ["AUTO-CSV-0901", f"Images Five {DATE_TAG}", "25.00", "3", links5],
        ["AUTO-CSV-0902", f"Images Six {DATE_TAG}", "25.00", "3", links6],
    ]))

    # CSV_TC_027 — new brand + vehicle values
    out.append(write_csv(
        csv_dir / "csv_new_brand_vehicle.csv",
        BASE_HEADER + ["brand", "departmentId", "make", "model", "yearStart", "yearEnd"],
        [["AUTO-CSV-1101", f"New Brand Vehicle {DATE_TAG}", "31.00", "3",
          f"AutoBrandCSV{DATE_TAG}", "auto", f"AutoMakeCSV{DATE_TAG}", f"AutoModelCSV{DATE_TAG}", "2018", "2022"]],
    ))

    # CSV_TC_028 — unsupported columns + createdBy spoof (dummy id; server must ignore) + metadata.*
    out.append(write_csv(
        csv_dir / "csv_extra_columns.csv",
        BASE_HEADER + ["specifications", "descriptionSections", "createdBy", "metadata.color"],
        [["AUTO-CSV-1201", f"Extra Columns {DATE_TAG}", "33.00", "3",
          "Weight: 2kg", "Intro: sample section", "000000000000000000000002", "red"]],
    ))

    # SCOPE_TC_010 — template with placeholder (use generated/ copy when running)
    out.append(write_csv(csv_dir / "scope_sku_other_vendor.csv", BASE_HEADER, [
        ["{{V2_PRODUCT_SKU}}", f"Overwrite Try {DATE_TAG}", "1", "5"],
    ]))

    # PSTAT_TC_010 — two products sharing one image URL
    shared = PUBLIC_IMG.format("AUTO-PSTAT-010")
    out.append(write_csv(csv_dir / "pstat_shared_image.csv", BASE_HEADER + ["image"], [
        ["AUTO-PSTAT-010A", f"Pstat Shared Image A {DATE_TAG}", "12.00", "3", shared],
        ["AUTO-PSTAT-010B", f"Pstat Shared Image B {DATE_TAG}", "12.00", "3", shared],
    ]))

    # PLIST seed — 25 products, 4 departments; status is set afterwards in UI (CSV status is ignored)
    seed = []
    depts = list(DEPARTMENT_BRAND)
    for i in range(1, 26):
        dept = depts[(i - 1) % 4]
        compare = f"{15 + i + 10:.2f}" if i % 5 == 0 else ""
        seed.append([
            f"AUTO-PLIST-{i:03d}", f"Plist Seed {i:03d} {dept.title()} {DATE_TAG}",
            f"{15 + i:.2f}", str((i % 9) + 1), compare, DEPARTMENT_BRAND[dept], dept,
        ])
    out.append(write_csv(
        csv_dir / "plist_seed_25_products.csv",
        BASE_HEADER + ["compareAtPrice", "brand", "departmentId"], seed,
    ))
    return out


def build_placeholder_csv(gen_dir: Path):
    out, warnings = [], []
    v2 = os.environ.get("V2_PRODUCT_SKU", "").strip()
    admin = os.environ.get("ADMIN_PRODUCT_SKU", "").strip()
    shared_url = os.environ.get("SHARED_IMAGE_URL", "").strip()

    if v2:
        out.append(write_csv(gen_dir / "csv_sku_other_vendor.csv", BASE_HEADER, [
            [v2, f"Overwrite Try V2 {DATE_TAG}", "1", "5"],
            ["AUTO-CSV-0601", f"Scope Valid Row {DATE_TAG}", "9.00", "2"],
        ]))
        out.append(write_csv(gen_dir / "scope_sku_other_vendor.csv", BASE_HEADER, [
            [v2, f"Overwrite Try {DATE_TAG}", "1", "5"],
        ]))
    else:
        warnings.append("V2_PRODUCT_SKU chưa đặt -> bỏ qua csv_sku_other_vendor.csv, scope_sku_other_vendor.csv")

    if admin:
        out.append(write_csv(gen_dir / "csv_sku_admin.csv", BASE_HEADER, [
            [admin, f"Overwrite Try Admin {DATE_TAG}", "1", "5"],
            ["AUTO-CSV-0602", f"Scope Valid Row Admin {DATE_TAG}", "9.00", "2"],
        ]))
    else:
        warnings.append("ADMIN_PRODUCT_SKU chưa đặt -> bỏ qua csv_sku_admin.csv")

    if shared_url:
        out.append(write_csv(gen_dir / "pstat_shared_image.csv", BASE_HEADER + ["image"], [
            ["AUTO-PSTAT-010A", f"Pstat Shared Image A {DATE_TAG}", "12.00", "3", shared_url],
            ["AUTO-PSTAT-010B", f"Pstat Shared Image B {DATE_TAG}", "12.00", "3", shared_url],
        ]))
    return out, warnings


def build_large_csv(gen_dir: Path, suffix: str):
    out = []
    for count, tag in ((50000, "A"), (50001, "B")):
        rows = (
            [f"AUTO-BIG{suffix}{tag}-{i:05d}", f"Bulk Row {i:05d}", "5.00", "1"]
            for i in range(1, count + 1)
        )
        out.append(write_csv(gen_dir / f"csv_{count}_rows.csv", BASE_HEADER, rows))

    # > 20 MB but < 50,000 rows: ~1 KB description per row, stop once >= 21,500,000 bytes
    target = 21_500_000
    path = gen_dir / "csv_over_20mb.csv"
    filler = ("Lorem ipsum dolor sit amet consectetur adipiscing elit " * 20)[:1000]
    with path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.writer(fh, lineterminator="\n")
        writer.writerow(BASE_HEADER + ["description"])
        i = 0
        while fh.tell() < target:
            i += 1
            writer.writerow([f"AUTO-BIG{suffix}C-{i:05d}", f"Oversize Row {i:05d}", "5.00", "1", filler])
    out.append(path)
    return out


def build_media(gen_dir: Path, skip_large: bool):
    out = []
    out.append(write_raw(gen_dir / "img_ok_200kb.png", make_png(200 * KIB)))
    out.append(write_raw(gen_dir / "avatar_ok_200kb.png", make_png(200 * KIB, 256, 256)))
    out.append(write_raw(gen_dir / "img_ok.jpg", make_jpeg()))
    out.append(write_raw(gen_dir / "img_ok.webp", base64.b64decode(WEBP_1X1)))
    out.append(write_raw(gen_dir / "img_ok.gif", base64.b64decode(GIF_1X1)))
    if not skip_large:
        out.append(write_raw(gen_dir / "img_10mb_decimal.png", make_png(10_000_000)))
        out.append(write_raw(gen_dir / "img_exact_10mib.png", make_png(10 * MIB)))
        out.append(write_raw(gen_dir / "img_11mb.png", make_png(11 * MIB)))
    out.append(write_raw(
        gen_dir / "img_vector.svg",
        b'<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60">'
        b'<rect width="120" height="60" fill="#1e3a5f"/>'
        b'<text x="10" y="35" fill="#fff" font-size="14">PARSCA SVG</text></svg>\n',
    ))
    out.append(write_raw(gen_dir / "img_photo.heic", make_fake_heic()))
    out.append(write_raw(gen_dir / "doc_sample.pdf", make_pdf()))
    out.append(write_raw(gen_dir / "fake_image_text.png", b"This is plain text renamed to .png\n"))
    out.append(write_raw(
        gen_dir / "csv_valid_5_rows.xlsx", make_xlsx(VALID_HEADER, valid_rows(1))
    ))
    return out


# ----------------------------------------------------------------------------
def main():
    default_root = Path(__file__).resolve().parent.parent / "test-data"
    parser = argparse.ArgumentParser(description="Sinh fixture cho bộ test PARSCA Vendor")
    parser.add_argument("--out-root", type=Path, default=default_root,
                        help=f"Thư mục gốc đầu ra (mặc định: {default_root})")
    parser.add_argument("--skip-large", action="store_true",
                        help="Bỏ qua CSV 50.000 dòng / > 20 MB và ảnh 10–11 MB")
    parser.add_argument("--csv-only", action="store_true", help="Chỉ sinh csv/ (file nhỏ, commit được)")
    args = parser.parse_args()

    csv_dir = args.out_root / "csv"
    gen_dir = args.out_root / "generated"
    created = build_small_csv(csv_dir)
    warnings = []
    if not args.csv_only:
        files, warnings = build_placeholder_csv(gen_dir)
        created += files
        if not args.skip_large:
            suffix = os.environ.get("RUN_SUFFIX", "").strip() or datetime.now().strftime("%Y%m%d%H%M")
            created += build_large_csv(gen_dir, suffix)
        created += build_media(gen_dir, args.skip_large)

    for path in created:
        print(f"  {path.stat().st_size:>12,d} B  {path}")
    for w in warnings:
        print(f"[WARN] {w}", file=sys.stderr)
    print(f"Done: {len(created)} file(s).")


if __name__ == "__main__":
    main()
