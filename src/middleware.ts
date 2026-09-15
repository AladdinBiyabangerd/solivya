import { type NextRequest, NextResponse } from "next/server";
import { tenantRewritePath, resolveTenant } from "@/lib/tenant";
import { updateSession } from "@/utils/supabase/middleware";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
}

export async function middleware(request: NextRequest) {
  const tenant = resolveTenant(request.headers.get("host"));
  const pathname = request.nextUrl.pathname;
  const rewritePath = tenantRewritePath(tenant, pathname);

  const rewriteUrl = rewritePath
    ? (() => {
        const url = request.nextUrl.clone();
        url.pathname = rewritePath;
        return url;
      })()
    : undefined;

  const { response, user } = await updateSession(request, rewriteUrl);

  if (tenant.zone === "admin") {
    const isPublicAuth =
      pathname === "/login" ||
      pathname.startsWith("/login/") ||
      pathname === "/signup" ||
      pathname.startsWith("/signup/");

    if (!user && !isPublicAuth) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      const redirectResponse = NextResponse.redirect(loginUrl);
      copyCookies(response, redirectResponse);
      return redirectResponse;
    }

    if (user && isPublicAuth) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      const redirectResponse = NextResponse.redirect(homeUrl);
      copyCookies(response, redirectResponse);
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
