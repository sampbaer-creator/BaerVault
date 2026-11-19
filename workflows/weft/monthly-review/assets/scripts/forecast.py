from collections import defaultdict
from statistics import median
from math import floor, ceil

# Use the same deterministic math as BaerVault's budgetForecast.ts.
# Values are chronological integer cents. Unknown months are not zeros.
def round_js(value):
    return floor(value + 0.5)

monthly = defaultdict(lambda: defaultdict(int))
for row in expenses:
    observed_month = row["date"][:7]
    if observed_month <= month:
        monthly[row["category"]][observed_month] += row["cents"]

recommendations = []
for category, by_month in sorted(monthly.items()):
    values = [by_month[key] for key in sorted(by_month)[-12:]]
    middle = median(values)
    weight_sum = len(values) * (len(values) + 1) / 2
    weighted = round_js(sum(min(value, middle * 2) * (i + 1) for i, value in enumerate(values)) / weight_sum)
    base = round_js((middle + weighted) / 2)
    deviation = median([abs(value - middle) for value in values])
    buffer = min(0.1, deviation / middle) if middle > 0 else 0
    buffered = round_js(base * (1 + buffer))
    suggested = min(99_999_999_999_900, max(ceil(middle * 0.5),
        min(floor(middle * 1.5), round_js(buffered / 100) * 100)))
    recommendations.append({
        "category": category,
        "suggestedCents": suggested,
        "monthsObserved": len(values),
        "confidence": "low" if len(values) < 3 else "medium" if len(values) < 6 else "high",
        "method": "Median blended with recency-weighted average, capped outliers and volatility buffer"
    })
return {"recommendations": recommendations}
