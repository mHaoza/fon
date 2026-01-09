<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3'
import { NodeViewWrapper } from '@tiptap/vue-3'
import { useTodoStore } from '~/store/todo'
import { fileToUint8Array, uploadFile } from '~/utils/file'
import { generateFilenameWithConflictResolution } from '~/utils/path'

const props = defineProps<NodeViewProps>()
const todoStore = useTodoStore()

const file = ref<File | null>(null)
const loading = ref(false)

watch(file, async (newFile) => {
  if (!newFile)
    return

  loading.value = true

  try {
    // 将文件转换为 Uint8Array
    const content = await fileToUint8Array(newFile)

    // 获取当前活动的 todo ID
    const todoId = todoStore.activeTodo?.id
    if (!todoId) {
      console.error('没有活动的 todo')
      loading.value = false
      return
    }

    // 生成文件名（如果重复则添加 (1), (2) 等）
    const filename = await generateFilenameWithConflictResolution(newFile.name, `todos/${todoId}`)

    // 上传文件到本地
    const result = await uploadFile({
      name: newFile.name,
      path: `todos/${todoId}/${filename}`,
      content: Array.from(content),
    })

    const pos = props.getPos()
    if (typeof pos !== 'number') {
      loading.value = false
      return
    }

    props.editor
      .chain()
      .focus()
      .deleteRange({ from: pos, to: pos + 1 })
      .setImage({ src: result.path })
      .run()
  }
  catch (error) {
    console.error('上传图片失败:', error)
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <NodeViewWrapper>
    <UFileUpload
      v-model="file"
      accept="image/*"
      label="Upload an image"
      description="SVG, PNG, JPG or GIF (max. 2MB)"
      :preview="false"
      class="min-h-48"
    >
      <template #leading>
        <UAvatar
          :icon="loading ? 'i-lucide-loader-circle' : 'i-lucide-image'"
          size="xl"
          :ui="{ icon: [loading && 'animate-spin'] }"
        />
      </template>
    </UFileUpload>
  </NodeViewWrapper>
</template>
