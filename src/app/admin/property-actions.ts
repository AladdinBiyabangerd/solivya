"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseAmenityIds } from "@/lib/amenities";
import {
  resolveZoneSelection,
  type CustomLocation,
} from "@/lib/azerbaijan-locations";
import type { LocaleCode } from "@/types/database";
import { MIN_SITE_PHOTOS, MAX_SITE_PHOTOS } from "@/lib/photoLayout";
import { getCurrentUser } from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/server";

export type EditorState = {
  error?: string;
  ok?: string;
};

function parseAmenitiesFromForm(formData: FormData): string[] {
  const fromChecks = formData
    .getAll("amenities")
    .map((v) => String(v).trim())
    .filter(Boolean);
  if (fromChecks.length > 0) {
    return parseAmenityIds(fromChecks);
  }
  // Legacy single textarea (comma-separated ids)
  return parseAmenityIds(
    String(formData.get("amenities") ?? "")
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function parseRules(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  const supabase = await createClient();
  return { supabase, user };
}

/** Create a draft and open the full editor immediately. */
export async function createDraftProperty(): Promise<never> {
  const { supabase, user } = await requireUser();
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const slug = `menzil-${suffix}`;
  const brandName = "Yeni mənzil";

  const { data, error } = await supabase
    .from("properties")
    .insert({
      owner_id: user.id,
      slug,
      brand_name: brandName,
      title_az: brandName,
      title_ru: brandName,
      lead_az: "",
      lead_ru: "",
      zone: "",
      zone_note: "",
      city_id: "",
      rayon_id: "",
      nishangah_id: "",
      lat: null,
      lng: null,
      rooms: 1,
      guests: 2,
      price_night: 0,
      price_note: "gecədən başlayaraq",
      min_nights: 1,
      deposit: 0,
      amenities: [],
      amenities_extra: "",
      rules: [],
      whatsapp_e164: "",
      locale_default: "az",
      published: false,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    redirect("/admin?error=create");
  }

  // Skip revalidatePath: called during /admin/new render (unsupported in Next 16).
  redirect(`/admin/properties/${data.id}`);
}

export async function saveProperty(
  _prev: EditorState,
  formData: FormData,
): Promise<EditorState> {
  const { supabase, user } = await requireUser();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Property id yoxdur." };

  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: "Slug formatı səhvdir." };
  }

  const locale = String(formData.get("locale_default") ?? "az") as LocaleCode;
  const published = formData.get("published") === "on";

  const latRaw = String(formData.get("lat") ?? "").trim();
  const lngRaw = String(formData.get("lng") ?? "").trim();
  let lat: number | null = null;
  let lng: number | null = null;
  if (latRaw || lngRaw) {
    const parsedLat = Number(latRaw);
    const parsedLng = Number(lngRaw);
    if (
      !Number.isFinite(parsedLat) ||
      !Number.isFinite(parsedLng) ||
      parsedLat < -90 ||
      parsedLat > 90 ||
      parsedLng < -180 ||
      parsedLng > 180
    ) {
      return { error: "Xəritə koordinatı səhvdir." };
    }
    lat = parsedLat;
    lng = parsedLng;
  }

  if (published) {
    const { count } = await supabase
      .from("photos")
      .select("*", { count: "exact", head: true })
      .eq("property_id", id);
    if ((count ?? 0) < MIN_SITE_PHOTOS) {
      return {
        error: `Publish üçün ən azı ${MIN_SITE_PHOTOS} foto lazımdır (indi: ${count ?? 0}).`,
      };
    }
  }

  const zone = String(formData.get("zone") ?? "").trim();
  let cityId = String(formData.get("city_id") ?? "").trim();
  let rayonId = String(formData.get("rayon_id") ?? "").trim();
  let nishangahId = String(formData.get("nishangah_id") ?? "").trim();
  if (zone && !cityId) {
    const resolved = resolveZoneSelection(zone);
    if (resolved) {
      cityId = resolved.cityId;
      rayonId = resolved.rayonId;
      nishangahId = resolved.nishangahId;
    }
  }

  const { error } = await supabase
    .from("properties")
    .update({
      slug,
      brand_name: String(formData.get("brand_name") ?? "").trim(),
      title_az: String(formData.get("title_az") ?? "").trim(),
      title_ru: String(formData.get("title_ru") ?? "").trim(),
      lead_az: String(formData.get("lead_az") ?? "").trim(),
      lead_ru: String(formData.get("lead_ru") ?? "").trim(),
      zone,
      zone_note: String(formData.get("zone_note") ?? "").trim(),
      city_id: cityId,
      rayon_id: rayonId,
      nishangah_id: nishangahId,
      lat,
      lng,
      rooms: Number(formData.get("rooms") ?? 1),
      guests: Number(formData.get("guests") ?? 2),
      price_night: Number(formData.get("price_night") ?? 0),
      price_note: String(formData.get("price_note") ?? "").trim(),
      min_nights: Number(formData.get("min_nights") ?? 1),
      deposit: Number(formData.get("deposit") ?? 0),
      amenities: parseAmenitiesFromForm(formData),
      amenities_extra: String(formData.get("amenities_extra") ?? "").trim(),
      rules: parseRules(String(formData.get("rules") ?? "")),
      whatsapp_e164: String(formData.get("whatsapp_e164") ?? "").replace(
        /\D/g,
        "",
      ),
      locale_default: locale === "ru" ? "ru" : "az",
      published,
    })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu slug artıq mövcuddur." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath(`/site/${slug}`);
  return { ok: "Yadda saxlanıldı." };
}

export async function uploadPhoto(
  _prev: EditorState,
  formData: FormData,
): Promise<EditorState> {
  const { supabase, user } = await requireUser();

  const propertyId = String(formData.get("property_id") ?? "");
  const fromMulti = formData
    .getAll("files")
    .filter((item): item is File => item instanceof File && item.size > 0);
  const single = formData.get("file");
  const files =
    fromMulti.length > 0
      ? fromMulti
      : single instanceof File && single.size > 0
        ? [single]
        : [];

  if (!propertyId || files.length === 0) {
    return { error: "Fayl seçilməyib." };
  }

  if (files.length > MAX_SITE_PHOTOS) {
    return { error: `Maksimum ${MAX_SITE_PHOTOS} foto (əsas daxil).` };
  }

  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) {
      return { error: `"${file.name}" 5MB-dan böyükdür.` };
    }
  }

  const { data: property } = await supabase
    .from("properties")
    .select("id, slug")
    .eq("id", propertyId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!property) {
    return { error: "Mənzil tapılmadı." };
  }

  const { count } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("property_id", propertyId);

  const existingCount = count ?? 0;
  if (existingCount + files.length > MAX_SITE_PHOTOS) {
    return {
      error: `Maksimum ${MAX_SITE_PHOTOS} foto (əsas daxil). İndi: ${existingCount}, əlavə: ${files.length}.`,
    };
  }
  const makeFirstMain = formData.get("make_first_main") === "1";
  const originals = formData
    .getAll("originals")
    .filter((item): item is File => item instanceof File && item.size > 0);
  let nextOrder = existingCount;
  let uploaded = 0;
  let mainCandidateId: string | null = null;
  const alt = String(formData.get("alt") ?? "").trim();

  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
      ? ext
      : "jpg";
    const stamp = `${Date.now()}-${uploaded}`;
    const path = `${user.id}/${propertyId}/${stamp}.${safeExt}`;
    const originalFile = originals[uploaded];
    let originalPath: string | null = null;

    if (originalFile && originalFile.size > 0) {
      const oExt = originalFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const oSafe = ["jpg", "jpeg", "png", "webp", "gif"].includes(oExt)
        ? oExt
        : "jpg";
      originalPath = `${user.id}/${propertyId}/originals/${stamp}.${oSafe}`;
      const { error: origError } = await supabase.storage
        .from("property-photos")
        .upload(originalPath, originalFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: originalFile.type || `image/${oSafe}`,
        });
      if (origError) {
        originalPath = null;
      }
    }

    const { error: uploadError } = await supabase.storage
      .from("property-photos")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || `image/${safeExt}`,
      });

    if (uploadError) {
      if (uploaded === 0) return { error: uploadError.message };
      break;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("photos")
      .insert({
        property_id: propertyId,
        storage_path: path,
        original_path: originalPath,
        alt: uploaded === 0 ? alt : "",
        sort_order: nextOrder,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      if (uploaded === 0) {
        return { error: insertError?.message ?? "Foto yazılmadı." };
      }
      break;
    }

    if (uploaded === 0 && makeFirstMain) {
      mainCandidateId = inserted.id;
    }

    nextOrder += 1;
    uploaded += 1;
  }

  if (
    makeFirstMain &&
    mainCandidateId &&
    existingCount > 0
  ) {
    const { data: siblings } = await supabase
      .from("photos")
      .select("id, sort_order")
      .eq("property_id", propertyId)
      .order("sort_order", { ascending: true });

    const target = siblings?.find((row) => row.id === mainCandidateId);
    if (target && target.sort_order !== 0 && siblings) {
      const before = siblings.filter(
        (row) => row.sort_order < target.sort_order,
      );
      await Promise.all(
        before.map((row) =>
          supabase
            .from("photos")
            .update({ sort_order: row.sort_order + 1 })
            .eq("id", row.id),
        ),
      );
      await supabase
        .from("photos")
        .update({ sort_order: 0 })
        .eq("id", mainCandidateId);
    }
  }

  revalidatePath("/admin");
  revalidatePath(`/site/${property.slug}`);

  if (uploaded === 0) {
    return { error: "Foto yüklənmədi." };
  }

  if (makeFirstMain && mainCandidateId) {
    return {
      ok:
        uploaded === 1
          ? "Əsas foto yükləndi."
          : `${uploaded} foto yükləndi · əsas seçildi.`,
    };
  }

  return {
    ok:
      uploaded === 1
        ? "Foto yükləndi."
        : `${uploaded} foto yükləndi. Əsas etmək üçün üzərinə kliklə.`,
  };
}

