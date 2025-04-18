<script setup lang="ts">
import type { Extension } from '@codemirror/state'
import { history } from '@codemirror/commands'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { onMounted, ref, useTemplateRef, watch } from 'vue'
import { customKeyMap } from './extensions/customKeyMap'
import { hashTagPlugin } from './extensions/hashTagPlugin'
import { lightTheme } from './theme'

interface TodoInputProps {
  placeholder?: string
  parseHashTag?: boolean
}

const props = withDefaults(defineProps<TodoInputProps>(), {
  parseHashTag: true,
})
const emit = defineEmits<{
  focus: []
  blur: []
}>()

const modelValue = defineModel<string>('value', { default: '' })

const todoInputContainer = useTemplateRef('todoInputContainer')

const editorView = ref<EditorView>()
const isFocused = ref(false)
const hasContent = ref(false)

watch(modelValue, (val) => {
  if (val !== editorView.value?.state.doc.toString()) {
    editorView.value?.dispatch({
      changes: { from: 0, to: editorView.value.state.doc.length, insert: val },
    })
  }
})

onMounted(() => {
  initInput(modelValue.value)
})

function initInput(defaultValue: string) {
  const updateListener = EditorView.updateListener.of((update) => {
    if (update.focusChanged) {
      isFocused.value = update.view.hasFocus
      if (isFocused.value) {
        emit('focus')
      }
      else {
        emit('blur')
      }
    }

    const doc = update.state.doc.toString()
    hasContent.value = !!doc
    modelValue.value = doc
  })

  const state = EditorState.create({
    doc: defaultValue,
    extensions: [
      history(),
      props.parseHashTag ? hashTagPlugin : null,
      customKeyMap,
      lightTheme,
      updateListener,
      EditorView.lineWrapping,
    ].filter(Boolean) as Extension [],
  })

  editorView.value = new EditorView({
    parent: todoInputContainer.value!,
    state,
  })
}

function focus(pos: number) {
  editorView.value?.focus()
  editorView.value?.dispatch({
    selection: { anchor: pos, head: pos },
  })
}
defineExpose({ isFocused, hasContent, editorView, focus })
</script>

<template>
  <div class="todo-input relative">
    <div ref="todoInputContainer" />

    <div v-show="!hasContent" class="flex pointer-events-none items-center bottom-0 left-0 top-0 absolute">
      <slot name="placeholder">
        <div class="text-gray-400/50 flex items-center">
          {{ props.placeholder }}
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped></style>
