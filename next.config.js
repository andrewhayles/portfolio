/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Define your Next.js config object
const nextConfig = {
  env: {
    stackbitPreview: process.env.STACKBIT_PREVIEW
  },
  trailingSlash: true,
  reactStrictMode: true
};

// Wrap the config with the analyzer and export the result
module.exports = withBundleAnalyzer(nextConfig);