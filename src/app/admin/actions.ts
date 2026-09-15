"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export type AuthState = {
  error?: string;
  message?: string;
};

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email və şifrə lazımdır." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();

  if (!email || !password) {
    return { error: "Email və şifrə lazımdır." };
  }

  if (password.length < 6) {
    return { error: "Şifrə ən az 6 simvol olmalıdır." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: phone ? { phone } : undefined,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Ensure owners row has phone when provided (trigger only sets email).
  if (data.user && phone) {
    await supabase
      .from("owners")
      .update({ phone })
      .eq("id", data.user.id);
  }

  // If email confirmation is disabled, session exists → go to panel.
  if (data.session) {
    redirect("/");
  }

  return {
    message:
      "Qeydiyyat uğurlu oldu. Email təsdiqi açıqdırsa, məktubu yoxla; sonra daxil ol.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
