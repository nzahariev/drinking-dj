/** @type {import('next').NextConfig} */
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
const isGhPages = !!process.env.GITHUB_REPOSITORY;

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  ...(isGhPages && repoName && {
    basePath: `/${repoName}`,
    assetPrefix: `/${repoName}/`,
  }),
};

module.exports = nextConfig;
