/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for GitHub Pages
  output: 'export',
  distDir: 'out',
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
