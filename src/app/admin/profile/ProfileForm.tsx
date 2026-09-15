"use client";

import { useActionState } from "react";
import { updateProfile, type AuthState } from "../actions";
import styles from "../admin.module.css";

const empty: AuthState = {};

type Props = {
  email: string;
  phone: string;
};

export function ProfileForm({ email, phone }: Props) {
  const [state, action, pending] = useActionState(updateProfile, empty);

  return (
    <form className={styles.createForm} action={action}>
      <label className={styles.label}>
        Email
        <input
          className={styles.input}
          type="email"
          value={email}
          disabled
          readOnly
        />
        <span className={styles.fieldHint}>Giriş üçün istifadə olunur</span>
      </label>
      <label className={styles.label}>
        Telefon
        <input
          className={styles.input}
          name="phone"
          type="tel"
          defaultValue={phone}
          placeholder="+994 XX XXX XX XX"
        />
      </label>
      {state.error ? <p className={styles.error}>{state.error}</p> : null}
      {state.message ? <p className={styles.success}>{state.message}</p> : null}
      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? "Saxlanılır…" : "Yadda saxla"}
      </button>
    </form>
  );
}
