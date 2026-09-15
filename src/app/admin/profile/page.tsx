import { createClient } from "@/utils/supabase/server";
import { AdminShell } from "../AdminShell";
import { ProfileForm } from "./ProfileForm";
import styles from "../admin.module.css";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: ownerRow } = await supabase
    .from("owners")
    .select("phone, created_at")
    .eq("id", user!.id)
    .maybeSingle();

  const phone =
    (ownerRow as { phone?: string | null } | null)?.phone?.trim() ?? "";
  const createdAt = (ownerRow as { created_at?: string } | null)?.created_at;
  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString("az-AZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <AdminShell active="profile">
      <div className={styles.panelWide}>
        <header className={styles.panelHeader}>
          <div className={styles.panelHeaderRow}>
            <div>
              <p className={styles.sectionLabel}>Hesab</p>
              <h1 className={styles.title}>Profil</h1>
            </div>
          </div>
          <p className={styles.dashLead}>
            Əlaqə məlumatlarınızı buradan yeniləyin.
          </p>
          {memberSince ? (
            <p className={styles.emailLine}>Üzv: {memberSince}</p>
          ) : null}
        </header>
        <ProfileForm email={user?.email ?? ""} phone={phone} />
      </div>
    </AdminShell>
  );
}
