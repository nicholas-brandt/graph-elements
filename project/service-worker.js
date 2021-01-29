importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

workbox.routing.registerRoute(/^https:\/\/opencitations\.net/,
  new workbox.strategies.CacheFirst({
    cacheName: 'open-citations',
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
      })
    ]
  }),
);

workbox.routing.registerRoute(/^https:\/\/(cdn\.jsdelivr\.net|hammerjs\.github\.io|rawgit\.com|d3js\.org|dev\.jspm\.io)/,
  new workbox.strategies.CacheFirst({
    cacheName: 'prerequisites',
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
      })
    ]
  }),
);

workbox.routing.registerRoute(/^https:\/\/geneva-avenue\.codio\.io/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'codio',
  }),
);

workbox.routing.registerRoute(/^https:\/\/jamtis\.\.github\.io/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'codio',
  }),
);