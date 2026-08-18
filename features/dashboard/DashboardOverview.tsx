"use client";

import { IconArrowRight, IconReceipt, IconWallet } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useCurrencyFormatter } from "@/components/preferences/PreferencesProvider";
import type { DashboardViewModel } from "./dashboardViewModel";
import styles from "./DashboardOverview.module.css";

type DashboardProps = { model: DashboardViewModel; basePath?: string };
type MarketState = { key: string; prices: Record<string, number>; unavailable: string[] };

const marketRequests = new Map<string, Promise<MarketState>>();

function loadMarketPrices(key: string, symbols: string[]) {
  const cached = marketRequests.get(key);
  if (cached) return cached;
  const request = fetch(`/api/market-data?symbols=${encodeURIComponent(symbols.join(","))}&range=1M&pricesOnly=1`)
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Market prices unavailable");
      return { key, prices: data.prices as Record<string, number>, unavailable: (data.unavailable ?? []) as string[] };
    })
    .catch((error) => { marketRequests.delete(key); throw error; });
  marketRequests.set(key, request);
  return request;
}

function PanelHeading({ title, href, action }: { title: string; href: string; action: string }) {
  return <div className={styles.panelHeading}><h2>{title}</h2><Link href={href}>{action}<IconArrowRight size={14} aria-hidden="true" /></Link></div>;
}

