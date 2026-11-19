from datetime import date

def money(cents):
    dollars, pennies = divmod(abs(cents), 100)
    return f"{'-' if cents < 0 else ''}${dollars:,}.{pennies:02d}"

def transaction(row):
    return f"- {row['date']} · {row['merchant']} · {money(row['cents'])}"

label = date.fromisoformat(f"{month}-01").strftime("%B %Y")
planned = sum(row["planned"] for row in comparison)
actual = sum(row["actual"] for row in comparison)
difference = planned - actual
position = f"{money(abs(difference))} {'over' if difference < 0 else 'under'} plan" if difference else "on plan"
lines = [
    f"# Household financial review - {label}", "",
    "**Synthetic data · USD**", "",
    f"Household spending was **{money(actual)}** against a **{money(planned)}** plan ({position}).",
    f"Excluded {int(excluded)} income or transfer records from spending.", "",
    "## Spending by category", "",
    "| Category | Planned | Spent | Remaining |", "| --- | ---: | ---: | ---: |",
]
for row in comparison:
    lines.append(f"| {row['category']} | {money(row['planned'])} | {money(row['actual'])} | {money(row['remaining'])} |")
lines.extend(["", "## Likely recurring bills", "",
              "Similar payments on the same account in each of the three prior months.", ""])
lines.extend([transaction(row) for row in recurring] or ["None found."])
lines.extend(["", "## Unusual transactions", "",
              "Expenses of $300 or more without a matching monthly pattern.", ""])
lines.extend([transaction(row) for row in unusual] or ["None found."])
lines.extend(["", "## Statistical forecast for the next budget", "",
              "Observed category months only. 65% recent weighted average and 35% median. Review each recommendation before applying.", "",
              "| Category | Forecast | Observed months | Confidence |", "| --- | ---: | ---: | --- |"])
for row in recommendations:
    lines.append(f"| {row['category']} | {money(row['suggestedCents'])} | {row['monthsObserved']} | {row['confidence']} |")
return {"report": "\n".join(lines) + "\n", "filename": f"household-review-{month}.md"}
