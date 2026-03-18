import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Pre-cache all JS/CSS chunks so all routes load instantly on repeat visits
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        // Cache the app shell for all navigations (SPA fallback)
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
      manifest: {
        name: 'Canasta Training App',
        short_name: 'Canasta',
        description:
          'Interactive Canasta training app — learn, practice, and play Canasta on any device.',
        theme_color: '#1e3a5f',
        background_color: '#0f2a44',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
    alias: {
      'virtual:pwa-register/react': '/src/test/mocks/pwaRegister.ts',
    },
  },
})
