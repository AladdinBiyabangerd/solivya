"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { deleteProperty } from "../property-actions";
import styles from "../admin.module.css";

type Props = {
  propertyId: string;
  label: string;
};

export function DeletePropertyButton({ propertyId, label }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pending, startTransition] = useTransition();
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, pending]);

  function close() {
    if (pending) return;
    setOpen(false);
  }

  function confirmDelete() {
    const formData = new FormData();
    formData.set("property_id", propertyId);
    startTransition(() => {
      void deleteProperty(formData).finally(() => {
        setOpen(false);
      });
    });
  }

  const modal =
    open && mounted
      ? createPortal(
          <div
            className={styles.confirmModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
          >
            <button
              type="button"
              className={styles.confirmModalBackdrop}
              aria-label="Bağla"
              disabled={pending}
              onClick={close}
            />
            <div className={styles.confirmModalSheet}>
              <header className={styles.confirmModalHead}>
                <h2 className={styles.confirmModalTitle} id={titleId}>
                  Mənzili sil
                </h2>
              </header>
              <p className={styles.confirmModalBody} id={descId}>
                “{label}” mənzilini silmək istəyirsiniz? Bu əməliyyat geri
                qaytarılmır.
              </p>
              <div className={styles.confirmModalActions}>
                <button
                  type="button"
                  className={styles.confirmModalCancel}
                  disabled={pending}
                  onClick={close}
                >
                  Ləğv et
                </button>
                <button
                  type="button"
                  className={styles.confirmModalDanger}
                  disabled={pending}
                  onClick={confirmDelete}
                >
                  {pending ? "Silinir…" : "Sil"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        className={styles.propertyDeleteBtn}
        disabled={pending}
        aria-label={`${label} mənzilini sil`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        Sil
      </button>
      {modal}
    </>
  );
}
