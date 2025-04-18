<script setup lang="ts">
import Vditor from 'vditor'
import { onMounted, ref, useTemplateRef, watch } from 'vue'
import 'vditor/dist/index.css'

interface MdEditorProps {
  width?: string | number
  height?: string | number
  placeholder?: string
}

const props = defineProps<MdEditorProps>()

const emit = defineEmits<{
  change: [value: string]
  blur: [value: string]
}>()

const modelValue = defineModel<string>('value', { default: '' })

const vditorEl = useTemplateRef('vditorEl')
const vditor = ref<Vditor | null>(null)

onMounted(() => {
  vditor.value = new Vditor(vditorEl.value!, {
    value: modelValue.value,
    placeholder: props.placeholder ?? '',
    height: props.height,
    width: props.width,
    undoDelay: 0,
    mode: 'ir',
    toolbar: [],
    cache: { enable: false },
    input: (value: string) => {
      modelValue.value = value
      emit('change', value)
    },
    blur: (value: string) => {
      emit('blur', value)
    },
  })
})

watch(modelValue, (value) => {
  if (value !== vditor.value?.getValue()) {
    vditor.value?.setValue(value)
  }
})
</script>

<template>
  <div ref="vditorEl" class="md-editor" />
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
}
</style>
