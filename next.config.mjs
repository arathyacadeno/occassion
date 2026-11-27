import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    agentUpgrade: "security",
  },
  serverExternalPackages: ["node:sqlite", "bcryptjs"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  },
  async redirects() {
    return [
      {
        source: "/privacy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/flower",
        destination: "/flower-bouquets",
        permanent: true,
      },
      {
        source: "/our-highlights",
        destination: "/#highlights",
        permanent: true,
      },
      {
        source: "/garlands-and-baskets",
        destination: "/garlands",
        permanent: true,
      },
      {
        source: "/car-decorations",
        destination: "/car-decoration",
        permanent: true,
      },
      {
        source: "/table-arrangements",
        destination: "/table-decor",
        permanent: true,
      },
      {
        source: "/stage-decor",
        destination: "/stage-decoration",
        permanent: true,
      },
      {
        source: "/church-arrangements",
        destination: "/church-decoration",
        permanent: true,
      },
      {
        source: "/gifts",
        destination: "/gift",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
