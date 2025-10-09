<script setup lang="ts">
import { MdEditor } from '@fon/ui'
import { convertFileSrc } from '@tauri-apps/api/core'
import { resourceDir } from '@tauri-apps/api/path'
import { debounce } from 'lodash-es'
import { nanoid } from 'nanoid'
import { useTodoStore } from '~/store/todo'

const todoStore = useTodoStore()

const vditorRef = useTemplateRef('vditorRef')

/** 更新todo */
const updateTodo = debounce(async () => {
  if (todoStore.activeTodo) {
    todoStore.updateTodo(todoStore.activeTodo)
  }
}, 1000)

/** 自定义markdown上传 */
const customUpload = {
  max: 5 * 1024 * 1024,
  async handler(fileList: File[]) {
    const filterFileList = fileList.filter(file => isImageFile(guessMimeType(file.name)))
    const fileInfoList = await Promise.all(filterFileList.map(async (file) => {
      const content = await fileToUint8Array(file)
      const result = await uploadFile({
        name: file.name,
        path: `/todos/${todoStore.activeTodo!.id}/${nanoid()}.${getFileExtension(file.name)}`,
        content: Array.from(content),
      })
      return result
    }))
    // 插入图片
    vditorRef.value?.vditor()?.insertValue(fileInfoList.map(fileInfo => `![${fileInfo.name}](${fileInfo.path})`).join('\n'))

    return null
  },
}

/** 处理markdown 中 img标签图片路径渲染问题 */
async function processImgSrc() {
  const dir = await resourceDir()
  const normalized = dir.replace(/\\/g, '/')
  const parent = normalized.replace(/\/?resources\/?$/, '')

  vditorRef.value?.$el?.querySelectorAll('img').forEach((img: HTMLImageElement) => {
    const imgSrc = img.getAttribute('src')
    if (imgSrc && !imgSrc.startsWith('http')) {
      img.src = convertFileSrc(`${parent}/${imgSrc}`)
    }
  })
}

/** 监听content变更， 处理img标签图片路径渲染问题 */
watch(() => todoStore.activeTodo?.content, async () => {
  await nextTick()
  processImgSrc()
})
</script>

<template>
  <div class="p-4 flex h-full overflow-hidden">
    <TodoList class="flex-1" />

    <div class="pl-2 h-full w-1/2">
      <MdEditor
        v-if="todoStore.activeTodo"
        ref="vditorRef"
        v-model:value="todoStore.activeTodo.content"
        placeholder="请输入内容"
        :upload="customUpload"
        class="h-full"
        @change="updateTodo"
        @blur="updateTodo.flush()"
        @loaded="processImgSrc"
      />
    </div>
  </div>
</template>

<style scoped></style>
