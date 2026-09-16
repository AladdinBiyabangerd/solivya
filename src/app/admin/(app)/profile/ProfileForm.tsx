"use client";

import { useActionState } from "react";
import { updateProfile, type AuthState } from "../../actions";
import styles from "../../admin.module.css";

const empty: AuthState = {};

type Props = {
  email: string;
  /** Pending address while Supabase waits for change confirmation. */
  pendingEmail?: string | null;
  phone: string;
};

export function ProfileForm({ email, pendingEmail, phone }: Props) {
  const [state, action, pending] = useActionState(updateProfile, empty);

  return (
    <form className={styles.createForm} action={action}>
      <label className={styles.label}>
        Email
        <input
          className={styles.input}
          type="email"
          name="email"
          autoComplete="email"
          required
          defaultValue={email}
          placeholder="sahib@email.com"
        />
        <span className={styles.fieldHint}>
          Dəyişəndə yeni ünvana təsdiq məktubu gəlir. Təsdiqdən sonra giriş o
          email ilə olur.
        </span>
        {pendingEmail ? (
          <span className={styles.fieldHint}>
            Təsdiq gözlənilir: <strong>{pendingEmail}</strong>
          </span>
        ) : null}
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
