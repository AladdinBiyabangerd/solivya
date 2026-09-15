/** Gallery / general site tiles (admin thumbs + gallery grid). */
export const SITE_PHOTO_ASPECT = 4 / 3;
/** Hero / main photo framing. */
export const SITE_MAIN_ASPECT = 16 / 9;
export const SITE_PHOTO_MAX_EDGE = 1600;

export type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () =>
      reject(new Error("Şəkil yüklənmədi.")),
    );
    image.src = src;
  });
}

/** Crop to site aspect and downscale for upload. */
export async function cropImageToFile(
  imageSrc: string,
  pixelCrop: PixelCrop,
  fileName: string,
): Promise<File> {
  const image = await loadImage(imageSrc);
  const source = document.createElement("canvas");
  source.width = Math.max(1, Math.round(pixelCrop.width));
  source.height = Math.max(1, Math.round(pixelCrop.height));
  const sourceCtx = source.getContext("2d");
  if (!sourceCtx) throw new Error("Canvas dəstəklənmir.");

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
  if (longest > SITE_PHOTO_MAX_EDGE) {
    const scale = SITE_PHOTO_MAX_EDGE / longest;
    outWidth = Math.round(outWidth * scale);
    outHeight = Math.round(outHeight * scale);
  }

  const output = document.createElement("canvas");
  output.width = outWidth;
  output.height = outHeight;
  const outCtx = output.getContext("2d");
  if (!outCtx) throw new Error("Canvas dəstəklənmir.");
  outCtx.drawImage(source, 0, 0, outWidth, outHeight);

  const blob = await new Promise<Blob>((resolve, reject) => {
    output.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Kəsim hazırlanmadı."));
      },
      "image/jpeg",
      0.9,
    );
  });

  const base = fileName.replace(/\.[^.]+$/, "") || "foto";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}
