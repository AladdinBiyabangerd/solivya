import { SolivyaLogo } from "@/components/brand/SolivyaLogo";
import { marketingHomeHref } from "@/lib/site";
import { headers } from "next/headers";
import Link from "next/link";
import styles from "./admin.module.css";

export type AdminNav = "home" | "new" | "profile" | "edit";

type Props = {
  active: AdminNav;
  children: React.ReactNode;
};

function ProfileGlyph() {
  return (
    <svg
      className={styles.profileGlyph}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="8" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.5 18.75c1.35-2.85 3.55-4.25 6.5-4.25s5.15 1.4 6.5 4.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export async function AdminShell({ active, children }: Props) {
  const host = (await headers()).get("host") ?? "";
  const isLocal = host.includes("localhost") || host.startsWith("127.0.0.1");
  const landingHref = marketingHomeHref({ isLocal });

  return (
    <main className={styles.shellTop}>
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <SolivyaLogo size="sm" className={styles.topBrand} href={landingHref} />
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
          </nav>
        </div>
        <div className={styles.topActions}>
          <Link
            href="/new"
            className={
              active === "new" ? styles.topNavCtaActive : styles.topNavCta
            }
          >
            Yeni
          </Link>
          <Link
            href="/profile"
            className={
              active === "profile"
                ? styles.profileIconActive
                : styles.profileIcon
            }
            aria-label="Profil"
            title="Profil"
          >
            <ProfileGlyph />
          </Link>
        </div>
      </header>
      {children}
    </main>
  );
}
