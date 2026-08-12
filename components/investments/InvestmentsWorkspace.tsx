"use client";

import { Drawer } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconBuildingBank,
  IconChevronRight,
  IconEdit,
  IconPlus,
  IconShieldCheck,
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
type MarketData = {
  price: number;
  points: Array<{ date: string; close: number }>;
  exchange?: string;
  error?: string;
};
const today = new Date().toISOString().slice(0, 10);

export function InvestmentsWorkspace({
  initialAccounts,
}: {
  initialAccounts: InvestmentAccount[];
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
  const account =
    accounts.find((item) => item.id === accountId) ?? accounts[0] ?? null;

  useEffect(() => {
    if (!holding) return;
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
  }, [holding, range]);

  useEffect(() => {
    if (!account?.holdings.length) return;
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
  }, [account, portfolioRange]);

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
          total + valueFor(current, accountMarkets[current.symbol]?.price ?? 0),
        0,
      ),
    0,
  );
  const accountValue =
    account?.holdings.reduce(
      (sum, item) =>
        sum + valueFor(item, accountMarkets[item.symbol]?.price ?? 0),
      0,
    ) ?? 0;
  const accountHistory = useMemo(() => {
    if (!account) return [];
    const histories = account.holdings
      .map((item) => ({
        shares: sharesFor(item),
        points: accountMarkets[item.symbol]?.points ?? [],
      }))
      .filter((item) => item.points.length);
    if (!histories.length) return [];
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
  }, [account, accountMarkets]);

  async function addAccount(event: FormEvent) {
    event.preventDefault();
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

  const positionPrice = market?.price ?? 0;
  const positionCost = holding ? costFor(holding) : 0;
  const positionValue = holding ? valueFor(holding, positionPrice) : 0;
  return (
    <div className={styles.workspace}>
      <header className={styles.intro}>
        <div>
          <p>Protected portfolio</p>
          <h2>Your investment accounts</h2>
          <span>
            Supabase stores what you own. Twelve Data supplies market prices and
            history.
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
      <section className={styles.hero}>
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
      {!accounts.length ? (
        <section className={styles.sheet}>
          <div className={styles.loading}>
            No investment accounts yet. Add your first account to start tracking
            holdings.
          </div>
        </section>
      ) : (
        <>
          <section className={styles.portfolioChartPanel}>
            <div className={styles.portfolioChartHeading}>
              <div>
                <h3>{account?.name} performance</h3>
                <p>Live household position value · Twelve Data</p>
              </div>
              <div className={styles.portfolioRanges} aria-label="Portfolio chart range">
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
          <div className={styles.accountTabs} role="tablist">
            {accounts.map((item) => (
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
                <IconBuildingBank size={17} />
                <span>
                  {item.name}
                  <small>
                    {item.type} · {item.owner}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <section className={styles.sheet}>
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
              <span>Holding</span>
              <span>Shares</span>
              <span>Avg. cost</span>
              <span>Invested</span>
              <span>Current value</span>
              <span>Gain / loss</span>
              <span>Weight</span>
              <span />
            </div>
            {account?.holdings.length ? (
              account.holdings.map((item) => {
                const shares = sharesFor(item);
                const cost = costFor(item);
                const live = accountMarkets[item.symbol]?.price ?? 0;
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
                      <b>{live ? currency.format(value) : "Loading…"}</b>
                      <small>
                        {live
                          ? `${currency.format(live)} / share`
                          : "Market price"}
                      </small>
                    </span>
                    <span
                      className={gain >= 0 ? styles.positive : styles.negative}
                    >
                      <b>{live ? currency.format(gain) : "—"}</b>
                    </span>
                    <span>
                      {accountValue && live
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
        </>
      )}
      <section className={styles.projection}>
        <div>
          <IconShieldCheck size={20} />
          <h3>Household-isolated ownership</h3>
          <p>
            Accounts, holdings, and purchase lots are saved for the active Clerk
            household. Market prices are fetched live and are not stored as
            ownership data.
          </p>
        </div>
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
              autoFocus
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
                autoFocus
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
                  {market ? currency.format(positionValue) : "Loading…"}
                </strong>
                <small>
                  {market?.error ??
                    `${currency.format(positionValue - positionCost)} gain / loss`}
                </small>
              </div>
              <div>
                <span>Shares</span>
                <strong>{sharesFor(holding).toFixed(4)}</strong>
              </div>
              <div>
                <span>Market price</span>
                <strong>{market ? currency.format(positionPrice) : "—"}</strong>
                <small>{market?.exchange ?? "Twelve Data"}</small>
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
              {market?.points.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={market.points}>
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={["dataMin", "dataMax"]} />
                    <Tooltip
                      formatter={(value) => currency.format(Number(value))}
                    />
                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke="#000080"
                      fill="#f2e7c9"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.loading}>
                  {market?.error ?? "Loading market history…"}
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
