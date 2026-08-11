"use client";

import { Drawer } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconBuildingBank, IconChevronRight, IconPlus, IconShieldCheck, IconTrendingUp } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Cell, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { currency } from "@/lib/finance";
import { costFor, investmentAccounts, sharesFor, valueFor, type Holding, type InvestmentAccount } from "@/lib/investmentData";
import styles from "./InvestmentsWorkspace.module.css";

type Range = "1M" | "3M" | "1Y" | "5Y";
type MarketData = { price: number; points: Array<{ date: string; close: number }>; exchange?: string; error?: string };

const portfolioValue = investmentAccounts.reduce((sum, account) => sum + account.holdings.reduce((total, holding) => total + valueFor(holding), 0), 0);
const portfolioCost = investmentAccounts.reduce((sum, account) => sum + account.holdings.reduce((total, holding) => total + costFor(holding), 0), 0);
const allocationColors = ["#25455d", "#315f50", "#70988a", "#a87546", "#8b947f"];

export function InvestmentsWorkspace() {
  const mobile = useMediaQuery("(max-width: 47.999rem)");
  const [account, setAccount] = useState<InvestmentAccount>(investmentAccounts[0]);
  const [holding, setHolding] = useState<Holding | null>(null);
  const [range, setRange] = useState<Range>("1Y");
  const [market, setMarket] = useState<MarketData | null>(null);
  const [projectionRate, setProjectionRate] = useState(7);
  const [monthly, setMonthly] = useState(500);

  useEffect(() => {
    if (!holding) return;
    const controller = new AbortController();
    fetch(`/api/market-data?symbol=${encodeURIComponent(holding.symbol)}&range=${range}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setMarket(data);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setMarket({ price: holding.fallbackPrice, points: [], error: error.message });
      });
    return () => controller.abort();
  }, [holding, range]);

  const price = market?.price ?? holding?.fallbackPrice ?? 0;
  const positionValue = holding ? valueFor(holding, price) : 0;
  const positionCost = holding ? costFor(holding) : 0;
  const positionGain = positionValue - positionCost;
  const accountValue = account.holdings.reduce((sum, item) => sum + valueFor(item), 0);
  const allocation = account.holdings.map((item) => ({ name: item.symbol, value: valueFor(item) }));
  const projected = useMemo(() => [5, 10, 20].map((years) => {
    const months = years * 12;
    const monthlyRate = projectionRate / 100 / 12;
    const growth = Math.pow(1 + monthlyRate, months);
    const future = monthlyRate === 0 ? portfolioValue + monthly * months : portfolioValue * growth + monthly * (growth - 1) / monthlyRate;
    return { years, value: future };
  }), [projectionRate, monthly]);

  function selectHolding(nextHolding: Holding) {
    setMarket(null);
    setHolding(nextHolding);
  }

  function selectRange(nextRange: Range) {
    setMarket(null);
    setRange(nextRange);
  }

  return <div className={styles.workspace}>
    <header className={styles.intro}>
      <div><p>Protected portfolio</p><h2>Your investment accounts</h2><span>Track ownership, growth, and long-term possibilities in one place.</span></div>
      <button type="button" disabled title="Account editing will be connected with persistence"><IconPlus size={17} />Add account</button>
    </header>

    <section className={styles.hero} aria-labelledby="portfolio-title">
      <div><span id="portfolio-title">Household portfolio</span><strong>{currency.format(portfolioValue)}</strong><p><IconTrendingUp size={15} />+{currency.format(portfolioValue - portfolioCost)} total gain · +{((portfolioValue / portfolioCost - 1) * 100).toFixed(1)}%</p></div>
      <div className={styles.heroRail}><div><span>Total invested</span><strong>{currency.format(portfolioCost)}</strong></div><div><span>Accounts</span><strong>{investmentAccounts.length}</strong></div><div><span>Holdings</span><strong>{investmentAccounts.reduce((count, item) => count + item.holdings.length, 0)}</strong></div></div>
    </section>

    <div className={styles.accountTabs} role="tablist" aria-label="Investment accounts">
      {investmentAccounts.map((item) => <button role="tab" aria-selected={item.id === account.id} className={item.id === account.id ? styles.activeTab : ""} onClick={() => setAccount(item)} key={item.id}><IconBuildingBank size={17} /><span>{item.name}<small>{item.type} · {item.owner}</small></span></button>)}
    </div>

    <div className={styles.accountGrid}>
      <section className={styles.sheet} aria-labelledby="holdings-title">
        <div className={styles.sheetHeading}><div><h3 id="holdings-title">{account.name}</h3><p>{account.institution} · {account.type}</p></div><button type="button" disabled title="Holding editing will be connected with persistence"><IconPlus size={16} />Add holding</button></div>
        <div className={styles.tableHead}><span>Holding</span><span>Shares</span><span>Avg. cost</span><span>Invested</span><span>Current value</span><span>Gain / loss</span><span>Weight</span><span /></div>
        {account.holdings.map((item) => {
          const shares = sharesFor(item); const cost = costFor(item); const value = valueFor(item); const gain = value - cost;
          return <button className={styles.holdingRow} type="button" onClick={() => selectHolding(item)} aria-haspopup="dialog" key={item.id}><span className={styles.identity}><b>{item.symbol}</b><span>{item.name}</span></span><span>{shares.toFixed(2)}</span><span>{currency.format(cost / shares)}</span><span>{currency.format(cost)}</span><span><b>{currency.format(value)}</b><small>{currency.format(item.fallbackPrice)} / share</small></span><span className={gain >= 0 ? styles.positive : styles.negative}><b>{gain >= 0 ? "+" : ""}{currency.format(gain)}</b><small>{gain >= 0 ? "+" : ""}{(gain / cost * 100).toFixed(1)}%</small></span><span>{(value / accountValue * 100).toFixed(1)}%</span><IconChevronRight size={16} /></button>;
        })}
      </section>

      <section className={styles.allocationPanel} aria-labelledby="allocation-title"><div><h3 id="allocation-title">Account allocation</h3><p>{account.name}</p></div><div className={styles.allocationChart} role="img" aria-label={`${account.name} allocation by holding`}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={allocation} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={2} isAnimationActive={false}>{allocation.map((item, index) => <Cell fill={allocationColors[index % allocationColors.length]} key={item.name} />)}</Pie><Tooltip formatter={(value) => currency.format(Number(value))} /></PieChart></ResponsiveContainer></div><div className={styles.allocationLegend}>{allocation.map((item, index) => <div key={item.name}><i style={{ background: allocationColors[index % allocationColors.length] }} /><span>{item.name}</span><strong>{(item.value / accountValue * 100).toFixed(1)}%</strong></div>)}</div></section>
    </div>

    <section className={styles.projection} aria-labelledby="projection-title">
      <div><IconShieldCheck size={20} /><h3 id="projection-title">Long-term scenarios</h3><p>Explore possible account growth using a steady assumed return—not a market prediction.</p></div>
      <div className={styles.assumptions}><label>Annual return<input type="number" min="0" max="15" step="0.5" value={projectionRate} onChange={(event) => setProjectionRate(Number(event.target.value))} /><span>%</span></label><label>Monthly contribution<span>$</span><input type="number" min="0" step="50" value={monthly} onChange={(event) => setMonthly(Number(event.target.value))} /></label></div>
      <div className={styles.outcomes}>{projected.map((item) => <div key={item.years}><span>{item.years} years</span><strong>{currency.format(item.value)}</strong></div>)}</div><small>Illustrative estimate only. Returns are not guaranteed and exclude taxes, fees, and inflation.</small>
    </section>

    <Drawer opened={Boolean(holding)} onClose={() => setHolding(null)} position={mobile ? "bottom" : "right"} size={mobile ? "92%" : 560} radius={mobile ? "18px 18px 0 0" : 0} title={holding ? `${holding.symbol} · ${holding.name}` : "Holding"} classNames={{ content: styles.drawer, header: styles.drawerHeader, body: styles.drawerBody, title: styles.drawerTitle }}>
      {holding && <><div className={styles.holdingSummary}><div><span>Position value</span><strong>{currency.format(positionValue)}</strong><small className={positionGain >= 0 ? styles.positive : styles.negative}>{positionGain >= 0 ? "+" : ""}{currency.format(positionGain)} since purchase</small></div><div><span>Shares</span><strong>{sharesFor(holding).toFixed(2)}</strong></div><div><span>Market price</span><strong>{currency.format(price)}</strong><small>{market?.exchange ?? "Market data"}</small></div></div><div className={styles.rangeBar}>{(["1M", "3M", "1Y", "5Y"] as Range[]).map((item) => <button type="button" aria-pressed={range === item} className={range === item ? styles.activeRange : ""} onClick={() => selectRange(item)} key={item}>{item}</button>)}</div><div className={styles.chart} role="img" aria-label={`${holding.symbol} price history for ${range}`}>{!market ? <div className={styles.loading}>Loading market history…</div> : market.points.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={market.points}><defs><linearGradient id="holdingFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#315f50" stopOpacity={.25} /><stop offset="1" stopColor="#315f50" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e8ecea" strokeDasharray="3 5" /><XAxis dataKey="date" hide /><YAxis domain={["dataMin", "dataMax"]} hide /><Tooltip formatter={(value) => currency.format(Number(value))} /><Area type="monotone" dataKey="close" stroke="#315f50" strokeWidth={2.2} fill="url(#holdingFill)" isAnimationActive={false} /></AreaChart></ResponsiveContainer> : <div className={styles.loading}>{market.error ?? "History unavailable"}</div>}</div><section className={styles.lots}><div><h3>Purchase history</h3><button type="button" disabled title="Lot editing will be connected with persistence"><IconPlus size={15} />Add lot</button></div>{holding.lots.map((lot) => <div key={lot.id}><span>{new Date(`${lot.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span><span>{lot.shares} shares</span><strong>{currency.format(lot.price)}</strong></div>)}</section></>}
    </Drawer>
  </div>;
}
