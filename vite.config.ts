import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    ui({
      autoImport: {
        imports: ['vue', 'vue-router', '@vueuse/core'],
        // dts: 'auto-imports.d.ts',
        // dirs: ['./src/utils/**', './src/stores/**', './src/api/**'],
      },
      ui: {
        container: {
          base: 'w-full max-w-(--ui-container-2xl) mx-auto'
        },
        main: {
          base: 'min-h-[calc(100vh-var(--ui-header-height))]'
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
