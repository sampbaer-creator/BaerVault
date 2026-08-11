import { OrganizationSwitcher } from "@clerk/nextjs";
import Link from "next/link";

import {
  brandIcon as BrandIcon,
  householdNavigation,
  mainNavigation,
  systemNavigation,
  type NavigationItem,
} from "./navigation";
import styles from "./AppShell.module.css";

type SidebarProps = {
  pathname: string;
};

type NavigationSectionProps = {
  label: string;
  items: NavigationItem[];
  pathname: string;
};

function NavigationSection({ label, items, pathname }: NavigationSectionProps) {
  return (
    <section className={styles.navSection} aria-labelledby={`nav-${label.toLowerCase()}`}>
      <p className={styles.navLabel} id={`nav-${label.toLowerCase()}`}>
        {label}
      </p>
      {items.map(({ href, label: itemLabel, icon: Icon }) => {
        const isActive = pathname === href;

        return (
          <Link
            className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
            href={href}
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

export function Sidebar({ pathname }: SidebarProps) {
  return (
    <aside className={styles.sidebar} aria-label="Primary navigation">
      <div className={styles.brand}>
        <span className={styles.brandMark} aria-hidden="true">
          <BrandIcon size={20} stroke={1.9} />
        </span>
        BearVault
      </div>

      <nav className={styles.sidebarNav}>
        <NavigationSection label="Main" items={mainNavigation} pathname={pathname} />
        <NavigationSection
          label="Household"
          items={householdNavigation}
          pathname={pathname}
        />
        <NavigationSection label="System" items={systemNavigation} pathname={pathname} />
      </nav>

      <div className={styles.sidebarFooter}>
        <OrganizationSwitcher hidePersonal afterCreateOrganizationUrl="/dashboard" afterSelectOrganizationUrl="/dashboard" />
      </div>
    </aside>
  );
}
