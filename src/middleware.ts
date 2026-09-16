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
function isRootSeoOrAssetPath(
  pathname: string,
  tenantZone: "marketing" | "admin-legacy" | "site",
): boolean {
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
    pathname.startsWith("/apple-icon")
  ) {
    return true;
  }
  // Apex marketing OG stays at /opengraph-image.
  // Tenant subdomains must rewrite to /site/[slug]/opengraph-image (main photo).
  if (
    pathname.includes("opengraph-image") ||
    pathname.includes("twitter-image")
  ) {
    return tenantZone !== "site";
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
      (request.nextUrl.protocol === "https:" ? "https" : "http");
    const location = `${proto}://${apex}${legacyAdminRedirectPath(pathname)}${request.nextUrl.search}`;
    const isLocalApex =
      apex.startsWith("localhost") || apex.startsWith("127.0.0.1");

    // Next.js middleware relativizes Location for *.localhost → *.localhost,
    // which would loop on app.localhost. Use a document redirect locally.
    if (isLocalApex) {
      const html = `<!DOCTYPE html><html lang="az"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${location}"><title>Redirect</title><script>location.replace(${JSON.stringify(location)})</script></head><body><p><a href="${location}">Davam et</a></p></body></html>`;
      return new NextResponse(html, {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    }

    return new NextResponse(null, {
      status: 308,
      headers: { Location: location },
    });
  }

  const rewritePath = isRootSeoOrAssetPath(pathname, tenant.zone)
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
      homeUrl.pathname = "/admin";
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
