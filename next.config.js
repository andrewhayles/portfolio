const withMDX = require('@next/mdx')({
  // Optionally, pass options to the loader
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Add mdx to the list of page extensions
    pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
    env: {
        stackbitPreview: process.env.STACKBIT_PREVIEW
    },
    trailingSlash: true,
    reactStrictMode: true
};

module.exports = withMDX(nextConfig);