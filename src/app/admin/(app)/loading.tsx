import styles from "../admin.module.css";

export default function AdminLoading() {
  return (
    <div className={styles.panelWide} aria-busy="true" aria-live="polite">
      <div className={styles.routeLoading}>
        <div className={styles.routeLoadingBar} />
        <p className={styles.routeLoadingLabel}>Yüklənir…</p>
        <div className={styles.routeLoadingStack}>
          <span className={styles.routeLoadingBlock} />
          <span className={styles.routeLoadingBlockWide} />
          <span className={styles.routeLoadingBlock} />
        </div>
      </div>
    </div>
  );
}
