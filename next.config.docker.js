/** @type {import('next').NextConfig} - Docker build: force static export (no basePath) */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
};

module.exports = nextConfig;
