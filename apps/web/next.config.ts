import type { NextConfig } from "next";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";

const currentDir = dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: resolve(currentDir, "../../.env") });

const nextConfig: NextConfig = {
  transpilePackages: [
    "@internal/web",
    "@vitrea/editor",
    "@vitrea/render",
    "@vitrea/cms",
    "@vitrea/database",
  ],
};

export default nextConfig;
