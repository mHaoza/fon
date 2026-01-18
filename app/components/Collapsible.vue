<script setup lang="tsx">
import type { ComponentInstance } from 'vue'
import { UCollapsible, UIcon } from '#components'

const props = defineProps<{ title: string }>()
defineSlots<{ triggerExtra?: () => VNode }>()

const vm = getCurrentInstance()!

function changeRef(exposed: any) {
  vm.exposed = exposed
}

const attrs = useAttrs()
const slots = useSlots()

function vnode() {
  return (
    <UCollapsible {...attrs} ref={changeRef}>
      {{
        ...slots,
        default: ({ open }: { open: boolean }) => (
          <div class="group flex items-center text-neutral-600 px-1 py-1.5 rounded-md h-7 w-full hover:bg-neutral-50 select-none transition-all cursor-pointer">
            <UIcon
              name="i-mdi-chevron-right"
              class={`opacity-0 inline-block group-hover:opacity-100 transition-all duration-200 ${open ? 'rotate-90' : ''}`}
            />
            <span class="text-xs font-medium">{ props.title }</span>
            <div class="trigger-extra">
              {slots.triggerExtra?.()}
            </div>
          </div>
        ),
        content: () => slots.content?.(),
      }}
    </UCollapsible>
  )
}

defineExpose({} as ComponentInstance<typeof UCollapsible>)
</script>

<template>
  <component :is="vnode" />
</template>
