"use client";

import { SolivyaLogo } from "@/components/brand/SolivyaLogo";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import type { AdminNav } from "./AdminShell";
import styles from "./admin.module.css";

const TITLES: Record<AdminNav, string> = {
  home: "Mənzillər",
  new: "Yeni mənzil",
  edit: "Redaktə",
  profile: "Profil",
};

type Props = {
  active: AdminNav;
  landingHref: string;
  children: React.ReactNode;
};

function NavIconHome() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
      <path
        d="M4.5 10.5 12 4.5l7.5 6V19a1.5 1.5 0 0 1-1.5 1.5h-4.5v-5.25h-3V20.5H6A1.5 1.5 0 0 1 4.5 19v-8.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavIconPlus() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
      <path
        d="M12 5.5v13M5.5 12h13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NavIconUser() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
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

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden focusable="false">
      <path
        d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden focusable="false">
      <path
        d="M4.5 7.5h15M4.5 12h15M4.5 16.5h15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SideNav({
  active,
  landingHref,
  onNavigate,
}: {
  active: AdminNav;
  landingHref: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className={styles.sideBrand}>
        <SolivyaLogo size="sm" className={styles.topBrand} href={landingHref} />
        <p className={styles.sideEyebrow}>Sahib paneli</p>
      </div>
      <nav className={styles.sideNav} aria-label="Panel">
        <Link
          href="/admin"
          className={
            active === "home" || active === "edit"
              ? styles.sideNavActive
              : styles.sideNavLink
          }
          onClick={onNavigate}
        >
          <NavIconHome />
          Mənzillər
        </Link>
        <Link
          href="/admin/new"
          className={active === "new" ? styles.sideNavActive : styles.sideNavLink}
          onClick={onNavigate}
        >
          <NavIconPlus />
          Yeni mənzil
        </Link>
        <Link
          href="/admin/profile"
          className={
            active === "profile" ? styles.sideNavActive : styles.sideNavLink
          }
          onClick={onNavigate}
        >
          <NavIconUser />
          Profil
        </Link>
      </nav>
      <div className={styles.sideFooter}>
        <a className={styles.sideHomeLink} href={landingHref}>
          ← Sayta qayıt
        </a>
      </div>
    </>
  );
}

export function AdminChrome({ active, landingHref, children }: Props) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const pageTitle = TITLES[active];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar} aria-label="Əsas naviqasiya">
        <SideNav active={active} landingHref={landingHref} />
      </aside>

      {open ? (
        <div className={styles.drawerRoot}>
          <button
            type="button"
            className={styles.drawerScrim}
            aria-label="Menyunu bağla"
            onClick={() => setOpen(false)}
          />
          <aside
            className={styles.drawerPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <SideNav
              active={active}
              landingHref={landingHref}
              onNavigate={() => setOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className={styles.appMain}>
        <header className={styles.appTop}>
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={open}
            aria-controls={undefined}
            aria-label={open ? "Menyunu bağla" : "Menyunu aç"}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon open={open} />
          </button>
          <p className={styles.appTopTitle} id={titleId}>
            {pageTitle}
          </p>
          <Link href="/admin/new" className={styles.appTopCta}>
            Yeni
          </Link>
        </header>
        <div className={styles.appContent}>{children}</div>
      </div>
    </div>
  );
}
