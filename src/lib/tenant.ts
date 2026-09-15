export type TenantZone =
  | { zone: "marketing" }
  | { zone: "admin-legacy" }
  | { zone: "site"; slug: string };

const RESERVED = new Set(["www", "app", "api"]);

/** Prefer proxy host on Vercel; fall back to Host. */
export function requestHost(headers: {
  get(name: string): string | null;
}): string | null {
  const raw = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!raw) return null;
  return raw.split(",")[0]?.trim() || null;
}

/**
 * Resolve host → Solivya zone.
 * Local: localhost | app.localhost (legacy redirect) | {slug}.localhost
 * Prod:  solivya.homes | app.solivya.homes (legacy redirect) | {slug}.solivya.homes
 * Owner admin is path-based: solivya.homes/admin
 * Vercel preview (*.vercel.app) → marketing
 */
export function resolveTenant(
  hostHeader: string | null,
  rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "solivya.homes",
): TenantZone {
  const host = (hostHeader ?? "localhost").split(":")[0].toLowerCase();

  if (host === "localhost" || host === "127.0.0.1") {
    return { zone: "marketing" };
  }

  if (host === "app.localhost") {
    return { zone: "admin-legacy" };
  }

  if (host.endsWith(".localhost")) {
    const slug = host.slice(0, -".localhost".length);
    if (slug && !RESERVED.has(slug) && !slug.includes(".")) {
      return { zone: "site", slug };
    }
    return { zone: "marketing" };
  }

  // Default Vercel URL / previews — no tenant subdomains.
  if (host === "vercel.app" || host.endsWith(".vercel.app")) {
    return { zone: "marketing" };
  }

  if (host === rootDomain || host === `www.${rootDomain}`) {
    return { zone: "marketing" };
  }

  if (host === `app.${rootDomain}`) {
    return { zone: "admin-legacy" };
  }

  const suffix = `.${rootDomain}`;
  if (host.endsWith(suffix)) {
    const slug = host.slice(0, -suffix.length);
    if (slug && !RESERVED.has(slug) && !slug.includes(".")) {
      return { zone: "site", slug };
    }
  }

  return { zone: "marketing" };
}

/** Map legacy app.* paths onto apex /admin… */
export function legacyAdminRedirectPath(pathname: string): string {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return pathname;
  }
  if (pathname === "/" || pathname === "") {
    return "/admin";
  }
  return `/admin${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

/** Apex host for redirects off app.* (preserves local port). */
export function apexHostFromRequestHost(
  hostHeader: string | null,
  rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "solivya.homes",
): string {
  const raw = (hostHeader ?? "localhost").trim();
  const [hostname, port] = raw.split(":");
  const host = hostname.toLowerCase();

  let apex = host;
  if (host === "app.localhost") {
    apex = "localhost";
  } else if (host === `app.${rootDomain}`) {
    apex = rootDomain;
  } else if (host.startsWith("app.")) {
    apex = host.slice("app.".length);
  }

  return port ? `${apex}:${port}` : apex;
}

export function tenantRewritePath(
  tenant: TenantZone,
  pathname: string,
): string | null {
  // Already on an internal app path — do not rewrite again.
  if (
    pathname.startsWith("/marketing") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/site/") ||
    pathname.startsWith("/api/")
  ) {
    return null;
  }

  const rest = pathname === "/" ? "" : pathname;

  switch (tenant.zone) {
    case "marketing":
      return `/marketing${rest || ""}`;
    case "admin-legacy":
      // Middleware redirects before rewrite; never serve from app.* host.
      return null;
    case "site":
      return `/site/${tenant.slug}${rest || ""}`;
  }
}

export function isAdminPublicPath(pathname: string): boolean {
  return (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname === "/admin/signup" ||
    pathname.startsWith("/admin/signup/")
  );
}

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}
