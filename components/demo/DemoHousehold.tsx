import styles from "./DemoHousehold.module.css";

export function DemoHousehold() {
  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <strong>Demo mode</strong>
        <span>Sample members · changes are never saved</span>
      </div>
      <header>
        <h2>Demo household</h2>
        <p>Review who shares your household records.</p>
      </header>
      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>Members</h2>
          <div className={styles.row}>
            <span>Sam</span>
            <strong>Organizer</strong>
          </div>
          <div className={styles.row}>
            <span>Bailey</span>
            <strong>Member</strong>
          </div>
        </section>
        <section className={styles.card}>
          <h2>Sharing</h2>
          <p>
            Both members see the same budgets, income, accounts, and holdings
            in the authenticated application.
          </p>
          <p className={styles.note}>
            This public demo has no real members and never writes to a household.
          </p>
        </section>
      </div>
    </div>
  );
}
