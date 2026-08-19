"use client";

import { UserButton } from "@clerk/nextjs";
import {
  IconBell,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconPlus,
  IconSearch,
  IconSettings,
  IconMessage,
} from "@tabler/icons-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { requestShellQuickAdd, type ShellQuickAddAction } from "@/lib/shellQuickAdd";

import {
  householdNavigation,
  mainNavigation,
  systemNavigation,
} from "./navigation";
import styles from "./AppShell.module.css";

type PageHeaderProps = {
  title: string;
  pathname: string;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

const searchablePages = [
  ...mainNavigation,
  ...householdNavigation,
  ...systemNavigation,
];

export function PageHeader({
  title,
  pathname,
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
  const quickAdd = useMemo(() => {
    const actions: Record<string, { action: ShellQuickAddAction; label: string }> = {
      "/budget": { action: "category", label: "Add category" },
      "/goals": { action: "goal", label: "Add goal" },
      "/transactions": { action: "income", label: "Add income" },
    };
    return actions[pathname.replace(/^\/demo/, "")];
  }, [pathname]);

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
              <span className={styles.srOnly}>Search BearVault pages</span>
              <input
                type="search"
                placeholder="Search pages"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-controls="page-search-results"
              />
            </label>
            {results.length > 0 && (
              <nav
                className={styles.searchResults}
                id="page-search-results"
                aria-label="Matching pages"
              >
                {results.map(({ href, label, icon: Icon }) => (
                  <Link href={href} key={href} onClick={() => setQuery("")}>
                    <Icon size={16} aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>
            )}
          </div>
          {quickAdd && (
            <button
              className={`${styles.periodControl} ${styles.quickAddControl}`}
              type="button"
              onClick={() => requestShellQuickAdd(quickAdd.action)}
            >
              <IconPlus size={15} aria-hidden="true" /> {quickAdd.label}
            </button>
          )}
          <button className={styles.iconControl} type="button" disabled aria-label="Notifications (coming soon)" title="Notifications are coming soon"><IconBell size={18} aria-hidden="true" /></button>
          <UserButton />
        </div>
      </header>

      <header className={`${styles.mobileHeader} glass-panel`}>
        <Link className={styles.mobileMark} href="/settings" aria-label="Open settings"><IconSettings size={24} /></Link>
        <strong className={styles.mobileTitle}>BearVault</strong>
        <span className={styles.mobileProfile}><Link className={styles.mobileHousehold} href="/household" aria-label="Open household"><IconMessage size={24}/></Link><UserButton /></span>
      </header>
    </>
  );
}
