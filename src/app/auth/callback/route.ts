import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/admin/profile";
  }
  return raw;
}

/** Exchange auth email-link code for a session, then return to the app. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id && user.email) {
        await supabase
          .from("owners")
          .update({ email: user.email })
          .eq("id", user.id);
      }

      return NextResponse.redirect(new URL(next, origin));
    }
  }

  const fail = new URL("/admin/login", origin);
  fail.searchParams.set("error", "email_confirm");
  return NextResponse.redirect(fail);
}
