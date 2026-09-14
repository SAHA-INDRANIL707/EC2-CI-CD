/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone output optimizes Docker container build sizes
  output: "standalone",
  async rewrites() {
    const backendUrl = process.env.INTERNAL_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
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
