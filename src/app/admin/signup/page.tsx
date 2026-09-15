import { SolivyaLogo } from "@/components/brand/SolivyaLogo";
import { marketingHomeHref } from "@/lib/site";
import { headers } from "next/headers";
import Link from "next/link";
import { SignupForm } from "./SignupForm";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminSignupPage() {
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
        <h1 className={styles.title}>Hesab yarat</h1>
        <p className={styles.lead}>
          Günlük kirayə sahibləri üçün panelə qeydiyyat.
        </p>
        <SignupForm />
        <p className={styles.switch}>
          Artıq hesabın var?{" "}
          <Link className={styles.switchLink} href="/admin/login">
            Daxil ol
          </Link>
        </p>
      </div>
    </main>
  );
}
