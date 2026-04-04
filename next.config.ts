import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typedRoutes: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Pin the workspace root to this directory so Next.js doesn't
  // pick up the parent repo's lockfile and corrupt the build manifest.
  outputFileTracingRoot: path.resolve(__dirname),
};

export default nextConfig;
