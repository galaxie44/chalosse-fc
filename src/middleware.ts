import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { applySecurityHeaders } from "@/lib/security/headers";
import { clientKey, rateLimit } from "@/lib/security/rate-limit";

const PUBLIC_PREFIX = [
  "/connexion",
  "/inscription",
  "/auth/callback",
  "/mdp-oublie",
];
const ADMIN_PREFIX = "/admin";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (
    path.startsWith("/connexion") ||
    path.startsWith("/inscription") ||
    path.startsWith("/mdp-oublie")
  ) {
    const limited = rateLimit(clientKey("auth-page", ip), 60, 10 * 60 * 1000);
    if (!limited.ok) {
      return new NextResponse("Trop de requêtes.", {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      });
    }
  }

  const response = await updateSession(request, {
    publicPaths: PUBLIC_PREFIX,
    adminPrefix: ADMIN_PREFIX,
  });
  applySecurityHeaders(response.headers);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
