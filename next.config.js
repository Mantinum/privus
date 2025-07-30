const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  dynamicStartUrl: true,
  runtimeCaching: [
    {
      urlPattern: /^\/_next\//,
      handler: 'CacheFirst',
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*$/i,
      handler: 'CacheFirst',
    },
    {
      urlPattern: /^\/api\/events/,
      handler: 'NetworkFirst',
      method: 'GET',
    },
  ],
  importScripts: ['push-sw.js'],
  fallbacks: {
    html: '/offline',
  },
});

module.exports = withPWA({
  reactStrictMode: true,
});
