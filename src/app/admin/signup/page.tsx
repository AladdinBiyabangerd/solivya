import Link from "next/link";
import { SignupForm } from "./SignupForm";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default function AdminSignupPage() {
  return (
    <main className={styles.shell}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Solivya · admin</p>
        <h1 className={styles.title}>Hesab yarat</h1>
        <p className={styles.lead}>
          Günlük kirayə sahibləri üçün panelə qeydiyyat.
        </p>
        <SignupForm />
        <p className={styles.switch}>
          Artıq hesabın var?{" "}
          <Link className={styles.switchLink} href="/login">
            Daxil ol
          </Link>
        </p>
      </div>
    </main>
  );
}
