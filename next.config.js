const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  dynamicStartUrl: true,
  runtimeCaching: [
    {
      urlPattern: /^\/_next\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    {
      urlPattern: /\/api\/events/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-events',
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
      },
    },
  ],
  fallbacks: { html: '/offline' },
});

module.exports = withPWA({ reactStrictMode: true });
