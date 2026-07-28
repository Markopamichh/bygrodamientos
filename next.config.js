/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Las imágenes se sirven sin pasar por el optimizador de Vercel. La cuota de
    // Image Optimization del plan se agotaba y devolvía HTTP 402, dejando sin
    // cargar las transformaciones no cacheadas. Los assets ya son webp y ~720px
    // (livianos), así que se entregan directo desde el CDN de Supabase.
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        // Supabase Storage
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // CDN de MR Accesorios Industriales (imágenes de productos por encargo)
        protocol: 'https',
        hostname: 'ss-cnt-001c.esmsv.com',
      },
    ],
  },
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  async redirects() {
    return [
      { source: '/admin/deposito', destination: '/admin/stock', permanent: true },
      // Evitar contenido duplicado: el dominio .vercel.app redirige al dominio real
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'bygrodamientos.vercel.app' }],
        destination: 'https://www.bygrodamientos.com.ar/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; base-uri 'self'" },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      // Mismo header para el subdominio admin (cuando llega como /)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'admin.bygrodamientos.com.ar' }],
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
