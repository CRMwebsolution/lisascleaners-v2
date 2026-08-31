import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fhyzsisluszpfhlngiyb.supabase.co",
      },
    ],
  },
};

export default nextConfig;
