import marketing from "../marketing.module.css";

export default function BrowseLoading() {
  return (
    <div className={marketing.routeLoading} aria-busy="true" aria-live="polite">
      <div className={marketing.routeLoadingBar} />
      <p className={marketing.routeLoadingLabel}>Yüklənir…</p>
    </div>
  );
}
