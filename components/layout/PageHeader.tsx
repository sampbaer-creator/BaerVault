"use client";

import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconPlus,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRef, useState } from "react";

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

const searchablePages = [
  ...primaryNavigation,
  { href: "/settings", label: "Settings", icon: IconSettings },
];

export function PageHeader({
  title,
  pathname,
  selectedMonth,
  sidebarCollapsed,
  onToggleSidebar,
}: PageHeaderProps) {
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const normalized = query.trim().toLowerCase();
  const results = searchablePages.filter(({ label }) => label.toLowerCase().includes(normalized));
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
          </div>
        </div>
        <div className={styles.headerTools}>
          <div
            className={styles.searchWrap}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setQuery("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape" && query) {
                event.preventDefault();
                setQuery("");
                searchInput.current?.focus();
              }
            }}
          >
            <label className={styles.searchControl}>
              <IconSearch size={16} aria-hidden="true" />
              <span className={styles.srOnly}>Search BaerVault pages</span>
              <input
                ref={searchInput}
                type="search"
                placeholder="Search pages"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            {normalized && (
              <nav
                className={styles.searchResults}
                aria-label="Matching pages"
              >
                {results.length === 0 && <p className={styles.searchEmpty} role="status">No matching pages</p>}
                {results.map(({ href, label, icon: Icon }) => (
                  <Link href={selectedMonth ? withMonth(href, selectedMonth) : href} key={href} onClick={() => setQuery("")}>
                    <Icon size={16} aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>
            )}
          </div>
          <Link className={`${styles.periodControl} ${styles.quickAddControl}`} href={selectedMonth ? withMonth("/budget?add=purchase", selectedMonth) : "/budget?add=purchase"} aria-label="Add purchase"><IconPlus size={16} aria-hidden="true" /> Add purchase</Link>
          <ProfileMenu />
        </div>
      </header>

      <header className={`${styles.mobileHeader} glass-panel`}>
        <span className={styles.mobileMark}><ProfileMenu /></span>
        <h1 className={styles.mobileTitle}>{pathname === "/dashboard" ? "BaerVault" : title}</h1>
        <span className={styles.mobileProfile} />
      </header>
    </>
  );
}
