<script setup lang="ts">
// import Document from '@tiptap/extension-document'
// import Paragraph from '@tiptap/extension-paragraph'
import TodoTitleInputTagMenu from './TodoTitleInputTagMenu.vue'
import { useTagInput } from './useChannelMention'

import { extractTags } from './utils'

const props = withDefaults(defineProps<{
  placeholder?: string
  tagEnabled?: boolean
  editable?: boolean
}>(), {
  placeholder: '输入 #标签名 然后按空格，或输入 # 打开菜单...',
  tagEnabled: true,
  editable: true,
})

const emit = defineEmits<{ enter: [], focus: [], blur: [] }>()

const modelValue = defineModel<string>('value', { default: '' })

const value = computed({
  get: () => modelValue.value || null,
  set: value => modelValue.value = value || '',
})

const tagInputExtension = props.tagEnabled ? useTagInput('#') : null

const extensions = computed(() => {
  // // 自定义扩展，只允许单行文本
  // const singleLineExtensions = [
  //   Document.extend({ content: 'paragraph' }),
  //   // 限制段落只能有一个，允许文本和内联节点（如 tag）
  //   Paragraph.extend({ content: 'inline*' }),
  //   Text,
  // ]
  return [
    // ...singleLineExtensions,
    ...(tagInputExtension ? [tagInputExtension] : []),
  ]
})

const editorRef = useTemplateRef('editorRef')
const isFocused = ref(false)

const editorProps = {
  handleKeyDown: (_: any, event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      emit('enter')
      return true
    }
    return false
  },
  // 处理粘贴的纯文本，将换行符替换为空格
  transformPastedText(text: string) {
    return text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim()
  },
  // 处理粘贴的 HTML，移除块级元素
  transformPastedHTML(html: string) {
    return html.replace(/<\/?(p|div|br)[^>]*>/gi, ' ').replace(/\s+/g, ' ')
  },
}

function focus() {
  editorRef.value?.editor?.chain().focus().run()
}

function setContent(newContent: string) {
  editorRef.value?.editor?.commands.setContent(newContent || '')
}

defineExpose({
  isFocused,
  focus,
  setContent,
  getTags: () => {
    const editor = editorRef.value?.editor
    if (!editor) {
      return []
    }
    return extractTags(editor)
  },
})
</script>

<template>
  <UEditor
    ref="editorRef"
    v-model="value"
    content-type="markdown"
    :placeholder="props.placeholder"
    :starter-kit="{
      bold: false,
      italic: false,
      heading: false,
      bulletList: false,
      orderedList: false,
      blockquote: false,
      codeBlock: false,
      horizontalRule: false,
      hardBreak: false,
      // document: false,
      // paragraph: false,
      // text: false,
    }"
    :extensions="extensions"
    :editor-props="editorProps"
    :ui="{
      base: [
        'px-0! size-full',
        '[&_p]:leading-7',
        '[&_.tag]:text-blue-600 [&_.tag]:bg-blue-50 [&_.tag]:px-1 [&_.tag]:py-0 [&_.tag]:leading-tight [&_.tag]:rounded [&_.tag]:inline-block',
      ],
    }"
    :editable="props.editable"
    autofocus
    class="w-full max-h-21 overflow-auto"
    @focus="() => {
      isFocused = true
      emit('focus')
    }"
    @blur="() => {
      isFocused = false
      emit('blur')
    }"
  >
    <template #default="{ editor }">
      <TodoTitleInputTagMenu v-if="tagEnabled" :editor="editor" char="#" />
    </template>
  </UEditor>
</template>
