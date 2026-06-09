import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build "standalone" (.next/standalone con server.js + deps mínimas trazadas)
  // para una imagen Docker chica y autocontenida.
  output: "standalone",
  env: {
    NEXT_CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_CLOUDINARY_UPLOAD_PRESET,
  },
};

export default nextConfig;
