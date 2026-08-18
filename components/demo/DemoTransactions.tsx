"use client";

import { IconList, IconSearch } from "@tabler/icons-react";
import { useCurrencyFormatter } from "@/components/preferences/PreferencesProvider";
import { totalIncome, totalSpending, type BudgetMonth } from "@/lib/finance";
import styles from "./DemoTransactions.module.css";

export function DemoTransactions({ budget }: { budget: BudgetMonth }) {
  const money = useCurrencyFormatter();
  const income = totalIncome(budget);
  const spent = totalSpending(budget);
  const purchases = budget.categories.flatMap((category) => category.purchases);
  const accountTotals = new Map<string, number>();

  for (const purchase of purchases) {
    const account = purchase.accountName ?? "Account not assigned";
    accountTotals.set(account, (accountTotals.get(account) ?? 0) + purchase.amount);
  }

  const accountSpending = [...accountTotals.entries()]
    .map(([account, amount]) => ({ account, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  const largestAccountSpend = accountSpending[0]?.amount ?? 0;
  const items = [
    ...budget.incomeEntries.map((entry) => ({
      id: entry.id,
      name: entry.source,
      category: "Income",
      account: entry.owner,
      date: entry.date,
      amount: entry.amount,
      incoming: true,
    })),
    ...budget.categories.flatMap((category) =>
      category.purchases.map((purchase) => ({
        id: purchase.id,
        name: purchase.description,
        category: category.name,
        account: purchase.accountName ?? "Account not assigned",
        date: purchase.date,
        amount: purchase.amount,
        incoming: false,
      })),
    ),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className={styles.page}>
      <div className={styles.mobileSearch}><IconSearch size={22}/><span>Search</span><IconList size={22}/></div>
      <div className={styles.summary}>
        <Summary label="Money in" value={`+${money.format(income)}`} tone="positive" />
        <Summary label="Money out" value={`−${money.format(spent)}`} tone="negative" />
        <Summary label="Net" value={money.format(income - spent)} />
      </div>
      <section className={`${styles.panel} ${styles.accountChart}`} aria-labelledby="demo-account-spending-title">
        <div className={styles.chartHeading}>
          <div>
            <span className={styles.label}>Spending by account</span>
            <h3 id="demo-account-spending-title">Where this month&apos;s money came from</h3>
          </div>
          <strong>{money.format(spent)}</strong>
        </div>
        <div className={styles.accountBars}>
          {accountSpending.map((item) => (
            <div className={styles.accountBarRow} key={item.account}>
              <span>{item.account}</span>
              <div className={styles.accountTrack} aria-hidden="true">
                <i style={{ width: `${largestAccountSpend ? (item.amount / largestAccountSpend) * 100 : 0}%` }} />
              </div>
              <strong>{money.format(item.amount)}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className={`${styles.panel} ${styles.transactionsPanel}`}>
        <div className={styles.tabs}>
          <button className={styles.tab}>All</button>
          <button className={styles.tab}>Income</button>
          <button className={styles.tab}>Expenses</button>
          <span className={styles.count}>{items.length} transactions</span>
        </div>
        <table className={styles.table}>
          <thead><tr><th>Merchant</th><th>Category</th><th>Account</th><th>Date</th><th>Amount</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td><div className={styles.merchant}><span className={styles.merchantIcon}>{item.name.slice(0, 1)}</span><strong>{item.name}</strong></div></td>
                <td><span className={styles.categoryChip}><i className={styles.dot} style={{ background: item.incoming ? "var(--money-positive)" : "var(--chart-secondary)" }} />{item.category}</span></td>
                <td className={styles.subtle}>{item.account}</td>
                <td className={styles.subtle}>{item.date}</td>
                <td className={item.incoming ? styles.positive : styles.negative}><strong>{item.incoming ? "+" : "−"}{money.format(item.amount)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Summary({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return <div><span className={styles.label}>{label}</span><strong className={tone ? styles[tone] : ""}>{value}</strong></div>;
}
