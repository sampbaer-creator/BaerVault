import { DemoBudget } from "@/components/demo/DemoBudget";
export default async function DemoBudgetPage({ searchParams }: { searchParams: Promise<{ year?: string; month?: string }> }) {
  const query = await searchParams;
  const requestedYear = Number(query.year), requestedMonth = Number(query.month);
  const year = Number.isInteger(requestedYear) && requestedYear >= 2000 && requestedYear <= 2200 ? requestedYear : 2026;
  const month = Number.isInteger(requestedMonth) && requestedMonth >= 1 && requestedMonth <= 12 ? requestedMonth : 8;
  return <DemoBudget year={year} month={month} />;
}
