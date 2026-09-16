import { SolivyaLogo } from "@/components/brand/SolivyaLogo";
import { marketingHomeHref } from "@/lib/site";
import { getCurrentUser } from "@/utils/supabase/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const host = (await headers()).get("host") ?? "";
  const isLocal = host.includes("localhost") || host.startsWith("127.0.0.1");
  const landingHref = marketingHomeHref({ isLocal });
  const user = await getCurrentUser();

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
        <h1 className={styles.title}>Şifrəni sıfırla</h1>
        <p className={styles.lead}>
          Emailinə link göndəririk — açandan sonra yeni şifrə seçirsən.
        </p>
        <ForgotPasswordForm defaultEmail={user?.email ?? ""} />
        <p className={styles.switch}>
          {user ? (
            <>
              <Link className={styles.switchLink} href="/admin/profile">
                Profilə qayıt
              </Link>
              {" · "}
              <Link className={styles.switchLink} href="/admin/update-password">
                Birbaşa yeni şifrə
              </Link>
            </>
          ) : (
            <>
              Xatırladın?{" "}
              <Link className={styles.switchLink} href="/admin/login">
                Daxil ol
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
