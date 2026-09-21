import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // The default .next directory got corrupted — pages-manifest.json pointed at
  // _app/_document/_error files that were never written, so every route 500'd
  // with an opaque ENOENT. Dev builds into its own directory to sidestep it.
  // Production builds are untouched and still use .next.
  ...(isDev ? { distDir: ".next-dev" } : {}),
};

export default nextConfig;

if (isDev) {
  void import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) =>
    initOpenNextCloudflareForDev(),
  );
}
