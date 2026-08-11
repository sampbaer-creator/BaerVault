type NetWorthPoint = {
  label: string;
  value: number;
};

export const netWorthHistory: Record<"1M" | "3M" | "1Y", NetWorthPoint[]> = {
  "1M": [
    { label: "Jul 12", value: 53536 },
    { label: "Jul 16", value: 53890 },
    { label: "Jul 20", value: 53742 },
    { label: "Jul 24", value: 54260 },
    { label: "Jul 28", value: 54418 },
    { label: "Aug 1", value: 54820 },
  ],
  "3M": [
    { label: "May", value: 50120 },
    { label: "May 15", value: 50940 },
    { label: "Jun", value: 51780 },
    { label: "Jun 15", value: 52610 },
    { label: "Jul", value: 53536 },
    { label: "Aug", value: 54820 },
  ],
  "1Y": [
    { label: "Sep", value: 42160 },
    { label: "Nov", value: 44280 },
    { label: "Jan", value: 46120 },
    { label: "Mar", value: 48740 },
    { label: "May", value: 50120 },
    { label: "Aug", value: 54820 },
  ],
};

export const summaryStats = [
  { label: "Income", value: "$5,400.00", detail: "August" },
  { label: "Spending", value: "$3,210.18", detail: "59% of income" },
  { label: "Budget left", value: "$1,289.82", detail: "9 days remaining" },
  { label: "Investments", value: "$39,420.36", detail: "+$684.20 this month" },
];

export const budgetCategories = [
  { label: "Home", spent: 1420, budget: 1650, color: "navy" },
  { label: "Everyday", spent: 760, budget: 1000, color: "green" },
  { label: "Lifestyle", spent: 530, budget: 850, color: "bronze" },
];

export const investments = [
  { symbol: "VTI", name: "US Total Market", value: "$18,640.20", change: "+1.8%" },
  { symbol: "VXUS", name: "International", value: "$11,280.16", change: "+0.6%" },
  { symbol: "BND", name: "US Bond Market", value: "$9,500.00", change: "−0.2%" },
];

export const recentTransactions = [
  { merchant: "King Soopers", category: "Groceries", date: "Today", amount: "−$86.42" },
  { merchant: "August paycheck", category: "Income", date: "Yesterday", amount: "+$2,700.00" },
  { merchant: "Xcel Energy", category: "Utilities", date: "Aug 8", amount: "−$124.18" },
  { merchant: "Vanguard", category: "Investment", date: "Aug 6", amount: "−$500.00" },
];
