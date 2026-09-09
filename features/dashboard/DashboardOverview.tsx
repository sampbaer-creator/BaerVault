"use client";

import { IconArrowRight, IconReceipt, IconWallet } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useCurrencyFormatter } from "@/components/preferences/PreferencesProvider";
import type { DashboardViewModel } from "./dashboardViewModel";
import styles from "./DashboardOverview.module.css";
import { type MonthSelection, withMonth } from "@/lib/monthSelection";

type DashboardProps = { model: DashboardViewModel; basePath?: string; selectedMonth?: MonthSelection };
type MarketState = { key: string; prices: Record<string, number>; unavailable: string[] };

const marketRequests = new Map<string, { expires: number; request: Promise<MarketState> }>();

function loadMarketPrices(key: string, symbols: string[]) {
  const cached = marketRequests.get(key);
  if (cached && cached.expires > Date.now()) return cached.request;
  const chunks = Array.from({ length: Math.ceil(symbols.length / 10) }, (_, index) => symbols.slice(index * 10, index * 10 + 10));
  const request = Promise.all(chunks.map((chunk) => fetch(`/api/market-data?symbols=${encodeURIComponent(chunk.join(","))}&range=1M&pricesOnly=1`)
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Market prices unavailable");
      return { key, prices: data.prices as Record<string, number>, unavailable: (data.unavailable ?? []) as string[] };
    }))).then((states) => ({ key, prices: Object.assign({}, ...states.map((state) => state.prices)), unavailable: states.flatMap((state) => state.unavailable) }))
    .catch((error) => { marketRequests.delete(key); throw error; });
  marketRequests.set(key, { expires: Date.now() + 900000, request });
  return request;
}

function PanelHeading({ title, href, action }: { title: string; href: string; action: string }) {
  return <div className={styles.panelHeading}><h2>{title}</h2><Link href={href}>{action}<IconArrowRight size={14} aria-hidden="true" /></Link></div>;
}

export function DashboardOverview({ model, basePath = "", selectedMonth }: DashboardProps) {
  const monthHref = (href: string) => selectedMonth ? withMonth(`${basePath}${href}`, selectedMonth) : `${basePath}${href}`;
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
  const displayedAssets = totalAssets;
  const budgetLeft = model.planned - model.spending;
  const spendingProgress = model.planned > 0 ? Math.min((model.spending / model.planned) * 100, 100) : 0;
  const debtShare = displayedAssets > 0 ? Math.min(100, Math.max((model.debts / displayedAssets) * 100, 0)) : 0;
  const budgetRangeMax = Math.max(model.planned, model.spending, 1);
  const topCategories = model.categories.slice(0, 4);

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardGrid}>
        <section className={styles.netWorthPanel}>
          <PanelHeading title="Current position" href={monthHref("/accounts")} action="View accounts" />
          <div className={styles.netWorthLead}>
            <span>Net worth</span>
            <strong>{money.format(netWorth)}</strong>
            {(waitingForMarket || marketUnavailable) && <small>{waitingForMarket ? "Updating prices. " : "Some prices are unavailable. "}Unpriced investments use purchase cost.</small>}
          </div>
          <div className={styles.compositionTrack} aria-label="Current assets and debts"><i data-animate-progress style={{ width: `${debtShare}%` }} /></div>
          <div className={styles.netWorthSummary}>
            <div><span><i className={styles.assetDot} />Assets</span><strong>{money.format(displayedAssets)}</strong></div>
            <div><span><i className={styles.debtDot} />Debts</span><strong>{money.format(model.debts)}</strong></div>
          </div>
          <p className={styles.emptyCopy}>Accounts {money.format(model.cashAssets)} + investments {money.format(portfolioValue)} − debts {money.format(model.debts)}</p>
        </section>

        <section className={styles.spendingPanel}>
          <PanelHeading title="This month" href={monthHref("/budget")} action="Open budget" />
          <div className={styles.spendingSummary}><span>{model.month}</span><strong>{money.format(Math.abs(budgetLeft))} {budgetLeft >= 0 ? "remaining" : "over plan"}</strong></div>
          <div className={styles.progressTrack} role="progressbar" aria-label="Monthly budget used" aria-valuemin={0} aria-valuemax={budgetRangeMax} aria-valuenow={model.spending}><i data-animate-progress style={{ width: `${spendingProgress}%` }} /></div>
          <div className={styles.spendingRail}>
            <div><span>Spent</span><strong>{money.format(model.spending)}</strong></div>
            <div><span>Planned</span><strong>{money.format(model.planned)}</strong></div>
            <div><span>Income</span><strong>{money.format(model.income)}</strong></div>
          </div>
        </section>

        <section className={styles.transactionsPanel}>
          <PanelHeading title="Recent activity" href={monthHref("/transactions")} action="View all" />
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
            <PanelHeading title="Top categories" href={monthHref("/budget")} action="View budget" />
            <div className={styles.categoryList}>
              {topCategories.length ? topCategories.map((category, index) => (
                <div key={category.name}><span><i style={{ background: `var(--category-${index + 1})` }} />{category.name}</span><strong>{money.format(category.value)}</strong></div>
              )) : <p className={styles.emptyCopy}>Category totals will appear after purchases are added.</p>}
            </div>
          </section>
          <section className={styles.upcomingPanel}>
            <PanelHeading title="Upcoming payments" href={monthHref("/recurring")} action="View all" />
            {model.upcomingPayments.length ? <div className={styles.transactionList}>{model.upcomingPayments.slice(0, 5).map((payment) => <div className={styles.transactionRow} key={payment.id}><span className={styles.transactionIcon}><IconReceipt size={16} aria-hidden="true" /></span><div><strong>{payment.name}</strong><span>{payment.date}{payment.estimated ? " · Estimated" : " · Scheduled"}</span></div><strong>{money.format(payment.amount)}</strong></div>)}</div> : <div className={styles.upcomingEmpty}><p>No upcoming payments found.</p><span>Estimates appear after three months of consistent payments. You can also record a future payment in your budget.</span></div>}
          </section>
        </div>
      </div>
    </div>
  );
}
