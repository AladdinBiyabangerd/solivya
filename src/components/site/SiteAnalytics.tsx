"use client";

import { useEffect } from "react";

type Props = {
  slug: string;
  enabled?: boolean;
};

function postTrack(slug: string, event: "view" | "whatsapp") {
  const body = JSON.stringify({ slug, event });
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon("/api/track", blob)) return;
    }
  } catch {
    /* fall through */
  }
  void fetch("/api/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function SiteAnalytics({ slug, enabled = true }: Props) {
  useEffect(() => {
    if (!enabled || !slug) return;

    const viewKey = `solivya:view:${slug}`;
    try {
      if (sessionStorage.getItem(viewKey)) {
        /* already counted this tab session */
      } else {
        sessionStorage.setItem(viewKey, "1");
        postTrack(slug, "view");
      }
    } catch {
      postTrack(slug, "view");
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[data-track='whatsapp']");
      if (!link) return;
      postTrack(slug, "whatsapp");
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [slug, enabled]);

  return null;
}
