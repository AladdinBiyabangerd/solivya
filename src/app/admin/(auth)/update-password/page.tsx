import { SolivyaLogo } from "@/components/brand/SolivyaLogo";
import { marketingHomeHref } from "@/lib/site";
import { getCurrentUser } from "@/utils/supabase/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UpdatePasswordForm } from "./UpdatePasswordForm";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function UpdatePasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/forgot-password");

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
        <h1 className={styles.title}>Yeni şifrə</h1>
        <p className={styles.lead}>
          Yeni şifrəni yaz və təkrarla. Sonra panelə qayıdırsan.
        </p>
        <UpdatePasswordForm />
        <p className={styles.switch}>
          <Link className={styles.switchLink} href="/admin/profile">
            Profilə qayıt
          </Link>
        </p>
      </div>
    </main>
  );
}
