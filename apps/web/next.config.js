/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@edu-reels/shared', '@edu-reels/db', '@edu-reels/remotion'],
};

module.exports = nextConfig;
