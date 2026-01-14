<script setup lang="ts">
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { initAllDatabases } from '~/db'

const appWindow = getCurrentWebviewWindow()

// 初始化数据库
onMounted(async () => {
  try {
    await initAllDatabases()
  }
  catch (error) {
    console.error('Failed to initialize database:', error)
  }
})

// 屏蔽浏览器默认行为
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('contextmenu', handleContextmenu)
})
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('contextmenu', handleContextmenu)
})

function handleKeydown(e: KeyboardEvent) {
  // ESC 键隐藏窗口
  if (e.key === 'Escape') {
    appWindow.hide()
    return
  }

  // Disable WebView keyboard shortcuts
  const disabledShortcuts
    = ['F5', 'F7'].includes(e.key)
      || (e.altKey && ['ArrowLeft', 'ArrowRight'].includes(e.key))
      || ((e.ctrlKey || e.metaKey)
        && ['F', 'G', 'H', 'J', 'P', 'Q', 'R', 'U'].includes(
          e.key.toUpperCase(),
        ))
  disabledShortcuts && e.preventDefault()
}

// 屏蔽浏览器默认右键菜单
function handleContextmenu(e: MouseEvent) {
  //   only prevent it on Windows
  const validList = ['input', 'textarea']
  const target = e.currentTarget as HTMLElement
  if (!validList.includes(target?.tagName?.toLowerCase()) || !target?.isContentEditable) {
    e.preventDefault()
  }
}
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
