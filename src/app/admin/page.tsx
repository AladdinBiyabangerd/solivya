import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { resolvePhotoSrc } from "@/lib/storage";
import type { Property } from "@/types/database";
import { AdminShell } from "./AdminShell";
import styles from "./admin.module.css";

type PropertyListRow = Property & {
  photos: { storage_path: string; sort_order: number }[] | null;
};

function coverSrc(property: PropertyListRow): string | null {
  const photos = property.photos ?? [];
  if (photos.length === 0) return null;
  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order);
  return resolvePhotoSrc(sorted[0].storage_path);
}

function formatCount(value: number | null | undefined): string {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("az-AZ").format(Math.max(0, Math.floor(n)));
}

export default async function AdminHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("properties")
    .select("*, photos(storage_path, sort_order)")
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: true });

  const properties = (rows as PropertyListRow[] | null) ?? [];

  return (
    <AdminShell active="home">
      <div className={styles.panelWide}>
        <header className={styles.panelHeader}>
          <div className={styles.panelHeaderRow}>
            <div>
              <p className={styles.sectionLabel}>İdarə paneli</p>
              <h1 className={styles.title}>Mənzilləriniz</h1>
            </div>
            <p className={styles.emailLine}>{user?.email ?? ""}</p>
          </div>
          <p className={styles.dashLead}>
            Saytlarınızı buradan açın, redaktə edin və ya yeni mənzil əlavə edin.
          </p>
        </header>

        {properties.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>Hələ mənzil yoxdur</p>
            <p className={styles.emptyText}>
              Birinci saytı yaratmaq üçün brend adı və subdomain seçin.
            </p>
            <Link href="/new" className={styles.submit}>
              Mənzil yarat
            </Link>
          </div>
        ) : (
          <ul className={styles.propertyList}>
            {properties.map((property) => {
              const cover = coverSrc(property);
              const title =
                property.title_az?.trim() ||
                property.brand_name ||
                "Adsız mənzil";
              const views = formatCount(property.view_count);
              const waClicks = formatCount(property.whatsapp_click_count);
              return (
                <li key={property.id}>
                  <Link
                    href={`/properties/${property.id}`}
                    className={styles.propertyRow}
                  >
                    <span className={styles.propertyThumb} aria-hidden>
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover} alt="" />
                      ) : (
                        <span className={styles.propertyThumbEmpty} />
                      )}
                    </span>
                    <span className={styles.propertyMeta}>
                      <span className={styles.propertyBrand}>
                        {property.brand_name || title}
                      </span>
                      <span className={styles.propertySlug}>
                        {property.slug}.solivya.homes
                      </span>
                      {property.zone ? (
                        <span className={styles.propertyZone}>
                          {property.zone}
                        </span>
                      ) : null}
                      <span className={styles.propertyStats}>
                        <span>
                          <span className={styles.propertyStatLabel}>
                            Baxış
                          </span>{" "}
                          {views}
                        </span>
                        <span className={styles.propertyStatSep} aria-hidden>
                          ·
                        </span>
                        <span>
                          <span className={styles.propertyStatLabel}>
                            WhatsApp
                          </span>{" "}
                          {waClicks}
                        </span>
                      </span>
                    </span>
                    <span
                      className={
                        property.published
                          ? styles.badgeLive
                          : styles.badgeDraft
                      }
                    >
                      {property.published ? "Canlı" : "Qaralama"}
                    </span>
                    <span className={styles.propertyAction}>Redaktə</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
