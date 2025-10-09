<script setup lang="ts">
import Vditor from 'vditor'
import { onMounted, ref, useTemplateRef, watch } from 'vue'
import 'vditor/dist/index.css'

interface MdEditorProps {
  width?: string | number
  height?: string | number
  placeholder?: string
  upload?: {
    max: number
    handler?: (files: File[]) => string | null | Promise<string> | Promise<null>
  }
}

const props = defineProps<MdEditorProps>()

const emit = defineEmits<{
  change: [value: string]
  blur: [value: string]
  loaded: []
}>()

const modelValue = defineModel<string>('value', { default: '' })
const vditorEl = useTemplateRef('vditorEl')
const vditor = ref<Vditor | null>(null)
function initVditor() {
  vditor.value = new Vditor(vditorEl.value!, {
    placeholder: props.placeholder ?? '',
    height: props.height,
    width: props.width,
    undoDelay: 0,
    mode: 'ir',
    tab: '\t',
    toolbar: [],
    cache: { enable: false },
    upload: props.upload,
    input: (value: string) => {
      modelValue.value = value
      emit('change', value)
    },
    blur: (value: string) => {
      emit('blur', value)
    },
    after: () => {
      vditor.value?.setValue(modelValue.value)
      vditor.value?.focus()
      emit('loaded')
    },
  })
}

onMounted(() => {
  initVditor()
})

watch(modelValue, (value) => {
  if (value !== vditor.value?.getValue()) {
    vditor.value?.setValue(value, true)
  }
})

defineExpose({ vditor: () => vditor.value })
</script>

<template>
  <div ref="vditorEl" class="md-editor vditor-reset" />
</template>

<style lang="postcss" scoped>
.md-editor  {
  border: none;
}
.md-editor :deep(.vditor-toolbar)  {
  display: none;
}
.md-editor :deep(.vditor-ir pre.vditor-reset) {
  background-color: transparent;
  padding: 0!important;
  font-size: 14px;
}
</style>
