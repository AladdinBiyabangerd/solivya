"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type AuthState = {
  error?: string;
  message?: string;
};

/** Stay on the admin host (app.localhost / app.solivya.homes), not marketing. */
async function redirectToAdminHome(): Promise<never> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");

  if (host) {
    redirect(`${proto}://${host}/`);
  }
  redirect("/");
}

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

  await redirectToAdminHome();
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

  if (data.user && phone) {
    await supabase.from("owners").update({ phone }).eq("id", data.user.id);
  }

  if (data.session) {
    await redirectToAdminHome();
  }

  return {
    message:
      "Qeydiyyat uğurlu oldu. Email təsdiqi açıqdırsa, məktubu yoxla; sonra daxil ol.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");

  if (host) {
    redirect(`${proto}://${host}/login`);
  }
  redirect("/login");
}
