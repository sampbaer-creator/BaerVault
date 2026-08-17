import styles from "./DemoHousehold.module.css";

export function DemoHousehold() {
  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <strong>Demo mode</strong>
        <span>Mock data · no sign-in · no database writes</span>
      </div>
      <header>
        <h1>Demo Household</h1>
        <p>See how a shared Clerk household appears in BearVault.</p>
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
            This public demo has no real members and never contacts Clerk or
            Supabase.
          </p>
        </section>
      </div>
    </div>
  );
}
