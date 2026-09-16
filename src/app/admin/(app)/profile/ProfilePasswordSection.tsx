"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type AuthState } from "../../actions";
import styles from "../../admin.module.css";

const empty: AuthState = {};

type Props = {
  email: string;
};

/** Logged-in: email a reset link, or open the direct change form. */
export function ProfilePasswordSection({ email }: Props) {
  const [state, action, pending] = useActionState(requestPasswordReset, empty);

  return (
    <section className={styles.profilePassword}>
      <h2 className={styles.profilePasswordTitle}>Şifrə</h2>
      <p className={styles.fieldHint}>
        Birbaşa dəyiş, və ya emailinə sıfırlama linki göndər.
      </p>
      <div className={styles.profilePasswordActions}>
        <Link className={styles.submitSecondary} href="/admin/update-password">
          Yeni şifrə seç
        </Link>
        <form action={action}>
          <input type="hidden" name="email" value={email} />
          <button
            className={styles.ghost}
            type="submit"
            disabled={pending || !email}
          >
            {pending ? "Göndərilir…" : "Email ilə sıfırla"}
          </button>
        </form>
      </div>
      {state.error ? <p className={styles.error}>{state.error}</p> : null}
      {state.message ? <p className={styles.success}>{state.message}</p> : null}
    </section>
  );
}
