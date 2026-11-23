/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // API Symfony lancée avec Docker (dépôt wanstead-wildlife-api) : nginx sur le port 8090.
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8090'

  return {
    plugins: [
      vue({
        // Les images de public/ (src="/assets/...") restent des URL, pas des imports.
        template: { transformAssetUrls: { includeAbsolute: false } },
      }),
    ],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      // Le front appelle /api/... : en dev, Vite relaie vers l'API (pas de souci de CORS).
      proxy: { '/api': { target: apiTarget, changeOrigin: true } },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.spec.ts', 'scripts/**/*.spec.ts'],
    },
  }
})
