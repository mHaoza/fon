<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3'
import { openPath, openUrl } from '@tauri-apps/plugin-opener'
import { NodeViewWrapper } from '@tiptap/vue-3'
import { getLocalFilePath, isNetworkUrl } from '~/utils/path'

const props = defineProps<NodeViewProps>()

const path = computed(() => props.node.attrs.path || '')
const name = computed(() => props.node.attrs.name || '')
const loading = computed(() => props.node.attrs.loading || false)

// 根据文件扩展名获取图标
const fileIcon = computed(() => {
  const ext = name.value.split('.').pop()?.toLowerCase()

  const iconMap: Record<string, string> = {
    // 文档
    'pdf': 'i-lucide-file-text',
    'doc': 'i-lucide-file-text',
    'docx': 'i-lucide-file-text',
    'txt': 'i-lucide-file-text',
    // 表格
    'xls': 'i-lucide-sheet',
    'xlsx': 'i-lucide-sheet',
    'csv': 'i-lucide-sheet',
    // 演示
    'ppt': 'i-lucide-presentation',
    'pptx': 'i-lucide-presentation',
    // 压缩包
    'zip': 'i-lucide-file-archive',
    'rar': 'i-lucide-file-archive',
    '7z': 'i-lucide-file-archive',
    'tar': 'i-lucide-file-archive',
    'gz': 'i-lucide-file-archive',
    // 代码
    'js': 'i-lucide-file-code',
    'ts': 'i-lucide-file-code',
    'jsx': 'i-lucide-file-code',
    'tsx': 'i-lucide-file-code',
    'vue': 'i-lucide-file-code',
    'py': 'i-lucide-file-code',
    'java': 'i-lucide-file-code',
    'cpp': 'i-lucide-file-code',
    'c': 'i-lucide-file-code',
    'html': 'i-lucide-file-code',
    'css': 'i-lucide-file-code',
    // 图片
    'jpg': 'i-lucide-image',
    'jpeg': 'i-lucide-image',
    'png': 'i-lucide-image',
    'gif': 'i-lucide-image',
    'svg': 'i-lucide-image',
    'webp': 'i-lucide-image',
    // 音频
    'mp3': 'i-lucide-music',
    'wav': 'i-lucide-music',
    'ogg': 'i-lucide-music',
    'flac': 'i-lucide-music',
    // 视频
    'mp4': 'i-lucide-video',
    'avi': 'i-lucide-video',
    'mov': 'i-lucide-video',
    'mkv': 'i-lucide-video',
    'webm': 'i-lucide-video',
  }

  return iconMap[ext || ''] || 'i-lucide-file'
})

// 处理点击事件
async function handleClick() {
  try {
    // 如果是网络链接,使用浏览器打开
    if (isNetworkUrl(path.value)) {
      await openUrl(path.value)
      return
    }

    // 本地文件,获取绝对路径后打开
    const localPath = await getLocalFilePath(path.value)
    await openPath(localPath)
  }
  catch (err) {
    console.error('打开文件失败:', err)
  }
}
</script>

<template>
  <NodeViewWrapper class="my-0!">
    <div
      class="inline-flex items-center gap-2 text-secondary-400 cursor-pointer hover:underline transition-opacity"
      :class="{ 'bg-primary/20': props.selected, 'opacity-60': loading }"
      :title="name"
      @click="handleClick"
    >
      <UIcon
        :name="loading ? 'i-lucide-loader-circle' : fileIcon"
        :class="[loading && 'animate-spin']"
        class="text-lg shrink-0 flex items-center"
      />
      <span class="truncate max-w-xs leading-none">
        {{ name }}
      </span>
    </div>
  </NodeViewWrapper>
</template>
