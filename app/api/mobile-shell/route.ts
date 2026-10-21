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
import type { MobileShellData } from "@/lib/helpers/mobileShell";
import { parseMonthSelection } from "@/lib/helpers/monthSelection";

export async function GET(request: NextRequest) {
  const { orgId } = await auth.protect();
  if (!orgId) return Response.json({ error: "Select a household first." }, { status: 403 });

  try {
    const selected = parseMonthSelection(request.nextUrl.searchParams.get("year"), request.nextUrl.searchParams.get("month"));
    const [budgetResult, accountsResult, investmentsResult, goalsResult, connectionsResult, upcomingResult] = await Promise.allSettled([
      getBudgetMonth(selected.year, selected.month),
      getFinancialAccounts(),
      getInvestmentAccounts(),
      getSavingsGoals(),
      getBankConnections(),
      getUpcomingPayments(selected.year, selected.month),
    ]);

    // The budget is the only required part of the mobile shell. The other
    // panels are independent and should not take down the whole app when an
    // optional table or provider is unavailable.
    if (budgetResult.status === "rejected") throw budgetResult.reason;
    const selectedMonth = budgetResult.value;
    const financialAccounts = accountsResult.status === "fulfilled" ? accountsResult.value : [];
    const investmentAccounts = investmentsResult.status === "fulfilled" ? investmentsResult.value : [];
    const goals = goalsResult.status === "fulfilled" ? goalsResult.value : [];
    const bankConnections = connectionsResult.status === "fulfilled" ? connectionsResult.value : [];
    const upcoming = upcomingResult.status === "fulfilled" ? upcomingResult.value : [];
    const payload: MobileShellData = {
      selectedMonth,
      financialAccounts,
      bankConnections,
      investmentAccounts,
      goals,
      dashboard: createDashboardViewModel(selectedMonth, investmentAccounts, financialAccounts, upcoming, goals),
    };
    return Response.json(payload, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
