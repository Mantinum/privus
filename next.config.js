const withPWA = require('next-pwa')({
  dest: 'public',
  sw: 'sw.js',
  dynamicStartUrl: true,
  runtimeCaching: [
    {
      urlPattern: /^\/(_next|static)\/.*$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static',
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts',
      },
    },
    {
      urlPattern: /^\/api\/events.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-events',
      },
    },
  ],
  fallbacks: {
    document: '/offline',
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
