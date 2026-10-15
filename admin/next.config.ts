import type { NextConfig } from 'next';

const basePath = process.env.BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
  },
  async rewrites() {
    return [{ source: '/uploads/:path*', destination: `${(process.env.STRAPI_URL ?? 'http://127.0.0.1:1337').replace(/\/$/, '')}/uploads/:path*` }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'same-origin' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
};

export default nextConfig;
