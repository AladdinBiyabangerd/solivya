import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { Photo, Property } from "@/types/database";
import type { CustomLocation } from "@/lib/azerbaijan-locations";
import { AdminShell } from "../../AdminShell";
import { PropertyEditor } from "../../PropertyEditor";
import styles from "../../admin.module.css";

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

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPropertyPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: propertyRow } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user!.id)
    .maybeSingle();

  const property = (propertyRow as Property | null) ?? null;
  if (!property) notFound();

  const { data: ownerRow } = await supabase
    .from("owners")
    .select("custom_locations")
    .eq("id", user!.id)
    .maybeSingle();

  const customLocations = parseCustomLocations(
    (ownerRow as { custom_locations?: unknown } | null)?.custom_locations,
  );

  const { data: photoRows } = await supabase
    .from("photos")
    .select("*")
    .eq("property_id", property.id)
    .order("sort_order", { ascending: true });

  const photos = (photoRows as Photo[]) ?? [];

  return (
    <AdminShell active="edit">
      <div className={styles.panelWide}>
        <p className={styles.backLinkWrap}>
          <Link href="/admin" className={styles.backLink}>
            ← Mənzillər
          </Link>
        </p>
        <PropertyEditor
          property={property}
          photos={photos}
          email={user?.email ?? ""}
          customLocations={customLocations}
        />
      </div>
    </AdminShell>
  );
}
