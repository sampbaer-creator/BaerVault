"use client";

import { Drawer } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconArrowUpRight, IconCoins, IconPlus, IconShieldCheck, IconTargetArrow, IconTrendingUp } from "@tabler/icons-react";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { addIncomeAction } from "@/app/(app)/cash-flow/actions";
import { categoryActual, currency, netCashFlow, savingsRate, totalIncome, totalSpending, type BudgetMonth, type IncomeEntry } from "@/lib/finance";
import styles from "./CashFlowOverview.module.css";

export function CashFlowOverview({ initialMonth }: { initialMonth: BudgetMonth }) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 47.999rem)");
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>(initialMonth.incomeEntries);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({ amount: "", source: "", date: new Date().toISOString().slice(0, 10), owner: "Household" });
  const month = useMemo(() => ({ ...initialMonth, incomeEntries }), [initialMonth, incomeEntries]);
  const income = totalIncome(month); const spending = totalSpending(month); const net = netCashFlow(month); const rate = savingsRate(month);
  const topCategories = [...month.categories].sort((a, b) => categoryActual(b) - categoryActual(a)).slice(0, 5);
  const maxCategory = topCategories.length ? categoryActual(topCategories[0]) : 0;
  const chartData = [{ month: initialMonth.month.split(" ")[0].slice(0, 3), income, spending }];

  async function addIncome(event: FormEvent) {
    event.preventDefault(); const amount = Number(draft.amount);
    if (!amount || amount <= 0 || !draft.source.trim() || !draft.date) return;
    setSaving(true); setError("");
    const result = await addIncomeAction({ description: draft.source, amount, date: draft.date, ownerLabel: draft.owner });
    setSaving(false);
    if (!result.ok) { setError(result.error); return; }
    setIncomeEntries((current) => [result.data, ...current]);
    setDraft({ amount: "", source: "", date: new Date().toISOString().slice(0, 10), owner: "Household" });
    setIncomeOpen(false); router.refresh();
  }

  return <div className={styles.cashFlow}>
    <header className={styles.intro}><div><p className={styles.eyebrow}>Household movement</p><h2>Cash Flow</h2><p>Income and spending derived from your saved household data.</p></div><button className={styles.addIncome} type="button" onClick={() => setIncomeOpen(true)}><IconPlus size={17} />Add income</button></header>
    <section className={styles.hero} aria-labelledby="cash-flow-title"><div className={styles.heroLead}><span id="cash-flow-title">Net cash flow · {initialMonth.month}</span><strong>{net >= 0 ? "+" : ""}{currency.format(net)}</strong><p><IconArrowUpRight size={15} />Income minus saved budget entries</p></div><div className={styles.heroRail}><div><span>Income</span><strong>{currency.format(income)}</strong><small>{incomeEntries.length} entries</small></div><div><span>Spending</span><strong>{currency.format(spending)}</strong><small>{month.categories.reduce((count, category) => count + category.purchases.length, 0)} entries</small></div><div><span>Savings rate</span><strong>{(rate * 100).toFixed(1)}%</strong><small>This month</small></div></div></section>
    <div className={styles.grid}>
      <section className={`${styles.panel} ${styles.flowPanel}`}><div className={styles.panelHeading}><div><h3>Money in vs money out</h3><p>Current saved totals</p></div><span className={styles.contextChip}>{initialMonth.month}</span></div><div className={styles.flowChart}><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid vertical={false} stroke="#e8ecea" strokeDasharray="3 5"/><XAxis dataKey="month" axisLine={false} tickLine={false}/><YAxis width={45} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000}k`}/><Tooltip formatter={(value) => currency.format(Number(value))}/><Bar dataKey="income" name="Income" fill="#315f50" radius={[4,4,0,0]}/><Bar dataKey="spending" name="Spending" fill="#a87546" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></section>
      <section className={`${styles.panel} ${styles.savingsPanel}`}><div className={styles.panelHeading}><div><h3>Savings momentum</h3><p>Based on this month</p></div><IconTrendingUp size={19}/></div><div className={styles.savingsLead}><span>Current net</span><strong>{currency.format(net)}</strong><small>No fake historical data</small></div></section>
      <section className={`${styles.panel} ${styles.categoriesPanel}`}><div className={styles.panelHeading}><div><h3>Top spending categories</h3><p>Saved budget entries</p></div></div><div className={styles.categoryBars}>{topCategories.length ? topCategories.map((category) => { const actual = categoryActual(category); return <div className={styles.categoryBar} key={category.id}><div><span>{category.name}</span><strong>{currency.format(actual)}</strong></div><i><b style={{ width: `${maxCategory ? actual / maxCategory * 100 : 0}%` }}/></i></div>; }) : <p>No spending entries yet.</p>}</div></section>
      <section className={`${styles.panel} ${styles.goalsPanel}`}><div className={styles.panelHeading}><div><h3>Household activity</h3><p>Persistent records this month</p></div><IconTargetArrow size={19}/></div><div className={styles.goals}><p>{incomeEntries.length || spending ? `${incomeEntries.length} income entries and ${month.categories.reduce((count, category) => count + category.purchases.length, 0)} spending entries.` : "Add income and budget spending to build this view."}</p></div></section>
      <section className={`${styles.panel} ${styles.projectionPanel}`}><div className={styles.projectionCopy}><IconShieldCheck size={20}/><div><h3>Cash-flow projection</h3><p>If this month’s net cash flow stayed consistent:</p></div></div><div className={styles.projections}><div><span>3 months</span><strong>{currency.format(net * 3)}</strong></div><div><span>6 months</span><strong>{currency.format(net * 6)}</strong></div><div><span>12 months</span><strong>{currency.format(net * 12)}</strong></div></div><small>Estimate only · assumes consistent income and spending</small></section>
    </div>
    <Drawer opened={incomeOpen} onClose={() => setIncomeOpen(false)} position={isMobile ? "bottom" : "right"} size={isMobile ? "auto" : 420} radius={isMobile ? "18px 18px 0 0" : 0} title="Add income" classNames={{ content: styles.drawer, header: styles.drawerHeader, body: styles.drawerBody, title: styles.drawerTitle }}><div className={styles.drawerIntro}><IconCoins size={19}/><p>This entry will be shared with your active household.</p></div>{error && <p className={styles.formError} role="alert">{error}</p>}<form className={styles.incomeForm} onSubmit={addIncome}><div className={styles.amountField}><span>$</span><input aria-label="Income amount" placeholder="0.00" inputMode="decimal" min="0.01" step="0.01" required value={draft.amount} onChange={(event) => setDraft({...draft, amount:event.target.value})} autoFocus/></div><label>Source<input placeholder="Payroll" required value={draft.source} onChange={(event) => setDraft({...draft, source:event.target.value})}/></label><div className={styles.formRow}><label>Date<input type="date" required value={draft.date} onChange={(event) => setDraft({...draft, date:event.target.value})}/></label><label>Owner<select value={draft.owner} onChange={(event) => setDraft({...draft, owner:event.target.value})}><option>Household</option><option>User</option><option>Spouse</option><option>Joint</option></select></label></div><button type="submit" disabled={saving}>{saving ? "Saving…" : "Add income"}</button></form><div className={styles.incomeList}><h3>{initialMonth.month} income</h3>{incomeEntries.length ? incomeEntries.map((entry) => <div key={entry.id}><div><strong>{entry.source}</strong><span>{entry.owner} · {new Date(`${entry.date}T12:00:00`).toLocaleDateString("en-US", {month:"short", day:"numeric"})}</span></div><strong>{currency.format(entry.amount)}</strong></div>) : <p>No income entries yet.</p>}</div></Drawer>
  </div>;
}
