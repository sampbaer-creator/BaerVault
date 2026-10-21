"use client";

import {
  IconBell,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ProfileMenu } from "@/components/ui/ProfileMenu";

import {
  primaryNavigation,
} from "./navigation";
import styles from "./AppShell.module.css";
import { type MonthSelection, withMonth } from "@/lib/helpers/monthSelection";

type PageHeaderProps = {
  title: string;
  pathname: string;
  tab?: string | null;
  selectedMonth?: MonthSelection;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

const searchablePages = primaryNavigation;

export function PageHeader({
  title,
  pathname,
  selectedMonth,
  sidebarCollapsed,
  onToggleSidebar,
}: PageHeaderProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return searchablePages.filter(({ label }) =>
      label.toLowerCase().includes(normalized),
    );
  }, [query]);
  return (
    <>
      <header className={`${styles.desktopHeader} glass-panel`}>
        <div className={styles.headerIdentity}>
          <button
            className={styles.sidebarToggle}
            type="button"
            onClick={onToggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={sidebarCollapsed}
          >
            {sidebarCollapsed ? (
              <IconLayoutSidebarLeftExpand size={17} aria-hidden="true" />
            ) : (
              <IconLayoutSidebarLeftCollapse size={17} aria-hidden="true" />
            )}
          </button>
          <div>
            <h1 className={styles.headerTitle}>{title}</h1>
            <p className={styles.headerSubtitle}>Household finance workspace</p>
          </div>
        </div>
        <div className={styles.headerTools}>
          <div className={styles.searchWrap}>
            <label className={styles.searchControl}>
              <IconSearch size={16} aria-hidden="true" />
              <span className={styles.srOnly}>Search BaerVault pages</span>
              <input
                type="search"
                placeholder="Search pages"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={results.length > 0}
                aria-controls="page-search-results"
              />
            </label>
            {results.length > 0 && (
              <nav
                className={styles.searchResults}
                id="page-search-results"
                aria-label="Matching pages"
                role="listbox"
              >
                {results.map(({ href, label, icon: Icon }) => (
                  <Link role="option" href={selectedMonth ? withMonth(href, selectedMonth) : href} key={href} onClick={() => setQuery("")}>
                    <Icon size={16} aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>
            )}
          </div>
          <Link className={`${styles.periodControl} ${styles.quickAddControl}`} href={selectedMonth ? withMonth("/budget?add=purchase", selectedMonth) : "/budget?add=purchase"} aria-label="Add purchase"><IconPlus size={16} aria-hidden="true" /> Add purchase</Link>
          <button className={styles.iconControl} type="button" disabled aria-label="Notifications (coming soon)" title="Notifications are coming soon"><IconBell size={18} aria-hidden="true" /></button>
          <ProfileMenu />
        </div>
      </header>

      <header className={`${styles.mobileHeader} glass-panel`}>
        <span className={styles.mobileMark}><ProfileMenu /></span>
        <strong className={styles.mobileTitle}>{pathname.replace(/^\/demo/, "") === "/dashboard" ? "BaerVault" : title}</strong>
        <span className={styles.mobileProfile} />
      </header>
    </>
  );
}
