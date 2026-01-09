import tailwindcss from '@tailwindcss/vite'
import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  // 启用 SSG
  ssr: false,
  devServer: { host: 'localhost' },
  vite: {
    plugins: [
      tailwindcss(),
    ],
    clearScreen: false,
    // 启用环境变量
    envPrefix: ['VITE_'],
    optimizeDeps: {
      include: [
        'prosemirror-state',
        'prosemirror-tables',
        'prosemirror-view',
      ],
    },
  },
  modules: ['@nuxt/eslint', '@pinia/nuxt', '@nuxt/ui'],
  // 配置自动导入
  imports: {
    dirs: ['utils/*'],
  },
  // ignore: ['app/pages/**/modules/**'],
  css: ['~/assets/styles/main.css'],
  eslint: {
    config: {
      standalone: false,
    },
  },
  // 禁用 Nuxt UI 的在线图标获取，避免访问 Google Fonts
  ui: {
    fonts: false,
    colorMode: false,
    experimental: {
      componentDetection: true,
    },
  },
  icon: {
    clientBundle: {
      // 扫描并打包使用的图标到客户端
      scan: true,
    },
  },
})
