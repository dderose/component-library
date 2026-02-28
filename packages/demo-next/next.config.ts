import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@component-library/core",
    "@component-library/react",
    "@component-library/css",
  ],
};

export default nextConfig;
