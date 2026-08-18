"use client";

import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons-react";
import { useReducedMotion } from "motion/react";
import { useMediaQuery } from "@mantine/hooks";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { currency, totalIncome, totalSpending, type BudgetMonth } from "@/lib/finance";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import styles from "./CashFlowWorkspace.module.css";

const compactMoney = new Intl.NumberFormat("en-US", {
  notation: "compact",
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function CashFlowWorkspace({ month }: { month: BudgetMonth }) {
  const reduceMotion = useReducedMotion();
  const mobile = useMediaQuery("(max-width: 47.999rem)");
  const income = totalIncome(month);
  const spending = totalSpending(month);
  const net = income - spending;
  const categories = month.categories
    .map((category) => ({
      name: category.name,
      amount: category.purchases.reduce((sum, purchase) => sum + purchase.amount, 0),
      planned: category.plannedAmount,
    }))
    .filter((category) => category.amount > 0 || category.planned > 0)
    .sort((a, b) => b.amount - a.amount);

  let runningBalance = 0;
  const activity = [
    ...month.incomeEntries.map((entry) => ({ label: entry.source, amount: entry.amount })),
    ...categories.filter((category) => category.amount > 0).map((category) => ({ label: category.name, amount: -category.amount })),
  ].slice(0, 10).map((item) => {
    runningBalance += item.amount;
    return { ...item, balance: runningBalance };
  });
  const chartMotion = {
    isAnimationActive: !reduceMotion && !mobile,
    animationDuration: 360,
    animationEasing: "ease-out" as const,
  };

  return (
    <div className={styles.page}>
      <section className={styles.netCard} aria-labelledby="net-cash-flow">
        <h2 id="net-cash-flow">Net income</h2>
        <span>{month.month}</span>
        <strong className={net >= 0 ? styles.positive : styles.negative}><AnimatedNumber value={net} format={currency.format}/></strong>
        <div className={styles.changePill}>{net >= 0 ? <IconArrowUpRight size={17}/> : <IconArrowDownRight size={17}/>}Current period</div>
        <div className={styles.cashChart} aria-label={`Income ${currency.format(income)}, spending ${currency.format(spending)}`}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={activity} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--app-border)" strokeDasharray="3 5" />
              <XAxis dataKey="label" hide />
              <YAxis width={42} axisLine={false} tickLine={false} tick={{ fill: "var(--app-text-muted)", fontSize: 10 }} tickFormatter={(value) => compactMoney.format(Number(value))}/>
              <Tooltip formatter={(value, name) => [currency.format(Number(value)), name === "amount" ? "Activity" : "Running balance"]}/>
              <ReferenceLine y={0} stroke="var(--app-border-strong)" />
              <Bar dataKey="amount" radius={[5, 5, 5, 5]} maxBarSize={32} {...chartMotion}>
                {activity.map((item, index) => <Cell key={`${item.label}-${index}`} fill={item.amount >= 0 ? "var(--money-positive)" : "var(--money-negative)"}/>) }
              </Bar>
              <Line type="monotone" dataKey="balance" stroke="var(--app-text-muted)" strokeWidth={1.5} strokeDasharray="6 6" dot={false} {...chartMotion}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.netLegend}>
          <span><IconArrowUpRight size={17} />Income <b>{currency.format(income)}</b></span>
          <span><IconArrowDownRight size={17} />Spend <b>{currency.format(spending)}</b></span>
        </div>
      </section>

      <section className={styles.breakdown} aria-labelledby="spending-breakdown">
        <header><div><h2 id="spending-breakdown">Spend</h2><span>{month.month}</span></div><strong><AnimatedNumber value={spending} format={currency.format}/></strong></header>
        <div className={styles.spendChart} aria-label="Actual category spending compared with planned amounts">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={categories.slice(0, 8)} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--app-border)" strokeDasharray="3 5" />
              <XAxis dataKey="name" hide />
              <YAxis width={42} axisLine={false} tickLine={false} tick={{ fill: "var(--app-text-muted)", fontSize: 10 }} tickFormatter={(value) => compactMoney.format(Number(value))}/>
              <Tooltip formatter={(value, name) => [currency.format(Number(value)), name === "amount" ? "Spent" : "Planned"]}/>
              <Bar dataKey="amount" fill="var(--app-text-strong)" radius={[5, 5, 0, 0]} maxBarSize={32} {...chartMotion}/>
              <Line type="monotone" dataKey="planned" stroke="var(--app-text-muted)" strokeWidth={1.5} strokeDasharray="6 6" dot={false} {...chartMotion}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.categories}>
          {categories.map((category, index) => (
            <div key={category.name}><span><i style={{ background: `var(--cash-${(index % 5) + 1})` }} />{category.name}</span><b aria-hidden="true"><i data-animate-progress style={{ width: `${spending ? (category.amount / spending) * 100 : 0}%`, background: `var(--cash-${(index % 5) + 1})` }} /></b><strong>{currency.format(category.amount)}</strong></div>
          ))}
        </div>
      </section>

      <section className={styles.incomeCard}>
        <h2>Income</h2><span>{month.month}</span><strong><AnimatedNumber value={income} format={currency.format}/></strong>
        <div className={styles.incomeSources}>{month.incomeEntries.map((entry) => <div key={entry.id}><span>{entry.source}</span><i><b data-animate-progress style={{width:`${(entry.amount / Math.max(income, 1)) * 100}%`}}/></i><strong>{currency.format(entry.amount)}</strong></div>)}</div>
      </section>
    </div>
  );
}
