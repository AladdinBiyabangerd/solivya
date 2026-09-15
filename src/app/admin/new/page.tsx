import Link from "next/link";
import { AdminShell } from "../AdminShell";
import { CreateForm } from "../PropertyEditor";
import styles from "../admin.module.css";

export default function NewPropertyPage() {
  return (
    <AdminShell active="new">
      <div className={styles.panelWide}>
        <header className={styles.panelHeader}>
          <p className={styles.backLinkWrap}>
            <Link href="/admin" className={styles.backLink}>
              ← Mənzillər
            </Link>
          </p>
          <div className={styles.panelHeaderRow}>
            <div>
              <p className={styles.sectionLabel}>Yeni</p>
              <h1 className={styles.title}>Mənzil yarat</h1>
            </div>
          </div>
          <p className={styles.dashLead}>
            Brend adı və subdomain seçin — sonra qalan detalları tamamlayacaqsınız.
          </p>
        </header>
        <CreateForm />
      </div>
    </AdminShell>
  );
}
