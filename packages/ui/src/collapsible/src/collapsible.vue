<script setup lang="ts">
import * as collapsible from '@zag-js/collapsible'
import { normalizeProps, useMachine } from '@zag-js/vue'
import { computed, useId, watch } from 'vue'

const props = withDefaults(
  defineProps<{ title?: string }>(),
  {
    title: '',
  },
)

const open = defineModel<boolean>('open', { default: false })

const service = useMachine(collapsible.machine, {
  id: useId(),
  defaultOpen: open.value,
})

const api = computed(() => collapsible.connect(service, normalizeProps))

watch(
  () => api.value.open,
  () => open.value = api.value.open,
)

watch(
  open,
  () => api.value.setOpen(open.value),
)
</script>

<template>
  <div v-bind="api.getRootProps()">
    <button v-if="props.title || $slots.trigger" v-bind="api.getTriggerProps()" class="w-full">
      <slot name="trigger" :open="api.open" :title="props.title">
        <div class="text-gray-500 p-1 rounded-md i-flex-y-center h-7 w-full hover:bg-gray-100">
          <span class="i-mdi-chevron-right opacity-100 inline-block" :class="{ 'rotate-90': open }" />
          <span class="text-xs">{{ props.title }}</span>
          <div class="trigger-extra i-flex-center">
            <slot name="trigger-extra" />
          </div>
        </div>
      </slot>
    </button>
    <div v-bind="api.getContentProps()" class="overflow-hidden">
      <slot />
    </div>
  </div>
</template>
