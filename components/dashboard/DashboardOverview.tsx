"use client";

import {
  IconArrowRight,
  IconArrowUpRight,
  IconBuildingBank,
  IconCalendar,
  IconReceipt,
  IconShieldCheck,
  IconWallet,
} from "@tabler/icons-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useCurrencyFormatter } from "@/components/preferences/PreferencesProvider";
import type { DashboardViewModel } from "./dashboardViewModel";

import styles from "./DashboardOverview.module.css";

const CashFlowVisualization = dynamic(() =>
  import("./DashboardCharts").then((module) => module.CashFlowVisualization),
  {
    loading: () => (
      <div className={styles.chartLoading} aria-label="Loading cash-flow chart">
        Loading chart…
      </div>
    ),
  },
);
const BudgetDonut = dynamic(() =>
  import("./DashboardCharts").then((module) => module.BudgetDonut),
  {
    loading: () => (
      <div className={styles.donutLoading} aria-label="Loading budget chart">
        Loading chart…
      </div>
    ),
  },
);

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

function SectionHeading({ title, href, action, id }: { title: string; href: string; action: string; id?: string }) {
  return (
    <div className={styles.sectionHeading}>
      <h3 id={id}>{title}</h3>
      <Link className={styles.textLink} href={href}>
        {action}
        <IconArrowRight size={15} aria-hidden="true" />
      </Link>
    </div>
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
      .then((nextState) => {
        if (!cancelled) setMarketState(nextState);
      })
      .catch(() => {
        if (!cancelled) {
          setMarketState({ key: requestKey, prices: {}, unavailable: model.symbols });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [basePath, model.symbols, requestKey]);

  const waitingForMarket = !basePath && requestKey !== marketState.key;
  const marketUnavailable = !basePath && marketState.unavailable.length > 0;
  const portfolioValue = model.accounts.reduce(
    (sum, account) => sum + account.holdings.reduce(
      (accountTotal, holding) => accountTotal + holding.shares * (marketState.prices[holding.symbol] ?? holding.fallbackPrice),
      0,
    ),
    0,
  );
  const portfolioDisplay = waitingForMarket ? "Updating…" : marketUnavailable ? "Unavailable" : money.format(portfolioValue);
  const position = model.cashAvailable + portfolioValue;
  const budgetUsed = model.planned ? Math.min((model.spending / model.planned) * 100, 100) : 0;
  const savingsRate = model.income ? (model.cashAvailable / model.income) * 100 : 0;

  return (
    <div className={styles.dashboard}>
      <section className={styles.intro} aria-labelledby="dashboard-title">
        <div>
          <h2 id="dashboard-title">Your financial home</h2>
          <p>{basePath ? "A complete household view using sample data." : "Income, spending, and investments—together in one calm view."}</p>
        </div>
        <div className={styles.periodBadge}>
          <IconCalendar size={16} aria-hidden="true" />
          {model.month}
        </div>
      </section>

      <div className={styles.cockpit}>
        <section className={styles.positionCard} aria-labelledby="position-title">
          <div className={styles.positionTopline}>
            <span id="position-title">Total net worth</span>
            <IconShieldCheck size={20} aria-hidden="true" />
          </div>
          <p className={styles.positionValue}>{waitingForMarket ? "Updating…" : marketUnavailable ? "Unavailable" : money.format(position)}</p>
          <div className={styles.positionChange}>
            <IconArrowUpRight size={15} aria-hidden="true" />
            <span>{savingsRate.toFixed(1)}% retained this month</span>
          </div>
          <div className={styles.positionBreakdown}>
            <div>
              <span>Available cash</span>
              <strong>{money.format(model.cashAvailable)}</strong>
            </div>
            <div>
              <span>Portfolio value</span>
              <strong>{portfolioDisplay}</strong>
            </div>
          </div>
          <Link className={styles.positionAction} href={`${basePath}/investments`}>
            View portfolio <IconArrowRight size={15} aria-hidden="true" />
          </Link>
        </section>

        <section className={styles.cashFlowPanel} aria-labelledby="cash-flow-title">
          <div className={styles.chartHeading}>
            <div>
              <h3 id="cash-flow-title">Monthly cash flow</h3>
              <p>How money is moving through the household</p>
            </div>
            <div className={styles.legend} aria-hidden="true">
              <span><i className={styles.incomeDot} />Income</span>
              <span><i className={styles.spendingDot} />Spending</span>
            </div>
          </div>
          <CashFlowVisualization
            data={model.cashFlowSeries}
            month={model.month}
            income={model.income}
            spending={model.spending}
          />
          <div className={styles.chartStats}>
            <div><span>Income</span><strong>{money.format(model.income)}</strong></div>
            <div><span>Spent</span><strong>{money.format(model.spending)}</strong></div>
            <div><span>Net cash flow</span><strong className={model.cashAvailable >= 0 ? styles.positive : styles.negative}>{money.format(model.cashAvailable)}</strong></div>
          </div>
        </section>

        <section className={styles.activityPanel} aria-labelledby="activity-title">
          <SectionHeading id="activity-title" title="Transactions" href={`${basePath}/transactions`} action="See all" />
          <div className={styles.activityList}>
            {model.activity.map((item) => (
              <div className={styles.activityRow} key={item.id}>
                <span className={item.incoming ? styles.incomeIcon : styles.expenseIcon} aria-hidden="true">
                  {item.incoming ? <IconWallet size={17} /> : <IconReceipt size={17} />}
                </span>
                <div className={styles.activityCopy}>
                  <strong>{item.name}</strong>
                  <span>{item.meta}</span>
                </div>
                <span className={item.incoming ? styles.incoming : styles.outgoing}>
                  {item.incoming ? "+" : "−"}{money.format(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className={styles.lowerGrid}>
        <section className={styles.budgetPanel} aria-labelledby="budget-title">
          <SectionHeading id="budget-title" title="Spending plan" href={`${basePath}/budget`} action="Open budget" />
          <div className={styles.budgetContent}>
            <BudgetDonut categories={model.categories} budgetUsed={budgetUsed} />
            <div className={styles.categoryList}>
              {model.categories.slice(0, 5).map((category, index) => (
                <div className={styles.categoryRow} key={category.name}>
                  <i style={{ background: `var(--dashboard-category-${(index % 6) + 1})` }} />
                  <span>{category.name}</span>
                  <strong>{money.format(category.value)}</strong>
                  <small>of {money.format(category.planned)}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.accountsPanel} aria-labelledby="accounts-title">
          <SectionHeading id="accounts-title" title="Investment accounts" href={`${basePath}/investments`} action="Manage" />
          <div className={styles.accountSummary}>
            <div><span>Current portfolio value</span><strong>{portfolioDisplay}</strong></div>
            <span className={styles.accountCount}>{model.accounts.length} accounts</span>
          </div>
          <div className={styles.accountList}>
            {model.accounts.map((account) => {
              const value = account.holdings.reduce(
                (sum, holding) => sum + holding.shares * (marketState.prices[holding.symbol] ?? holding.fallbackPrice),
                0,
              );
              const accountUnavailable = !basePath && account.holdings.some((holding) => marketState.unavailable.includes(holding.symbol));
              return (
                <div className={styles.accountRow} key={account.id}>
                  <span className={styles.bankIcon}><IconBuildingBank size={18} aria-hidden="true" /></span>
                  <div><strong>{account.name}</strong><span>{account.owner} · {account.holdings.length} holdings</span></div>
                  <strong>{waitingForMarket ? "Updating…" : accountUnavailable ? "Unavailable" : money.format(value)}</strong>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
