<script lang="ts" setup>
onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))

function handleKeydown(e: KeyboardEvent) {
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
  <div @contextmenu="handleContextmenu">
    <slot />
  </div>
</template>
