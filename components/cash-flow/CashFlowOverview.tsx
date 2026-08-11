"use client";

import { Drawer } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconArrowUpRight, IconCoins, IconPlus, IconShieldCheck, IconTargetArrow, IconTrendingUp } from "@tabler/icons-react";
import { FormEvent, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { categoryActual, currency, netCashFlow, savingsRate, totalIncome, totalSpending, type IncomeEntry } from "@/lib/finance";
import { augustBudget, cashFlowHistory } from "@/lib/mockFinanceData";

import styles from "./CashFlowOverview.module.css";

const goals = [
  { name: "Emergency fund", current: 18400, target: 25000 },
  { name: "Japan trip", current: 2600, target: 4000 },
];

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className={styles.tooltip}><span>{label}</span>{payload.map((item) => <div key={item.name}><i style={{ background: item.color }} /><span>{item.name}</span><strong>{currency.format(item.value)}</strong></div>)}</div>;
}

export function CashFlowOverview() {
  const isMobile = useMediaQuery("(max-width: 47.999rem)");
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>(augustBudget.incomeEntries);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [draft, setDraft] = useState({ amount: "", source: "", date: "2026-08-11", owner: "Samuel", note: "" });
  const month = useMemo(() => ({ ...augustBudget, incomeEntries }), [incomeEntries]);
  const income = totalIncome(month);
  const spending = totalSpending(month);
  const net = netCashFlow(month);
  const rate = savingsRate(month);
  const topCategories = [...month.categories].sort((a,b) => categoryActual(b) - categoryActual(a)).slice(0,5);
  const maxCategory = categoryActual(topCategories[0]);

  function addIncome(event: FormEvent) {
    event.preventDefault();
    const amount = Number(draft.amount);
    if (!amount || amount < 0 || !draft.source.trim() || !draft.date || !draft.owner) return;
    setIncomeEntries((current) => [{ id: `income-${Date.now()}`, amount, source: draft.source.trim(), date: draft.date, owner: draft.owner, note: draft.note.trim() || undefined }, ...current]);
    setDraft({ amount: "", source: "", date: "2026-08-11", owner: "Samuel", note: "" });
    setIncomeOpen(false);
  }

  return <div className={styles.cashFlow}>
    <header className={styles.intro}><div><p className={styles.eyebrow}>Household movement</p><h2>Cash Flow</h2><p>See what came in, what went out, and what your household kept.</p></div><button className={styles.addIncome} type="button" onClick={() => setIncomeOpen(true)}><IconPlus size={17} />Add income</button></header>

    <section className={styles.hero} aria-labelledby="cash-flow-title">
      <div className={styles.heroLead}><span id="cash-flow-title">Net cash flow · August</span><strong>+{currency.format(net)}</strong><p><IconArrowUpRight size={15} />$969.82 above your January pace</p></div>
      <div className={styles.heroRail}><div><span>Income</span><strong>{currency.format(income)}</strong><small>{incomeEntries.length} entries</small></div><div><span>Spending</span><strong>{currency.format(spending)}</strong><small>Across {month.categories.length} categories</small></div><div><span>Savings rate</span><strong>{(rate*100).toFixed(1)}%</strong><small>7.8 points above January</small></div></div>
    </section>

    <div className={styles.grid}>
      <section className={`${styles.panel} ${styles.flowPanel}`} aria-labelledby="money-movement-title"><div className={styles.panelHeading}><div><h3 id="money-movement-title">Money in vs money out</h3><p>Monthly household totals</p></div><span className={styles.contextChip}>Jan–Aug 2026</span></div><div className={styles.flowChart} role="img" aria-label="Income and spending from January through August 2026"><ResponsiveContainer width="100%" height="100%"><BarChart data={cashFlowHistory} barGap={3}><CartesianGrid vertical={false} stroke="#e8ecea" strokeDasharray="3 5" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill:"#78837e", fontSize:11 }} /><YAxis width={45} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} tick={{ fill:"#8a948f", fontSize:10 }} /><Tooltip content={<ChartTooltip />} cursor={{ fill:"rgba(49,95,80,.045)" }} /><Bar dataKey="income" name="Income" fill="#315f50" radius={[4,4,0,0]} isAnimationActive={false} /><Bar dataKey="spending" name="Spending" fill="#a87546" radius={[4,4,0,0]} isAnimationActive={false} /></BarChart></ResponsiveContainer></div></section>

      <section className={`${styles.panel} ${styles.savingsPanel}`} aria-labelledby="savings-title"><div className={styles.panelHeading}><div><h3 id="savings-title">Savings momentum</h3><p>Progress built from monthly cash flow</p></div><IconTrendingUp size={19} /></div><div className={styles.savingsLead}><span>Year to date</span><strong>$14,420.00</strong><small>+$2,189.82 this month</small></div><div className={styles.savingsChart} role="img" aria-label="Net monthly cash flow trend from January through August"><ResponsiveContainer width="100%" height="100%"><AreaChart data={cashFlowHistory}><defs><linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5c8b79" stopOpacity={.28}/><stop offset="1" stopColor="#5c8b79" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="month" hide/><YAxis hide domain={[900,2400]}/><Tooltip content={<ChartTooltip />}/><Area type="monotone" dataKey="net" name="Net savings" stroke="#315f50" strokeWidth={2.25} fill="url(#savingsFill)" isAnimationActive={false}/></AreaChart></ResponsiveContainer></div></section>

      <section className={`${styles.panel} ${styles.categoriesPanel}`} aria-labelledby="top-categories-title"><div className={styles.panelHeading}><div><h3 id="top-categories-title">Top spending categories</h3><p>Based on August budget purchases</p></div></div><div className={styles.categoryBars}>{topCategories.map((category) => { const actual=categoryActual(category); return <div className={styles.categoryBar} key={category.id}><div><span>{category.name}</span><strong>{currency.format(actual)}</strong></div><i><b style={{width:`${actual/maxCategory*100}%`}} /></i></div>})}</div></section>

      <section className={`${styles.panel} ${styles.goalsPanel}`} aria-labelledby="goals-title"><div className={styles.panelHeading}><div><h3 id="goals-title">Savings goals</h3><p>Focused household reserves</p></div><IconTargetArrow size={19}/></div><div className={styles.goals}>{goals.map((goal) => <div className={styles.goal} key={goal.name}><div><strong>{goal.name}</strong><span>{currency.format(goal.current)} of {currency.format(goal.target)}</span></div><div role="progressbar" aria-label={`${goal.name} progress`} aria-valuemin={0} aria-valuemax={goal.target} aria-valuenow={goal.current}><i style={{width:`${goal.current/goal.target*100}%`}} /></div><small>{Math.round(goal.current/goal.target*100)}% funded</small></div>)}</div></section>

      <section className={`${styles.panel} ${styles.projectionPanel}`} aria-labelledby="projection-title"><div className={styles.projectionCopy}><IconShieldCheck size={20}/><div><h3 id="projection-title">Cash reserve projection</h3><p>At your current average savings pace, your $24,850 cash balance could reach:</p></div></div><div className={styles.projections}><div><span>3 months</span><strong>$31,400</strong></div><div><span>6 months</span><strong>$38,100</strong></div><div><span>12 months</span><strong>$51,500</strong></div></div><small>Estimate only · assumes consistent income and spending</small></section>
    </div>

    <Drawer opened={incomeOpen} onClose={() => setIncomeOpen(false)} position={isMobile?"bottom":"right"} size={isMobile?"auto":420} radius={isMobile?"18px 18px 0 0":0} title="Add income" classNames={{content:styles.drawer,header:styles.drawerHeader,body:styles.drawerBody,title:styles.drawerTitle}}><div className={styles.drawerIntro}><IconCoins size={19}/><p>Income entries are added together automatically for August.</p></div><form className={styles.incomeForm} onSubmit={addIncome}><div className={styles.amountField}><span>$</span><input aria-label="Income amount" placeholder="0.00" inputMode="decimal" min="0.01" step="0.01" required value={draft.amount} onChange={(e)=>setDraft({...draft,amount:e.target.value})} autoFocus/></div><label>Source<input placeholder="Trucordia Payroll" required value={draft.source} onChange={(e)=>setDraft({...draft,source:e.target.value})}/></label><div className={styles.formRow}><label>Date<input type="date" required value={draft.date} onChange={(e)=>setDraft({...draft,date:e.target.value})}/></label><label>Owner<select value={draft.owner} onChange={(e)=>setDraft({...draft,owner:e.target.value})}><option>Samuel</option><option>Bailey</option></select></label></div><label>Note <span>Optional</span><input placeholder="August paycheck" value={draft.note} onChange={(e)=>setDraft({...draft,note:e.target.value})}/></label><button type="submit">Add income</button></form><div className={styles.incomeList}><h3>August income</h3>{incomeEntries.map((entry)=><div key={entry.id}><div><strong>{entry.source}</strong><span>{entry.owner} · {new Date(`${entry.date}T12:00:00`).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span></div><strong>{currency.format(entry.amount)}</strong></div>)}</div></Drawer>
  </div>;
}
