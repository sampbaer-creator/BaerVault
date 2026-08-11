import styles from "@/components/layout/AppShell.module.css";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section aria-labelledby="page-title">
      <div className={styles.pageIntro}>
        <h2 className={styles.pageTitle} id="page-title">
          {title}
        </h2>
        <p className={styles.pageDescription}>{description}</p>
      </div>
      <div className={styles.placeholderSurface} aria-hidden="true" />
    </section>
  );
}
