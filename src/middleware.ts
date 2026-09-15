import { type NextRequest, NextResponse } from "next/server";
import {
  tenantRewritePath,
  resolveTenant,
  requestHost,
  legacyAdminRedirectPath,
  apexHostFromRequestHost,
  isAdminPath,
  isAdminPublicPath,
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
  const hostHeader = requestHost(request.headers);
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "solivya.homes";
  const tenant = resolveTenant(hostHeader, rootDomain);
  const pathname = request.nextUrl.pathname;

  // Legacy app.* → apex /admin…
  if (tenant.zone === "admin-legacy") {
    const apex = apexHostFromRequestHost(hostHeader, rootDomain);
    const proto =
      request.headers.get("x-forwarded-proto") ??
      request.nextUrl.protocol.replace(":", "") ??
      "https";
    const target = new URL(
      `${proto}://${apex}${legacyAdminRedirectPath(pathname)}`,
    );
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target, 308);
  }

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

  if (isAdminPath(pathname)) {
    if (!user && !isAdminPublicPath(pathname)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.search = "";
      const redirectResponse = NextResponse.redirect(loginUrl);
      copyCookies(response, redirectResponse);
      return redirectResponse;
    }

    if (user && isAdminPublicPath(pathname)) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
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
