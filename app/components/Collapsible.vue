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
          <div class="group flex h-7 w-full cursor-pointer items-center rounded-md px-1 py-1.5 text-neutral-600 transition-all select-none hover:bg-neutral-50">
            <UIcon
              name="i-mdi-chevron-right"
              class={`inline-block opacity-0 transition-all duration-200 group-hover:opacity-100 ${open ? 'rotate-90' : ''}`}
            />
            <span class="text-xs font-medium">{props.title}</span>
            <div class="trigger-extra">{slots.triggerExtra?.()}</div>
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
