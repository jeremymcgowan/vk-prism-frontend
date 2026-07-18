import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Authorize your local network IP to receive live developer style updates
  allowedDevOrigins: ['10.0.0.101'],
  
  experimental: {
    // Keep this clean and empty for now
  },
};

export default nextConfig;