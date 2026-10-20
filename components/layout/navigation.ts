import {
  IconBuildingCommunity,
  IconBuildingBank,
  IconArrowsExchange,
  IconHome,
  IconPigMoney,
  type Icon,
} from "@tabler/icons-react";

export type NavigationItem = {
  href: string;
  label: string;
  icon: Icon;
};

export const primaryNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Home", icon: IconHome },
  { href: "/transactions", label: "Transactions", icon: IconArrowsExchange },
  { href: "/budget", label: "Budget", icon: IconPigMoney },
  { href: "/accounts", label: "Accounts", icon: IconBuildingBank },
  { href: "/household", label: "Household", icon: IconBuildingCommunity },
];

export const mobileRouteOrder = primaryNavigation.filter(({ href }) => href !== "/household").map(({ href }) => href);

export const pageTitles: Record<string, string> = {
  "/dashboard": "Home",
  "/transactions": "Transactions",
  "/accounts": "Accounts",
  "/budget": "Budget",
  "/investments": "Investments",
  "/goals": "Goals",
  "/household": "Household",
  "/settings": "Settings",
  "/cash-flow": "Cash flow",
  "/recurring": "Recurring",
};
