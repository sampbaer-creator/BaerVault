export type InvestmentLot = { id: string; shares: number; price: number; date: string };
export type Holding = { id: string; symbol: string; name: string; fallbackPrice: number; lots: InvestmentLot[] };
export type InvestmentAccount = { id: string; name: string; institution: string; type: string; owner: string; contributionAmount?: number; holdings: Holding[] };

export const investmentAccounts: InvestmentAccount[] = [
  { id: "fidelity-joint", name: "Fidelity Joint", institution: "Fidelity", type: "Joint brokerage", owner: "Samuel & Bailey", holdings: [
    { id: "aapl", symbol: "AAPL", name: "Apple", fallbackPrice: 225.32, lots: [{ id:"a1", shares:18, price:142.18, date:"2023-03-14" },{ id:"a2", shares:7, price:188.42, date:"2024-06-11" }] },
    { id: "vti", symbol: "VTI", name: "Vanguard Total Stock Market ETF", fallbackPrice: 298.18, lots: [{ id:"v1", shares:42, price:217.36, date:"2022-08-19" }] },
    { id: "msft", symbol: "MSFT", name: "Microsoft", fallbackPrice: 511.44, lots: [{ id:"m1", shares:11, price:312.48, date:"2023-10-02" }] },
  ]},
  { id: "roth-ira", name: "Samuel Roth IRA", institution: "Fidelity", type: "Roth IRA", owner: "Samuel", holdings: [
    { id: "voo", symbol: "VOO", name: "Vanguard S&P 500 ETF", fallbackPrice: 591.16, lots: [{ id:"vo1", shares:18, price:441.2, date:"2023-01-09" }] },
    { id: "schd", symbol: "SCHD", name: "Schwab U.S. Dividend Equity ETF", fallbackPrice: 28.51, lots: [{ id:"s1", shares:74, price:24.84, date:"2024-02-20" }] },
  ]},
];

export const sharesFor = (holding: Holding) => holding.lots.reduce((sum, lot) => sum + lot.shares, 0);
export const costFor = (holding: Holding) => holding.lots.reduce((sum, lot) => sum + lot.shares * lot.price, 0);
export const valueFor = (holding: Holding, price = holding.fallbackPrice) => sharesFor(holding) * price;
