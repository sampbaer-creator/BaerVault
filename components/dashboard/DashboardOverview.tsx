"use client";

import {
  IconArrowRight,
  IconArrowUpRight,
  IconBuildingBank,
  IconCalendar,
  IconReceipt,
  IconShieldCheck,
  IconWallet,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useCurrencyFormatter } from "@/components/preferences/PreferencesProvider";
import {
  categoryActual,
  totalIncome,
  totalPlanned,
  totalSpending,
  type BudgetMonth,
} from "@/lib/finance";
import { valueFor, type InvestmentAccount } from "@/lib/investmentData";

import styles from "./DashboardOverview.module.css";

const chartColors = ["#000080", "#72998a", "#d4af37", "#9abfd8", "#5e7b72", "#cfac87"];

type DashboardProps = {
  budget: BudgetMonth;
  accounts: InvestmentAccount[];
  basePath?: string;
};

function SectionHeading({ title, href, action, id }: { title: string; href: string; action: string; id?: string }) {
  return (
    <div className={styles.sectionHeading}>
      <h3 id={id}>{title}</h3>
      <Link className={styles.textLink} href={href}>
        {action}
        <IconArrowRight size={15} aria-hidden="true" />
      </Link>
    </div>
  );
}

function buildCashFlowSeries(budget: BudgetMonth) {
  const events = [
    ...budget.incomeEntries.map((entry) => ({ date: entry.date, income: entry.amount, spending: 0 })),
    ...budget.categories.flatMap((category) =>
      category.purchases.map((purchase) => ({ date: purchase.date, income: 0, spending: purchase.amount })),
    ),
  ].sort((a, b) => a.date.localeCompare(b.date));

  let income = 0;
  let spending = 0;
  const byDate = new Map<string, { income: number; spending: number }>();

  for (const event of events) {
    income += event.income;
    spending += event.spending;
    byDate.set(event.date, { income, spending });
  }

  return Array.from(byDate, ([date, values]) => ({
    day: new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    ...values,
  }));
}

function MoneyTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  const money = useCurrencyFormatter();
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.chartTooltip}>
      <span>{label}</span>
      {payload.map((item) => (
        <div key={item.name}>
          <i style={{ background: item.color }} />
          <small>{item.name}</small>
          <strong>{money.format(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}

export function DashboardOverview({ budget, accounts, basePath = "" }: DashboardProps) {
  const money = useCurrencyFormatter();
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({});
  const [marketSettled, setMarketSettled] = useState(false);
  const symbols = useMemo(
    () => [...new Set(accounts.flatMap((account) => account.holdings.map((holding) => holding.symbol)))],
    [accounts],
  );

  useEffect(() => {
    if (!symbols.length || basePath) return;
    const controller = new AbortController();
    setMarketSettled(false);
    Promise.allSettled(
      symbols.map(async (symbol) => {
        const response = await fetch(`/api/market-data?symbol=${encodeURIComponent(symbol)}&range=1M`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok || !Number.isFinite(data.price)) throw new Error(data.error ?? "Market price unavailable");
        return [symbol, Number(data.price)] as const;
      }),
    ).then((results) => {
      if (controller.signal.aborted) return;
      const prices = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
      setMarketPrices(Object.fromEntries(prices));
      setMarketSettled(true);
    });
    return () => controller.abort();
  }, [basePath, symbols]);

  const income = totalIncome(budget);
  const spending = totalSpending(budget);
  const planned = totalPlanned(budget);
  const cashAvailable = income - spending;
  const portfolioValue = accounts.reduce(
    (sum, account) => sum + account.holdings.reduce(
      (accountTotal, holding) => accountTotal + valueFor(holding, marketPrices[holding.symbol] ?? holding.fallbackPrice),
      0,
    ),
    0,
  );
  const waitingForMarket = !basePath && symbols.length > 0 && !marketSettled;
  const marketUnavailable = !basePath && marketSettled && symbols.some((symbol) => marketPrices[symbol] === undefined);
  const portfolioDisplay = waitingForMarket ? "Updating…" : marketUnavailable ? "Unavailable" : money.format(portfolioValue);
  const position = cashAvailable + portfolioValue;
  const budgetUsed = planned ? Math.min((spending / planned) * 100, 100) : 0;
  const savingsRate = income ? (cashAvailable / income) * 100 : 0;
  const cashFlowSeries = buildCashFlowSeries(budget);
  const categories = budget.categories
    .map((category, index) => ({
      name: category.name,
      value: categoryActual(category),
      planned: category.plannedAmount,
      color: chartColors[index % chartColors.length],
    }))
    .filter((category) => category.value > 0)
    .sort((a, b) => b.value - a.value);
  const activity = [
    ...budget.incomeEntries.map((entry) => ({
      id: entry.id,
      name: entry.source,
      meta: `${entry.owner} · ${entry.date}`,
      amount: entry.amount,
      incoming: true,
    })),
    ...budget.categories.flatMap((category) =>
      category.purchases.map((purchase) => ({
        id: purchase.id,
        name: purchase.description,
        meta: `${category.name} · ${purchase.date}`,
        amount: purchase.amount,
        incoming: false,
      })),
    ),
  ]
    .sort((a, b) => b.meta.slice(-10).localeCompare(a.meta.slice(-10)))
    .slice(0, 5);

  return (
    <div className={styles.dashboard}>
      <section className={styles.intro} aria-labelledby="dashboard-title">
        <div>
          <h2 id="dashboard-title">Your financial home</h2>
          <p>{basePath ? "A complete household view using sample data." : "Income, spending, and investments—together in one calm view."}</p>
        </div>
        <div className={styles.periodBadge}>
          <IconCalendar size={16} aria-hidden="true" />
          {budget.month}
        </div>
      </section>

      <div className={styles.cockpit}>
        <section className={styles.positionCard} aria-labelledby="position-title">
          <div className={styles.positionTopline}>
            <span id="position-title">Total net worth</span>
            <IconShieldCheck size={20} aria-hidden="true" />
          </div>
          <p className={styles.positionValue}>{waitingForMarket ? "Updating…" : marketUnavailable ? "Unavailable" : money.format(position)}</p>
          <div className={styles.positionChange}>
            <IconArrowUpRight size={15} aria-hidden="true" />
            <span>{savingsRate.toFixed(1)}% retained this month</span>
          </div>
          <div className={styles.positionBreakdown}>
            <div>
              <span>Available cash</span>
              <strong>{money.format(cashAvailable)}</strong>
            </div>
            <div>
              <span>Portfolio value</span>
              <strong>{portfolioDisplay}</strong>
            </div>
          </div>
          <Link className={styles.positionAction} href={`${basePath}/investments`}>
            View portfolio <IconArrowRight size={15} aria-hidden="true" />
          </Link>
        </section>

        <section className={styles.cashFlowPanel} aria-labelledby="cash-flow-title">
          <div className={styles.chartHeading}>
            <div>
              <h3 id="cash-flow-title">Monthly cash flow</h3>
              <p>How money is moving through the household</p>
            </div>
            <div className={styles.legend} aria-hidden="true">
              <span><i className={styles.incomeDot} />Income</span>
              <span><i className={styles.spendingDot} />Spending</span>
            </div>
          </div>
          <div className={styles.cashFlowChart} role="img" aria-label={`Cumulative income is ${money.format(income)} and spending is ${money.format(spending)} for ${budget.month}.`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowSeries} margin={{ top: 14, right: 6, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000080" stopOpacity={0.16} />
                    <stop offset="100%" stopColor="#000080" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(29, 42, 54, 0.08)" strokeDasharray="3 5" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#75807b", fontSize: 10 }} minTickGap={24} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8a938f", fontSize: 10 }} tickFormatter={(value) => `$${Math.round(value / 1000)}k`} width={42} />
                <Tooltip content={<MoneyTooltip />} cursor={{ stroke: "rgba(0, 0, 128, 0.18)" }} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#000080" strokeWidth={2.4} fill="url(#incomeFill)" isAnimationActive={false} />
                <Area type="monotone" dataKey="spending" name="Spending" stroke="#72998a" strokeWidth={2.2} fill="transparent" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.chartStats}>
            <div><span>Income</span><strong>{money.format(income)}</strong></div>
            <div><span>Spent</span><strong>{money.format(spending)}</strong></div>
            <div><span>Net cash flow</span><strong className={cashAvailable >= 0 ? styles.positive : styles.negative}>{money.format(cashAvailable)}</strong></div>
          </div>
        </section>

        <section className={styles.activityPanel} aria-labelledby="activity-title">
          <SectionHeading id="activity-title" title="Transactions" href={`${basePath}/transactions`} action="See all" />
          <div className={styles.activityList}>
            {activity.map((item) => (
              <div className={styles.activityRow} key={item.id}>
                <span className={item.incoming ? styles.incomeIcon : styles.expenseIcon} aria-hidden="true">
                  {item.incoming ? <IconWallet size={17} /> : <IconReceipt size={17} />}
                </span>
                <div className={styles.activityCopy}>
                  <strong>{item.name}</strong>
                  <span>{item.meta}</span>
                </div>
                <span className={item.incoming ? styles.incoming : styles.outgoing}>
                  {item.incoming ? "+" : "−"}{money.format(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className={styles.lowerGrid}>
        <section className={styles.budgetPanel} aria-labelledby="budget-title">
          <SectionHeading id="budget-title" title="Spending plan" href={`${basePath}/budget`} action="Open budget" />
          <div className={styles.budgetContent}>
            <div className={styles.donutWrap} role="img" aria-label={`${budgetUsed.toFixed(0)} percent of the monthly budget has been used.`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categories} dataKey="value" nameKey="name" innerRadius="67%" outerRadius="91%" paddingAngle={2} stroke="none" isAnimationActive={false}>
                    {categories.map((category) => <Cell key={category.name} fill={category.color} />)}
                  </Pie>
                  <Tooltip content={<MoneyTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.donutCenter}><strong>{budgetUsed.toFixed(0)}%</strong><span>used</span></div>
            </div>
            <div className={styles.categoryList}>
              {categories.slice(0, 5).map((category) => (
                <div className={styles.categoryRow} key={category.name}>
                  <i style={{ background: category.color }} />
                  <span>{category.name}</span>
                  <strong>{money.format(category.value)}</strong>
                  <small>of {money.format(category.planned)}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.accountsPanel} aria-labelledby="accounts-title">
          <SectionHeading id="accounts-title" title="Investment accounts" href={`${basePath}/investments`} action="Manage" />
          <div className={styles.accountSummary}>
            <div><span>Current portfolio value</span><strong>{portfolioDisplay}</strong></div>
            <span className={styles.accountCount}>{accounts.length} accounts</span>
          </div>
          <div className={styles.accountList}>
            {accounts.map((account) => {
              const value = account.holdings.reduce(
                (sum, holding) => sum + valueFor(holding, marketPrices[holding.symbol] ?? holding.fallbackPrice),
                0,
              );
              const accountUnavailable = !basePath && marketSettled && account.holdings.some((holding) => marketPrices[holding.symbol] === undefined);
              return (
                <div className={styles.accountRow} key={account.id}>
                  <span className={styles.bankIcon}><IconBuildingBank size={18} aria-hidden="true" /></span>
                  <div><strong>{account.name}</strong><span>{account.owner} · {account.holdings.length} holdings</span></div>
                  <strong>{waitingForMarket ? "Updating…" : accountUnavailable ? "Unavailable" : money.format(value)}</strong>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
