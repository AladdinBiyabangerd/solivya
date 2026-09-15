import { SolivyaLogo } from "@/components/brand/SolivyaLogo";
import { marketingHomeHref } from "@/lib/site";
import { headers } from "next/headers";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const host = (await headers()).get("host") ?? "";
  const isLocal = host.includes("localhost") || host.startsWith("127.0.0.1");
  const landingHref = marketingHomeHref({ isLocal });

  return (
    <main className={styles.shell}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>
          <SolivyaLogo size="sm" href={landingHref} />
          <span aria-hidden="true"> · </span>
          admin
        </p>
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
