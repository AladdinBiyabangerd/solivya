import { cache } from "react";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./server";

function cookieLooksLikeSession(name: string): boolean {
  return name.includes("-auth-token");
}

/** True when the request likely has a Supabase session cookie. */
export async function hasSessionCookie(): Promise<boolean> {
  const store = await cookies();
  return store.getAll().some((cookie) => cookieLooksLikeSession(cookie.name));
}

/**
 * One auth lookup per request. Skips the Supabase round-trip when there is
 * no session cookie (anonymous marketing / browse / tenant pages).
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!(await hasSessionCookie())) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
