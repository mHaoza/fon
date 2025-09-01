<script setup lang="ts">
import * as collapsible from '@zag-js/collapsible'
import { normalizeProps, useMachine } from '@zag-js/vue'
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    title?: string
  }>(),
  {
    title: '',
  },
)

const service = useMachine(collapsible.machine, {
  id: useId(),
  defaultOpen: true,
})

const api = computed(() => collapsible.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <button v-bind="api.getTriggerProps()" class="w-full">
      <slot name="trigger">
        <div class="text-gray-500 p-1 rounded-md i-flex-y-center h-7 w-full hover:bg-gray-300/30">
          <span class="i-mdi-chevron-right inline-block" :class="{ 'rotate-90': api.open }" />
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
