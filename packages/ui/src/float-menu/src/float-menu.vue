<script setup lang="ts">
import type { Placement, Instance as PopperInstance } from '@popperjs/core'
import type { FloatMenuItem, FloatMenuPlacement } from './types'
import { createPopper } from '@popperjs/core'
import { onMounted, onUnmounted, ref, watchEffect } from 'vue'

const props = defineProps<{
  items: FloatMenuItem[]
  position: { x: number, y: number }
  placement?: FloatMenuPlacement
  onClose?: () => void
}>()

const menuRef = ref<HTMLElement | null>(null)
let popper: PopperInstance | null = null

// 使用虚拟元素承载坐标
const virtualElement = {
  getBoundingClientRect(): DOMRect {
    const { x, y } = props.position
    return {
      x,
      y,
      width: 0,
      height: 0,
      top: y,
      left: x,
      right: x,
      bottom: y,
      toJSON() {},
    } as DOMRect
  },
}

function initPopper() {
  if (!menuRef.value)
    return
  popper?.destroy()
  popper = createPopper(virtualElement as any, menuRef.value, {
    placement: (props.placement as Placement) || 'bottom-start',
    strategy: 'fixed',
    modifiers: [
      { name: 'offset', options: { offset: [0, 6] } },
      { name: 'preventOverflow', options: { padding: 8 } },
      { name: 'flip', options: { fallbackPlacements: ['bottom', 'top', 'right', 'left'] } },
    ],
  })
}

function handleOutsideClick(ev: MouseEvent) {
  const target = ev.target as Node
  if (menuRef.value && !menuRef.value.contains(target)) {
    props.onClose?.()
  }
}

onMounted(() => {
  initPopper()
  document.addEventListener('mousedown', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
  popper?.destroy()
  popper = null
})

watchEffect(() => {
  // 位置更新
  popper?.update()
})

function onItemClick(action?: () => void) {
  action?.()
  props.onClose?.()
}
</script>

<template>
  <Teleport to="body">
    <div ref="menuRef" class="py-1 outline-none border border-gray-200 rounded-lg bg-white min-w-48 shadow-lg">
      <div
        v-for="(item, index) in props.items"
        :key="index"
        class="text-sm px-3 py-2 outline-none flex cursor-pointer transition-colors items-center hover:bg-gray-100"
        :class="item.class || ''"
        @click="onItemClick(item.action)"
      >
        <span v-if="item.icon" class="mr-2 flex h-4 w-4 items-center justify-center" :class="item.icon" />
        <span v-if="typeof item.title === 'string'">{{ item.title }}</span>
        <component :is="item.title" v-else />
      </div>
    </div>
  </Teleport>
</template>
