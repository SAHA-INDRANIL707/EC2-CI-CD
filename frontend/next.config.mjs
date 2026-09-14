/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Base path so Next.js serves all assets under /app1 for Nginx
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "/app1",
  async rewrites() {
    const backendUrl = process.env.INTERNAL_BACKEND_URL || "http://127.0.0.1:3001";
    return [
      {
        source: "/api/py/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/health/py",
        destination: `${backendUrl}/health`,
      }
    ];
  },
};

export default nextConfig;
