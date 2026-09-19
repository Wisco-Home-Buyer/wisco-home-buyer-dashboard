import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["react-icons"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tygry8.saikat.com.bd",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "2.24.127.98",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.wiscohomebuyer.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;