import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [],
       manifest: {
        name: 'Axess Inventory',
        short_name: 'Axess',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
      },devOptions: {
  enabled: false, // enables SW even in dev (not needed for production)
},
 globPatterns: ['index.html'],
          workbox: {
        runtimeCaching: [
          {
            // Cache item-view API responses to keep item data fresh and available offline
            urlPattern: /\/api\/items\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'item-data-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
          {
            // Cache certificates only when user opens an item-view page for offline availability
            urlPattern: /^https:\/\/res\.cloudinary\.com\/[^/]+\/.*\/certificates\/.*$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'certificates-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
          {
            // Cache all SPA UI assets (documents, scripts, styles) using CacheFirst
            // to ensure the React shell loads quickly and offline for item-view pages
            urlPattern: ({request}) => ['document', 'script', 'style'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: 'spa-ui-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
        ],
        // Serve index.html for all navigation requests to support SPA routing offline
        navigateFallback: '/index.html',
        // Clean up old caches automatically to avoid storage bloat and bugs
        cleanupOutdatedCaches: true,
      },
    }),],
  server: {
    port: 5175,       // Set your preferred port  // Fails if the port is already in use
  }
})
