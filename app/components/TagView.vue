<script setup lang="ts">
import { computed } from 'vue'

interface TagViewProps {
  tagList: string[]
  maxTagCount?: number
  maxTagTextLength?: number
}

const props = withDefaults(defineProps<TagViewProps>(), {
  maxTagCount: 5,
  maxTagTextLength: 10,
})

const router = useRouter()

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

function switchTagList(tag: string) {
  router.push({ path: `/main/todo/tag/${tag}` })
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-1.5" @click.stop>
    <div
      v-for="(tag, index) in visibleTags"
      :key="index"
      class="inline-flex max-w-30 cursor-pointer items-center overflow-hidden rounded-full border border-neutral-200 px-2.5 py-1 text-xs leading-none whitespace-nowrap text-neutral-700 transition-all hover:scale-105 hover:opacity-80"
      :style="{ backgroundColor: getTagColor(tag) }"
      :title="tag.length > maxTagTextLength ? tag : ''"
      @click="switchTagList(tag)"
    >
      {{ truncateText(tag) }}
    </div>

    <div
      v-if="remainingTags.length > 0"
      class="inline-flex cursor-pointer items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs leading-none font-medium text-neutral-600 transition-all hover:bg-neutral-100"
      :title="remainingTags.join(', ')"
    >
      +{{ remainingTags.length }}
    </div>
  </div>
</template>
