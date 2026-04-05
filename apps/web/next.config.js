require('dotenv').config({ path: '../../.env' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@clario/ui', '@clario/shared', '@clario/supabase'],
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'images-porsche.imgix.net' },
    ],
  },
};

module.exports = nextConfig;
