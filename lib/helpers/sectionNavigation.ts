export type SectionQuery = { year?: string | string[]; month?: string | string[]; tab?: string | string[] };

export const accountTabs = [
  { label: "Accounts", value: "accounts" },
  { label: "Investments", value: "investments" },
  { label: "Goals", value: "goals" },
] as const;

export const budgetTabs = [
  { label: "Budget", value: "budget" },
  { label: "Cash flow", value: "cash-flow" },
] as const;

export const transactionTabs = [
  { label: "Transactions", value: "transactions" },
  { label: "Recurring", value: "recurring" },
] as const;

export function sectionHref(basePath: string, tab: string, query: SectionQuery = {}) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  for (const key of ["year", "month"] as const) {
    const value = query[key];
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first === "string") params.set(key, first);
  }
  return `${basePath}?${params}`;
}

export function selectedTab<T extends string>(value: string | string[] | undefined, options: readonly T[], fallback: T): T {
  return typeof value === "string" && options.includes(value as T) ? value as T : fallback;
}
