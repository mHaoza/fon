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
import { handleFileUpload } from './composables/useFileUploadHandler'
import CustomFile from './CustomFile'
import CustomImage from './CustomImage'
import ImageUpload from './ImageUpload'
import LinkPopover from './LinkPopover.vue'

const todoStore = useTodoStore()

// Custom handlers for editor
const customHandlers = {
  imageUpload: {
    canExecute: (editor: Editor) => editor.can().insertContent({ type: 'imageUpload' }),
    execute: (editor: Editor) => editor.chain().focus().insertContent({ type: 'imageUpload' }),
    isActive: (editor: Editor) => editor.isActive('imageUpload'),
    isDisabled: undefined,
  },
  file: {
    canExecute: (_editor: Editor) => true,
    execute: (editor: Editor) => {
      const todoId = todoStore.activeTodo?.id
      if (todoId) {
        handleFileUpload(editor, todoId)
      }
    },
    isActive: (editor: Editor) => editor.isActive('file'),
    isDisabled: undefined,
  },
} satisfies EditorCustomHandlers

const { items: suggestionItems } = useEditorSuggestions(customHandlers)
const { bubbleToolbarItems, getImageToolbarItems } = useEditorToolbar(customHandlers)

const content = computed({
  get: () => todoStore.activeTodo?.content || null,
  set: (v: string) => {
    if (todoStore.activeTodo) {
      todoStore.activeTodo.content = v || ''
    }
  },
})

const extensions = computed(() => [
  CustomImage,
  CustomFile,
  ImageUpload,
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
          // Task lists
          '[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:ps-1',
          '[&_ul[data-type=taskList]_li]:flex [&_ul[data-type=taskList]_li]:items-start [&_ul[data-type=taskList]_li]:ps-0',
          '[&_ul[data-type=taskList]_li_label]:inline-flex [&_ul[data-type=taskList]_li_label]:relative [&_ul[data-type=taskList]_li_label]:pr-2.5',
          '[&_ul[data-type=taskList]_li_label_input]:appearance-none [&_ul[data-type=taskList]_li_label_input]:size-4 [&_ul[data-type=taskList]_li_label_input]:my-0.5 [&_ul[data-type=taskList]_li_label_input]:rounded-sm [&_ul[data-type=taskList]_li_label_input]:ring [&_ul[data-type=taskList]_li_label_input]:ring-inset [&_ul[data-type=taskList]_li_label_input]:ring-accented [&_ul[data-type=taskList]_li_label_input]:bg-center',
          '[&_ul[data-type=taskList]_li_label_input:checked]:bg-primary [&_ul[data-type=taskList]_li_label_input:checked]:ring-primary [&_ul[data-type=taskList]_li_label_input:checked]:bg-[url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDZMOSAxN2wtNS01Ii8+PC9zdmc+)] dark:[&_ul[data-type=taskList]_li_label_input:checked]:bg-[url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDZMOSAxN2wtNS01Ii8+PC9zdmc+)]',
          '[&_ul[data-type=taskList]_li[data-checked=true]>div>p]:line-through [&_ul[data-type=taskList]_li[data-checked=true]>div>p]:opacity-50',
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
          if (editor.isActive('imageUpload') || editor.isActive('image') || editor.isActive('file')) {
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
