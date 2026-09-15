/** Public site gallery grid has 5 slots (1 large + 4 tiles). */
export const GALLERY_SLOTS = 5;

/**
 * Minimum photos for a complete listing page:
 * hero + full gallery grid.
 */
export const MIN_SITE_PHOTOS = GALLERY_SLOTS;

/**
 * Hard cap including the main photo.
 * (1 əsas + ən çox 11 əlavə)
 */
export const MAX_SITE_PHOTOS = 12;

/** Optional map card uses the photo after the gallery slots. */
export const MAP_PHOTO_SLOT = GALLERY_SLOTS;

export function sitePhotoPlan(total: number): {
  gallery: number;
  map: boolean;
  spare: number;
  missing: number;
  overMax: number;
} {
  const gallery = Math.min(total, GALLERY_SLOTS);
  const map = total > GALLERY_SLOTS;
  const spare = Math.max(0, total - GALLERY_SLOTS - (map ? 1 : 0));
  const missing = Math.max(0, MIN_SITE_PHOTOS - total);
  const overMax = Math.max(0, total - MAX_SITE_PHOTOS);
  return { gallery, map, spare, missing, overMax };
}
