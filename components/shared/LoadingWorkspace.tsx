import styles from "./LoadingWorkspace.module.css";

export function LoadingWorkspace() {
  return <section className={styles.loading} role="status" aria-label="Loading household view">
    <p>Loading your view…</p>
    <div className={styles.lead} aria-hidden="true" />
    <div className={styles.details} aria-hidden="true"><div /><div /></div>
  </section>;
}
