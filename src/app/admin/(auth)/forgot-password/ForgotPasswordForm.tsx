"use client";

import { useActionState } from "react";
import { requestPasswordReset, type AuthState } from "../../actions";
import styles from "../../admin.module.css";

const initial: AuthState = {};

type Props = {
  defaultEmail?: string;
};

export function ForgotPasswordForm({ defaultEmail = "" }: Props) {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initial,
  );

  return (
    <form className={styles.form} action={formAction}>
      <label className={styles.label}>
        Email
        <input
          className={styles.input}
          type="email"
          name="email"
          autoComplete="email"
          required
          defaultValue={defaultEmail}
          placeholder="sahib@email.com"
        />
      </label>
      {state.error ? <p className={styles.error}>{state.error}</p> : null}
      {state.message ? <p className={styles.success}>{state.message}</p> : null}
      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? "Göndərilir…" : "Sıfırlama linki göndər"}
      </button>
    </form>
  );
}
