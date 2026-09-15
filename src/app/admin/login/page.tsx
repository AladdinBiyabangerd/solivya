import Link from "next/link";
import { LoginForm } from "./LoginForm";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <main className={styles.shell}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Solivya · admin</p>
        <h1 className={styles.title}>Sahib girişi</h1>
        <p className={styles.lead}>
          Mənzil səhifəni idarə etmək üçün daxil ol.
        </p>
        <LoginForm />
        <p className={styles.switch}>
          Hesabın yoxdur?{" "}
          <Link className={styles.switchLink} href="/signup">
            Qeydiyyat
          </Link>
        </p>
      </div>
    </main>
  );
}
