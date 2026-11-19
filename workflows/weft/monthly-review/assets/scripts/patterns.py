from collections import defaultdict
from datetime import date

def month_index(value):
    day = date.fromisoformat(value)
    return day.year * 12 + day.month

review_month = month_index(f"{month}-01")
history = defaultdict(lambda: defaultdict(list))
current = []
for row in expenses:
    index = month_index(row["date"])
    key = (row["account"], row["merchantKey"])
    if review_month - 3 <= index < review_month:
        history[key][index].append(row)
    elif index == review_month:
        current.append(row)

recurring = []
unusual = []
for row in sorted(current, key=lambda item: (item["date"], item["id"])):
    key = (row["account"], row["merchantKey"])
    months = history[key]
    prior = [entries[0] for entries in months.values() if len(entries) == 1]
    if len(prior) == 3:
        latest = max(prior, key=lambda item: item["date"])
        baseline = latest["cents"]
        tolerance = max(10000, baseline * 10)
        days = [int(item["date"][-2:]) for item in [*prior, row]]
        if (max(days) - min(days) <= 4
                and all(abs(item["cents"] - baseline) * 100 <= tolerance for item in [*prior, row])):
            recurring.append(row)
            continue
    if row["cents"] >= 30000:
        unusual.append(row)

return {"recurring": recurring, "unusual": unusual}
