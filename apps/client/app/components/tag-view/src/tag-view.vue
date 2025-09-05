<script setup lang="ts">
import type { TagViewProps } from '../types'
import { computed } from 'vue'

const props = withDefaults(defineProps<TagViewProps>(), {
  maxTagCount: 5,
  maxTagTextLength: 10,
})

// 截断文字
function truncateText(text: string): string {
  if (text.length <= props.maxTagTextLength) {
    return text
  }
  return `${text.slice(0, props.maxTagTextLength)}...`
}

// 可见的标签
const visibleTags = computed(() => {
  return props.tagList.slice(0, props.maxTagCount)
})

// 剩余的标签
const remainingTags = computed(() => {
  return props.tagList.slice(props.maxTagCount)
})
</script>

<template>
  <div class="flex flex-wrap gap-1.5 items-center">
    <div
      v-for="(tag, index) in visibleTags"
      :key="index"
      class="text-xs text-gray-800 leading-5 line-height-none px-2 py-0.5 border border-black/10 rounded-full inline-flex max-w-30 cursor-default whitespace-nowrap items-center overflow-hidden"
      :style="{ backgroundColor: getTagColor(tag) }"
      :title="tag.length > maxTagTextLength ? tag : ''"
    >
      {{ truncateText(tag) }}
    </div>

    <div
      v-if="remainingTags.length > 0"
      class="text-xs text-gray-600 leading-5 line-height-none font-medium px-2 py-0.5 border border-black/10 rounded-full bg-gray-100 inline-flex cursor-pointer items-center"
      :title="remainingTags.join(', ')"
    >
      +{{ remainingTags.length }}
    </div>
  </div>
</template>
