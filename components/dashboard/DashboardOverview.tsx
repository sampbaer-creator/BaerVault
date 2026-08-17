"use client";

import {
  IconArrowRight,
  IconArrowUpRight,
  IconArrowsExchange,
  IconChartPie,
  IconPigMoney,
  IconReceipt,
  IconWallet,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useCurrencyFormatter } from "@/components/preferences/PreferencesProvider";
import type { DashboardViewModel } from "./dashboardViewModel";
import styles from "./DashboardOverview.module.css";

type DashboardProps = {
  model: DashboardViewModel;
  basePath?: string;
};

type MarketState = {
  key: string;
  prices: Record<string, number>;
  unavailable: string[];
};

const marketRequests = new Map<string, Promise<MarketState>>();

function loadMarketPrices(key: string, symbols: string[]) {
  const cached = marketRequests.get(key);
  if (cached) return cached;

  const request = fetch(
    `/api/market-data?symbols=${encodeURIComponent(symbols.join(","))}&range=1M&pricesOnly=1`,
  )
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Market prices unavailable");
      return {
        key,
        prices: data.prices as Record<string, number>,
        unavailable: (data.unavailable ?? []) as string[],
      };
    })
    .catch((error) => {
      marketRequests.delete(key);
      throw error;
    });
  marketRequests.set(key, request);
  return request;
}

function PanelHeading({ title, href, action }: { title: string; href: string; action: string }) {
  return (
    <div className={styles.panelHeading}>
      <h2>{title}</h2>
      <Link href={href}>{action}<IconArrowRight size={14} aria-hidden="true" /></Link>
    </div>
  );
}

function TimeRange() {
  return (
    <div className={styles.timeRange} aria-label="Chart period">
      {['1W', '1M', '3M', 'YTD', '1Y', 'ALL'].map((range) => (
        <span className={range === '1W' ? styles.activeRange : undefined} key={range}>{range}</span>
      ))}
    </div>
  );
}

function LineGraphic({ dual = false }: { dual?: boolean }) {
  return (
    <svg className={styles.lineGraphic} viewBox="0 0 600 130" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={dual ? "net-fill" : "spend-fill"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity=".12" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className={styles.guideLine} d="M12 112 L588 24" />
      {dual ? <>
        <path className={styles.assetFill} d="M0 74 L330 74 L430 72 L505 68 L590 56 L600 56 L600 130 L0 130 Z" />
        <path className={styles.assetLine} d="M0 74 L330 74 L430 72 L505 68 L590 56" />
        <path className={styles.debtLine} d="M0 112 L330 112 L430 111 L505 110 L590 108" />
        <circle className={styles.assetPoint} cx="590" cy="56" r="4" />
        <circle className={styles.debtPoint} cx="590" cy="108" r="4" />
      </> : <>
        <path className={styles.spendLine} d="M12 112 L260 111 L330 107 L390 91 L455 94 L520 72 L588 64" />
        <circle className={styles.spendPoint} cx="588" cy="64" r="4" />
      </>}
    </svg>
  );
}

export function DashboardOverview({ model, basePath = "" }: DashboardProps) {
  const money = useCurrencyFormatter();
  const requestKey = useMemo(() => model.symbols.toSorted().join(","), [model.symbols]);
  const [marketState, setMarketState] = useState<MarketState>(() => ({
    key: basePath ? requestKey : "",
    prices: {},
    unavailable: [],
  }));

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
  const portfolioValue = model.accounts.reduce(
    (sum, account) => sum + account.holdings.reduce(
      (total, holding) => total + holding.shares * (marketState.prices[holding.symbol] ?? holding.fallbackPrice), 0,
    ), 0,
  );
  const netWorth = model.cashAssets - model.debts + portfolioValue;
  const budgetLeft = model.planned - model.spending;
  const topCategories = model.categories.slice(0, 4);

  return (
    <div className={styles.dashboard}>
      <nav className={styles.quickActions} aria-label="Dashboard shortcuts">
        {[
          { href: `${basePath}/transactions`, label: "Transactions", icon: IconArrowsExchange },
          { href: `${basePath}/budget`, label: "Budget", icon: IconPigMoney },
          { href: `${basePath}/investments`, label: "Investments", icon: IconChartPie },
          { href: `${basePath}/cash-flow`, label: "Cash flow", icon: IconWallet },
        ].map(({ href, label, icon: Icon }) => (
          <Link className={styles.quickAction} href={href} key={href}>
            <span><Icon size={20} stroke={1.8} aria-hidden="true" /></span>
            {label}
          </Link>
        ))}
      </nav>
      <div className={styles.dashboardGrid}>
        <section className={styles.spendingPanel}>
          <PanelHeading title="Monthly spending" href={`${basePath}/transactions`} action="Transactions" />
          <div className={styles.spendingSummary}>
            <strong>{money.format(Math.abs(budgetLeft))} {budgetLeft >= 0 ? "left" : "over"}</strong>
            <span>{money.format(model.planned)} budgeted</span>
          </div>
          <LineGraphic />
          <span className={styles.chartPill}>{money.format(model.spending)} spent</span>
        </section>

        <section className={styles.netWorthPanel}>
          <PanelHeading title="Net worth" href={`${basePath}/accounts`} action="Accounts" />
          <div className={styles.netWorthSummary}>
            <div><span><i className={styles.assetDot} />Assets</span><strong>{waitingForMarket ? "Updating…" : marketUnavailable ? money.format(model.cashAssets) : money.format(netWorth + model.debts)}</strong><small><IconArrowUpRight size={12} /> 5.67%</small></div>
            <div><span><i className={styles.debtDot} />Debts</span><strong>{money.format(model.debts)}</strong><small className={styles.debtChange}>0.94%</small></div>
          </div>
          <LineGraphic dual />
          <TimeRange />
        </section>

        <section className={styles.transactionsPanel}>
          <PanelHeading title="Transactions to review" href={`${basePath}/transactions`} action="View all" />
          <div className={styles.transactionList}>
            {model.activity.length ? model.activity.concat(model.activity.slice(0, 3)).map((item, index) => (
              <div className={styles.transactionRow} key={`${item.id}-${index}`}>
                <span className={styles.transactionIcon} aria-hidden="true">{item.incoming ? <IconWallet size={14} /> : <IconReceipt size={14} />}</span>
                <div><strong>{item.name}</strong><span>{item.meta}</span></div>
                <span className={item.incoming ? styles.positive : undefined}>{item.incoming ? "+" : "−"}{money.format(item.amount)}</span>
              </div>
            )) : <p className={styles.emptyCopy}>No transactions need review.</p>}
          </div>
        </section>

        <div className={styles.sideStack}>
          <section className={styles.categoriesPanel}>
            <PanelHeading title="Top categories" href={`${basePath}/budget`} action="View all" />
            <div className={styles.categoryList}>
              {topCategories.length ? topCategories.map((category, index) => (
                <div key={category.name}><span><i style={{ background: `var(--category-${index + 1})` }} />{category.name}</span><strong>{money.format(category.value)}</strong></div>
              )) : <div><span><i />Other</span><strong>{money.format(0)}</strong></div>}
            </div>
          </section>
          <section className={styles.upcomingPanel}>
            <PanelHeading title="Next two weeks" href={`${basePath}/budget`} action="Budgets" />
            <div className={styles.upcomingEmpty}>
              <p>There are no upcoming payments</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
