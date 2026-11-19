actual = dict.fromkeys(budget, 0)
for row in expenses:
    if row["date"][:7] == month:
        actual[row["category"]] += row["cents"]
return {"comparison": [
    {"category": category, "planned": planned, "actual": actual[category],
     "remaining": planned - actual[category]}
    for category, planned in budget.items()
]}
