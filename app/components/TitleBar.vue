<script setup lang="ts">
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { computed, onBeforeMount, ref } from 'vue'

const appWindow = getCurrentWebviewWindow()

const isAlwaysOnTop = ref(false)
const isMaximized = ref(false)

onBeforeMount(async () => {
  isMaximized.value = await appWindow.isMaximized()
  appWindow.onResized(async () => {
    isMaximized.value = await appWindow.isMaximized()
  })
})

const controlList = computed(() => [
  {
    name: '置顶',
    icon: isAlwaysOnTop.value ? 'i-lucide:pin-off' : 'i-lucide:pin',
    action: () => {
      appWindow.setAlwaysOnTop(!isAlwaysOnTop.value)
      isAlwaysOnTop.value = !isAlwaysOnTop.value
    },
  },
  {
    name: '最小化',
    icon: 'i-lucide:minus',
    action: () => appWindow.minimize(),
  },
  {
    name: isMaximized.value ? '还原' : '最大化',
    icon: isMaximized.value ? 'i-lucide:copy rotate-90' : 'i-lucide:square',
    action: () => appWindow.toggleMaximize(),
  },
  {
    name: '关闭',
    icon: 'i-lucide:x',
    action: () => appWindow.close(),
  },
])
</script>

<template>
  <div class="title-bar flex items-center select-none">
    <div class="drag-bar flex flex-1 items-center pl-2" data-tauri-drag-region>
      <img src="/logo.svg" alt="logo" class="pointer-events-none h-5 w-auto" />
      <span class="pointer-events-none pl-1 font-bold text-neutral-400">Fon</span>
    </div>

    <div class="flex">
      <div
        v-for="{ name, icon, action } in controlList"
        :key="name"
        class="flex h-8 w-10 cursor-pointer items-center justify-center transition-all hover:bg-neutral-100 active:bg-neutral-200"
        :aria-label="name"
        @click="action()"
      >
        <UIcon :name="icon" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
