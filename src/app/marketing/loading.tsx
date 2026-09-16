import styles from "./marketing.module.css";

export default function MarketingLoading() {
  return (
    <div className={styles.routeLoading} aria-busy="true" aria-live="polite">
      <div className={styles.routeLoadingBar} />
      <p className={styles.routeLoadingLabel}>Yüklənir…</p>
    </div>
  );
}
