import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/server";
import { signOut } from "../../actions";
import { ProfileForm } from "./ProfileForm";
import { ProfilePasswordSection } from "./ProfilePasswordSection";
import styles from "../../admin.module.css";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ password?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const params = await searchParams;
  const passwordUpdated = params.password === "updated";

  const supabase = await createClient();
  const { data: ownerRow } = await supabase
    .from("owners")
    .select("phone, created_at")
    .eq("id", user.id)
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
    <div className={styles.panelWide}>
      <header className={styles.panelHeader}>
        <div className={styles.panelHeaderRow}>
          <div>
            <p className={styles.sectionLabel}>Hesab</p>
            <h1 className={styles.title}>Profil</h1>
          </div>
        </div>
        <p className={styles.dashLead}>
          Telefon, email və şifrəni buradan yeniləyin.
        </p>
        {memberSince ? (
          <p className={styles.emailLine}>Üzv: {memberSince}</p>
        ) : null}
        {passwordUpdated ? (
          <p className={styles.success}>Şifrə yeniləndi.</p>
        ) : null}
      </header>
      <ProfileForm
        email={user.email ?? ""}
        pendingEmail={user.new_email ?? null}
        phone={phone}
      />
      <ProfilePasswordSection email={user.email ?? ""} />
      <form className={styles.profileSignOut} action={signOut}>
        <button className={styles.ghost} type="submit">
          Çıxış
        </button>
      </form>
    </div>
  );
}
