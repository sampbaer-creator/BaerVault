import styles from "./loading.module.css";

export default function AppLoading() {
  return (
    <div
      className={styles.loading}
      data-route-loading
      aria-label="Loading household data"
      aria-busy="true"
    >
      <div className={styles.title} />
      <div className={styles.hero} />
      <div className={styles.grid}>
        {[1, 2, 3].map((item) => <div className={styles.card} key={item} />)}
      </div>
    </div>
  );
}
