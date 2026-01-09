import type { RouterConfig } from '@nuxt/schema'

// https://router.vuejs.org/api/interfaces/routeroptions.html
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置（例如浏览器后退），使用该位置
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
}
