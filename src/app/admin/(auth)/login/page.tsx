import { SolivyaLogo } from "@/components/brand/SolivyaLogo";
import { marketingHomeHref } from "@/lib/site";
import { headers } from "next/headers";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const host = (await headers()).get("host") ?? "";
  const isLocal = host.includes("localhost") || host.startsWith("127.0.0.1");
  const landingHref = marketingHomeHref({ isLocal });

  return (
    <main className={styles.shell}>
      <div className={styles.card}>
        <a className={styles.authBack} href={landingHref}>
          ← Solivya
        </a>
        <p className={styles.eyebrow}>
          <SolivyaLogo size="sm" href={landingHref} />
          <span aria-hidden="true"> · </span>
          Sahib paneli
        </p>
        <h1 className={styles.title}>Daxil ol</h1>
        <p className={styles.lead}>
          Hesabına gir — sonra ana səhifədən panelə keçə bilərsən.
        </p>
        <LoginForm />
        <p className={styles.switch}>
          Hesabın yoxdur?{" "}
          <Link className={styles.switchLink} href="/admin/signup">
            Qeydiyyat
          </Link>
        </p>
      </div>
    </main>
  );
}
