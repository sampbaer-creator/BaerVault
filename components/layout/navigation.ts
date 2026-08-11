import {
  IconBuildingCommunity,
  IconChartPie,
  IconCreditCard,
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
  { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/budget", label: "Budget", icon: IconPigMoney },
  { href: "/transactions", label: "Transactions", icon: IconCreditCard },
  { href: "/investments", label: "Investments", icon: IconChartPie },
];

export const householdNavigation: NavigationItem[] = [
  { href: "/household", label: "Household", icon: IconBuildingCommunity },
];

export const systemNavigation: NavigationItem[] = [
  { href: "/settings", label: "Settings", icon: IconSettings },
];

export const mobileNavigation: NavigationItem[] = mainNavigation;

export const moreNavigation: NavigationItem[] = [
  ...householdNavigation,
  ...systemNavigation,
];

export const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/budget": "Budget",
  "/transactions": "Transactions",
  "/investments": "Investments",
  "/household": "Household",
  "/settings": "Settings",
};

export const brandIcon = IconWallet;
