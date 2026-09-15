import { type NextRequest, NextResponse } from "next/server";
import {
  tenantRewritePath,
  resolveTenant,
  requestHost,
} from "@/lib/tenant";
import { updateSession } from "@/utils/supabase/middleware";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
}

/** Paths that must stay on the root app (not tenant-rewritten). */
function isRootSeoOrAssetPath(pathname: string): boolean {
  if (
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/llms.txt"
  ) {
    return true;
  }
  if (
    pathname === "/icon" ||
    pathname.startsWith("/icon/") ||
    pathname === "/apple-icon" ||
    pathname.startsWith("/apple-icon") ||
    pathname.includes("opengraph-image") ||
    pathname.includes("twitter-image")
  ) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const tenant = resolveTenant(requestHost(request.headers));
  const pathname = request.nextUrl.pathname;
  const rewritePath = isRootSeoOrAssetPath(pathname)
    ? null
    : tenantRewritePath(tenant, pathname);

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
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
