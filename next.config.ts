import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: "bottom-right",
  },
  // Disable development overlay
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
