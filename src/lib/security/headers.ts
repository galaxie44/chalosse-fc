export const securityHeaders: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "X-DNS-Prefetch-Control": "off",
};

export function applySecurityHeaders(headers: Headers) {
  for (const [key, value] of Object.entries(securityHeaders)) {
    headers.set(key, value);
  }
}
