"use client";
import { BudgetWorkspace } from "@/components/budget/BudgetWorkspace";import { augustBudget, withDemoSpendingAccounts } from "@/lib/mockFinanceData";
import { demoFinancialAccounts } from "@/lib/accounts";
import type { BudgetMonth } from "@/lib/finance";
const ok=<T,>(data:T)=>Promise.resolve({ok:true as const,data});const id=()=>`demo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const actions={addCategoryAction:(input:{name:string;plannedAmount:number})=>ok({id:id(),name:input.name,plannedAmount:input.plannedAmount,purchases:[]}),deleteBudgetCategoryAction:()=>ok(undefined),deleteBudgetEntryAction:()=>ok(undefined),saveBudgetEntryAction:(input:{id?:string})=>ok({id:input.id??id()}),updateBudgetCategoryAction:()=>ok(undefined)};
export function DemoBudget({ year = 2026, month = 8 }: { year?: number; month?: number }) {
  const isFeaturedMonth = year === 2026 && month === 8;
  const label = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, 1)));
  const source = isFeaturedMonth ? withDemoSpendingAccounts(augustBudget) : { categories: [], incomeEntries: [] };
  const budget: BudgetMonth & { year: number; monthNumber: number } = {
    ...source,
    categories: source.categories,
    month: label,
    year,
    monthNumber: month,
  };
  return <BudgetWorkspace key={`${year}-${month}`} initialBudget={budget} accounts={demoFinancialAccounts.map(({ id, name, institution, type }) => ({ id, name, institution, type }))} actions={actions} />;
}
