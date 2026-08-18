import {
  IconBuildingCommunity,
  IconBuildingBank,
  IconChartPie,
  IconTargetArrow,
  IconArrowsExchange,
  IconLayoutDashboard,
  IconPigMoney,
  IconSettings,
  IconChartHistogram,
  type Icon,
} from "@tabler/icons-react";

export type NavigationItem = {
  href: string;
  label: string;
  icon: Icon;
};

export const mainNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: IconArrowsExchange },
  { href: "/accounts", label: "Accounts", icon: IconBuildingBank },
  { href: "/budget", label: "Budgets", icon: IconPigMoney },
  { href: "/investments", label: "Investments", icon: IconChartPie },
  { href: "/goals", label: "Goals", icon: IconTargetArrow },
];

export const mobileSectionNavigation: NavigationItem[] = [
  { href: "/cash-flow", label: "Cash flow", icon: IconChartHistogram },
  { href: "/accounts", label: "Accounts", icon: IconBuildingBank },
  { href: "/investments", label: "Investments", icon: IconChartPie },
  { href: "/transactions", label: "Transactions", icon: IconArrowsExchange },
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/budget", label: "Categories", icon: IconPigMoney },
  { href: "/goals", label: "Goals", icon: IconTargetArrow },
];

export const mobileRouteOrder = mobileSectionNavigation.map(({ href }) => href);

export const householdNavigation: NavigationItem[] = [
  { href: "/household", label: "Household", icon: IconBuildingCommunity },
];

export const systemNavigation: NavigationItem[] = [
  { href: "/settings", label: "Settings", icon: IconSettings },
];

export const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/accounts": "Accounts",
  "/budget": "Budgets",
  "/investments": "Investments",
  "/goals": "Goals",
  "/household": "Household",
  "/settings": "Settings",
  "/cash-flow": "Cash flow",
  "/recurring": "Recurring",
};
