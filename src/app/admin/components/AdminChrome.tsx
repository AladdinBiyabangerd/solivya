"use client";

import { SolivyaLogo } from "@/components/brand/SolivyaLogo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import styles from "../admin.module.css";

type Props = {
  landingHref: string;
  children: React.ReactNode;
};

type NavKey = "home" | "profile" | "edit";

function navFromPath(pathname: string): NavKey {
  if (pathname.startsWith("/admin/profile")) return "profile";
  if (pathname.startsWith("/admin/properties/")) return "edit";
  return "home";
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

function TopNav({
  active,
  onNavigate,
  className,
}: {
  active: NavKey;
  onNavigate?: () => void;
  className?: string;
}) {
  const homesActive = active === "home" || active === "edit";

  return (
    <nav className={className ?? styles.appTopNav} aria-label="Panel">
      <Link
        href="/admin"
        className={homesActive ? styles.appTopNavActive : styles.appTopNavLink}
        onClick={onNavigate}
      >
        Mənzillər
      </Link>
      <Link
        href="/admin/profile"
        className={
          active === "profile" ? styles.appTopNavActive : styles.appTopNavLink
        }
        onClick={onNavigate}
      >
        Profil
      </Link>
    </nav>
  );
}

export function AdminChrome({ landingHref, children }: Props) {
  const pathname = usePathname() || "/admin";
  const active = navFromPath(pathname);
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
            <div className={styles.sideBrand}>
              <SolivyaLogo
                size="sm"
                className={styles.topBrand}
                href={landingHref}
              />
              <p className={styles.sideEyebrow} id={titleId}>
                Panel
              </p>
            </div>
            <TopNav
              active={active}
              className={styles.drawerNav}
              onNavigate={() => setOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className={styles.appMain}>
        <header className={styles.appTop}>
          <div className={styles.appTopLeft}>
            <button
              type="button"
              className={styles.menuBtn}
              aria-expanded={open}
              aria-label={open ? "Menyunu bağla" : "Menyunu aç"}
              onClick={() => setOpen((v) => !v)}
            >
              <MenuIcon open={open} />
            </button>
            <SolivyaLogo
              size="sm"
              className={styles.appTopLogo}
              href={landingHref}
            />
          </div>

          <TopNav active={active} />

          <div className={styles.appTopRight}>
            <Link href="/admin/new" className={styles.appTopCta}>
              Yeni
            </Link>
          </div>
        </header>
        <div className={styles.appContent}>{children}</div>
      </div>
    </div>
  );
}
