import { reviewText } from "./spendingReview";

export type BudgetAdvice = {
  suggestions: Array<{ categoryName: string; isNewCategory?: boolean; suggestedAmount: number; rationale: string }>;
  insights?: string[];
  review?: import("./spendingReview").SpendingSummary;
  overallTip: string;
  confidence: "low" | "medium" | "high";
};

export function normalizeBudgetAdvice(advice: BudgetAdvice, historyMonthCount: number): BudgetAdvice {
  const seen = new Set<string>();
  const suggestions = advice.suggestions.flatMap((suggestion) => {
    const categoryName = suggestion.categoryName.trim();
    if (!categoryName) return [];
    const key = categoryName;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ ...suggestion }];
  });
  return {
    ...advice,
    suggestions,
    confidence: historyMonthCount < 3 ? "low" : advice.confidence,
  };
}

type IdentifiedAdvice = Omit<BudgetAdvice, "suggestions"> & {
  suggestions: Array<BudgetAdvice["suggestions"][number] & { categoryId: string | null; isNewCategory: boolean }>;
};

// Only this server-side mapping can restore original category names after AI.
export function resolveAdviceCategories(advice: IdentifiedAdvice, categoryNames: ReadonlyMap<string, string>): BudgetAdvice {
  const seen = new Set<string>();
  const suggestions = advice.suggestions.map(suggestion => {
    let categoryName: string;
    if (suggestion.categoryId !== null) {
      const original = categoryNames.get(suggestion.categoryId);
      if (suggestion.isNewCategory || original === undefined) throw new Error("Unrecognized category identity. Request a new review.");
      categoryName = original;
      // A malformed mapping must never let an identifier select between names.
      if ([...categoryNames.values()].filter(name => name === original).length !== 1) throw new Error("Ambiguous category identity.");
    } else {
      categoryName = suggestion.categoryName.trim();
      const key = categoryName.toLocaleLowerCase();
      if (!suggestion.isNewCategory || !categoryName || [...categoryNames.values()].some(name =>
        name.trim().toLocaleLowerCase() === key || reviewText(name).toLocaleLowerCase() === key
      )) throw new Error("New category conflicts with existing category identity.");
    }
    if (seen.has(categoryName)) throw new Error("Duplicate category identity.");
    seen.add(categoryName);
    return { categoryName, isNewCategory: suggestion.isNewCategory, suggestedAmount: suggestion.suggestedAmount, rationale: suggestion.rationale };
  });
  return { ...advice, suggestions };
}

// Historical IDs identify exact names across months, not a month's database row.
// Refuse case/whitespace collisions rather than updating an arbitrary row.
export function findAdviceTarget<T extends { name: string }>(categories: T[], suggestion: { categoryName: string; isNewCategory?: boolean }): T | undefined {
  const matches = categories.filter(category => category.name.trim().toLocaleLowerCase() === suggestion.categoryName.trim().toLocaleLowerCase());
  if ((suggestion.isNewCategory && matches.length > 0) || matches.length > 1 || (matches.length === 1 && matches[0].name !== suggestion.categoryName)) throw new Error("Ambiguous category identity.");
  return matches[0];
}
