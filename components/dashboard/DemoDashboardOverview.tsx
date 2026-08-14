"use client";

import {
  IconArrowDownRight,
  IconArrowRight,
  IconArrowUpRight,
  IconBuildingBank,
  IconCoin,
  IconHome,
  IconReceipt,
  IconShieldCheck,
  IconShoppingBag,
  IconTrendingUp,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  budgetCategories,
  investments,
  netWorthHistory,
  recentTransactions,
  summaryStats,
} from "./demoDashboardData";
import styles from "./DemoDashboardOverview.module.css";

type Timeframe = keyof typeof netWorthHistory;

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
};

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className={styles.chartTooltip}>
      <span>{label}</span>
      <strong>
        {payload[0].value.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        })}
      </strong>
    </div>
  );
}

function NetWorthChart({ timeframe }: { timeframe: Timeframe }) {
  return (
    <div
      className={styles.chart}
      role="img"
      aria-label={`Net worth increased to $54,820 over the selected ${timeframe} period.`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={netWorthHistory[timeframe]}
          margin={{ top: 12, right: 4, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-secondary)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--chart-secondary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="rgba(28, 39, 52, 0.08)"
            strokeDasharray="3 5"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--app-text-muted)", fontSize: 11 }}
            minTickGap={28}
          />
          <YAxis hide domain={["dataMin - 800", "dataMax + 500"]} />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "rgba(31, 77, 59, 0.22)" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            isAnimationActive={false}
            stroke="var(--chart-primary)"
            strokeWidth={2.25}
            fill="url(#netWorthFill)"
            activeDot={{
              r: 4,
              fill: "var(--chart-primary)",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function SectionHeading({
  title,
  href,
  action,
  id,
}: {
  title: string;
  href: string;
  action: string;
  id: string;
}) {
  return (
    <div className={styles.sectionHeading}>
      <h3 id={id}>{title}</h3>
      <Link className={styles.textLink} href={href}>
        {action}
        <IconArrowRight size={15} stroke={1.9} aria-hidden="true" />
      </Link>
    </div>
  );
}

export function DemoDashboardOverview() {
  const [timeframe, setTimeframe] = useState<Timeframe>("3M");

  return (
    <div className={styles.dashboard}>
      <section className={styles.intro} aria-labelledby="dashboard-greeting">
        <div>
          <h2 id="dashboard-greeting">Good afternoon, Sam</h2>
          <p>Your household is moving in the right direction this month.</p>
        </div>
        <div className={styles.secureBadge}>
          <IconShieldCheck size={17} stroke={1.8} aria-hidden="true" />
          <span>Household overview</span>
        </div>
      </section>

      <section
        className={styles.netWorthSurface}
        aria-labelledby="net-worth-title"
      >
        <div className={styles.netWorthTopline}>
          <div className={styles.netWorthCopy}>
            <h3 id="net-worth-title">Net worth</h3>
            <p className={styles.netWorthValue}>$54,820.21</p>
            <div className={styles.netWorthChange}>
              <span>
                <IconArrowUpRight size={16} stroke={2} aria-hidden="true" />
                +$1,284.42
              </span>
              <span>+2.4% this month</span>
            </div>
          </div>
          <div
            className={styles.timeframes}
            aria-label="Net worth chart timeframe"
          >
            {(Object.keys(netWorthHistory) as Timeframe[]).map((item) => (
              <button
                type="button"
                className={
                  timeframe === item ? styles.timeframeActive : undefined
                }
                aria-pressed={timeframe === item}
                onClick={() => setTimeframe(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <NetWorthChart timeframe={timeframe} />
        <div className={styles.summaryRail}>
          {summaryStats.map((stat) => (
            <div className={styles.summaryStat} key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.detail}</small>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.detailGrid}>
        <section
          className={`${styles.panel} ${styles.budgetPanel}`}
          aria-labelledby="budget-title"
        >
          <SectionHeading
            id="budget-title"
            title="August budget"
            href="/demo/budget"
            action="Open budget"
          />
          <div className={styles.budgetLead}>
            <div>
              <span>Spent</span>
              <strong>$3,210.18</strong>
            </div>
            <p>
              <strong>$1,289.82</strong> remaining of $4,500
            </p>
          </div>
          <div
            className={styles.budgetBar}
            role="progressbar"
            aria-label="Monthly budget spent"
            aria-valuemin={0}
            aria-valuemax={4500}
            aria-valuenow={3210.18}
            aria-valuetext="$3,210.18 of $4,500 spent"
          >
            <span style={{ width: "71.3%" }} />
          </div>
          <div className={styles.budgetCategories}>
            {budgetCategories.map((category) => (
              <div className={styles.budgetCategory} key={category.label}>
                <div>
                  <span
                    className={`${styles.categoryDot} ${styles[category.color]}`}
                  />
                  <span>{category.label}</span>
                </div>
                <p>
                  <strong>${category.spent.toLocaleString()}</strong> / $
                  {category.budget.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          className={`${styles.panel} ${styles.investmentPanel}`}
          aria-labelledby="investment-title"
        >
          <SectionHeading
            id="investment-title"
            title="Investments"
            href="/demo/investments"
            action="View portfolio"
          />
          <div className={styles.investmentLead}>
            <div>
              <span>Portfolio value</span>
              <strong>$39,420.36</strong>
            </div>
            <span className={styles.positiveChip}>
              <IconTrendingUp size={15} stroke={1.9} aria-hidden="true" /> +1.7%
            </span>
          </div>
          <div className={styles.holdings}>
            {investments.map((investment) => (
              <div className={styles.holding} key={investment.symbol}>
                <span className={styles.symbol}>{investment.symbol}</span>
                <div className={styles.holdingName}>{investment.name}</div>
                <div className={styles.holdingValue}>
                  <strong>{investment.value}</strong>
                  <small
                    className={
                      investment.change.startsWith("+")
                        ? styles.positive
                        : styles.negative
                    }
                  >
                    {investment.change}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          className={`${styles.panel} ${styles.transactionsPanel}`}
          aria-labelledby="transactions-title"
        >
          <SectionHeading
            id="transactions-title"
            title="Recent activity"
            href="/demo/cash-flow"
            action="View cash flow"
          />
          <div className={styles.transactions}>
            {recentTransactions.map((transaction, index) => {
              const icons = [
                IconShoppingBag,
                IconCoin,
                IconHome,
                IconBuildingBank,
              ];
              const Icon = icons[index];
              const incoming = transaction.amount.startsWith("+");

              return (
                <div
                  className={styles.transaction}
                  key={`${transaction.merchant}-${transaction.date}`}
                >
                  <span className={styles.transactionIcon} aria-hidden="true">
                    <Icon size={18} stroke={1.75} />
                  </span>
                  <div className={styles.transactionName}>
                    <strong>{transaction.merchant}</strong>
                    <span>
                      {transaction.category} · {transaction.date}
                    </span>
                  </div>
                  <span
                    className={incoming ? styles.incoming : styles.outgoing}
                  >
                    {incoming ? (
                      <IconArrowUpRight size={14} aria-hidden="true" />
                    ) : (
                      <IconArrowDownRight size={14} aria-hidden="true" />
                    )}
                    {transaction.amount}
                  </span>
                </div>
              );
            })}
          </div>
          <div className={styles.monthlyNote}>
            <IconReceipt size={18} stroke={1.8} aria-hidden="true" />
            <p>
              <strong>On track for August.</strong> Spending is $184 below your
              typical pace.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
