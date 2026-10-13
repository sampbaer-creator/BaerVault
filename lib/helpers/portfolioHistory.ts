type HistoricalHolding = { shares: number; points: Array<{ date: string; close: number }> };

/** Historical pricing of today's shares, only where every holding has a quote. */
export function portfolioHistory(holdings: HistoricalHolding[]) {
  if (!holdings.length || holdings.some((holding) => !holding.points.length)) return [];
  const series = holdings.map((holding) => ({ shares: holding.shares, prices: new Map(holding.points.map((point) => [point.date, point.close])) }));
  return [...series[0].prices.keys()]
    .filter((date) => series.every((holding) => holding.prices.has(date)))
    .sort()
    .map((date) => ({ date, value: series.reduce((sum, holding) => sum + holding.prices.get(date)! * holding.shares, 0) }));
}
