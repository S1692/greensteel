if (!self.define) {
  let e,
    s = {};
  const n = (n, a) => (
    (n = new URL(n + '.js', a).href),
    s[n] ||
      new Promise(s => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = n), (e.onload = s), document.head.appendChild(e));
        } else ((e = n), importScripts(n), s());
      }).then(() => {
        let e = s[n];
        if (!e) throw new Error(`Module ${n} didn’t register its module`);
        return e;
      })
  );
  self.define = (a, i) => {
    const t =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (s[t]) return;
    let c = {};
    const d = e => n(e, t),
      f = { module: { uri: t }, exports: c, require: d };
    s[t] = Promise.all(a.map(e => f[e] || d(e))).then(e => (i(...e), c));
  };
}
define(['./workbox-977fb9bf'], function (e) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/_next/app-build-manifest.json',
          revision: '4f557fd84c144efa495121f8ac530fc4',
        },
        {
          url: '/_next/static/chunks/590-038d87e4285f47f5.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/691-df4355af34b70861.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/954-011f997324349b75.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/ad1ff839-a39c1cdc3c1e9437.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/app/(protected)/cbam/page-9a16a7fa727d807d.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/app/(protected)/dashboard/page-1db710f1204730f7.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/app/(protected)/data-upload/page-1e5fb597a5d1687d.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/app/(protected)/lca/page-92bfdb03c649759c.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/app/(protected)/settings/page-630b9dc58b7e20fe.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/app/(public)/landing/page-60cb77879e6cb1df.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/app/(public)/register/page-6cf30d49f5405fbd.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-a958a345c2c24e4f.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/app/layout-f04c7b8eabf8d568.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/app/page-5d8381500b7e020a.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/framework-6e06c675866dc992.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/main-app-205ad2eeb3078426.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/main-f9f150f2dd033021.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/pages/_app-1e0813bbe740beb7.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/pages/_error-7730e932b281c983.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js',
          revision: '79330112775102f91e1010318bae2bd3',
        },
        {
          url: '/_next/static/chunks/webpack-4da7738d6019a505.js',
          revision: 'g8vys-fM4hOH2TkIvndqS',
        },
        {
          url: '/_next/static/css/4e965ca29a9813d3.css',
          revision: '4e965ca29a9813d3',
        },
        {
          url: '/_next/static/g8vys-fM4hOH2TkIvndqS/_buildManifest.js',
          revision: 'ba35485bdaa5e988214920c8725fe4d3',
        },
        {
          url: '/_next/static/g8vys-fM4hOH2TkIvndqS/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/media/26a46d62cd723877-s.woff2',
          revision: 'befd9c0fdfa3d8a645d5f95717ed6420',
        },
        {
          url: '/_next/static/media/55c55f0601d81cf3-s.woff2',
          revision: '43828e14271c77b87e3ed582dbff9f74',
        },
        {
          url: '/_next/static/media/581909926a08bbc8-s.woff2',
          revision: 'f0b86e7c24f455280b8df606b89af891',
        },
        {
          url: '/_next/static/media/8e9860b6e62d6359-s.woff2',
          revision: '01ba6c2a184b8cba08b0d57167664d75',
        },
        {
          url: '/_next/static/media/97e0cb1ae144a2a9-s.woff2',
          revision: 'e360c61c5bd8d90639fd4503c829c2dc',
        },
        {
          url: '/_next/static/media/df0a9ae256c0569c-s.woff2',
          revision: 'd54db44de5ccb18886ece2fda72bdfe0',
        },
        {
          url: '/_next/static/media/e4af272ccee01ff0-s.p.woff2',
          revision: '65850a373e258f1c897a2b3d75eb74de',
        },
        {
          url: '/apple-touch-icon.svg',
          revision: 'f58db01365333c3df27f8464d95a2c9d',
        },
        { url: '/favicon.svg', revision: '93fb7652ce25b187c8c616a269fd21f3' },
        {
          url: '/icon-192x192.svg',
          revision: 'dd70ef3507fad7ee6658b7cfe9140638',
        },
        {
          url: '/icon-512x512.svg',
          revision: '11ae17a8fd81addfe1cdde5addeed051',
        },
        { url: '/icon.svg', revision: '11ae17a8fd81addfe1cdde5addeed051' },
        { url: '/manifest.json', revision: '117e34c90392986218a0a81263d96fad' },
        { url: '/offline.html', revision: 'afd584b2df9d6c316bfb16a340109341' },
        { url: '/robots.txt', revision: 'db4a6dc60de7b8bb527e0c83ecba5327' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: n,
              state: a,
            }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/api\.greensteel\.site/,
      new e.NetworkFirst({
        cacheName: 'api-cache',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 86400 }),
          new e.CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
      new e.CacheFirst({
        cacheName: 'image-cache',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 2592e3 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js|css)$/,
      new e.StaleWhileRevalidate({
        cacheName: 'static-resources',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 604800 }),
        ],
      }),
      'GET'
    ));
});
