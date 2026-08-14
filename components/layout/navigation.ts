import {
  IconBuildingCommunity,
  IconBuildingBank,
  IconChartPie,
  IconTargetArrow,
  IconArrowsExchange,
  IconLayoutDashboard,
  IconPigMoney,
  IconSettings,
  IconWallet,
  type Icon,
} from "@tabler/icons-react";

export type NavigationItem = {
  href: string;
  label: string;
  icon: Icon;
};

export const mainNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Overview", icon: IconLayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: IconArrowsExchange },
  { href: "/accounts", label: "Accounts", icon: IconBuildingBank },
  { href: "/budget", label: "Budgets", icon: IconPigMoney },
  { href: "/investments", label: "Investments", icon: IconChartPie },
  { href: "/goals", label: "Goals", icon: IconTargetArrow },
];

export const householdNavigation: NavigationItem[] = [
  { href: "/household", label: "Household", icon: IconBuildingCommunity },
];

export const systemNavigation: NavigationItem[] = [
  { href: "/settings", label: "Settings", icon: IconSettings },
];

export const mobileNavigation: NavigationItem[] = mainNavigation.slice(0, 4);

export const moreNavigation: NavigationItem[] = [
  ...mainNavigation.slice(4),
  ...householdNavigation,
  ...systemNavigation,
];

export const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/transactions": "Transactions",
  "/accounts": "Accounts",
  "/budget": "Budgets",
  "/cash-flow": "Transactions",
  "/investments": "Investments",
  "/goals": "Goals",
  "/household": "Household",
  "/settings": "Settings",
};

export const brandIcon = IconWallet;
