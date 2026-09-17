export type BudgetAdvice = {
  suggestions: Array<{ categoryName: string; suggestedAmount: number; rationale: string }>;
  overallTip: string;
  confidence: "low" | "medium" | "high";
};

export function normalizeBudgetAdvice(advice: BudgetAdvice, historyMonthCount: number): BudgetAdvice {
  const seen = new Set<string>();
  const suggestions = advice.suggestions.flatMap((suggestion) => {
    const categoryName = suggestion.categoryName.trim();
    if (!categoryName) return [];
    const key = categoryName.toLocaleLowerCase();
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ ...suggestion, categoryName }];
  });
  return {
    ...advice,
    suggestions,
    confidence: historyMonthCount < 3 ? "low" : advice.confidence,
  };
}
