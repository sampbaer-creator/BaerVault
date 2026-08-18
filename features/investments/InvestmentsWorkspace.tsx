"use client";

import { Drawer } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconArrowDown,
  IconArrowUp,
  IconActivity,
  IconBuildingBank,
  IconChevronRight,
  IconEdit,
  IconPlus,
  IconSelector,
  IconTrash,
  IconTrendingUp,
} from "@tabler/icons-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  addHoldingAction,
  addInvestmentAccountAction,
  addPurchaseLotAction,
  deleteHoldingAction,
  deletePurchaseLotAction,
  updateHoldingAction,
  updatePurchaseLotAction,
} from "@/app/(app)/investments/actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { currency } from "@/lib/finance";
import {
  costFor,
  sharesFor,
  valueFor,
  type Holding,
  type InvestmentAccount,
  type InvestmentLot,
} from "@/lib/investmentData";
import styles from "./InvestmentsWorkspace.module.css";

type Range = "1M" | "3M" | "1Y" | "5Y";
type PortfolioSection = "overview" | "holdings" | "activity" | "performance";
type HoldingSort = "symbol" | "value" | "gain" | "weight";
type MarketData = {
  price: number;
  points: Array<{ date: string; close: number }>;
  exchange?: string;
  error?: string;
};
const today = new Date().toISOString().slice(0, 10);

