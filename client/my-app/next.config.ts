import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://resumeai-analyzer-1-oikd.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;