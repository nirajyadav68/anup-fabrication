/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Admin routes render inside an iframe nowhere in this app, and no
  // third-party site should be able to frame the admin login/dashboard.
];

const nextConfig = {
  images: {
    // Product/service images are currently rendered with `unoptimized`
    // (see components using next/image) so this can stay empty during
    // development. For production, add your Supabase Storage hostname
    // here and drop `unoptimized` from those components to get real
    // Next.js image optimization, e.g.:
    // { protocol: "https", hostname: "xxxxxxx.supabase.co", pathname: "/storage/v1/object/public/**" }
    remotePatterns: [],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Extra assurance: admin/API responses are never cached by a
        // shared cache (CDN, proxy) even if a header is misconfigured
        // upstream, since they can contain per-user data.
        source: "/admin/:path*",
        headers: [
          ...securityHeaders,
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
