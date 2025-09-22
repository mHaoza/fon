<script setup lang="ts">
import * as collapsible from '@zag-js/collapsible'
import { normalizeProps, useMachine } from '@zag-js/vue'
import { computed, useId, watch } from 'vue'

const props = withDefaults(
  defineProps<{ title?: string, defaultOpen?: boolean }>(),
  {
    title: '',
    defaultOpen: true,
  },
)

const open = defineModel<boolean>('open', { default: true })

const service = useMachine(collapsible.machine, {
  id: useId(),
  defaultOpen: props.defaultOpen,
})

const api = computed(() => collapsible.connect(service, normalizeProps))

watch(
  () => api.value.open,
  () => open.value = api.value.open,
  { immediate: true },
)

watch(
  open,
  () => api.value.setOpen(open.value),
  { immediate: true },
)
</script>

<template>
  <div v-bind="api.getRootProps()">
    <button v-if="props.title || $slots.trigger" v-bind="api.getTriggerProps()" class="w-full">
      <slot name="trigger" :open="api.open" :title="props.title">
        <div class="font-bold p-1 rounded-md i-flex-y-center h-7 w-full">
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
