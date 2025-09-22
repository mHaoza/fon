<script setup lang="ts">
import type { SidebarGroupProps, SidebarOption } from '../types'

const props = defineProps<SidebarGroupProps>()
const emit = defineEmits<{ change: [SidebarOption['value'], any] }>()

const value = defineModel<number | string | null>('value')

function handleItemClick(option: SidebarOption) {
  value.value = option.value
  emit('change', option.value, option)
}
</script>

<template>
  <div class="sidebar-group">
    <div
      v-for="(option, index) in props.options"
      :key="index"
      class="sidebar-item px-4 py-2 rounded-md flex cursor-pointer items-center"
      :class="{
        'bg-gray-100': value === option.value,
        'hover:bg-gray-100/50': value !== option.value,
      }"
      v-bind="option?.eleProps"
      @click="handleItemClick(option)"
    >
      <span v-if="option.icon" :class="option.icon" class="text-gray mr-1" />
      <div class="text-sm flex-1">
        {{ option.label }}
      </div>
      <div>
        <slot name="extra" :option="option" />
      </div>
    </div>
  </div>
</template>
