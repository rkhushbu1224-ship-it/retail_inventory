/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    // If an external backend is explicitly provided, rewrite /api calls to it.
    // Otherwise, let Next.js internal API route handlers (/src/app/api/...) handle requests directly on Vercel and locally.
    if (process.env.API_URL && /^https?:\/\//i.test(process.env.API_URL)) {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.API_URL.replace(/\/+$/, '')}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
