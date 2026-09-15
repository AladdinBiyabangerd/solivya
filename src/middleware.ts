import { type NextRequest } from "next/server";
import { tenantRewritePath, resolveTenant } from "@/lib/tenant";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const tenant = resolveTenant(request.headers.get("host"));
  const rewritePath = tenantRewritePath(tenant, request.nextUrl.pathname);

  if (!rewritePath) {
    return updateSession(request);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = rewritePath;

  return updateSession(request, rewriteUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
