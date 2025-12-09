import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

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
      // 設定 semantic colors 使用自訂色板
      ui: {
        colors: {
          primary: 'harvest',    // 暖橙色 - 主要按鈕、連結
          secondary: 'earth',    // 土橘色 - 次要強調
          success: 'nature',     // 自然綠 - 成功狀態
          neutral: 'stone',      // 石頭色 - 中性底色
        },
        container: {
          base: 'w-full max-w-(--ui-container-2xl) mx-auto',
        },
        main: {
          base: 'min-h-[calc(100vh-var(--ui-header-height))]',
        },
      },
    }),
    VitePWA({
      strategies: 'injectManifest', // 使用自定義 Service Worker
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: '農業管理系統',
        short_name: '農管系統',
        description: '智慧農業管理平台 - 產品、訂單、會員一站式管理',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      devOptions: {
        enabled: true, // 開發環境啟用 PWA
        type: 'module'
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // ECharts 相關 - 拆分為獨立 chunk
          if (id.includes('echarts') || id.includes('zrender')) {
            return 'echarts'
          }
          // Vue 核心 - 拆分為獨立 chunk
          if (id.includes('node_modules/vue/') ||
            id.includes('node_modules/@vue/') ||
            id.includes('node_modules/vue-router/') ||
            id.includes('node_modules/pinia/')) {
            return 'vue-vendor'
          }
          // Reka UI (Nuxt UI 底層) - 拆分為獨立 chunk
          if (id.includes('reka-ui') || id.includes('@floating-ui')) {
            return 'ui-primitives'
          }
          // 其他 node_modules - 拆分為通用 vendor chunk
          if (id.includes('node_modules')) {
            // Socket.io 相關
            if (id.includes('socket.io')) {
              return 'socket-io'
            }
            // Axios
            if (id.includes('axios')) {
              return 'axios'
            }
          }
        }
      }
    },
    // 調整 chunk size 警告閾值
    chunkSizeWarningLimit: 600
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
