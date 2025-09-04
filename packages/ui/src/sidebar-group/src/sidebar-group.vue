<script setup lang="ts">
const props = defineProps<{
  options: { label: string, icon?: string, value?: number | string | null }[]
}>()
const value = defineModel('value')
</script>

<template>
  <div class="sidebar-group">
    <div
      v-for="(option, index) in props.options"
      :key="index"
      class="sidebar-item p-2 rounded-md flex cursor-pointer items-center"
      :class="{
        'bg-gray-100': value === option.value,
        'hover:bg-gray-100/50': value !== option.value,
      }"
      @click="value = option.value"
    >
      <span v-if="option.icon" :class="option.icon" class="text-gray mr-1" />
      <div class="text-sm">
        {{ option.label }}
      </div>
      <div class="extra" />
    </div>
  </div>
</template>
