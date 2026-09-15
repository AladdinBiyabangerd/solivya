"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { marketingHomeHref } from "@/lib/site";

export type AuthState = {
  error?: string;
  message?: string;
};

/** After auth, return to marketing landing — panel via explicit CTA. */
async function redirectToMarketingHome(): Promise<never> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const isLocal = host.includes("localhost") || host.startsWith("127.0.0.1");

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/marketing", "layout");

  redirect(marketingHomeHref({ isLocal }));
  throw new Error("unreachable");
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

  return redirectToMarketingHome();
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
    return redirectToMarketingHome();
  }

  return {
    message:
      "Qeydiyyat uğurlu oldu. Email təsdiqi açıqdırsa, məktubu yoxla; sonra daxil ol.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/marketing", "layout");

  redirect("/admin/login");
}

export async function updateProfile(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const phone = String(formData.get("phone") ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { error } = await supabase
    .from("owners")
    .update({ phone: phone || null })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/profile");
  return { message: "Profil yeniləndi." };
}
