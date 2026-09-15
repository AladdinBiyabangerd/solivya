import type { Database } from "@/types/database";

/** Public URL for a file in the property-photos bucket. */
export function propertyPhotoUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return storagePath;
  return `${base}/storage/v1/object/public/property-photos/${storagePath}`;
}

export type { Database };
