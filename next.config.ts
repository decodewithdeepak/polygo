import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dynamically set APP_BASE_URL for Vercel deployments
  env: {
    APP_BASE_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.APP_BASE_URL,
  },

  // Allow external profile image hosts for the Next.js <Image> component.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google
      },
      {
        protocol: "https",
        hostname: "s.gravatar.com", // Gravatar
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },

  // Security headers — applied to all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
