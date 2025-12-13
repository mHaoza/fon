import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  // 启用 SSG
  ssr: false,
  devServer: { host: 'localhost' },
  vite: {
    plugins: [],
    clearScreen: false,
    // 启用环境变量
    envPrefix: ['VITE_'],
  },
  modules: ['@unocss/nuxt', '@nuxt/eslint', '@pinia/nuxt'],
  // ignore: ['app/pages/**/modules/**'],
  css: ['~/assets/styles/main.css'],
  eslint: {
    config: {
      standalone: false,
    },
  },
  hooks: {
    'pages:extend': function (pages) {
      // 移除modules路由
      const index = pages.findIndex(page => /\/modules\//.test(page.path))
      if (index >= 0) {
        pages.splice(index, 1)
      }
    },
  },
})
