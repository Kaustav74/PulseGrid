/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: { unoptimized: true },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:3001/api/:path*' },
      { source: '/ws', destination: 'http://localhost:3001/ws' }
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false, ws: false };
    return config;
  },
};
module.exports = nextConfig;
