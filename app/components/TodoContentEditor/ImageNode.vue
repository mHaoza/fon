<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3'
import { openPath, openUrl } from '@tauri-apps/plugin-opener'
import { NodeViewWrapper } from '@tiptap/vue-3'
import { getLocalFilePath, isDataUrl, isNetworkUrl, resolveFileSrc } from '~/utils/path'

const props = defineProps<NodeViewProps>()

const fullUrl = ref<string>('')
const loading = ref(true)
const error = ref(false)

/** 处理图片加载失败 */
function handleImageError() {
  error.value = true
  loading.value = false
}

/** 双击打开图片 */
async function handleDoubleClick() {
  try {
    const src = props.node.attrs.src

    // 如果是网络图片，使用浏览器打开
    if (isNetworkUrl(src)) {
      await openUrl(src)
      return
    }

    // 如果是data URL，提示用户无法打开
    if (isDataUrl(src)) {
      console.warn('无法直接打开 base64 图片')
      return
    }

    // 本地图片，获取绝对路径后打开
    const localPath = await getLocalFilePath(src)
    await openPath(localPath)
  } catch (err) {
    console.error('打开图片失败:', err)
  }
}

// 监听 src 变化
watch(
  () => props.node.attrs.src,
  async (newSrc) => {
    if (newSrc) {
      loading.value = true
      error.value = false
      try {
        fullUrl.value = await resolveFileSrc(newSrc)
      } catch (err) {
        console.error('解析文件路径失败:', err)
        error.value = true
      } finally {
        loading.value = false
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <NodeViewWrapper class="relative rounded-md" :class="{ 'ring-primary-500 ring-2': selected }">
    <img
      v-if="!loading && !error && fullUrl"
      :src="fullUrl"
      :alt="node.attrs.alt"
      :title="node.attrs.title || '双击打开图片'"
      class="h-auto max-w-full cursor-pointer rounded-md transition-opacity hover:opacity-90"
      @error="handleImageError"
      @dblclick="handleDoubleClick"
    />
    <div
      v-else-if="loading"
      class="inline-flex min-h-32 w-full items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="animate-spin text-neutral-400 dark:text-neutral-500"
      />
    </div>
    <div
      v-else-if="error"
      class="inline-flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20"
    >
      <UIcon name="i-lucide-image-off" class="text-xl text-red-400 dark:text-red-500" />
      <span class="text-sm text-red-600 dark:text-red-400">图片加载失败</span>
    </div>
  </NodeViewWrapper>
</template>
