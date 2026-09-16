"use client";

import { useTransition } from "react";
import { deleteProperty } from "../property-actions";
import styles from "../admin.module.css";

type Props = {
  propertyId: string;
  label: string;
};

export function DeletePropertyButton({ propertyId, label }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={styles.propertyDeleteBtn}
      disabled={pending}
      aria-label={`${label} mənzilini sil`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const ok = window.confirm(
          `“${label}” mənzilini silmək istəyirsiniz? Bu əməliyyat geri qaytarılmır.`,
        );
        if (!ok) return;
        const formData = new FormData();
        formData.set("property_id", propertyId);
        startTransition(() => {
          void deleteProperty(formData);
        });
      }}
    >
      {pending ? "Silinir…" : "Sil"}
    </button>
  );
}