export function DashboardOverview({ model, basePath = "" }: DashboardProps) {
  const money = useCurrencyFormatter();
  const requestKey = useMemo(() => model.symbols.toSorted().join(","), [model.symbols]);
  const [marketState, setMarketState] = useState<MarketState>(() => ({ key: basePath ? requestKey : "", prices: {}, unavailable: [] }));

  useEffect(() => {
    if (!model.symbols.length || basePath) return;
    let cancelled = false;
    loadMarketPrices(requestKey, model.symbols)
      .then((nextState) => { if (!cancelled) setMarketState(nextState); })
      .catch(() => { if (!cancelled) setMarketState({ key: requestKey, prices: {}, unavailable: model.symbols }); });
    return () => { cancelled = true; };
  }, [basePath, model.symbols, requestKey]);

  const waitingForMarket = !basePath && requestKey !== marketState.key;
  const marketUnavailable = !basePath && marketState.unavailable.length > 0;
  const portfolioValue = model.accounts.reduce((sum, account) => sum + account.holdings.reduce(
    (total, holding) => total + holding.shares * (marketState.prices[holding.symbol] ?? holding.fallbackPrice), 0,
  ), 0);
  const netWorth = model.cashAssets - model.debts + portfolioValue;
  const totalAssets = netWorth + model.debts;
  const displayedAssets = waitingForMarket || marketUnavailable ? model.cashAssets : totalAssets;
  const budgetLeft = model.planned - model.spending;
  const spendingProgress = model.planned > 0 ? Math.min((model.spending / model.planned) * 100, 100) : 0;
  const debtShare = displayedAssets > 0 ? Math.max((model.debts / displayedAssets) * 100, 2) : 0;
  const budgetRangeMax = Math.max(model.planned, model.spending, 1);
  const topCategories = model.categories.slice(0, 4);

  return (
    <div className={styles.dashboard}>
      <div className={styles.mobileReference}>
        <section className={styles.mobileTrajectory}>
          <strong>{money.format(Math.max(budgetLeft, 0))} left</strong>
          <span>out of {money.format(model.planned)} budgeted</span>
          <svg viewBox="0 0 320 92" role="img" aria-label={`${model.month} budget progress`}><path d="M10 79 L42 68 L72 65 L101 53 L129 50 L157 35 L186 32 L214 25 L245 15 L310 4"/><path d="M10 79 L40 70 L68 67 L96 56 L124 52 L151 39 L178 37 L207 30 L236 19 L267 13"/><circle cx="267" cy="13" r="5"/></svg>
        </section>
        <section className={styles.mobileBudgetSection}>
          <div className={styles.mobileSectionHead}><h2>Budgets</h2><Link href={`${basePath}/budget`}>Categories <IconArrowRight size={14}/></Link></div>
          <div className={styles.mobileBudgetRail}>{model.categories.slice(0,5).map((category,index)=>{
            const remaining=category.planned-category.value; const used=category.planned?Math.min(category.value/category.planned*100,100):0;
            return <Link href={`${basePath}/budget`} key={category.name} className={styles.mobileBudgetItem}>
              <span className={styles.mobileRing} style={{"--ring-progress":`${used*3.6}deg`,"--ring-color":`var(--category-${(index%4)+1})`} as React.CSSProperties}><IconReceipt size={20}/></span>
              <strong>{money.format(Math.abs(remaining))}</strong><small>{remaining>=0?"left":"over"}</small>
            </Link>;
          })}</div>
        </section>
        <section className={styles.mobileNet}>
          <div className={styles.mobileSectionHead}><h2>Net this month</h2><Link href={`${basePath}/cash-flow`}>Cash flow <IconArrowRight size={14}/></Link></div>
          <div className={styles.mobileNetCard}><strong>{money.format(model.cashAvailable)}</strong><div className={styles.mobileSplit}><i style={{width:`${model.income?Math.min(model.income/(model.income+model.spending)*100,100):50}%`}}/><i/></div><div className={styles.mobileNetLegend}><span>Income <b>{money.format(model.income)}</b></span><span>Spend <b>{money.format(model.spending)}</b></span></div></div>
        </section>
        <section className={styles.mobilePlan}>
          <div className={styles.mobileSectionHead}><h2>Monthly plan</h2><Link href={`${basePath}/goals`}>Goals <IconArrowRight size={14}/></Link></div>
          <div><strong>{money.format(Math.max(model.planned-model.spending,0))}</strong><span> remaining in {model.month}</span><i><b style={{width:`${model.planned?Math.min(model.spending/model.planned*100,100):0}%`}}/></i></div>
        </section>
      </div>
      <div className={styles.dashboardGrid}>
        <section className={styles.netWorthPanel}>
          <PanelHeading title="Current position" href={`${basePath}/accounts`} action="View accounts" />
          <div className={styles.netWorthLead}>
            <span>Net worth</span>
            <strong>{waitingForMarket ? "Updating…" : marketUnavailable ? money.format(model.cashAssets - model.debts) : money.format(netWorth)}</strong>
            {marketUnavailable && <small>Investment prices are temporarily unavailable.</small>}
          </div>
          <div className={styles.compositionTrack} aria-label="Current assets and debts"><i style={{ width: `${debtShare}%` }} /></div>
          <div className={styles.netWorthSummary}>
            <div><span><i className={styles.assetDot} />Assets</span><strong>{waitingForMarket ? "—" : money.format(displayedAssets)}</strong></div>
            <div><span><i className={styles.debtDot} />Debts</span><strong>{money.format(model.debts)}</strong></div>
          </div>
        </section>

        <section className={styles.spendingPanel}>
          <PanelHeading title="This month" href={`${basePath}/budget`} action="Open budget" />
          <div className={styles.spendingSummary}><span>{model.month}</span><strong>{money.format(Math.abs(budgetLeft))} {budgetLeft >= 0 ? "remaining" : "over plan"}</strong></div>
          <div className={styles.progressTrack} role="progressbar" aria-label="Monthly budget used" aria-valuemin={0} aria-valuemax={budgetRangeMax} aria-valuenow={model.spending}><i style={{ width: `${spendingProgress}%` }} /></div>
          <div className={styles.spendingRail}>
            <div><span>Spent</span><strong>{money.format(model.spending)}</strong></div>
            <div><span>Planned</span><strong>{money.format(model.planned)}</strong></div>
            <div><span>Income</span><strong>{money.format(model.income)}</strong></div>
          </div>
        </section>

        <section className={styles.transactionsPanel}>
          <PanelHeading title="Recent activity" href={`${basePath}/transactions`} action="View all" />
          <div className={styles.transactionList}>
            {model.activity.length ? model.activity.map((item) => (
              <div className={styles.transactionRow} key={item.id}>
                <span className={styles.transactionIcon} aria-hidden="true">{item.incoming ? <IconWallet size={14} /> : <IconReceipt size={14} />}</span>
                <div><strong>{item.name}</strong><span>{item.meta}</span></div>
                <span className={item.incoming ? styles.positive : undefined}>{item.incoming ? "+" : "−"}{money.format(item.amount)}</span>
              </div>
            )) : <p className={styles.emptyCopy}>Activity will appear as income and purchases are added.</p>}
          </div>
        </section>

        <div className={styles.sideStack}>
          <section className={styles.categoriesPanel}>
            <PanelHeading title="Top categories" href={`${basePath}/budget`} action="View budget" />
            <div className={styles.categoryList}>
              {topCategories.length ? topCategories.map((category, index) => (
                <div key={category.name}><span><i style={{ background: `var(--category-${index + 1})` }} />{category.name}</span><strong>{money.format(category.value)}</strong></div>
              )) : <p className={styles.emptyCopy}>Category totals will appear after purchases are added.</p>}
            </div>
          </section>
          <section className={styles.upcomingPanel}>
            <PanelHeading title="Planning ahead" href={`${basePath}/goals`} action="View goals" />
            <div className={styles.upcomingEmpty}><p>Use your budget and goals to plan what comes next.</p><span>No projected bills are shown without historical evidence.</span></div>
          </section>
        </div>
      </div>
    </div>
  );
}
