import { DemoBudgets } from "@/components/demo/DemoBudgets";
export default async function DemoBudgetsPage({ searchParams }: { searchParams: Promise<{ year?: string; month?: string }> }) {
  const query = await searchParams;
  const requestedYear = Number(query.year), requestedMonth = Number(query.month);
  const year = Number.isInteger(requestedYear) && requestedYear >= 2000 && requestedYear <= 2200 ? requestedYear : 2026;
  const month = Number.isInteger(requestedMonth) && requestedMonth >= 1 && requestedMonth <= 12 ? requestedMonth : 8;
  return <DemoBudgets year={year} month={month} />;
}
