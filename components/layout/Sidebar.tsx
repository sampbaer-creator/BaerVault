import { OrganizationSwitcher } from "@clerk/nextjs";
import Link from "next/link";

import {
  householdNavigation,
  mainNavigation,
  systemNavigation,
  type NavigationItem,
} from "./navigation";
import styles from "./AppShell.module.css";
import { BearVaultLogo } from "@/components/brand/BearVaultLogo";
import { type MonthSelection, withMonth } from "@/lib/monthSelection";

type SidebarProps = {
  pathname: string;
  collapsed?: boolean;
  selectedMonth?: MonthSelection;
};

type NavigationSectionProps = {
  label: string;
  items: NavigationItem[];
  pathname: string;
  selectedMonth?: MonthSelection;
};

function NavigationSection({ label, items, pathname, selectedMonth }: NavigationSectionProps) {
  return (
    <section
      className={styles.navSection}
      aria-labelledby={`nav-${label.toLowerCase()}`}
    >
      <p className={styles.navLabel} id={`nav-${label.toLowerCase()}`}>
        {label}
      </p>
      {items.map(({ href, label: itemLabel, icon: Icon }) => {
        const isActive = pathname === href;

        return (
          <Link
            className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
            href={selectedMonth ? withMonth(href, selectedMonth) : href}
            aria-current={isActive ? "page" : undefined}
            key={href}
          >
            <Icon size={19} stroke={1.8} aria-hidden="true" />
            <span>{itemLabel}</span>
          </Link>
        );
      })}
    </section>
  );
}

export function Sidebar({ pathname, collapsed = false, selectedMonth }: SidebarProps) {
  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.sidebarCompact : ""}`}
      aria-label="Primary navigation"
    >
      <div
        className={`${styles.sidebarGlass} liquid-gl-pane glass-panel`}
        aria-hidden="true"
      />
      <div className={styles.brand}>
        <BearVaultLogo compact={collapsed} />
      </div>

      <nav className={styles.sidebarNav}>
        <NavigationSection
          label="Main"
          items={mainNavigation}
          pathname={pathname}
          selectedMonth={selectedMonth}
        />
        <NavigationSection
          label="Household"
          items={householdNavigation}
          pathname={pathname}
          selectedMonth={selectedMonth}
        />
        <NavigationSection
          label="System"
          items={systemNavigation}
          pathname={pathname}
          selectedMonth={selectedMonth}
        />
      </nav>

      <div className={styles.sidebarFooter}>
        <OrganizationSwitcher
          hidePersonal
          afterCreateOrganizationUrl="/dashboard"
          afterSelectOrganizationUrl="/dashboard"
        />
      </div>
    </aside>
  );
}
