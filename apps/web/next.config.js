const path = require('path');
const dotenv = require('dotenv');

const env = dotenv.config({ path: path.resolve(__dirname, '../../.env') }).parsed || {};

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'images-porsche.imgix.net' },
    ],
  },
  transpilePackages: ['@clario/ui', '@clario/shared', '@clario/supabase'],
  env: {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    NEXT_PUBLIC_API_URL: env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_REGISTER_SECRET: env.NEXT_PUBLIC_REGISTER_SECRET || env.REGISTER_SECRET,
  },
};

module.exports = nextConfig;
