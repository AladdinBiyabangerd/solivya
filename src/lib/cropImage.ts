/** Gallery / general site tiles (admin thumbs + gallery grid). */
export const SITE_PHOTO_ASPECT = 4 / 3;
/** Hero / main photo framing. */
export const SITE_MAIN_ASPECT = 16 / 9;
/** Longest edge for gallery tiles. */
export const SITE_PHOTO_MAX_EDGE = 2000;
/** Longest edge for hero / main — needs to cover wide viewports. */
export const SITE_MAIN_MAX_EDGE = 2560;
/** Warn in admin when the source is too small for a sharp hero. */
export const SITE_PHOTO_MIN_WARN_EDGE = 1200;

export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (!src.startsWith("blob:") && !src.startsWith("data:")) {
      image.crossOrigin = "anonymous";
    }
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () =>
      reject(new Error("Şəkil yüklənmədi.")),
    );
    image.src = src;
  });
}

export type CropToFileOptions = {
  /** Cap longest output edge (default: gallery max). */
  maxEdge?: number;
  /** JPEG quality 0–1 (default 0.92). */
  quality?: number;
};

/** Crop to site aspect and downscale for upload (never upscales). */
export async function cropImageToFile(
  imageSrc: string,
  pixelCrop: PixelCrop,
  fileName: string,
  options: CropToFileOptions = {},
): Promise<File> {
  const maxEdge = options.maxEdge ?? SITE_PHOTO_MAX_EDGE;
  const quality = options.quality ?? 0.92;
  const image = await loadImage(imageSrc);
  const source = document.createElement("canvas");
  source.width = Math.max(1, Math.round(pixelCrop.width));
  source.height = Math.max(1, Math.round(pixelCrop.height));
  const sourceCtx = source.getContext("2d");
  if (!sourceCtx) throw new Error("Canvas dəstəklənmir.");

  sourceCtx.imageSmoothingEnabled = true;
  sourceCtx.imageSmoothingQuality = "high";
  sourceCtx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    source.width,
    source.height,
  );

  let outWidth = source.width;
  let outHeight = source.height;
  const longest = Math.max(outWidth, outHeight);
  if (longest > maxEdge) {
    const scale = maxEdge / longest;
    outWidth = Math.round(outWidth * scale);
    outHeight = Math.round(outHeight * scale);
  }

  const output = document.createElement("canvas");
  output.width = outWidth;
  output.height = outHeight;
  const outCtx = output.getContext("2d");
  if (!outCtx) throw new Error("Canvas dəstəklənmir.");
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = "high";
  outCtx.drawImage(source, 0, 0, outWidth, outHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    output.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Kəsim hazırlanmadı."));
      },
      "image/jpeg",
      quality,
    );
  });

  const base = fileName.replace(/\.[^.]+$/, "") || "foto";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}
