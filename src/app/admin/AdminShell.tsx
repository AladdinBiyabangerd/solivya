import Link from "next/link";
import { signOut } from "./actions";
import styles from "./admin.module.css";

export type AdminNav = "home" | "new" | "profile" | "edit";

type Props = {
  active: AdminNav;
  children: React.ReactNode;
};

export function AdminShell({ active, children }: Props) {
  return (
    <main className={styles.shellTop}>
      <header className={styles.topBar}>
        <Link href="/" className={styles.topBrand}>
          Solivya
        </Link>
        <nav className={styles.topNav} aria-label="Admin">
          <Link
            href="/"
            className={
              active === "home" || active === "edit"
                ? styles.topNavActive
                : styles.topNavLink
            }
          >
            Mənzillər
          </Link>
          <Link
            href="/profile"
            className={
              active === "profile" ? styles.topNavActive : styles.topNavLink
            }
          >
            Profil
          </Link>
        </nav>
        <div className={styles.topActions}>
          <Link
            href="/new"
            className={
              active === "new" ? styles.topNavCtaActive : styles.topNavCta
            }
          >
            Yeni
          </Link>
          <form action={signOut}>
            <button className={styles.ghost} type="submit">
              Çıxış
            </button>
          </form>
        </div>
      </header>
      {children}
    </main>
  );
}
