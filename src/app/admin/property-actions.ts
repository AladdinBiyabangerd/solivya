"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Amenity, LocaleCode } from "@/types/database";
import { createClient } from "@/utils/supabase/server";

export type EditorState = {
  error?: string;
  ok?: string;
};

function parseAmenities(raw: string): Amenity[] {
  return raw
    .split(/[\n,]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, subtitle] = line.split("|").map((p) => p.trim());
      return subtitle ? { title, subtitle } : { title };
    });
}

function parseRules(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  return { supabase, user };
}

export async function createProperty(
  _prev: EditorState,
  formData: FormData,
): Promise<EditorState> {
  const { supabase, user } = await requireUser();

  const brandName = String(formData.get("brand_name") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  if (!slug && brandName) slug = slugify(brandName);

  if (!brandName || !slug) {
    return { error: "Brend adı və slug lazımdır." };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: "Slug yalnız kiçik hərf, rəqəm və tire ola bilər." };
  }

  const { error } = await supabase.from("properties").insert({
    owner_id: user.id,
    slug,
    brand_name: brandName,
    title_az: brandName,
    title_ru: brandName,
    lead_az: "",
    lead_ru: "",
    zone: "",
    zone_note: "",
    rooms: 1,
    guests: 2,
    price_night: 0,
    price_note: "gecədən başlayaraq",
    min_nights: 1,
    deposit: 0,
    amenities: [],
    rules: [],
    whatsapp_e164: "",
    locale_default: "az",
    published: false,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Bu slug artıq mövcuddur." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath(`/site/${slug}`);
  return { ok: "Mənzil yaradıldı." };
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

  const { error } = await supabase
    .from("properties")
    .update({
      slug,
      brand_name: String(formData.get("brand_name") ?? "").trim(),
      title_az: String(formData.get("title_az") ?? "").trim(),
      title_ru: String(formData.get("title_ru") ?? "").trim(),
      lead_az: String(formData.get("lead_az") ?? "").trim(),
      lead_ru: String(formData.get("lead_ru") ?? "").trim(),
      zone: String(formData.get("zone") ?? "").trim(),
      zone_note: String(formData.get("zone_note") ?? "").trim(),
      rooms: Number(formData.get("rooms") ?? 1),
      guests: Number(formData.get("guests") ?? 2),
      price_night: Number(formData.get("price_night") ?? 0),
      price_note: String(formData.get("price_note") ?? "").trim(),
      min_nights: Number(formData.get("min_nights") ?? 1),
      deposit: Number(formData.get("deposit") ?? 0),
      amenities: parseAmenities(String(formData.get("amenities") ?? "")),
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

  if (files.length > 12) {
    return { error: "Maksimum 12 foto seçin." };
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
  const makeFirstMain = formData.get("make_first_main") === "1";
  let nextOrder = existingCount;
  let uploaded = 0;
  let mainCandidateId: string | null = null;
  const alt = String(formData.get("alt") ?? "").trim();

  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
      ? ext
      : "jpg";
    const path = `${user.id}/${propertyId}/${Date.now()}-${uploaded}.${safeExt}`;

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
    .select("id, storage_path, property_id")
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

  if (
    !photo.storage_path.startsWith("http://") &&
    !photo.storage_path.startsWith("https://")
  ) {
    await supabase.storage.from("property-photos").remove([photo.storage_path]);
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

  const { data: siblings } = await supabase
    .from("photos")
    .select("id, sort_order")
    .eq("property_id", photo.property_id)
    .order("sort_order", { ascending: true });

  if (!siblings?.length) return;

  const target = siblings.find((row) => row.id === photoId);
  if (!target) return;

  if (target.sort_order === 0) {
    revalidatePath("/admin");
    return;
  }

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

  revalidatePath("/admin");
  revalidatePath(`/site/${property.slug}`);
}