export async function deletePhoto(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const photoId = String(formData.get("photo_id") ?? "");
  if (!photoId) return;

  const { data: photo } = await supabase
    .from("photos")
    .select("id, storage_path, original_path, property_id")
    .eq("id", photoId)
    .maybeSingle();

  if (!photo) return;

  const { data: property } = await supabase
    .from("properties")
    .select("id, slug, owner_id")
    .eq("id", photo.property_id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!property) return;

  const toRemove: string[] = [];
  if (
    !photo.storage_path.startsWith("http://") &&
    !photo.storage_path.startsWith("https://")
  ) {
    toRemove.push(photo.storage_path);
  }
  if (
    photo.original_path &&
    !photo.original_path.startsWith("http://") &&
    !photo.original_path.startsWith("https://")
  ) {
    toRemove.push(photo.original_path);
  }
  if (toRemove.length) {
    await supabase.storage.from("property-photos").remove(toRemove);
  }

  await supabase.from("photos").delete().eq("id", photoId);

  revalidatePath("/admin");
  revalidatePath(`/site/${property.slug}`);
}

export async function movePhoto(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const photoId = String(formData.get("photo_id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!photoId || (direction !== "up" && direction !== "down")) return;

  const { data: photo } = await supabase
    .from("photos")
    .select("id, sort_order, property_id")
    .eq("id", photoId)
    .maybeSingle();

  if (!photo) return;

  const { data: property } = await supabase
    .from("properties")
    .select("id, slug, owner_id")
    .eq("id", photo.property_id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!property) return;

  const { data: siblings } = await supabase
    .from("photos")
    .select("id, sort_order")
    .eq("property_id", photo.property_id)
    .order("sort_order", { ascending: true });

  if (!siblings?.length) return;

  const index = siblings.findIndex((row) => row.id === photoId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= siblings.length) return;

  const a = siblings[index];
  const b = siblings[swapWith];

  await supabase
    .from("photos")
    .update({ sort_order: b.sort_order })
    .eq("id", a.id);
  await supabase
    .from("photos")
    .update({ sort_order: a.sort_order })
    .eq("id", b.id);

  revalidatePath("/admin");
  revalidatePath(`/site/${property.slug}`);
}

/** Make this photo the hero (sort_order 0). */
async function promotePhotoToMain(
  supabase: Awaited<ReturnType<typeof createClient>>,
  propertyId: string,
  photoId: string,
) {
  const { data: siblings } = await supabase
    .from("photos")
    .select("id, sort_order")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true });

  if (!siblings?.length) return;

  const target = siblings.find((row) => row.id === photoId);
  if (!target || target.sort_order === 0) return;

  const before = siblings.filter((row) => row.sort_order < target.sort_order);
  await Promise.all(
    before.map((row) =>
      supabase
        .from("photos")
        .update({ sort_order: row.sort_order + 1 })
        .eq("id", row.id),
    ),
  );
  await supabase.from("photos").update({ sort_order: 0 }).eq("id", photoId);
}

