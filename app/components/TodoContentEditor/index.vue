<script setup lang="ts">
import type { EditorCustomHandlers } from '@nuxt/ui'
import type { Editor } from '@tiptap/core'
import { openUrl } from '@tauri-apps/plugin-opener'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { TableKit } from '@tiptap/extension-table'
import { debounce } from 'lodash-es'
import { CellSelection } from 'prosemirror-tables'
import { CodeBlockShiki } from 'tiptap-extension-code-block-shiki'
import { useTodoStore } from '~/store/todo'
import { useEditorSuggestions } from './composables/useEditorSuggestions'
import { useEditorToolbar } from './composables/useEditorToolbar'
import {
  handleDropUpload,
  handleFileUpload,
  handleImageUpload,
  handlePasteUpload,
} from './composables/useFileUploadHandler'
import CustomFile from './CustomFile'
import CustomImage from './CustomImage'
import LinkPopover from './LinkPopover.vue'

const todoStore = useTodoStore()

// Custom handlers for editor
const customHandlers = {
  image: {
    canExecute: (_editor: Editor) => true,
    execute: (editor: Editor) => {
      const todoId = todoStore.activeTodo?.id
      if (todoId) {
        handleImageUpload(editor, todoId)
      }
      // 返回空函数以消除调用报错
      return { run: () => {} }
    },
    isActive: (editor: Editor) => editor.isActive('image'),
    isDisabled: undefined,
  },
  table: {
    canExecute: (editor: Editor) =>
      editor.can().insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
    execute: (editor: Editor) =>
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
    isActive: (editor: Editor) => editor.isActive('table'),
    isDisabled: undefined,
  },
  file: {
    canExecute: (_editor: Editor) => true,
    execute: (editor: Editor) => {
      const todoId = todoStore.activeTodo?.id
      if (todoId) {
        handleFileUpload(editor, todoId)
      }
      // 返回空函数以消除调用报错
      return { run: () => {} }
    },
    isActive: (editor: Editor) => editor.isActive('file'),
    isDisabled: undefined,
  },
} satisfies EditorCustomHandlers

