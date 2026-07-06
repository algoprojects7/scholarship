import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@scholarship/shared", "@scholarship/ui"],
};

export default nextConfig;
