"use client";

import { useActionState } from "react";
import { signIn, type AuthState } from "../../actions";
import styles from "../../admin.module.css";

const initial: AuthState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initial);

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
          placeholder="sahib@email.com"
        />
      </label>
      <label className={styles.label}>
        Şifrə
        <input
          className={styles.input}
          type="password"
          name="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </label>
      {state.error ? <p className={styles.error}>{state.error}</p> : null}
      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? "Giriş…" : "Daxil ol"}
      </button>
    </form>
  );
}
