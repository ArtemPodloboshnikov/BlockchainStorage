import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Полное отключение ESLint при сборке
  }
};

export default nextConfig;
