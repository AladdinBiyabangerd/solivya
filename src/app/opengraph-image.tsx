import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = "Solivya — günlük kirayə səhifəsi · Bakı";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#F7F3EE",
          color: "#1C1917",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 28,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#9A7B4F",
          }}
        >
          {SITE.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.1,
              maxWidth: 900,
              fontWeight: 600,
            }}
          >
            Günlük kirayə üçün öz brendli səhifən
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.35,
              maxWidth: 820,
              color: "#57534E",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Foto, qiymət, qaydalar — WhatsApp. İndilik pulsuz.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: "#57534E",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <span>solivya.homes</span>
          <span style={{ color: "#9A7B4F" }}>Bakı</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
