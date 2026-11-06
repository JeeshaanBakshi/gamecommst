import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // No floating "N" badge over the slides during rehearsals.
  devIndicators: false,
  partialPrefetching: true,
  turbopack: {
    // This folder is the project root (ignore any workspace files further up).
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