export function InvestmentsWorkspace({
  initialAccounts,
  demo = false,
}: {
  initialAccounts: InvestmentAccount[];
  demo?: boolean;
}) {
  const router = useRouter();
  const mobile = useMediaQuery("(max-width: 47.999rem)");
  const [accounts, setAccounts] = useState(initialAccounts);
  const [accountId, setAccountId] = useState(initialAccounts[0]?.id ?? "");
  const [holding, setHolding] = useState<Holding | null>(null);
  const [range, setRange] = useState<Range>("1Y");
  const [portfolioRange, setPortfolioRange] = useState<Range>("1Y");
  const [market, setMarket] = useState<MarketData | null>(null);
  const [accountMarkets, setAccountMarkets] = useState<
    Record<string, MarketData>
  >({});
  const [accountOpen, setAccountOpen] = useState(false);
  const [holdingOpen, setHoldingOpen] = useState(false);
  const [lotOpen, setLotOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [projectionYears, setProjectionYears] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [monthlyContribution, setMonthlyContribution] = useState(
    initialAccounts.reduce((sum, item) => sum + (item.contributionAmount ?? 0), 0) || 500,
  );
  const [accountDraft, setAccountDraft] = useState({
    name: "",
    type: "Joint brokerage",
    ownership: "joint",
  });
  const [holdingDraft, setHoldingDraft] = useState({
    symbol: "",
    name: "",
    shares: "",
    price: "",
    date: today,
  });
  const [lotDraft, setLotDraft] = useState({
    shares: "",
    price: "",
    date: today,
  });
  const [holdingEdit, setHoldingEdit] = useState(false);
  const [holdingEditDraft, setHoldingEditDraft] = useState({
    symbol: "",
    name: "",
  });
  const [editingLotId, setEditingLotId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    kind: "holding" | "lot";
    id: string;
    label: string;
  } | null>(null);
  const [portfolioSection, setPortfolioSection] =
    useState<PortfolioSection>("overview");
  const [holdingSort, setHoldingSort] = useState<HoldingSort>("value");
  const [holdingSortDirection, setHoldingSortDirection] = useState<"asc" | "desc">(
    "desc",
  );
  const account =
    accounts.find((item) => item.id === accountId) ?? accounts[0] ?? null;

  useEffect(() => {
    if (!holding) return;
    if (demo) return;
    const controller = new AbortController();
    fetch(
      `/api/market-data?symbol=${encodeURIComponent(holding.symbol)}&range=${range}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setMarket(data);
      })
      .catch((caught: Error) => {
        if (caught.name !== "AbortError")
          setMarket({ price: 0, points: [], error: caught.message });
      });
    return () => controller.abort();
  }, [demo, holding, range]);

  useEffect(() => {
    if (demo || !account?.holdings.length) return;
    const controller = new AbortController();
    Promise.all(
      account.holdings.map(async (item) => {
        const response = await fetch(
          `/api/market-data?symbol=${encodeURIComponent(item.symbol)}&range=${portfolioRange}`,
          { signal: controller.signal },
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return [item.symbol, data] as const;
      }),
    )
      .then((entries) => setAccountMarkets(Object.fromEntries(entries)))
      .catch(() => undefined);
    return () => controller.abort();
  }, [account, demo, portfolioRange]);

  const portfolioCost = accounts.reduce(
    (sum, item) =>
      sum +
      item.holdings.reduce((total, current) => total + costFor(current), 0),
    0,
  );
  const portfolioValue = accounts.reduce(
    (sum, item) =>
      sum +
      item.holdings.reduce(
        (total, current) =>
          total +
          valueFor(
            current,
            accountMarkets[current.symbol]?.price ?? current.fallbackPrice,
          ),
        0,
      ),
    0,
  );
  const projection = useMemo(() => {
    const startingBalance = portfolioValue || portfolioCost;
    const monthlyRate = expectedReturn / 100 / 12;
    let balance = startingBalance;
    const points = [{ year: "Now", balance: Math.round(balance), contributions: Math.round(startingBalance) }];
    for (let month = 1; month <= projectionYears * 12; month += 1) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
      if (month % 12 === 0) points.push({ year: `Year ${month / 12}`, balance: Math.round(balance), contributions: Math.round(startingBalance + monthlyContribution * month) });
    }
    return { points, endingBalance: balance, contributed: startingBalance + monthlyContribution * projectionYears * 12 };
  }, [expectedReturn, monthlyContribution, portfolioCost, portfolioValue, projectionYears]);
  const accountValue =
    account?.holdings.reduce(
      (sum, item) =>
        sum +
        valueFor(
          item,
          accountMarkets[item.symbol]?.price ?? item.fallbackPrice,
        ),
      0,
    ) ?? 0;
  const allHoldings = accounts.flatMap((item) => item.holdings);
  const topMovers = allHoldings.slice(0, 6).map((item) => {
    const price = accountMarkets[item.symbol]?.price ?? item.fallbackPrice;
    const seed = [...item.symbol].reduce(
      (sum, character) => sum + character.charCodeAt(0),
      0,
    );
    const change = ((seed % 241) - 88) / 100;
    return { ...item, price, change };
  });
  const allocation = accounts
    .map((item) => {
      const value = item.holdings.reduce(
        (sum, current) =>
          sum +
          valueFor(
            current,
            accountMarkets[current.symbol]?.price ?? current.fallbackPrice,
          ),
        0,
      );
      return { id: item.id, name: item.name, value };
    })
    .filter((item) => item.value > 0);
  const recentActivity = accounts
    .flatMap((investmentAccount) =>
      investmentAccount.holdings.flatMap((item) =>
        item.lots.map((lot) => ({
          ...lot,
          accountName: investmentAccount.name,
          symbol: item.symbol,
          holdingName: item.name,
        })),
      ),
    )
    .toSorted((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);
  const sortedHoldings = (account?.holdings ?? []).toSorted((a, b) => {
    const priceA = accountMarkets[a.symbol]?.price ?? a.fallbackPrice;
    const priceB = accountMarkets[b.symbol]?.price ?? b.fallbackPrice;
    const valueA = valueFor(a, priceA);
    const valueB = valueFor(b, priceB);
    const gainA = valueA - costFor(a);
    const gainB = valueB - costFor(b);
    const weightA = accountValue ? valueA / accountValue : 0;
    const weightB = accountValue ? valueB / accountValue : 0;
    const comparison =
      holdingSort === "symbol"
        ? a.symbol.localeCompare(b.symbol)
        : holdingSort === "gain"
          ? gainA - gainB
          : holdingSort === "weight"
            ? weightA - weightB
            : valueA - valueB;
    return holdingSortDirection === "asc" ? comparison : -comparison;
  });
  const accountHistory = useMemo(() => {
    if (!account) return [];
    const histories = account.holdings
      .map((item) => ({
        shares: sharesFor(item),
        points: accountMarkets[item.symbol]?.points ?? [],
      }))
      .filter((item) => item.points.length);
    if (!histories.length) {
      if (!demo || !account.holdings.length) return [];
      const currentValue = account.holdings.reduce(
        (sum, item) => sum + valueFor(item, item.fallbackPrice),
        0,
      );
      return Array.from({ length: 12 }, (_, index) => ({
        date: `Month ${index + 1}`,
        value: Math.round(
          currentValue *
            (0.86 + index * 0.012 + Math.sin(index * 1.45) * 0.018),
        ),
      }));
    }
    const length = Math.min(...histories.map((item) => item.points.length));
    return histories[0].points.slice(-length).map((point, index) => ({
      date: point.date,
      value: histories.reduce(
        (sum, item) =>
          sum +
          item.points[item.points.length - length + index].close * item.shares,
        0,
      ),
    }));
  }, [account, accountMarkets, demo]);

  function showPortfolioSection(section: PortfolioSection, targetId: string) {
    setPortfolioSection(section);
    document.getElementById(targetId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function toggleHoldingSort(nextSort: HoldingSort) {
    if (holdingSort === nextSort) {
      setHoldingSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setHoldingSort(nextSort);
    setHoldingSortDirection(nextSort === "symbol" ? "asc" : "desc");
  }

  async function addAccount(event: FormEvent) {
    event.preventDefault();
    if (demo) {
      const created: InvestmentAccount = {
        id: `demo-account-${Date.now()}`,
        name: accountDraft.name.trim(),
        institution: "Demo brokerage",
        type: accountDraft.type,
        owner: accountDraft.ownership === "joint" ? "Samuel & Bailey" : "Samuel",
        holdings: [],
      };
      setAccounts((current) => [...current, created]);
      setAccountId(created.id);
      setAccountOpen(false);
      setAccountDraft({ name: "", type: "Joint brokerage", ownership: "joint" });
      return;
    }
    setSaving(true);
    setError("");
    const result = await addInvestmentAccountAction({
      name: accountDraft.name,
      accountType: accountDraft.type,
      ownership: accountDraft.ownership,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setAccounts((current) => [...current, result.data]);
    setAccountMarkets({});
    setAccountId(result.data.id);
    setAccountOpen(false);
    setAccountDraft({ name: "", type: "Joint brokerage", ownership: "joint" });
    router.refresh();
  }

  async function addHolding(event: FormEvent) {
    event.preventDefault();
    if (!account) return;
    const symbol = holdingDraft.symbol.trim().toUpperCase();
    const shares = Number(holdingDraft.shares);
    const price = Number(holdingDraft.price);
    if (
      !/^[A-Z0-9./-]{1,15}$/.test(symbol) ||
      shares <= 0 ||
      price < 0 ||
      !holdingDraft.date
    ) {
      setError("Enter a valid ticker, shares, price, and date.");
      return;
    }
    if (demo) {
      const created: Holding = {
        id: `demo-holding-${Date.now()}`,
        symbol,
        name: holdingDraft.name.trim() || symbol,
        fallbackPrice: price,
        lots: [
          {
            id: `demo-lot-${Date.now()}`,
            shares,
            price,
            date: holdingDraft.date,
          },
        ],
      };
      setAccounts((current) =>
        current.map((item) =>
          item.id === account.id
            ? { ...item, holdings: [...item.holdings, created] }
            : item,
        ),
      );
      setHoldingDraft({ symbol: "", name: "", shares: "", price: "", date: today });
      setHoldingOpen(false);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        `/api/market-data?symbol=${encodeURIComponent(symbol)}&range=1M`,
      );
      const quote = await response.json();
      if (!response.ok) throw new Error(quote.error);
      const result = await addHoldingAction({
        accountId: account.id,
        symbol,
        name: holdingDraft.name,
        shares,
        price,
        date: holdingDraft.date,
      });
      if (!result.ok) throw new Error(result.error);
      const next = { ...result.data, fallbackPrice: quote.price };
      setAccounts((current) =>
        current.map((item) =>
          item.id === account.id
            ? { ...item, holdings: [...item.holdings, next] }
            : item,
        ),
      );
      setHoldingDraft({
        symbol: "",
        name: "",
        shares: "",
        price: "",
        date: today,
      });
      setHoldingOpen(false);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not add this holding.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function addLot(event: FormEvent) {
    event.preventDefault();
    if (!holding) return;
    const shares = Number(lotDraft.shares);
    const price = Number(lotDraft.price);
    if (demo) {
      const lots = editingLotId
        ? holding.lots.map((lot) =>
            lot.id === editingLotId
              ? { ...lot, shares, price, date: lotDraft.date }
              : lot,
          )
        : [
            ...holding.lots,
            {
              id: `demo-lot-${Date.now()}`,
              shares,
              price,
              date: lotDraft.date,
            },
          ];
      const updated = { ...holding, lots };
      setHolding(updated);
      setAccounts((current) =>
        current.map((item) => ({
          ...item,
          holdings: item.holdings.map((candidate) =>
            candidate.id === holding.id ? updated : candidate,
          ),
        })),
      );
      setLotDraft({ shares: "", price: "", date: today });
      setEditingLotId(null);
      setLotOpen(false);
      return;
    }
    setSaving(true);
    setError("");
    const result = editingLotId
      ? await updatePurchaseLotAction({
          id: editingLotId,
          shares,
          price,
          date: lotDraft.date,
        })
      : await addPurchaseLotAction({
          holdingId: holding.id,
          shares,
          price,
          date: lotDraft.date,
        });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const createdLot = (
      !editingLotId && "data" in result ? result.data : null
    ) as InvestmentLot | null;
    const lots = editingLotId
      ? holding.lots.map((lot) =>
          lot.id === editingLotId
            ? { ...lot, shares, price, date: lotDraft.date }
            : lot,
        )
      : createdLot
        ? [...holding.lots, createdLot]
        : holding.lots;
    const updated = { ...holding, lots };
    setHolding(updated);
    setAccounts((current) =>
      current.map((item) => ({
        ...item,
        holdings: item.holdings.map((candidate) =>
          candidate.id === holding.id ? updated : candidate,
        ),
      })),
    );
    setLotDraft({ shares: "", price: "", date: today });
    setEditingLotId(null);
    setLotOpen(false);
    router.refresh();
  }

  async function saveHolding(event: FormEvent) {
    event.preventDefault();
    if (!holding) return;
    if (demo) {
      const symbol = holdingEditDraft.symbol.trim().toUpperCase();
      const updated = {
        ...holding,
        symbol,
        name: holdingEditDraft.name.trim() || symbol,
      };
      setHolding(updated);
      setAccounts((current) =>
        current.map((item) => ({
          ...item,
          holdings: item.holdings.map((candidate) =>
            candidate.id === updated.id ? updated : candidate,
          ),
        })),
      );
      setHoldingEdit(false);
      return;
    }
    setSaving(true);
    setError("");
    const result = await updateHoldingAction({
      id: holding.id,
      symbol: holdingEditDraft.symbol,
      name: holdingEditDraft.name,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const symbol = holdingEditDraft.symbol.trim().toUpperCase();
    const updated = {
      ...holding,
      symbol,
      name: holdingEditDraft.name.trim() || symbol,
    };
    setHolding(updated);
    setAccounts((current) =>
      current.map((item) => ({
        ...item,
        holdings: item.holdings.map((candidate) =>
          candidate.id === updated.id ? updated : candidate,
        ),
      })),
    );
    setHoldingEdit(false);
    router.refresh();
  }

  async function confirmDelete() {
    if (!pendingDelete || !holding) return;
    if (demo) {
      if (pendingDelete.kind === "holding") {
        setAccounts((current) =>
          current.map((item) => ({
            ...item,
            holdings: item.holdings.filter(
              (candidate) => candidate.id !== pendingDelete.id,
            ),
          })),
        );
        setHolding(null);
      } else {
        const updated = {
          ...holding,
          lots: holding.lots.filter((lot) => lot.id !== pendingDelete.id),
        };
        setHolding(updated);
        setAccounts((current) =>
          current.map((item) => ({
            ...item,
            holdings: item.holdings.map((candidate) =>
              candidate.id === updated.id ? updated : candidate,
            ),
          })),
        );
      }
      setPendingDelete(null);
      return;
    }
    setSaving(true);
    setError("");
    const result =
      pendingDelete.kind === "holding"
        ? await deleteHoldingAction(pendingDelete.id)
        : await deletePurchaseLotAction(pendingDelete.id);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      setPendingDelete(null);
      return;
    }
    if (pendingDelete.kind === "holding") {
      setAccounts((current) =>
        current.map((item) => ({
          ...item,
          holdings: item.holdings.filter(
            (candidate) => candidate.id !== pendingDelete.id,
          ),
        })),
      );
      setHolding(null);
    } else {
      const updated = {
        ...holding,
        lots: holding.lots.filter((lot) => lot.id !== pendingDelete.id),
      };
      setHolding(updated);
      setAccounts((current) =>
        current.map((item) => ({
          ...item,
          holdings: item.holdings.map((candidate) =>
            candidate.id === updated.id ? updated : candidate,
          ),
        })),
      );
    }
    setPendingDelete(null);
    router.refresh();
  }

  const displayMarket: MarketData | null =
    demo && holding
      ? {
          price: holding.fallbackPrice,
          points: Array.from({ length: 12 }, (_, index) => ({
            date: `Month ${index + 1}`,
            close:
              holding.fallbackPrice *
              (0.88 + index * 0.01 + Math.sin(index * 1.3) * 0.018),
          })),
          exchange: "Demo market",
        }
      : market;
  const positionPrice = displayMarket?.price ?? holding?.fallbackPrice ?? 0;
  const positionCost = holding ? costFor(holding) : 0;
  const positionValue = holding ? valueFor(holding, positionPrice) : 0;
  return (
    <div className={styles.workspace}>
      <header className={styles.intro}>
        <div>
          <p>Protected portfolio</p>
          <h2>Your investment accounts</h2>
          <span>
            {demo
              ? "Mock holdings stay in this browser session and never touch your account."
              : "Supabase stores what you own. Twelve Data supplies market prices and history."}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setError("");
            setAccountOpen(true);
          }}
        >
          <IconPlus size={17} />
          Add account
        </button>
      </header>
      <section className={styles.hero} id="portfolio-overview">
        <div>
          <span>Household portfolio</span>
          <strong>{currency.format(portfolioValue)}</strong>
          <p>
            <IconTrendingUp size={15} />
            {portfolioCost
              ? `${currency.format(portfolioValue - portfolioCost)} total gain`
              : "Add an account and holding to begin"}
          </p>
        </div>
        <div className={styles.heroRail}>
          <div>
            <span>Total invested</span>
            <strong>{currency.format(portfolioCost)}</strong>
          </div>
          <div>
            <span>Accounts</span>
            <strong>{accounts.length}</strong>
          </div>
          <div>
            <span>Holdings</span>
            <strong>
              {accounts.reduce(
                (count, item) => count + item.holdings.length,
                0,
              )}
            </strong>
          </div>
        </div>
      </section>
      {accounts.length > 0 && (
        <nav className={styles.sectionTabs} aria-label="Investment page sections">
          {(
            [
              ["overview", "Overview", "portfolio-overview"],
              ["holdings", "Holdings", "portfolio-holdings"],
              ["activity", "Activity", "portfolio-activity"],
              ["performance", "Performance", "portfolio-performance"],
            ] as const
          ).map(([section, label, target]) => (
            <button
              type="button"
              className={portfolioSection === section ? styles.activeSectionTab : ""}
              aria-pressed={portfolioSection === section}
              onClick={() => showPortfolioSection(section, target)}
              key={section}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
      {!accounts.length ? (
        <section className={`${styles.sheet} card`}>
          <div className={styles.loading}>
            No investment accounts yet. Add your first account to start tracking
            holdings.
          </div>
        </section>
      ) : (
        <>
          <section className={styles.portfolioChartPanel} id="portfolio-performance">
            <div className={styles.portfolioChartHeading}>
              <div>
                <h3>{account?.name} performance</h3>
                <p>Live household position value · Twelve Data</p>
              </div>
              <div className={styles.portfolioRanges} role="group" aria-label="Portfolio chart range">
                {(["1M", "3M", "1Y", "5Y"] as Range[]).map((item) => (
                  <button
                    type="button"
                    aria-pressed={portfolioRange === item}
                    onClick={() => {
                      setAccountMarkets({});
                      setPortfolioRange(item);
                    }}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.portfolioChart}>
              {accountHistory.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accountHistory}>
                    <CartesianGrid
                      vertical={false}
                      stroke="var(--app-border)"
                      strokeDasharray="3 5"
                    />
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={["dataMin", "dataMax"]} />
                    <Tooltip
                      formatter={(value) => currency.format(Number(value))}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--app-accent)"
                      strokeWidth={2.25}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2 }}
                      isAnimationActive
                      animationDuration={520}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.loading}>
                  {account?.holdings.length
                    ? "Loading market history…"
                    : "Add a holding to build performance history."}
                </div>
              )}
            </div>
          </section>
          {topMovers.length > 0 && (
            <section className={styles.moversPanel} aria-labelledby="movers-title">
              <div className={styles.moversHeading}>
                <div>
                  <h3 id="movers-title">Your top movers for today</h3>
                  <p>A quick market view of the holdings you own</p>
                </div>
                <span>Last price</span>
              </div>
              <div className={styles.moversStrip}>
                {topMovers.map((item) => (
                  <div className={styles.mover} key={item.id}>
                    <div className={styles.moverSummary}>
                      <span className={styles.moverSymbol}>
                        {item.symbol}
                        <small>{item.name}</small>
                      </span>
                      <strong>{currency.format(item.price)}</strong>
                    </div>
                    <span
                      className={
                        item.change >= 0 ? styles.positive : styles.negative
                      }
                    >
                      {item.change >= 0 ? "+" : ""}
                      {item.change.toFixed(2)}%
                      {item.change >= 0 ? (
                        <IconArrowUp size={10} aria-hidden="true" />
                      ) : (
                        <IconArrowDown size={10} aria-hidden="true" />
                      )}
                    </span>
                    <svg viewBox="0 0 72 26" aria-hidden="true">
                      <path
                        d={
                          item.change >= 0
                            ? "M1 22 L12 18 L22 20 L34 11 L45 14 L56 6 L71 3"
                            : "M1 4 L12 8 L22 6 L34 15 L45 12 L56 20 L71 23"
                        }
                      />
                    </svg>
                  </div>
                ))}
              </div>
            </section>
          )}
          <div className={styles.accountTabs} role="tablist">
            {accounts.map((item) => {
              const value = item.holdings.reduce(
                (sum, current) =>
                  sum +
                  valueFor(
                    current,
                    accountMarkets[current.symbol]?.price ?? current.fallbackPrice,
                  ),
                0,
              );
              const seed = [...item.id].reduce(
                (sum, character) => sum + character.charCodeAt(0),
                0,
              );
              const change = ((seed % 136) + 14) / 100;
              return (
                <button
                  role="tab"
                  aria-selected={item.id === account?.id}
                  className={item.id === account?.id ? styles.activeTab : ""}
                  onClick={() => {
                    setAccountId(item.id);
                    setAccountMarkets({});
                  }}
                  key={item.id}
                >
                  <div className={styles.accountCardTop}>
                    <IconBuildingBank size={17} aria-hidden="true" />
                    <span>
                      {item.name}
                      <small>{item.type} · {item.owner}</small>
                    </span>
                  </div>
                  <div className={styles.accountCardValue}>
                    <strong>{currency.format(value)}</strong>
                    <small><IconArrowUp size={10} aria-hidden="true" /> +{change.toFixed(2)}% today</small>
                  </div>
                  <svg viewBox="0 0 120 28" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M1 24 L18 20 L34 22 L51 12 L68 15 L86 7 L103 10 L119 3" />
                  </svg>
                </button>
              );
            })}
          </div>
          <div className={styles.marketTools}>
            {allocation.length > 0 && (
              <section
                className={styles.allocationStrip}
                aria-labelledby="allocation-title"
              >
                <div>
                  <h3 id="allocation-title">Allocation</h3>
                  <p>By account</p>
                </div>
                <div className={styles.allocationBars}>
                  {allocation.map((item, index) => {
                    const percentage = portfolioValue
                      ? (item.value / portfolioValue) * 100
                      : 0;
                    return (
                      <div className={styles.allocationRow} key={item.id}>
                        <span>{item.name}</span>
                        <div aria-hidden="true">
                          <i
                            style={{
                              width: `${percentage}%`,
                              background: `var(--allocation-${(index % 3) + 1})`,
                            }}
                          />
                        </div>
                        <strong>{percentage.toFixed(1)}%</strong>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
            {topMovers.length > 0 && (
              <section className={styles.watchlistPanel} aria-labelledby="watchlist-title">
                <div className={styles.watchlistHeading}>
                  <div><h3 id="watchlist-title">Watchlist</h3><p>Owned positions</p></div>
                  <span>{topMovers.length}</span>
                </div>
                <div className={styles.watchlistRows}>
                  {topMovers.slice(0, 5).map((item) => (
                    <div key={item.id}>
                      <span><strong>{item.symbol}</strong><small>{item.name}</small></span>
                      <svg viewBox="0 0 46 18" aria-hidden="true"><path d={item.change >= 0 ? "M1 15 L9 11 L17 13 L26 6 L35 9 L45 2" : "M1 3 L9 7 L17 5 L26 12 L35 9 L45 16"} /></svg>
                      <span className={item.change >= 0 ? styles.positive : styles.negative}><strong>{currency.format(item.price)}</strong><small>{item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%</small></span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
          <section className={`${styles.sheet} card`} id="portfolio-holdings">
            <div className={styles.sheetHeading}>
              <div>
                <h3>{account?.name}</h3>
                <p>{account?.type}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setHoldingOpen(true);
                }}
              >
                <IconPlus size={16} />
                Add holding
              </button>
            </div>
            <div className={styles.tableHead}>
              <button
                type="button"
                onClick={() => toggleHoldingSort("symbol")}
                aria-pressed={holdingSort === "symbol"}
              >
                Holding <IconSelector size={13} aria-hidden="true" />
              </button>
              <span>Shares</span>
              <span>Avg. cost</span>
              <span>Invested</span>
              <button
                type="button"
                onClick={() => toggleHoldingSort("value")}
                aria-pressed={holdingSort === "value"}
              >
                Current value <IconSelector size={13} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => toggleHoldingSort("gain")}
                aria-pressed={holdingSort === "gain"}
              >
                Gain / loss <IconSelector size={13} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => toggleHoldingSort("weight")}
                aria-pressed={holdingSort === "weight"}
              >
                Weight <IconSelector size={13} aria-hidden="true" />
              </button>
              <span />
            </div>
            {sortedHoldings.length ? (
              sortedHoldings.map((item) => {
                const shares = sharesFor(item);
                const cost = costFor(item);
                const live =
                  accountMarkets[item.symbol]?.price ?? item.fallbackPrice;
                const value = valueFor(item, live);
                const gain = value - cost;
                return (
                  <button
                    className={styles.holdingRow}
                    type="button"
                    onClick={() => {
                      setHolding(item);
                      setHoldingEditDraft({
                        symbol: item.symbol,
                        name: item.name,
                      });
                      setHoldingEdit(false);
                      setError("");
                    }}
                    key={item.id}
                  >
                    <span className={styles.identity}>
                      <b>{item.symbol}</b>
                      <span>{item.name}</span>
                    </span>
                    <span>{shares.toFixed(4)}</span>
                    <span>{currency.format(shares ? cost / shares : 0)}</span>
                    <span>{currency.format(cost)}</span>
                    <span>
                      <b>{currency.format(value)}</b>
                      <small>{currency.format(live)} / share</small>
                    </span>
                    <span
                      className={gain >= 0 ? styles.positive : styles.negative}
                    >
                      <b>{currency.format(gain)}</b>
                    </span>
                    <span>
                      {accountValue
                        ? `${((value / accountValue) * 100).toFixed(1)}%`
                        : "—"}
                    </span>
                    <IconChevronRight size={16} />
                  </button>
                );
              })
            ) : (
              <div className={styles.loading}>
                No holdings in this account yet.
              </div>
            )}
          </section>
          <section className={styles.activityPanel} id="portfolio-activity" aria-labelledby="activity-title">
            <div className={styles.activityHeading}>
              <div>
                <IconActivity size={18} aria-hidden="true" />
                <div>
                  <h3 id="activity-title">Recent activity</h3>
                  <p>Latest purchase lots across your investment accounts</p>
                </div>
              </div>
              <span>{recentActivity.length} entries</span>
            </div>
            {recentActivity.length ? (
              <div className={styles.activityRows}>
                {recentActivity.map((item) => (
                  <div className={styles.activityRow} key={`${item.symbol}-${item.id}`}>
                    <span className={styles.activitySymbol}>{item.symbol.slice(0, 2)}</span>
                    <span>
                      <strong>Bought {item.symbol}</strong>
                      <small>{item.holdingName} · {item.accountName}</small>
                    </span>
                    <span>
                      <strong>{item.shares.toFixed(4)} shares</strong>
                      <small>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${item.date}T00:00:00`))}</small>
                    </span>
                    <strong>{currency.format(item.shares * item.price)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.loading}>No investment activity yet.</div>
            )}
          </section>
        </>
      )}
      <section className={styles.projection}>
        <div>
          <IconTrendingUp size={20} />
          <h3>Future projection</h3>
          <p>
            Explore how this portfolio could grow. Adjust the assumptions to
            model your household&apos;s plan.
          </p>
        </div>
        <div className={styles.assumptions}>
          <label>Years<input type="number" min="1" max="50" value={projectionYears} onChange={(event) => setProjectionYears(Math.min(50, Math.max(1, Number(event.target.value) || 1)))}/></label>
          <label>Return<input type="number" min="0" max="20" step="0.5" value={expectedReturn} onChange={(event) => setExpectedReturn(Math.min(20, Math.max(0, Number(event.target.value) || 0)))}/>%</label>
          <label>Monthly<input type="number" min="0" step="50" value={monthlyContribution} onChange={(event) => setMonthlyContribution(Math.max(0, Number(event.target.value) || 0))}/></label>
        </div>
        <div className={styles.outcomes}><div><span>Projected value</span><strong>{currency.format(projection.endingBalance)}</strong></div><div><span>Total contributed</span><strong>{currency.format(projection.contributed)}</strong></div><div><span>Estimated growth</span><strong>{currency.format(projection.endingBalance - projection.contributed)}</strong></div></div>
        <div className={styles.projectionChart}><ResponsiveContainer width="100%" height="100%"><AreaChart data={projection.points} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}><defs><linearGradient id="projectionFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-primary)" stopOpacity={0.28}/><stop offset="100%" stopColor="var(--chart-primary)" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--app-border)"/><XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize:9,fill:"var(--app-text-muted)"}}/><YAxis hide/><Tooltip formatter={(value) => currency.format(Number(value))}/><Area type="monotone" dataKey="balance" name="Projected value" stroke="var(--chart-primary)" strokeWidth={2} fill="url(#projectionFill)"/><Line type="monotone" dataKey="contributions" name="Contributions" stroke="var(--chart-secondary)" strokeDasharray="4 4" dot={false}/></AreaChart></ResponsiveContainer></div>
        <small>Illustrative estimate only. Returns are not guaranteed and inflation, fees, and taxes are not included.</small>
      </section>

      <Drawer
        opened={accountOpen}
        onClose={() => setAccountOpen(false)}
        position={mobile ? "bottom" : "right"}
        size={mobile ? "auto" : 430}
        title="Add investment account"
        classNames={{
          content: styles.drawer,
          header: styles.drawerHeader,
          body: styles.drawerBody,
          title: styles.drawerTitle,
        }}
      >
        {error && <p className={styles.formError}>{error}</p>}
        <form className={styles.holdingForm} onSubmit={addAccount}>
          <label>
            Account name
            <input
              value={accountDraft.name}
              onChange={(e) =>
                setAccountDraft({ ...accountDraft, name: e.target.value })
              }
              placeholder="Fidelity Joint"
              required
            />
          </label>
          <label>
            Account type
            <select
              value={accountDraft.type}
              onChange={(e) =>
                setAccountDraft({ ...accountDraft, type: e.target.value })
              }
            >
              <option>Joint brokerage</option>
              <option>Brokerage</option>
              <option>Roth IRA</option>
              <option>Traditional IRA</option>
              <option>401(k)</option>
              <option>HSA</option>
            </select>
          </label>
          <label>
            Ownership
            <select
              value={accountDraft.ownership}
              onChange={(e) =>
                setAccountDraft({ ...accountDraft, ownership: e.target.value })
              }
            >
              <option value="user">User</option>
              <option value="spouse">Spouse</option>
              <option value="joint">Joint</option>
              <option value="other">Other</option>
            </select>
          </label>
          <button
            className={styles.submitHolding}
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving…" : "Add account"}
          </button>
        </form>
      </Drawer>
      <Drawer
        opened={holdingOpen}
        onClose={() => setHoldingOpen(false)}
        position={mobile ? "bottom" : "right"}
        size={mobile ? "auto" : 430}
        title={`Add holding to ${account?.name ?? "account"}`}
        classNames={{
          content: styles.drawer,
          header: styles.drawerHeader,
          body: styles.drawerBody,
          title: styles.drawerTitle,
        }}
      >
        {error && <p className={styles.formError}>{error}</p>}
        <form className={styles.holdingForm} onSubmit={addHolding}>
          <div className={styles.formRow}>
            <label>
              Ticker
              <input
                value={holdingDraft.symbol}
                onChange={(e) =>
                  setHoldingDraft({
                    ...holdingDraft,
                    symbol: e.target.value.toUpperCase(),
                  })
                }
                placeholder="QQQ"
                maxLength={15}
                required
              />
            </label>
            <label>
              Investment name
              <input
                value={holdingDraft.name}
                onChange={(e) =>
                  setHoldingDraft({ ...holdingDraft, name: e.target.value })
                }
                placeholder="Optional"
              />
            </label>
          </div>
          <div className={styles.formRow}>
            <label>
              Shares
              <input
                type="number"
                min="0.000001"
                step="any"
                value={holdingDraft.shares}
                onChange={(e) =>
                  setHoldingDraft({ ...holdingDraft, shares: e.target.value })
                }
                required
              />
            </label>
            <label>
              Purchase price
              <input
                type="number"
                min="0"
                step="0.01"
                value={holdingDraft.price}
                onChange={(e) =>
                  setHoldingDraft({ ...holdingDraft, price: e.target.value })
                }
                required
              />
            </label>
          </div>
          <label>
            Purchase date
            <input
              type="date"
              value={holdingDraft.date}
              onChange={(e) =>
                setHoldingDraft({ ...holdingDraft, date: e.target.value })
              }
              required
            />
          </label>
          <button
            className={styles.submitHolding}
            type="submit"
            disabled={saving}
          >
            {saving ? "Verifying and saving…" : "Add holding"}
          </button>
        </form>
      </Drawer>
      <Drawer
        opened={Boolean(holding)}
        onClose={() => {
          setHolding(null);
          setLotOpen(false);
          setHoldingEdit(false);
          setEditingLotId(null);
        }}
        position={mobile ? "bottom" : "right"}
        size={mobile ? "92%" : 560}
        title={holding ? `${holding.symbol} · ${holding.name}` : "Holding"}
        classNames={{
          content: styles.drawer,
          header: styles.drawerHeader,
          body: styles.drawerBody,
          title: styles.drawerTitle,
        }}
      >
        {holding && (
          <>
            <div className={styles.manageBar}>
              <span>Holding details and purchase lots</span>
              <div>
                <button
                  type="button"
                  onClick={() => setHoldingEdit((open) => !open)}
                >
                  <IconEdit size={15} /> Edit
                </button>
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={() =>
                    setPendingDelete({
                      kind: "holding",
                      id: holding.id,
                      label: holding.symbol,
                    })
                  }
                >
                  <IconTrash size={15} /> Delete
                </button>
              </div>
            </div>
            {holdingEdit && (
              <form className={styles.holdingForm} onSubmit={saveHolding}>
                {error && <p className={styles.formError}>{error}</p>}
                <div className={styles.formRow}>
                  <label>
                    Ticker
                    <input
                      value={holdingEditDraft.symbol}
                      onChange={(event) =>
                        setHoldingEditDraft({
                          ...holdingEditDraft,
                          symbol: event.target.value.toUpperCase(),
                        })
                      }
                      required
                    />
                  </label>
                  <label>
                    Investment name
                    <input
                      value={holdingEditDraft.name}
                      onChange={(event) =>
                        setHoldingEditDraft({
                          ...holdingEditDraft,
                          name: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <button className={styles.submitHolding} disabled={saving}>
                  {saving ? "Saving…" : "Save holding"}
                </button>
              </form>
            )}
            <div className={styles.holdingSummary}>
              <div>
                <span>Position value</span>
                <strong>
                  {displayMarket ? currency.format(positionValue) : "Loading…"}
                </strong>
                <small>
                  {displayMarket?.error ??
                    `${currency.format(positionValue - positionCost)} gain / loss`}
                </small>
              </div>
              <div>
                <span>Shares</span>
                <strong>{sharesFor(holding).toFixed(4)}</strong>
              </div>
              <div>
                <span>Market price</span>
                <strong>{displayMarket ? currency.format(positionPrice) : "—"}</strong>
                <small>{displayMarket?.exchange ?? "Twelve Data"}</small>
              </div>
            </div>
            <div className={styles.rangeBar}>
              {(["1M", "3M", "1Y", "5Y"] as Range[]).map((item) => (
                <button
                  type="button"
                  aria-pressed={range === item}
                  className={range === item ? styles.activeRange : ""}
                  onClick={() => {
                    setMarket(null);
                    setRange(item);
                  }}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className={styles.chart}>
              {displayMarket?.points.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={displayMarket.points}>
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={["dataMin", "dataMax"]} />
                    <Tooltip
                      formatter={(value) => currency.format(Number(value))}
                    />
                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke="var(--chart-primary)"
                      fill="var(--app-accent-soft)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.loading}>
                  {displayMarket?.error ?? "Loading market history…"}
                </div>
              )}
            </div>
            <section className={styles.lots}>
              <div>
                <h3>Purchase history</h3>
                <button
                  type="button"
                  onClick={() => {
                    setEditingLotId(null);
                    setLotDraft({ shares: "", price: "", date: today });
                    setLotOpen((open) => !open);
                  }}
                >
                  <IconPlus size={15} />
                  Add lot
                </button>
              </div>
              {lotOpen && (
                <form className={styles.holdingForm} onSubmit={addLot}>
                  {error && <p className={styles.formError}>{error}</p>}
                  <div className={styles.formRow}>
                    <label>
                      Shares
                      <input
                        type="number"
                        min="0.000001"
                        step="any"
                        value={lotDraft.shares}
                        onChange={(e) =>
                          setLotDraft({ ...lotDraft, shares: e.target.value })
                        }
                        required
                      />
                    </label>
                    <label>
                      Price per share
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={lotDraft.price}
                        onChange={(e) =>
                          setLotDraft({ ...lotDraft, price: e.target.value })
                        }
                        required
                      />
                    </label>
                  </div>
                  <label>
                    Purchase date
                    <input
                      type="date"
                      value={lotDraft.date}
                      onChange={(e) =>
                        setLotDraft({ ...lotDraft, date: e.target.value })
                      }
                      required
                    />
                  </label>
                  <button className={styles.submitHolding} disabled={saving}>
                    {saving
                      ? "Saving…"
                      : editingLotId
                        ? "Update lot"
                        : "Save lot"}
                  </button>
                </form>
              )}
              {holding.lots.map((lot) => (
                <div className={styles.lotRow} key={lot.id}>
                  <span>
                    {new Date(`${lot.date}T12:00:00`).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </span>
                  <span>{lot.shares} shares</span>
                  <strong>{currency.format(lot.price)}</strong>
                  <span className={styles.rowActions}>
                    <button
                      type="button"
                      aria-label={`Edit ${holding.symbol} purchase lot`}
                      onClick={() => {
                        setEditingLotId(lot.id);
                        setLotDraft({
                          shares: String(lot.shares),
                          price: String(lot.price),
                          date: lot.date,
                        });
                        setLotOpen(true);
                      }}
                    >
                      <IconEdit size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${holding.symbol} purchase lot`}
                      onClick={() =>
                        setPendingDelete({
                          kind: "lot",
                          id: lot.id,
                          label: `${lot.shares} shares of ${holding.symbol}`,
                        })
                      }
                    >
                      <IconTrash size={15} />
                    </button>
                  </span>
                </div>
              ))}
            </section>
          </>
        )}
      </Drawer>
      <ConfirmDialog
        opened={Boolean(pendingDelete)}
        title={
          pendingDelete?.kind === "holding"
            ? "Delete holding?"
            : "Delete purchase lot?"
        }
        description={`Delete ${pendingDelete?.label ?? "this record"}? This cannot be undone.`}
        busy={saving}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
