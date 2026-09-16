"use client";

import { useEffect, useState } from "react";
import styles from "../admin.module.css";

type Props = {
  href: string;
  host: string;
};

export function PropertySiteActions({ href, host }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(id);
  }, [copied]);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <span className={styles.propertySiteActions}>
      <button
        type="button"
        className={styles.propertySiteBtn}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void copyUrl();
        }}
        aria-label={`${host} linkini kopyala`}
      >
        {copied ? "Link kopyalandı" : "Linki kopyala"}
      </button>
      <a
        className={styles.propertySiteBtn}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        aria-label={`${host} saytını aç`}
      >
        Saytı aç
      </a>
    </span>
  );
}
