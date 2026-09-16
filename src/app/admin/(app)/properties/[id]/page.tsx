import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser } from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/server";
import type { Photo, Property } from "@/types/database";
import type { CustomLocation } from "@/lib/azerbaijan-locations";
import { requestHost } from "@/lib/tenant";
import { PropertyEditor } from "../../../components/PropertyEditor";
import styles from "../../../admin.module.css";

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

function propertyLiveHref(slug: string, hostHeader: string | null): string {
  const host = (hostHeader ?? "").toLowerCase();
  const isLocal =
    process.env.NODE_ENV === "development" ||
    host.includes("localhost") ||
    host.startsWith("127.0.0.1");
  if (isLocal) {
    return `http://${slug}.localhost:3000`;
  }
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "solivya.homes";
  return `https://${slug}.${root}`;
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPropertyPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const supabase = await createClient();
  const { data: propertyRow } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  const property = (propertyRow as Property | null) ?? null;
  if (!property) notFound();

  const { data: ownerRow } = await supabase
    .from("owners")
    .select("custom_locations")
    .eq("id", user.id)
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
  const liveHref = propertyLiveHref(property.slug, requestHost(await headers()));

  return (
    <div className={styles.panelWide}>
      <PropertyEditor
        property={property}
        photos={photos}
        email={user?.email ?? ""}
        customLocations={customLocations}
        liveHref={liveHref}
      />
    </div>
  );
}
