"use client";

import { UserButton } from "@clerk/nextjs";
import { IconBuildingCommunity, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { allNavigation } from "./navigation";
import styles from "./AppShell.module.css";
import { NavigationDrawer } from "./NavigationDrawer";
import { type MonthSelection, withMonth } from "@/lib/helpers/monthSelection";

type PageHeaderProps = {
  title: string;
  pathname: string;
  selectedMonth?: MonthSelection;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export function PageHeader({ title, pathname, selectedMonth, sidebarCollapsed, onToggleSidebar }: PageHeaderProps) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? allNavigation.filter(({ label }) => label.toLowerCase().includes(normalized)) : [];
  }, [query]);

  return <>
    <header className={styles.desktopHeader}>
      <div className={styles.headerIdentity}>
        <button className={styles.sidebarToggle} type="button" onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} aria-pressed={sidebarCollapsed}>
          {sidebarCollapsed ? <IconLayoutSidebarLeftExpand size={20} aria-hidden="true" /> : <IconLayoutSidebarLeftCollapse size={20} aria-hidden="true" />}
        </button>
        <h1 className={styles.headerTitle}>{title}</h1>
      </div>
      <div className={styles.headerTools}>
        <div className={styles.searchWrap}
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false); }}
          onKeyDown={(event) => { if (event.key === "Escape") { setQuery(""); setSearchOpen(false); } }}>
          <label className={styles.searchControl}>
            <IconSearch size={18} aria-hidden="true" />
            <span className={styles.srOnly}>Find a page in BearVault</span>
            <input type="search" placeholder="Find a page" value={query}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }}
              aria-controls={searchOpen && query.trim() ? "page-search-results" : undefined} />
          </label>
          {searchOpen && query.trim() && <nav className={styles.searchResults} id="page-search-results" aria-label="Matching pages">
            {results.length ? results.map(({ href, label, icon: Icon }) => <Link
              href={selectedMonth ? withMonth(href, selectedMonth) : href} key={href}
              onClick={() => { setQuery(""); setSearchOpen(false); }}>
              <Icon size={18} aria-hidden="true" /><span>{label}</span>
            </Link>) : <p role="status">No matching pages.</p>}
          </nav>}
        </div>
        <UserButton />
      </div>
    </header>
    <header className={styles.mobileHeader}>
      <NavigationDrawer pathname={pathname} selectedMonth={selectedMonth} />
      <h1 className={styles.mobileTitle}>{title}</h1>
      <Link className={styles.mobileHousehold} href={selectedMonth ? withMonth("/household", selectedMonth) : "/household"} aria-label="Open household">
        <IconBuildingCommunity size={24} aria-hidden="true" />
      </Link>
    </header>
  </>;
}
