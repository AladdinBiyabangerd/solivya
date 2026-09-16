"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "../../actions";
import styles from "../../admin.module.css";

const initial: AuthState = {};

export function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initial);

  return (
    <form className={styles.form} action={formAction}>
      <label className={styles.label}>
        Yeni şifrə
        <input
          className={styles.input}
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="ən az 6 simvol"
        />
      </label>
      <label className={styles.label}>
        Şifrəni təkrarla
        <input
          className={styles.input}
          type="password"
          name="confirm"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="••••••••"
        />
      </label>
      {state.error ? <p className={styles.error}>{state.error}</p> : null}
      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? "Saxlanılır…" : "Şifrəni yenilə"}
      </button>
    </form>
  );
}
