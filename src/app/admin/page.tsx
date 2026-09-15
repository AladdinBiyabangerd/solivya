import { createClient } from "@/utils/supabase/server";
import { signOut } from "./actions";
import styles from "./admin.module.css";

export default async function AdminHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className={styles.shell}>
      <div className={styles.panel}>
        <p className={styles.eyebrow}>Solivya · admin</p>
        <h1 className={styles.title}>Panel</h1>
        <p className={styles.meta}>
          Daxil olmusan:{" "}
          <span className={styles.code}>{user?.email ?? "—"}</span>
          <br />
          Növbəti addımda burada mənzil redaktəsi olacaq.
        </p>
        <div className={styles.row}>
          <form action={signOut}>
            <button className={styles.ghost} type="submit">
              Çıxış
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
