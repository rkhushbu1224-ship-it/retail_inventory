/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Proxy /api calls to the Express backend running on port 8081
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:47191/api/:path*',
      },
    ];
  },
};

export default nextConfig;