/** Make this photo the hero (sort_order 0). */
export async function setMainPhoto(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const photoId = String(formData.get("photo_id") ?? "");
  if (!photoId) return;

  const { data: photo } = await supabase
    .from("photos")
    .select("id, sort_order, property_id")
    .eq("id", photoId)
    .maybeSingle();

  if (!photo) return;

  const { data: property } = await supabase
    .from("properties")
    .select("id, slug, owner_id")
    .eq("id", photo.property_id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!property) return;

  await promotePhotoToMain(supabase, photo.property_id, photoId);

  revalidatePath("/admin");
  revalidatePath(`/site/${property.slug}`);
}

/** Re-crop from original (or current). Optionally promote to main. */
export async function replacePhotoCrop(
  _prev: EditorState,
  formData: FormData,
): Promise<EditorState> {
  const { supabase, user } = await requireUser();
  const photoId = String(formData.get("photo_id") ?? "");
  const file = formData.get("file");
  const makeMain = formData.get("make_main") === "1";

  if (!photoId || !(file instanceof File) || file.size === 0) {
    return { error: "Kəsim tapılmadı." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "Maksimum 5MB." };
  }

  const { data: photo } = await supabase
    .from("photos")
    .select("id, storage_path, original_path, property_id, sort_order")
    .eq("id", photoId)
    .maybeSingle();

  if (!photo) return { error: "Foto tapılmadı." };

  const { data: property } = await supabase
    .from("properties")
    .select("id, slug, owner_id")
    .eq("id", photo.property_id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!property) return { error: "Mənzil tapılmadı." };

  const prefix = makeMain ? "main" : "crop";
  const path = `${user.id}/${photo.property_id}/${prefix}-${Date.now()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from("property-photos")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (uploadError) return { error: uploadError.message };

  const oldPath = photo.storage_path;
  const { error: updateError } = await supabase
    .from("photos")
    .update({ storage_path: path })
    .eq("id", photoId);

  if (updateError) return { error: updateError.message };

  if (
    oldPath &&
    oldPath !== path &&
    !oldPath.startsWith("http://") &&
    !oldPath.startsWith("https://")
  ) {
    await supabase.storage.from("property-photos").remove([oldPath]);
  }

  if (makeMain) {
    await promotePhotoToMain(supabase, photo.property_id, photoId);
  }

  revalidatePath("/admin");
  revalidatePath(`/site/${property.slug}`);
  return {
    ok: makeMain ? "Əsas foto kəsilib təyin olundu." : "Foto yenidən kəsildi.",
  };
}

/** @deprecated use replacePhotoCrop with make_main=1 */
export async function setMainPhotoWithCrop(
  prev: EditorState,
  formData: FormData,
): Promise<EditorState> {
  formData.set("make_main", "1");
  return replacePhotoCrop(prev, formData);
}

function parseCustomLocations(raw: unknown): CustomLocation[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is CustomLocation => {
    if (!item || typeof item !== "object") return false;
    const row = item as Record<string, unknown>;
    return (
      typeof row.id === "string" &&
      typeof row.parentKey === "string" &&
      typeof row.name === "string" &&
      row.name.trim().length > 0
    );
  });
}

export async function addOwnerCustomLocation(
  parentKey: string,
  name: string,
): Promise<{ location?: CustomLocation; error?: string }> {
  const { supabase, user } = await requireUser();
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) return { error: "Ad boş ola bilməz." };
  if (trimmed.length > 80) return { error: "Ad çox uzundur (max 80)." };

  const { data: owner, error: readError } = await supabase
    .from("owners")
    .select("custom_locations")
    .eq("id", user.id)
    .maybeSingle();

  if (readError) return { error: readError.message };

  const existing = parseCustomLocations(owner?.custom_locations);
  const parent = String(parentKey ?? "");
  const duplicate = existing.find(
    (c) =>
      c.parentKey === parent &&
      c.name.localeCompare(trimmed, "az", { sensitivity: "base" }) === 0,
  );
  if (duplicate) return { location: duplicate };

  const location: CustomLocation = {
    id: `custom-${crypto.randomUUID()}`,
    parentKey: parent,
    name: trimmed,
  };
  const next = [...existing, location];

  const { error: writeError } = await supabase
    .from("owners")
    .update({ custom_locations: next })
    .eq("id", user.id);

  if (writeError) return { error: writeError.message };

  revalidatePath("/admin");
  return { location };
}

/** Delete a property the current owner owns (photos cascade; storage cleaned). */
export async function deleteProperty(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const propertyId = String(formData.get("property_id") ?? "").trim();
  if (!propertyId) return;

  const { data: property } = await supabase
    .from("properties")
    .select("id, slug, owner_id")
    .eq("id", propertyId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!property) return;

  const { data: photos } = await supabase
    .from("photos")
    .select("storage_path, original_path")
    .eq("property_id", property.id);

  const toRemove: string[] = [];
  for (const photo of photos ?? []) {
    if (
      photo.storage_path &&
      !photo.storage_path.startsWith("http://") &&
      !photo.storage_path.startsWith("https://")
    ) {
      toRemove.push(photo.storage_path);
    }
    if (
      photo.original_path &&
      !photo.original_path.startsWith("http://") &&
      !photo.original_path.startsWith("https://")
    ) {
      toRemove.push(photo.original_path);
    }
  }
  if (toRemove.length) {
    await supabase.storage.from("property-photos").remove(toRemove);
  }

  await supabase.from("properties").delete().eq("id", property.id);

  revalidatePath("/admin");
  revalidatePath(`/site/${property.slug}`);
  revalidatePath("/marketing/browse");
  revalidatePath("/sitemap.xml");
}

