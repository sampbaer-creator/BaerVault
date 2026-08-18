import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

import { createDashboardViewModel } from "@/features/dashboard/dashboardViewModel";
import { getFinancialAccounts } from "@/lib/data/accounts";
import { getBudgetMonth } from "@/lib/data/budgets";
import { errorMessage } from "@/lib/data/errors";
import { getSavingsGoals } from "@/lib/data/goals";
import { getInvestmentAccounts } from "@/lib/data/investments";
import type { MobileShellData } from "@/lib/mobileShell";

function requestedMonth(request: NextRequest) {
  const now = new Date();
  const year = Number(request.nextUrl.searchParams.get("year"));
  const month = Number(request.nextUrl.searchParams.get("month"));
  return {
    year: Number.isInteger(year) && year >= 2000 && year <= 2200 ? year : now.getUTCFullYear(),
    month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : now.getUTCMonth() + 1,
    currentYear: now.getUTCFullYear(),
    currentMonth: now.getUTCMonth() + 1,
  };
}

export async function GET(request: NextRequest) {
  const { orgId } = await auth.protect();
  if (!orgId) return Response.json({ error: "Select a household first." }, { status: 403 });

  try {
    const selected = requestedMonth(request);
    const [currentMonth, financialAccounts, investmentAccounts, goals] = await Promise.all([
      getBudgetMonth(selected.currentYear, selected.currentMonth),
      getFinancialAccounts(),
      getInvestmentAccounts(),
      getSavingsGoals(),
    ]);
    const selectedBudget = selected.year === selected.currentYear && selected.month === selected.currentMonth
      ? currentMonth
      : await getBudgetMonth(selected.year, selected.month);
    const payload: MobileShellData = {
      currentMonth,
      selectedBudget,
      financialAccounts,
      investmentAccounts,
      goals,
      dashboard: createDashboardViewModel(currentMonth, investmentAccounts, financialAccounts),
    };
    return Response.json(payload, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
