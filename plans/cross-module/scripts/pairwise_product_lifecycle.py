"""Pairwise matrix generator for the PARSCA Vendor product lifecycle (cross-module).

Modules covered: PFORM / CSV -> SCOPE -> PSTAT -> WEB.
Usage:
    pip install allpairspy
    python pairwise_product_lifecycle.py            # Markdown table to stdout
    python pairwise_product_lifecycle.py --csv      # CSV to stdout
"""

import argparse
import csv
import sys
from itertools import product

from allpairspy import AllPairs

DIMENSIONS = {
    "D1_Channel": ["Form", "Import CSV"],
    "D2_Department": ["marine", "auto", "door", "tools"],
    "D3_InitialStatus": ["Active", "Draft", "Archived"],
    "D4_ActionAfterCreate": ["Keep", "Change status", "Edit name", "Delete"],
    "D5_Checker": ["Owner", "Other vendor", "Admin", "Guest"],
    "D6_Brand": ["Existing", "New"],
}

KEYS = list(DIMENSIONS.keys())
IDX = {key: i for i, key in enumerate(KEYS)}

# Status reached after "Change status" (always a real transition).
STATUS_TRANSITION = {"Active": "Draft", "Draft": "Active", "Archived": "Active"}


def is_valid(row):
    """Constraints. allpairspy passes partial rows, so check length before indexing."""
    if len(row) > IDX["D3_InitialStatus"]:
        # C1: Import CSV always creates Active products (status column ignored).
        if row[IDX["D1_Channel"]] == "Import CSV" and row[IDX["D3_InitialStatus"]] != "Active":
            return False
    if len(row) > IDX["D6_Brand"]:
        # C2: Product form only offers brands from /product-brands (no new brand).
        if row[IDX["D1_Channel"]] == "Form" and row[IDX["D6_Brand"]] == "New":
            return False
    return True


def final_status(initial, action):
    if action == "Delete":
        return "Deleted"
    if action == "Change status":
        return STATUS_TRANSITION[initial]
    return initial


def expected_result(combo):
    status = final_status(combo[IDX["D3_InitialStatus"]], combo[IDX["D4_ActionAfterCreate"]])
    checker = combo[IDX["D5_Checker"]]
    notes = []

    if checker == "Owner":
        if status == "Deleted":
            notes.append("Not in /vendor/products; detail shows not-found message")
        else:
            notes.append(f"Listed in /vendor/products as {status}; createdBy = owner")
    elif checker == "Other vendor":
        notes.append("Not listed; GET /products/admin/:id -> 404 'Product not found'")
    elif checker == "Admin":
        if status == "Deleted":
            notes.append("Not in admin list (204 on delete)")
        else:
            notes.append(f"Visible in admin list as {status}; Created by = owner")
    elif checker == "Guest":
        if status == "Active":
            notes.append("Visible on storefront immediately (GET /products)")
        else:
            notes.append("Storefront product page -> 404")

    if combo[IDX["D1_Channel"]] == "Import CSV" and combo[IDX["D6_Brand"]] == "New":
        notes.append("New brand added to shared brand filter (@CodeHienTai Q-V5)")
    if combo[IDX["D4_ActionAfterCreate"]] == "Edit name" and checker in ("Owner", "Guest") and status == "Active":
        notes.append("New name shown; slug rule per doc 09/12")

    return "; ".join(notes)


def full_cartesian_valid_count():
    return sum(1 for combo in product(*DIMENSIONS.values()) if is_valid(list(combo)))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--csv", action="store_true", help="Output CSV instead of Markdown")
    args = parser.parse_args()

    rows = [list(combo) for combo in AllPairs(list(DIMENSIONS.values()), filter_func=is_valid)]
    header = ["#", "Combo ID", *KEYS, "Final status", "Expected"]

    if args.csv:
        writer = csv.writer(sys.stdout)
        writer.writerow(header)
        for i, combo in enumerate(rows, start=1):
            status = final_status(combo[IDX["D3_InitialStatus"]], combo[IDX["D4_ActionAfterCreate"]])
            writer.writerow([i, f"LC-{i:02d}", *combo, status, expected_result(combo)])
        return

    print(f"<!-- Full Cartesian valid: {full_cartesian_valid_count()} / Pairwise: {len(rows)} -->")
    print("| " + " | ".join(header) + " |")
    print("|" + "---|" * len(header))
    for i, combo in enumerate(rows, start=1):
        status = final_status(combo[IDX["D3_InitialStatus"]], combo[IDX["D4_ActionAfterCreate"]])
        cells = [str(i), f"LC-{i:02d}", *combo, status, expected_result(combo)]
        print("| " + " | ".join(cells) + " |")


if __name__ == "__main__":
    main()
