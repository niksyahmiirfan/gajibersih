/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // static HTML in ./out — deploy to Cloudflare Pages or GitHub Pages
  trailingSlash: true,
  images: { unoptimized: true },
  // Set NEXT_PUBLIC_BASE_PATH=/repo-name when deploying to a GitHub Pages project URL
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

export default nextConfig;
