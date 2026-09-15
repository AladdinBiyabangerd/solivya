import { createClient } from "@/utils/supabase/server";
import { signOut } from "./actions";
import { PropertyEditor } from "./PropertyEditor";
import styles from "./admin.module.css";
import type { Photo, Property } from "@/types/database";
import type { CustomLocation } from "@/lib/azerbaijan-locations";

function parseCustomLocations(raw: unknown): CustomLocation[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is CustomLocation => {
    if (!item || typeof item !== "object") return false;
    const row = item as Record<string, unknown>;
    return (
      typeof row.id === "string" &&
      typeof row.parentKey === "string" &&
      typeof row.name === "string"
    );
  });
}

export default async function AdminHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: true })
    .limit(1);

  const property = (properties?.[0] as Property | undefined) ?? null;

  const { data: ownerRow } = await supabase
    .from("owners")
    .select("custom_locations")
    .eq("id", user!.id)
    .maybeSingle();

  const customLocations = parseCustomLocations(
    (ownerRow as { custom_locations?: unknown } | null)?.custom_locations,
  );

  let photos: Photo[] = [];
  if (property) {
    const { data } = await supabase
      .from("photos")
      .select("*")
      .eq("property_id", property.id)
      .order("sort_order", { ascending: true });
    photos = (data as Photo[]) ?? [];
  }

  return (
    <main className={styles.shellTop}>
      <div className={styles.topBar}>
        <p className={styles.topBrand}>Solivya</p>
        <div className={styles.topActions}>
          <form action={signOut}>
            <button className={styles.ghost} type="submit">
              Çıxış
            </button>
          </form>
        </div>
      </div>
      <PropertyEditor
        property={property}
        photos={photos}
        email={user?.email ?? ""}
        customLocations={customLocations}
      />
    </main>
  );
}
