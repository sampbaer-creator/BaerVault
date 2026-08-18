import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons-react";

import { currency, totalIncome, totalSpending, type BudgetMonth } from "@/lib/finance";
import styles from "./CashFlowWorkspace.module.css";

export function CashFlowWorkspace({ month }: { month: BudgetMonth }) {
  const income = totalIncome(month);
  const spending = totalSpending(month);
  const net = income - spending;
  const max = Math.max(income, spending, 1);
  const categories = month.categories
    .map((category) => ({ name: category.name, amount: category.purchases.reduce((sum, purchase) => sum + purchase.amount, 0) }))
    .filter((category) => category.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className={styles.page}>
      <section className={styles.netCard} aria-labelledby="net-cash-flow">
        <h2 id="net-cash-flow">Net cash flow</h2>
        <span>{month.month}</span>
        <strong className={net >= 0 ? styles.positive : styles.negative}>{currency.format(net)}</strong>
        <div className={styles.netBars} aria-label={`Income ${currency.format(income)}, spending ${currency.format(spending)}`}>
          <i style={{ width: `${(income / max) * 100}%` }} />
          <i style={{ width: `${(spending / max) * 100}%` }} />
        </div>
        <div className={styles.netLegend}>
          <span><IconArrowUpRight size={17} />Income <b>{currency.format(income)}</b></span>
          <span><IconArrowDownRight size={17} />Spend <b>{currency.format(spending)}</b></span>
        </div>
      </section>

      <section className={styles.breakdown} aria-labelledby="spending-breakdown">
        <header><div><h2 id="spending-breakdown">Spend</h2><span>{month.month}</span></div><strong>{currency.format(spending)}</strong></header>
        <div className={styles.stack} aria-hidden="true">
          {categories.map((category, index) => <i key={category.name} style={{ flex: category.amount, background: `var(--cash-${(index % 5) + 1})` }} />)}
        </div>
        <div className={styles.categories}>
          {categories.map((category, index) => (
            <div key={category.name}><span><i style={{ background: `var(--cash-${(index % 5) + 1})` }} />{category.name}</span><strong>{currency.format(category.amount)}</strong></div>
          ))}
        </div>
      </section>

      <section className={styles.incomeCard}>
        <h2>Income</h2><span>{month.month}</span><strong>{currency.format(income)}</strong>
        <div className={styles.incomeBars}>{month.incomeEntries.map((entry) => <i key={entry.id} style={{ height: `${Math.max(18, (entry.amount / Math.max(...month.incomeEntries.map((item) => item.amount), 1)) * 100)}%` }} />)}</div>
      </section>
    </div>
  );
}
