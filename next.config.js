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

  // --- ADD THIS 'images' CONFIGURATION ---
  images: {
    // Define the screen sizes you want to generate images for.
    // This creates smaller, more efficient images for mobile and tablet.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Define smaller, fixed-width sizes for things like thumbnails.
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Tell Next.js to serve images in the AVIF format if the browser supports it.
    // AVIF offers the best compression and will significantly reduce your image file sizes.
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = withBundleAnalyzer(nextConfig);