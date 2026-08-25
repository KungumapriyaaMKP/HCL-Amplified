import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // An unrelated package.json/package-lock.json at the D:\ drive root was
  // making Next.js infer the wrong workspace root - pin it explicitly.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
