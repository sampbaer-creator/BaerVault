import json
from datetime import date

data = json.loads(fixture)
month = data["month"]
if date.fromisoformat(f"{month}-01").isoformat()[:7] != month:
    raise ValueError("Review month must be YYYY-MM")

budget = data["budgetCents"]
categories = {
    "pine apartments": "Housing",
    "cedar internet": "Utilities",
    "maple market": "Groceries",
    "birch cafe": "Dining",
}
if set(budget) != {*categories.values(), "Other"}:
    raise ValueError("Budget must include all five sample categories")
if any(type(cents) is not int or cents < 0 for cents in budget.values()):
    raise ValueError("Budget amounts must be nonnegative integer cents")

seen = set()
expenses = []
excluded = 0
has_review_rows = False
for row in data["transactions"]:
    row_id = row["id"]
    if not isinstance(row_id, str) or not row_id or row_id in seen:
        raise ValueError("Transaction IDs must be nonempty and unique")
    seen.add(row_id)
    day = date.fromisoformat(row["date"])
    cents = row["cents"]
    kind = row["kind"]
    if type(cents) is not int or cents <= 0 or kind not in {"expense", "transfer", "income"}:
        raise ValueError(f"Invalid amount or kind for {row_id}")
    merchant_key = " ".join(row["merchant"].casefold().split())
    if not merchant_key or not isinstance(row["account"], str) or not row["account"].strip():
        raise ValueError(f"Missing merchant or account for {row_id}")
    in_month = day.isoformat()[:7] == month
    has_review_rows |= in_month
    if kind == "expense":
        expenses.append({**row, "date": day.isoformat(), "merchantKey": merchant_key,
                         "category": categories.get(merchant_key, "Other")})
    elif in_month:
        excluded += 1

if not has_review_rows:
    raise ValueError("Fixture contains no transactions for the review month")
return {"month": month, "budget": budget, "expenses": expenses, "excluded": excluded}
