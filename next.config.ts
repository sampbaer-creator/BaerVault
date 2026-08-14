import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["@mantine/core", "@tabler/icons-react"],
  },
};

export default nextConfig;
