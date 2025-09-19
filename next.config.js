// next.config.js

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  env: {
    stackbitPreview: process.env.STACKBIT_PREVIEW
  },
  trailingSlash: true,
  reactStrictMode: true,

  // This is the correct and complete configuration for local images
  images: {
    // Generates smaller, more efficient images for different screen sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Generates smaller, fixed-width images for thumbnails
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Serves modern, highly compressed formats like AVIF to supported browsers
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = withBundleAnalyzer(nextConfig);