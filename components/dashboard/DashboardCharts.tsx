"use client";

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
import type {
  DashboardCashFlowPoint,
  DashboardCategory,
} from "./dashboardViewModel";
import styles from "./DashboardOverview.module.css";

function MoneyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
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

export function CashFlowVisualization({
  data,
  month,
  income,
  spending,
}: {
  data: DashboardCashFlowPoint[];
  month: string;
  income: number;
  spending: number;
}) {
  const money = useCurrencyFormatter();

  return (
    <>
      <div
        className={styles.cashFlowChart}
        role="img"
        aria-label={`Cumulative income is ${money.format(income)} and spending is ${money.format(spending)} for ${month}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 14, right: 6, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--dashboard-chart-primary)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="100%"
                  stopColor="var(--dashboard-chart-primary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--dashboard-chart-grid)"
              strokeDasharray="3 5"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--dashboard-chart-axis)", fontSize: 11 }}
              minTickGap={24}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--dashboard-chart-axis)", fontSize: 11 }}
              tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
              width={42}
            />
            <Tooltip
              content={<MoneyTooltip />}
              cursor={{ stroke: "var(--dashboard-chart-cursor)" }}
            />
            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="var(--dashboard-chart-primary)"
              strokeWidth={2.4}
              fill="url(#incomeFill)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="spending"
              name="Spending"
              stroke="var(--dashboard-chart-secondary)"
              strokeWidth={2.2}
              fill="transparent"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <details className={styles.chartDataDetails}>
        <summary>View cash-flow data</summary>
        <div className={styles.chartTableWrap}>
          <table>
            <caption>Cumulative income and spending for {month}</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Income</th>
                <th scope="col">Spending</th>
              </tr>
            </thead>
            <tbody>
              {data.map((point) => (
                <tr key={point.day}>
                  <th scope="row">{point.day}</th>
                  <td>{money.format(point.income)}</td>
                  <td>{money.format(point.spending)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}

export function BudgetDonut({
  categories,
  budgetUsed,
}: {
  categories: DashboardCategory[];
  budgetUsed: number;
}) {
  return (
    <div
      className={styles.donutWrap}
      role="img"
      aria-label={`${budgetUsed.toFixed(0)} percent of the monthly budget has been used.`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={categories}
            dataKey="value"
            nameKey="name"
            innerRadius="67%"
            outerRadius="91%"
            paddingAngle={2}
            stroke="none"
            isAnimationActive={false}
          >
            {categories.map((category, index) => (
              <Cell
                key={category.name}
                fill={`var(--dashboard-category-${(index % 6) + 1})`}
              />
            ))}
          </Pie>
          <Tooltip content={<MoneyTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className={styles.donutCenter}>
        <strong>{budgetUsed.toFixed(0)}%</strong>
        <span>used</span>
      </div>
    </div>
  );
}
