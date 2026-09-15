import { LoginForm } from "./LoginForm";
import styles from "../admin.module.css";

export default function AdminLoginPage() {
  return (
    <main className={styles.shell}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Solivya · admin</p>
        <h1 className={styles.title}>Sahib girişi</h1>
        <p className={styles.lead}>
          Hesabı sən yaradırsan (Supabase Auth). Self-signup yoxdur.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
