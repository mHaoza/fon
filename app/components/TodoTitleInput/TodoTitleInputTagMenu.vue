<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import theme from '#build/ui/editor-mention-menu'
import { useEditorMenu } from '#ui/composables/useEditorMenu'
import { tv } from '#ui/utils/tv'
import { computed, h, nextTick, onBeforeUnmount, onMounted, resolveComponent } from 'vue'
import { useTagStore } from '~/store/tag'
import { extractTags } from './utils'

interface TagMenuItem {
  label: string
  id: string | number
}

defineOptions({ inheritAttrs: false })

const props = defineProps<{ editor: Editor }>()

const pluginKey = 'tagMenu'
const char = '#'
const tagStore = useTagStore()

/** 计算可用的标签列表 */
const tagItems = computed(() => {
  const tagList = tagStore.tagList.map((tag) => ({ label: tag.name, id: tag.id || tag.name }))

  return tagList
})

let menu: ReturnType<typeof useEditorMenu> | null = null

// 插入标签到编辑器
function insertTag(editor: Editor, item: TagMenuItem) {
  editor
    .chain()
    .focus()
    .setTag({ label: item.label, id: String(item.id) })
    .insertContent(' ')
    .run()
}

onMounted(async () => {
  await nextTick()

  if (!props.editor || props.editor.isDestroyed) {
    return
  }

  const UIcon = resolveComponent('UIcon')

  menu = useEditorMenu({
    editor: props.editor,
    char,
    pluginKey,
    items: tagItems,
    ui: computed(() => tv({ extend: tv(theme) })()),
    options: { strategy: 'fixed' },
    onSelect: (editor, range, item) => {
      // 删除触发字符和输入的文本
      editor
        .chain()
        .focus()
        .command(({ tr }) => {
          tr.delete(range.from, range.to)
          return true
        })
      // .run()

      // 插入标签
      insertTag(editor, item as TagMenuItem)
    },
    filter: (items, query) => {
      const extractedTags = extractTags(props.editor)
      return items.filter(
        (item) => !extractedTags.includes(item.label) && item.label.includes(query),
      )
    },
    renderItem: (item, styles) => [
      h(UIcon, { name: 'i-heroicons-tag', class: styles.value.itemLeadingIcon() }),
      h('span', { class: styles.value.itemLabel() }, item.label),
    ],
  })

  props.editor.registerPlugin(menu.plugin)
})

onBeforeUnmount(() => {
  if (menu) {
    menu.destroy()
    menu = null
  }

  if (props.editor && !props.editor.isDestroyed) {
    props.editor.unregisterPlugin(pluginKey)
  }
})
</script>

<template>
  <div />
</template>
