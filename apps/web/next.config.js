require('dotenv').config({ path: '../../.env' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@clario/ui', '@clario/shared', '@clario/supabase'],
};

module.exports = nextConfig;
