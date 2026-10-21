"use client";

import { IconArrowRight, IconArrowsExchange, IconPlus, IconReceipt, IconWallet } from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { useCurrencyFormatter } from "@/components/preferences/PreferencesProvider";
import type { DashboardViewModel } from "@/lib/dashboard";
import styles from "./DashboardOverview.module.css";
import { type MonthSelection, withMonth } from "@/lib/helpers/monthSelection";

type DashboardProps = { model: DashboardViewModel; basePath?: string; selectedMonth?: MonthSelection; members?: Array<{ userId: string; name: string; imageUrl: string }> };
type MarketState = { key: string; prices: Record<string, number>; unavailable: string[] };

const marketRequests = new Map<string, { expires: number; request: Promise<MarketState> }>();
const inviteDismissedKey = "baervault-household-invite-dismissed";
const inviteDismissedEvent = "baervault-household-invite-dismissed-change";
function subscribeInviteDismissed(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(inviteDismissedEvent, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(inviteDismissedEvent, callback); };
}
function getInviteDismissed() { return window.localStorage.getItem(inviteDismissedKey) === "true"; }

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

export function DashboardOverview({ model, basePath = "", selectedMonth, members = [] }: DashboardProps) {
  const monthHref = (href: string) => selectedMonth ? withMonth(`${basePath}${href}`, selectedMonth) : `${basePath}${href}`;
  const money = useCurrencyFormatter();
  const requestKey = useMemo(() => [...model.symbols].sort().join(","), [model.symbols]);
  const [marketState, setMarketState] = useState<MarketState>(() => ({ key: basePath ? requestKey : "", prices: {}, unavailable: [] }));
  const inviteDismissed = useSyncExternalStore(subscribeInviteDismissed, getInviteDismissed, () => false);

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
  const budgetLeft = model.leftToSpend;
  const spendingProgress = model.planned > 0 ? Math.min((model.spending / model.planned) * 100, 100) : 0;
  const debtShare = displayedAssets > 0 ? Math.min(100, Math.max((model.debts / displayedAssets) * 100, 0)) : 0;
  const budgetRangeMax = Math.max(model.planned, model.spending, 1);
  const memberMap = new Map(members.map((member) => [member.userId, member]));


  return (
    <div className={styles.dashboard}>
      <section className={styles.hero} aria-label="Monthly spending overview">
        <div className={styles.heroTop}><span>Good to see you</span><span className={styles.status} data-status={model.budgetStatus}>{model.budgetStatus === "over" ? "Over budget" : model.budgetStatus === "close" ? "Close to limit" : "On track"}</span></div>
        <p>{model.month} spending plan</p>
        <strong className={styles.heroAmount}>{money.format(budgetLeft)}</strong>
        <div className={styles.heroCaption}>left to spend this month · {model.daysLeft} {model.daysLeft === 1 ? "day" : "days"} left</div>
        {model.planned === 0 && <p className={styles.heroEmpty}>Set up a budget to see how much is safe to spend. <Link href={monthHref("/budget")}>Create a budget</Link></p>}
        <div className={styles.quickActions} aria-label="Quick actions">
          <Link href={monthHref("/budget?add=purchase")}><IconPlus size={21} aria-hidden="true" /><span>Add purchase</span></Link>
          <Link href={monthHref("/transactions?add=income")}><IconWallet size={21} aria-hidden="true" /><span>Add income</span></Link>
          <Link href={`${basePath}/accounts?add=account-transfer`}><IconArrowsExchange size={21} aria-hidden="true" /><span>Transfer</span></Link>
        </div>
      </section>
      <div className={styles.dashboardGrid}>
        {members.length === 1 && !inviteDismissed && <section className={styles.invitePrompt} aria-labelledby="invite-partner-title"><div><strong id="invite-partner-title">Share your household with someone</strong><span>Invite your partner to plan and review finances together.</span></div><Link href={`${basePath}/household`}>Invite a member</Link><button type="button" aria-label="Dismiss invite prompt" onClick={() => { window.localStorage.setItem(inviteDismissedKey, "true"); window.dispatchEvent(new Event(inviteDismissedEvent)); }}>Dismiss</button></section>}
        <section className={styles.netWorthPanel}>
          <PanelHeading title="Current position" href={monthHref("/accounts")} action="View accounts" />
          {model.financialAccounts.length === 0 && model.accounts.length === 0 ? <p className={styles.emptyCopy}>No accounts yet. <Link href={`${basePath}/accounts?add=account`}>Add an account</Link> to see your current position.</p> : <><div className={styles.netWorthLead}>
            <span>Net worth</span>
            <strong>{money.format(netWorth)}</strong>
            {(waitingForMarket || marketUnavailable) && <small>{waitingForMarket ? "Updating prices. " : "Some prices are unavailable. "}Unpriced investments use purchase cost.</small>}
          </div>
          <div className={styles.compositionTrack} aria-label="Current assets and debts"><i data-animate-progress style={{ width: `${debtShare}%` }} /></div>
          <div className={styles.netWorthSummary}>
            <div><span><i className={styles.assetDot} />Assets</span><strong>{money.format(displayedAssets)}</strong></div>
            <div><span><i className={styles.debtDot} />Debts</span><strong>{money.format(model.debts)}</strong></div>
          </div>
          <p className={styles.emptyCopy}>Accounts {money.format(model.cashAssets)} + investments {money.format(portfolioValue)} − debts {money.format(model.debts)}</p></>}
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
                {item.createdByClerkUserId && memberMap.get(item.createdByClerkUserId) && <span className={styles.memberAvatar} title={`Added by ${memberMap.get(item.createdByClerkUserId)!.name}`}>{memberMap.get(item.createdByClerkUserId)!.imageUrl ? <Image src={memberMap.get(item.createdByClerkUserId)!.imageUrl} alt="" width={28} height={28} unoptimized /> : memberMap.get(item.createdByClerkUserId)!.name.slice(0,1)}</span>}
                <span className={item.incoming ? styles.positive : undefined}>{item.incoming ? "+" : "−"}{money.format(item.amount)}</span>
              </div>
            )) : <p className={styles.emptyCopy}>Activity will appear as income and purchases are added. <Link href={monthHref("/budget?add=purchase")}>Add a purchase</Link>.</p>}
          </div>
        </section>

        <div className={styles.sideStack}>
          <section className={styles.categoriesPanel}>
            <PanelHeading title="Budget by category" href={monthHref("/budget")} action="View budget" />
            <div className={styles.categoryList}>
              {model.categories.length ? model.categories.map((category) => (
                <div className={styles.categoryItem} key={category.name}><span><strong>{category.name}</strong><small>{money.format(category.value)} of {money.format(category.planned)}</small></span><div className={styles.categoryTrack} role="progressbar" aria-label={`${category.name} budget used`} aria-valuemin={0} aria-valuemax={Math.max(category.planned, category.value, 1)} aria-valuenow={category.value}><i data-animate-progress data-over={category.value > category.planned} style={{ width: `${category.planned > 0 ? Math.min(100, category.value / category.planned * 100) : 100}%` }} /></div><small>{category.value > category.planned ? `${money.format(category.value - category.planned)} over` : `${money.format(category.planned - category.value)} left`}</small></div>
              )) : <p className={styles.emptyCopy}>No budgets yet. <Link href={monthHref("/budget")}>Add a category</Link> to start your spending plan.</p>}
            </div>
          </section>
          <section className={styles.upcomingPanel}>
            <PanelHeading title="Upcoming payments" href={monthHref("/transactions?tab=recurring")} action="View all" />
            {model.upcomingPayments.length ? <div className={styles.transactionList}>{model.upcomingPayments.slice(0, 5).map((payment) => <div className={styles.transactionRow} key={payment.id}><span className={styles.transactionIcon}><IconReceipt size={16} aria-hidden="true" /></span><div><strong>{payment.name}</strong><span>{payment.date}{payment.estimated ? " · Estimated" : " · Scheduled"}</span></div><strong>{money.format(payment.amount)}</strong></div>)}</div> : <div className={styles.upcomingEmpty}><p>No upcoming payments found.</p><span>Estimates appear after three months of consistent payments. You can also record a future payment in your budget.</span></div>}
          </section>
          {model.reviewCount > 0 && <section className={styles.reviewPanel} aria-labelledby="dashboard-review-title"><div><span>New bank transactions</span><strong id="dashboard-review-title">{model.reviewCount} {model.reviewCount === 1 ? "transaction" : "transactions"} to review</strong></div><Link href={monthHref("/transactions")}>Review now<IconArrowRight size={15} aria-hidden="true" /></Link></section>}
        </div>
        <section className={styles.goalsPanel}>
          <PanelHeading title="Goals" href={`${basePath}/accounts?tab=goals`} action="View goals" />
          {model.goals.length ? <div className={styles.goalsList}>{model.goals.slice(0, 3).map((goal) => <div className={styles.goalRow} key={goal.id}><div><strong>{goal.name}</strong><span>{money.format(goal.savedAmount)} of {money.format(goal.targetAmount)}</span></div><div className={styles.categoryTrack} role="progressbar" aria-label={`${goal.name} progress`} aria-valuemin={0} aria-valuemax={goal.targetAmount} aria-valuenow={goal.savedAmount}><i style={{ width: `${goal.targetAmount > 0 ? Math.min(100, goal.savedAmount / goal.targetAmount * 100) : 0}%` }} /></div></div>)}</div> : <p className={styles.emptyCopy}>No goals yet. <Link href={`${basePath}/accounts?tab=goals&add=goal`}>Add a goal</Link> to track your progress.</p>}
        </section>
      </div>
    </div>
  );
}