const { suggestionItems } = useEditorSuggestions(customHandlers)
const { bubbleToolbarItems, getImageToolbarItems, getTableToolbarItems } =
  useEditorToolbar(customHandlers)

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
  TableKit,
  CodeBlockShiki.configure({
    defaultTheme: 'material-theme',
    themes: {
      light: 'material-theme-lighter',
      dark: 'material-theme-palenight',
    },
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
  const href = (event.target as HTMLElement)?.closest('a')?.getAttribute('href')
  if (href) {
    event.preventDefault()
    await openUrl(href)
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

async function handleDrop(event: DragEvent) {
  if (todoStore.activeTodo?.id && editorRef.value?.editor) {
    handleDropUpload(editorRef.value.editor, todoStore.activeTodo.id, event)
  }
}

async function handlePaste(event: ClipboardEvent) {
  if (todoStore.activeTodo?.id && editorRef.value?.editor) {
    handlePasteUpload(editorRef.value.editor, todoStore.activeTodo.id, event)
  }
}

const bodyElement = computed(() => document.body)

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
      :starter-kit="{ codeBlock: false }"
      :image="false"
      :handlers="customHandlers"
      placeholder="输入内容或使用 / 快速插入..."
      :ui="{
        base: [
          ' pb-8! px-8! [&_p]:leading-5',
          // h1, h2, h3,h4, h5, h6
          '[&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_h4]:text-sm [&_h5]:text-sm [&_h6]:text-sm',
          // Tables
          '[&_table]:w-full [&_table]:border-separate [&_table]:border-spacing-0 [&_table]:rounded-md',
          '[&_th]:py-3 [&_th]:px-4 [&_th]:font-semibold [&_th]:text-sm [&_th]:text-left [&_th]:bg-muted/50 [&_th]:border-t [&_th]:border-b [&_th]:border-e [&_th]:first:border-s [&_th]:border-muted',
          '[&_th_p]:my-0 [&_th_p]:leading-5',
          '[&_td]:py-3 [&_td]:px-4 [&_td]:text-sm [&_td]:text-left [&_td]:border-b [&_td]:border-e [&_td]:first:border-s [&_td]:border-muted',
          '[&_td_p]:my-0 [&_td_p]:leading-5 [&_td_code]:text-xs/5 [&_td_ul]:my-0 [&_td_ol]:my-0 [&_td_ul]:ps-4.5 [&_td_ol]:ps-4.5 [&_td_li]:leading-6 [&_td_li]:my-0.5',
          '[&_tr:first-child_th:first-child]:rounded-tl-md [&_tr:first-child_th:last-child]:rounded-tr-md [&_tr:last-child_td:first-child]:rounded-bl-md [&_tr:last-child_td:last-child]:rounded-br-md',
          '[&_.selectedCell]:bg-primary/10 [&_.selectedCell]:ring-2 [&_.selectedCell]:ring-primary [&_.selectedCell]:ring-inset',
          // Task lists
          '[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:ps-1',
          '[&_ul[data-type=taskList]_li]:flex [&_ul[data-type=taskList]_li]:items-start [&_ul[data-type=taskList]_li]:ps-0',
          '[&_ul[data-type=taskList]_li_label]:inline-flex [&_ul[data-type=taskList]_li_label]:relative [&_ul[data-type=taskList]_li_label]:pr-2.5',
          '[&_ul[data-type=taskList]_li_label_input]:appearance-none [&_ul[data-type=taskList]_li_label_input]:size-4 [&_ul[data-type=taskList]_li_label_input]:my-0.5 [&_ul[data-type=taskList]_li_label_input]:rounded-sm [&_ul[data-type=taskList]_li_label_input]:ring [&_ul[data-type=taskList]_li_label_input]:ring-inset [&_ul[data-type=taskList]_li_label_input]:ring-accented [&_ul[data-type=taskList]_li_label_input]:bg-center',
          '[&_ul[data-type=taskList]_li_label_input:checked]:bg-primary [&_ul[data-type=taskList]_li_label_input:checked]:ring-primary [&_ul[data-type=taskList]_li_label_input:checked]:bg-[url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDZMOSAxN2wtNS01Ii8+PC9zdmc+)] dark:[&_ul[data-type=taskList]_li_label_input:checked]:bg-[url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDZMOSAxN2wtNS01Ii8+PC9zdmc+)]',
          '[&_ul[data-type=taskList]_li[data-checked=true]>div>p]:line-through [&_ul[data-type=taskList]_li[data-checked=true]>div>p]:opacity-50',
        ],
      }"
      @drop="handleDrop"
      @paste="handlePaste"
      @update:model-value="onUpdate"
      @blur="updateTodo.flush()"
    >
      <UEditorToolbar
        :editor="editor"
        :items="bubbleToolbarItems"
        layout="bubble"
        :should-show="
          ({ editor, view, state }: any) => {
            if (
              editor.isActive('image') ||
              editor.isActive('file') ||
              state.selection instanceof CellSelection
            ) {
              return false
            }
            const { selection } = state
            return view.hasFocus() && !selection.empty
          }
        "
      >
        <template #link>
          <LinkPopover :editor="editor" />
        </template>
      </UEditorToolbar>

      <UEditorToolbar
        :editor="editor"
        :items="getTableToolbarItems(editor)"
        layout="bubble"
        :should-show="
          ({ editor, view }: any) => {
            return editor.state.selection instanceof CellSelection && view.hasFocus()
          }
        "
      />

      <UEditorToolbar
        :editor="editor"
        :items="getImageToolbarItems(editor)"
        layout="bubble"
        :should-show="
          ({ editor, view }: any) => {
            return editor.isActive('image') && view.hasFocus()
          }
        "
      />
      <UEditorSuggestionMenu
        :editor="editor"
        :items="suggestionItems"
        :append-to="() => bodyElement"
      />
      <UEditorDragHandle :editor="editor" />
    </UEditor>
  </div>
</template>

<style>
html.dark .tiptap .shiki,
html.dark .tiptap .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--ui-bg-muted) !important;
}
</style>
