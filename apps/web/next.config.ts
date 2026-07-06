import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "@scholarship/shared",
    "@scholarship/ui",
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "lucide-react",
  ],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
