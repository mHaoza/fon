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
  <div class="title-bar flex select-none items-center">
    <div class="drag-bar pl-2 flex-1 flex items-center" data-tauri-drag-region>
      <img src="/logo.svg" alt="logo" class="h-5 w-auto pointer-events-none">
      <span class="text-gray-400 font-bold pl-1 pointer-events-none">Fon</span>
    </div>

    <div class="flex">
      <div
        v-for="{ name, icon, action } in controlList"
        :key="name"
        class="flex h-8 w-10 items-center justify-center hover:bg-gray-600/10 active:opacity-50"
        :aria-label="name"
        @click="action()"
      >
        <UIcon :name="icon" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
