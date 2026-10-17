const apiTarget = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:47191';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Proxy /api calls to the Express backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget.replace(/\/+$/, '')}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
