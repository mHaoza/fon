<script setup lang="ts">
import type { EditorCustomHandlers } from '@nuxt/ui'
import type { Editor } from '@tiptap/core'
import { openPath, openUrl } from '@tauri-apps/plugin-opener'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import TextAlign from '@tiptap/extension-text-align'
import { debounce } from 'lodash-es'
import { CodeBlockShiki } from 'tiptap-extension-code-block-shiki'
import { useTodoStore } from '~/store/todo'
import { getLocalFilePath, isNetworkUrl } from '~/utils/path'
import { useEditorSuggestions } from './composables/useEditorSuggestions'
import { useEditorToolbar } from './composables/useEditorToolbar'
import CustomFile from './CustomFile'
import CustomImage from './CustomImage'
import FileUpload from './FileUpload'
import ImageUpload from './ImageUpload'
import LinkPopover from './LinkPopover.vue'

// Custom handlers for editor
const customHandlers = {
  imageUpload: {
    canExecute: (editor: Editor) => editor.can().insertContent({ type: 'imageUpload' }),
    execute: (editor: Editor) => editor.chain().focus().insertContent({ type: 'imageUpload' }),
    isActive: (editor: Editor) => editor.isActive('imageUpload'),
    isDisabled: undefined,
  },
  fileUpload: {
    canExecute: (editor: Editor) => editor.can().insertContent({ type: 'fileUpload' }),
    execute: (editor: Editor) => editor.chain().focus().insertContent({ type: 'fileUpload' }),
    isActive: (editor: Editor) => editor.isActive('fileUpload'),
    isDisabled: undefined,
  },
} satisfies EditorCustomHandlers

const { items: suggestionItems } = useEditorSuggestions(customHandlers)
const { bubbleToolbarItems, getImageToolbarItems } = useEditorToolbar(customHandlers)

const todoStore = useTodoStore()

const content = computed({
  get: () => todoStore.activeTodo?.content || null,
  set: (v: string) => {
    if (todoStore.activeTodo) {
      todoStore.activeTodo.content = v || ''
    }
  },
})

const taskListStyle = [
  // Task list 基础样式
  '**:data-[type=taskList]:list-none **:data-[type=taskList]:ml-0 **:data-[type=taskList]:p-0 **:data-[type=taskList]:m-0',
  // Task list item 样式
  '[&_[data-type=taskList]_li]:flex [&_[data-type=taskList]_li]:items-start [&_[data-type=taskList]_li]:break-all',
  // Task list item 内容区域
  '[&_[data-type=taskList]_li>div]:flex-auto',
  // Task list label 样式
  '[&_[data-type=taskList]_li>label]:flex-none [&_[data-type=taskList]_li>label]:mr-2 [&_[data-type=taskList]_li>label]:select-none',
  // Task list checkbox 样式
  '[&_[data-type=taskList]_input[type=checkbox]]:cursor-pointer',
  // 已完成任务样式（灰色 + 删除线）
  '[&_[data-type=taskList]_li:has(input[type=checkbox]:checked)>div]:text-gray-500 [&_[data-type=taskList]_li:has(input[type=checkbox]:checked)>div]:line-through',
  '[&_[data-type=taskList]_li:has(input[type=checkbox]:checked)>div]:dark:text-gray-400',
]

const extensions = computed(() => [
  CustomImage,
  CustomFile,
  ImageUpload,
  FileUpload,
  CodeBlockShiki.configure({
    defaultTheme: 'material-theme',
    themes: {
      light: 'material-theme-lighter',
      dark: 'material-theme-palenight',
    },
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
])

const updateTodo = debounce(async () => {
  if (todoStore.activeTodo) {
    todoStore.updateTodo(todoStore.activeTodo)
  }
}, 1000)

function onUpdate(v: string | null) {
  content.value = v || ''
  updateTodo()
}

const editorRef = useTemplateRef('editorRef')
const editorContainerRef = ref<HTMLElement>()

// 处理点击链接事件
async function handleLinkClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  const link = target.closest('a[data-local-file="true"]')

  if (link) {
    event.preventDefault()
    const href = link.getAttribute('href')

    if (!href)
      return

    try {
      // 如果是网络链接，使用浏览器打开
      if (isNetworkUrl(href)) {
        await openUrl(href)
        return
      }

      // 本地附件，获取绝对路径后打开
      const localPath = await getLocalFilePath(href)
      await openPath(localPath)
    }
    catch (err) {
      console.error('打开附件失败:', err)
    }
  }
}

// 监听编辑器内容的点击事件
onMounted(() => {
  if (editorContainerRef.value) {
    editorContainerRef.value.addEventListener('click', handleLinkClick)
  }
})

onBeforeUnmount(() => {
  if (editorContainerRef.value) {
    editorContainerRef.value.removeEventListener('click', handleLinkClick)
  }
})

defineExpose({ focus: () => editorRef.value?.editor?.commands.focus('end') })
</script>

<template>
  <div ref="editorContainerRef">
    <UEditor
      v-if="todoStore.activeTodo"
      ref="editorRef"
      :key="todoStore.activeTodo.id"
      v-slot="{ editor }"
      :model-value="content"
      content-type="markdown"
      :extensions="extensions"
      :starter-kit="{ codeBlock: false, link: false }"
      :image="false"
      :handlers="customHandlers"
      placeholder="输入内容或使用 / 快速插入..."
      :ui="{
        base: [
          'p-2! pb-8! [&_p]:leading-5',
          ...taskListStyle,
        ],
        content: [
          'max-w-4xl',
          'mx-auto',
        ],
      }"
      @update:model-value="onUpdate"
      @blur="updateTodo.flush()"
    >
      <UEditorToolbar
        :editor="editor"
        :items="bubbleToolbarItems"
        layout="bubble"
        :should-show="({ editor, view, state }: any) => {
          if (editor.isActive('imageUpload') || editor.isActive('image') || editor.isActive('fileUpload') || editor.isActive('file')) {
            return false
          }
          const { selection } = state
          return view.hasFocus() && !selection.empty
        }"
      >
        <template #link>
          <LinkPopover :editor="editor" />
        </template>
      </UEditorToolbar>

      <UEditorToolbar
        :editor="editor"
        :items="getImageToolbarItems(editor)"
        layout="bubble"
        :should-show="({ editor, view }: any) => {
          return editor.isActive('image') && view.hasFocus()
        }"
      />
      <UEditorSuggestionMenu
        :editor="editor"
        :items="suggestionItems"
      />
    </UEditor>
  </div>
</template>

<style>
/* dark mode code block styles */
html.dark .tiptap .shiki,
html.dark .tiptap .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--ui-bg-muted) !important;
}
</style>
