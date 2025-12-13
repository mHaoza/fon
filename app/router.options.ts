import type { RouterConfig } from '@nuxt/schema'

// https://router.vuejs.org/api/interfaces/routeroptions.html
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置（例如浏览器后退），使用该位置
    if (savedPosition) {
      return savedPosition
    }

    // 不处理 hash 滚动，因为我们的 hash 用于视图切换而不是页面锚点
    // 这样可以避免浏览器尝试查找类似 #tag/xxx 这样包含特殊字符的 id
    return { top: 0 }
  },
}

