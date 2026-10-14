import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Foto dikompres di HP sebelum dikirim (±300 KB), batas ini hanya pengaman.
    // Batas Vercel sendiri sekitar 4,5 MB.
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
