import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export static files for canister deployment
  output: 'export',
  // Optional: Customize trailing slashes behavior
  trailingSlash: true,
  // Optional: Set base path for correct asset loading
  basePath: '',
  // Disable images optimization since it's not supported in static export
  images: {
    unoptimized: true
  }
};

export default nextConfig;
