import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

/**
 * Generates an offline-first Service Worker (dist/sw.js) containing all built
 * assets (JS, CSS, HTML, bundled offline fonts, icons, manifest) for browser offline mode.
 * Electron file:// execution automatically skips SW registration and loads directly from disk.
 */
function offlineServiceWorkerPlugin(): Plugin {
  return {
    name: 'vms-offline-sw-generator',
    apply: 'build',
    generateBundle(_options, bundle) {
      const cacheVersion = `vms-offline-${Date.now().toString(36)}`;
      const assetFiles = new Set<string>([
        './',
        './index.html',
        './icon.svg',
        './manifest.webmanifest',
      ]);

      for (const fileName of Object.keys(bundle)) {
        if (fileName !== 'sw.js') {
          assetFiles.add(`./${fileName}`);
        }
      }

      const precacheList = JSON.stringify(Array.from(assetFiles), null, 2);

      const swSource = `const CACHE_NAME = '${cacheVersion}';
const PRECACHE_URLS = ${precacheList};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const reqUrl = new URL(event.request.url);
  if (reqUrl.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', clone));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
`;

      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: swSource,
      });
    },
  };
}

export default defineConfig(() => {
  return {
    // Relative base ensures Electron loadFile('dist/index.html') resolves all local assets offline
    base: './',
    plugins: [react(), tailwindcss(), offlineServiceWorkerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
