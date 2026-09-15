"use client";

import { useActionState } from "react";
import { signUp, type AuthState } from "../actions";
import styles from "../admin.module.css";

const initial: AuthState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, initial);

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
        WhatsApp / telefon
        <input
          className={styles.input}
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="+99450…"
        />
      </label>
      <label className={styles.label}>
        Şifrə
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
      {state.error ? <p className={styles.error}>{state.error}</p> : null}
      {state.message ? <p className={styles.success}>{state.message}</p> : null}
      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? "Yaradılır…" : "Hesab yarat"}
      </button>
    </form>
  );
}
