// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primeuix/themes/aura'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@element-plus/nuxt',
    '@primevue/nuxt-module',
    '@pinia/nuxt'
  ],

  css: [
    'element-plus/dist/index.css',
    'primeicons/primeicons.css',
    '@vue-flow/core/dist/style.css',
    '@vue-flow/core/dist/theme-default.css',
    '@vue-flow/controls/dist/style.css',
    '@vue-flow/minimap/dist/style.css',
    '@vue-flow/node-resizer/dist/style.css',
    '~/assets/css/main.scss'
  ],

  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark'
        }
      }
    }
  },

  app: {
    head: {
      title: '端网协同',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  vite: {
    server: {
      proxy: {
        // /api/v1/* 走 FastAPI/mock backend（默认本机，实际请求走 useBackendIp 的绝对 URL，proxy 仅作兜底）
        // /api/topology、/api/upload 由 Nuxt Nitro 自己的 server/api 处理，不代理
        '/api/v1': { target: 'http://localhost:3001', changeOrigin: true },
      }
    }
  }
})
