import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["node:sqlite", "bcryptjs"],
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
        destination: "/#highlights",
        permanent: true,
      },
      {
        source: "/car-decorations",
        destination: "/#highlights",
        permanent: true,
      },
      {
        source: "/table-arrangements",
        destination: "/#highlights",
        permanent: true,
      },
      {
        source: "/stage-decor",
        destination: "/#highlights",
        permanent: true,
      },
      {
        source: "/church-arrangements",
        destination: "/#highlights",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
