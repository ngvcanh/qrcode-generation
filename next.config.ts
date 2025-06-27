import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  
  // SEO and Performance optimizations
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: [
      'raw.githubusercontent.com',
      'github.com',
      'avatars.githubusercontent.com',
      'user-images.githubusercontent.com',
      'camo.githubusercontent.com'
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Transpile problematic modules
  transpilePackages: ['recharts'],
};

export default nextConfig;
