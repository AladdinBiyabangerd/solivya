import { type NextRequest, NextResponse } from "next/server";
import { tenantRewritePath, resolveTenant } from "@/lib/tenant";
import { updateSession } from "@/utils/supabase/middleware";

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
      return NextResponse.redirect(loginUrl);
    }

    if (user && isPublicAuth) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      return NextResponse.redirect(homeUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
