export interface SecurityHeaderOptions {
  isDev: boolean;
  isHttps?: boolean;
}

export function buildContentSecurityPolicy(isDev: boolean): string {
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self'";

  const connectSrc = isDev
    ? "connect-src 'self' ws: wss: http: https://api.iconify.design"
    : "connect-src 'self' ws: wss: https://api.iconify.design";

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://db.onlinewebfonts.com https://fonts.gstatic.com",
    connectSrc,
    "frame-src 'self' blob: https://drive.google.com https://docs.google.com",
    "worker-src 'self' blob:",
    "frame-ancestors 'self' https://aistudio.google.com https://*.google.com https://*.googleusercontent.com https://*.usercontent.goog",
  ];

  return directives.join('; ');
}

export function getEssentialSecurityHeaders(
  options: SecurityHeaderOptions
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Security-Policy': buildContentSecurityPolicy(options.isDev),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-DNS-Prefetch-Control': 'off',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=(), usb=()',
  };

  if (!options.isDev && options.isHttps) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  }

  return headers;
}
