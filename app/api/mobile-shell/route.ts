import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

import { createDashboardViewModel } from "@/features/dashboard/dashboardViewModel";
import { getFinancialAccounts } from "@/lib/data/accounts";
import { getBankConnections } from "@/lib/data/bankConnections";
import { getUpcomingPayments } from "@/lib/data/recurring";
import { getBudgetMonth } from "@/lib/data/budgets";
import { errorMessage } from "@/lib/data/errors";
import { getSavingsGoals } from "@/lib/data/goals";
import { getInvestmentAccounts } from "@/lib/data/investments";
import type { MobileShellData } from "@/lib/mobileShell";
import { parseMonthSelection } from "@/lib/monthSelection";

export async function GET(request: NextRequest) {
  const { orgId } = await auth.protect();
  if (!orgId) return Response.json({ error: "Select a household first." }, { status: 403 });

  try {
    const selected = parseMonthSelection(request.nextUrl.searchParams.get("year"), request.nextUrl.searchParams.get("month"));
    const [selectedMonth, financialAccounts, investmentAccounts, goals, bankConnections, upcoming] = await Promise.all([
      getBudgetMonth(selected.year, selected.month),
      getFinancialAccounts(),
      getInvestmentAccounts(),
      getSavingsGoals(),
      getBankConnections(),
      getUpcomingPayments(selected.year, selected.month),
    ]);
    const payload: MobileShellData = {
      selectedMonth,
      financialAccounts,
      bankConnections,
      investmentAccounts,
      goals,
      dashboard: createDashboardViewModel(selectedMonth, investmentAccounts, financialAccounts, upcoming),
    };
    return Response.json(payload, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
