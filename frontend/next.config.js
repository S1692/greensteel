const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.greensteel\.site/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 24시간
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30일
        },
      },
    },
    {
      urlPattern: /\.(?:js|css)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7일
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix:
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_ASSET_PREFIX || ''
      : '',
  basePath: '',
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,
  images: {
    domains: ['greensteel.site'],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://dapi.kakao.com https://t1.daumcdn.net https://greensteel.site; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: https://www.google-analytics.com https://greensteel.site; connect-src 'self' ${process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://api.greensteel.site'} http://localhost:8080 http://localhost:8083 https://www.google-analytics.com https://analytics.google.com https://dapi.kakao.com https://greensteel.site; font-src 'self' data:; frame-src 'self' https://greensteel.site https://postcode.map.daum.net;`,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      // 모든 API 요청을 Gateway로 라우팅 (우선순위 높음)
      {
        source: '/api/:path*',
        destination:
          'https://gateway-production-da31.up.railway.app/api/:path*',
      },
      // Gateway 직접 접근
      {
        source: '/gateway/:path*',
        destination: 'https://gateway-production-da31.up.railway.app/:path*',
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
