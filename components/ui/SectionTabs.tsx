import Link from "next/link";
import styles from "./SectionTabs.module.css";

export type SectionTab = { label: string; value: string };

export function SectionTabs({ basePath, active, tabs, year, month }: {
  basePath: string;
  active: string;
  tabs: readonly SectionTab[];
  year?: string | number;
  month?: string | number;
}) {
  return <nav className={styles.tabs} aria-label={`${tabs[0]?.label ?? "Section"} sections`}>
    {tabs.map(({ label, value }) => {
      const query = new URLSearchParams();
      if (value !== tabs[0]?.value) query.set("tab", value);
      if (year !== undefined) query.set("year", String(year));
      if (month !== undefined) query.set("month", String(month));
      const href = `${basePath}${query.size ? `?${query}` : ""}`;
      return <Link key={value} href={href} className={`${styles.tab} ${active === value ? styles.active : ""}`} aria-current={active === value ? "page" : undefined}>{label}</Link>;
    })}
  </nav>;
}
