import { ImageResponse } from "next/og";
import {
  getPublishedPropertyRecord,
  mainPhotoShareUrl,
} from "@/lib/properties";
import { brandCoverAbsoluteUrl, SITE } from "@/lib/site";

export const alt = "Solivya listing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Tenant share card: owner-selected main photo (sort_order 0).
 * Apex marketing keeps /opengraph-image (brand graphic) — no overlap.
 */
export default async function PropertyOpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const record = await getPublishedPropertyRecord(slug);

  const photoUrl =
    (record ? mainPhotoShareUrl(record.photos) : null) ??
    brandCoverAbsoluteUrl();

  const brand =
    record?.property.brand_name?.trim() || SITE.name;
  const titleAz = record?.property.title_az?.trim() || "";
  const titleRu = record?.property.title_ru?.trim() || "";
  const title = titleAz || titleRu || brand;
  const zone = record?.property.zone?.trim() || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#1C1917",
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(28,25,23,0.15) 0%, rgba(28,25,23,0.55) 55%, rgba(28,25,23,0.88) 100%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 64,
            right: 64,
            bottom: 56,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            color: "#F7F3EE",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#D4B896",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {brand}
            {zone ? ` · ${zone}` : ""}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 52,
              lineHeight: 1.12,
              fontWeight: 600,
              maxWidth: 980,
              fontFamily: "Georgia, serif",
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#A8A29E",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {SITE.name.toLowerCase()}.homes
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
