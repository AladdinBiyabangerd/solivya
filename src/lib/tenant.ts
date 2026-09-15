export type TenantZone =
  | { zone: "marketing" }
  | { zone: "admin" }
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
 * Local: localhost | app.localhost | {slug}.localhost
 * Prod:  solivya.homes | app.solivya.homes | {slug}.solivya.homes
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
    return { zone: "admin" };
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
    return { zone: "admin" };
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
    case "admin":
      return `/admin${rest || ""}`;
    case "site":
      return `/site/${tenant.slug}${rest || ""}`;
  }
}
