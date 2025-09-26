import type { ShowFloatMenuOptions } from './types'
import { createApp, h } from 'vue'
import FloatMenu from './float-menu.vue'

let vm: ReturnType<typeof createApp> | null = null
let container: HTMLElement | null = null

export function showFloatMenu(options: ShowFloatMenuOptions) {
  hideFloatMenu()
  container = document.createElement('div')
  document.body.appendChild(container)
  vm = createApp({
    render() {
      return h(FloatMenu, {
        items: options.items,
        position: options.position,
        placement: options.placement,
        onClose: hideFloatMenu,
      })
    },
  })
  vm.mount(container)
}

export function hideFloatMenu() {
  if (vm) {
    vm.unmount()
    vm = null
  }
  if (container) {
    container.remove()
    container = null
  }
}
