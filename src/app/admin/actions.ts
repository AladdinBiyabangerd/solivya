"use server";

import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/supabase/auth";
import { siteUrl } from "@/lib/site";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Request origin for auth email redirects (local vs production). */
async function authEmailRedirectOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const isLocal =
      host.includes("localhost") || host.startsWith("127.0.0.1");
    const proto =
      h.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");
    return `${proto}://${host}`;
  }
  return siteUrl();
}

export type AuthState = {
  error?: string;
  message?: string;
};

/** After auth, open the owner panel on the apex domain. */
async function redirectToAdminHome(): Promise<never> {
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/marketing", "layout");

  redirect("/admin");
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

  return redirectToAdminHome();
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
    return redirectToAdminHome();
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
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }

  const supabase = await createClient();
  const { error: phoneError } = await supabase
    .from("owners")
    .update({ phone: phone || null })
    .eq("id", user.id);

  if (phoneError) {
    return { error: phoneError.message };
  }

  const currentEmail = (user.email ?? "").trim().toLowerCase();
  const emailChanged = Boolean(email) && email !== currentEmail;

  if (emailChanged) {
    if (!EMAIL_RE.test(email)) {
      return { error: "Düzgün email ünvanı daxil et." };
    }

    const origin = await authEmailRedirectOrigin();
    const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/admin/profile")}`;

    const { error: emailError } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo },
    );

    if (emailError) {
      return { error: emailError.message };
    }

    revalidatePath("/admin/profile");
    return {
      message: `Təsdiq məktubu ${email} ünvanına göndərildi. Linkə klik et — təsdiqdən sonra yeni email ilə daxil olursan.`,
    };
  }

  revalidatePath("/admin/profile");
  return { message: "Profil yeniləndi." };
}

/** Send password-reset email (works logged-in or out). */
export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !EMAIL_RE.test(email)) {
    return { error: "Düzgün email ünvanı daxil et." };
  }

  const origin = await authEmailRedirectOrigin();
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/admin/update-password")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  // Avoid leaking whether the address is registered.
  if (error) {
    return { error: "Məktub göndərilmədi. Bir az sonra yenidən yoxla." };
  }

  return {
    message:
      "Əgər bu email qeydiyyatdadırsa, sıfırlama linki göndərildi. Gələn qutunu (və spam) yoxla.",
  };
}

/** Set a new password after recovery link (or while already signed in). */
export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }

  if (password.length < 6) {
    return { error: "Şifrə ən az 6 simvol olmalıdır." };
  }

  if (password !== confirm) {
    return { error: "Şifrələr eyni deyil." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/profile");
  redirect("/admin/profile?password=updated");
}
