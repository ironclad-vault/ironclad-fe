import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export static files for canister deployment
  output: "standalone",
  trailingSlash: true,
  basePath: "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
